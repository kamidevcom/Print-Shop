"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

function formatGrouped(value: string) {
  const raw = digitsOnly(value);
  if (!raw) return "";
  return Number(raw).toLocaleString("en-US");
}

type MoneyInputProps = {
  name: string;
  id?: string;
  defaultValue?: number | string;
  value?: number;
  required?: boolean;
  className?: string;
  placeholder?: string;
  onValueChange?: (value: number) => void;
};

export function MoneyInput({
  name,
  id,
  defaultValue = 0,
  value,
  required,
  className,
  placeholder = "0",
  onValueChange,
}: MoneyInputProps) {
  const initial = useMemo(() => {
    const n = Number(value ?? defaultValue ?? 0);
    return Number.isFinite(n) && n > 0 ? formatGrouped(String(n)) : "";
  }, [defaultValue, value]);

  const [display, setDisplay] = useState(initial);
  const numeric = Number(digitsOnly(display) || "0");

  return (
    <div className="relative">
      <input type="hidden" name={name} value={numeric} required={required} />
      <input
        id={id}
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const next = formatGrouped(e.target.value);
          setDisplay(next);
          onValueChange?.(Number(digitsOnly(next) || "0"));
        }}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-bg-elevated px-3.5 pl-14 text-left text-text outline-none transition placeholder:text-text-dim focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
          className,
        )}
        dir="ltr"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-dim">
        تومان
      </span>
    </div>
  );
}
