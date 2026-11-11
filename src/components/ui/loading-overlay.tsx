"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (!anchor.href) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.dataset.noLoading === "true") return false;
  if (anchor.getAttribute("href")?.startsWith("#")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
  return true;
}

function urlChanged(nextUrl: string | URL | null | undefined) {
  if (!nextUrl) return false;
  const next = new URL(String(nextUrl), window.location.href);
  return next.pathname !== window.location.pathname || next.search !== window.location.search;
}

function isServerActionRequest(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      if (!headers.has(key)) headers.set(key, value);
    });
  }
  return headers.has("Next-Action") || headers.has("next-action");
}

function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();
  const urlKey = `${pathname}?${searchParams.toString()}`;
  const safetyTimer = useRef<number | null>(null);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimer.current != null) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, []);

  const beginLoading = useCallback(() => {
    startLoading();
    clearSafetyTimer();
    safetyTimer.current = window.setTimeout(() => {
      stopLoading();
      safetyTimer.current = null;
    }, 15000);
  }, [startLoading, stopLoading, clearSafetyTimer]);

  useEffect(() => {
    clearSafetyTimer();
    stopLoading();
  }, [urlKey, stopLoading, clearSafetyTimer]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !isInternalNavigation(anchor)) return;
      beginLoading();
    };

    const onSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.noLoading === "true") return;
      beginLoading();
    };

    const onPopState = () => beginLoading();

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    const originalFetch = window.fetch.bind(window);

    history.pushState = (data, unused, url) => {
      if (urlChanged(url)) beginLoading();
      return originalPushState(data, unused, url);
    };

    history.replaceState = (data, unused, url) => {
      if (urlChanged(url)) beginLoading();
      return originalReplaceState(data, unused, url);
    };

    window.fetch = async (input, init) => {
      const action = isServerActionRequest(input, init);
      const href = window.location.href;
      try {
        return await originalFetch(input, init);
      } finally {
        if (action) {
          window.setTimeout(() => {
            if (window.location.href === href) stopLoading();
          }, 400);
        }
      }
    };

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      clearSafetyTimer();
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("popstate", onPopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.fetch = originalFetch;
    };
  }, [beginLoading, stopLoading, clearSafetyTimer]);

  return null;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <Suspense fallback={null}>
        <NavigationEvents />
      </Suspense>
      {isLoading ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-bg-elevated/95 p-6 shadow-[var(--shadow-soft)] ring-1 ring-border backdrop-blur-md">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
            <p className="text-sm text-text-muted">در حال پردازش...</p>
          </div>
        </div>
      ) : null}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
