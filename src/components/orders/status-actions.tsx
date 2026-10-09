"use client";

import { useTransition } from "react";
import { OrderStatus } from "@/lib/domain";
import { changeOrderStatusAction } from "@/app/actions/orders";
import { ORDER_STATUS_LABELS, getAllowedTransitions } from "@/lib/order-state";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";

export function StatusActions({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const allowed = getAllowedTransitions(current);
  const [pending, startTransition] = useTransition();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  if (allowed.length === 0) {
    return <p className="text-sm text-text-muted">وضعیت نهایی شده است.</p>;
  }

  async function handleStatusChange(status: OrderStatus) {
    startLoading();
    startTransition(async () => {
      try {
        await changeOrderStatusAction(orderId, status);
        showToast("success", `وضعیت سفارش به ${ORDER_STATUS_LABELS[status]} تغییر کرد.`);
      } catch (err: unknown) {
        if (err instanceof Error) {
          showToast("error", err.message);
        }
        throw err;
      } finally {
        stopLoading();
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((status) => (
        <Button
          key={status}
          type="button"
          size="sm"
          variant={status === "CANCELLED" ? "danger" : "secondary"}
          disabled={pending}
          onClick={() => handleStatusChange(status)}
        >
          {ORDER_STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
