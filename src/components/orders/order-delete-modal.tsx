"use client";

import { useState, useTransition } from "react";
import { deleteOrderAction } from "@/app/actions/orders";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function OrderDeleteModal({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError("");
    startTransition(async () => {
      try {
        await deleteOrderAction(orderId);
      } catch (err: unknown) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
        throw err;
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-danger hover:bg-danger/10"
        onClick={() => setOpen(true)}
      >
        <AlertTriangle className="h-4 w-4 mr-1" />
        حذف
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="حذف سفارش"
        description={`آیا از حذف سفارش #${orderNumber} مطمئن هستید؟ این کار غیرقابل بازگشت است.`}
        size="sm"
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <p className="text-text-muted">
            با حذف سفارش، تمام اطلاعات مرتبط (پرداخت‌ها، فایل‌ها، تاریخچه) نیز حذف می‌شوند.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={pending}>
              {pending ? "در حال حذف..." : "تأیید و حذف"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}