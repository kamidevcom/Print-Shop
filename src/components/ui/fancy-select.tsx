"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type FancySelectProps = {
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
};

export function FancySelect({
  name,
  options,
  value,
  defaultValue = "",
  placeholder = "انتخاب کنید",
  searchable = true,
  required,
  disabled,
  className,
  onChange,
}: FancySelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const [query, setQuery] = useState("");

  const selectedOption = options.find((o) => o.value === selected);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.hint && o.hint.toLowerCase().includes(q)) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function choose(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={selected} required={required && !selected} />
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-bg-elevated px-3.5 text-right text-sm outline-none transition",
          "hover:border-border-strong focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
          disabled && "cursor-not-allowed opacity-50",
          open && "border-accent/50 ring-2 ring-accent/20",
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-text-dim")}>
          {selectedOption ? (
            <>
              {selectedOption.label}
              {selectedOption.hint ? (
                <span className="mr-2 text-text-dim">· {selectedOption.hint}</span>
              ) : null}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-dim transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[var(--shadow)]">
          {searchable ? (
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-dim" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو..."
                  className="h-9 w-full rounded-lg border border-border bg-bg-elevated pr-9 pl-3 text-sm outline-none focus:border-accent/40"
                />
              </div>
            </div>
          ) : null}
          <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-text-muted">موردی یافت نشد</li>
            ) : (
              filtered.map((option) => {
                const active = option.value === selected;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => choose(option.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right text-sm transition",
                        active ? "bg-accent-soft text-accent" : "hover:bg-surface-hover text-text",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{option.label}</span>
                        {option.hint ? (
                          <span className="mt-0.5 block truncate text-xs text-text-dim">{option.hint}</span>
                        ) : null}
                      </span>
                      {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
