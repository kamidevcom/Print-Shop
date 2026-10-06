import { OrderPriority, OrderStatus } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/order-state";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "DELIVERED"
      ? "success"
      : status === "READY"
        ? "accent"
        : status === "CANCELLED"
          ? "danger"
          : status === "ON_HOLD" || status === "NEEDS_REVISION"
            ? "warning"
            : status === "IN_PROGRESS" || status === "REVIEWING"
              ? "info"
              : "default";

  return (
    <Badge tone={tone}>
      {ORDER_STATUS_LABELS[status as OrderStatus] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "VERY_URGENT" ? "danger" : priority === "URGENT" ? "warning" : "default";
  return (
    <Badge tone={tone}>
      {PRIORITY_LABELS[priority as OrderPriority] ?? priority}
    </Badge>
  );
}
