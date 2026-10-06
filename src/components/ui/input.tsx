import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-bg-elevated px-3.5 text-text outline-none transition placeholder:text-text-dim focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
