import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-xl border border-border bg-bg-elevated px-3.5 py-3 text-text outline-none transition placeholder:text-text-dim focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
