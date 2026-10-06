import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border px-6 py-16 text-center", className)}>
      <p className="text-base font-medium text-text">{title}</p>
      {description ? <p className="mt-2 text-sm text-text-muted">{description}</p> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "warning" | "danger" | "success";
}) {
  const accent =
    tone === "accent"
      ? "text-accent"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : tone === "success"
            ? "text-success"
            : "text-text";

  return (
    <div className="lux-card p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", accent)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-dim">{hint}</p> : null}
    </div>
  );
}
