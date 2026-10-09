"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in setter callbacks
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => {
      const next = prev + 1;
      if (next === 1) setIsLoading(true);
      return next;
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) setIsLoading(false);
      return next;
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-bg-elevated/95 p-6 shadow-[var(--shadow-soft)] ring-1 ring-border backdrop-blur-md">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
            <p className="text-sm text-text-muted">در حال پردازش...</p>
          </div>
        </div>
      )}
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