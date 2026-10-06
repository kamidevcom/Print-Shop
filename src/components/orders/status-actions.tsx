"use client";

import { OrderStatus } from "@/lib/domain";
import { changeOrderStatusAction } from "@/app/actions/orders";
import { ORDER_STATUS_LABELS, getAllowedTransitions } from "@/lib/order-state";
import { Button } from "@/components/ui/button";

export function StatusActions({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const allowed = getAllowedTransitions(current);

  if (allowed.length === 0) {
    return <p className="text-sm text-text-muted">وضعیت نهایی شده است.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((status) => (
        <form
          key={status}
          action={async () => {
            await changeOrderStatusAction(orderId, status);
          }}
        >
          <Button
            type="submit"
            size="sm"
            variant={status === "CANCELLED" ? "danger" : "secondary"}
          >
            {ORDER_STATUS_LABELS[status]}
          </Button>
        </form>
      ))}
    </div>
  );
}
