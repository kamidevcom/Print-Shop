"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteCustomerAction } from "@/app/actions/entities";
import { useLoading } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";

interface CustomerDeleteModalProps {
  customerId: string;
  customerName: string;
}

export function CustomerDeleteModal({ customerId, customerName }: CustomerDeleteModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();
  const router = useRouter();

  function handleDelete() {
    setError("");
    startLoading();
    startTransition(async () => {
      try {
        await deleteCustomerAction(customerId);
        showToast("success", `مشتری ${customerName} با موفقیت حذف شد.`);
        router.refresh();
        setOpen(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
          showToast("error", err.message);
        }
        throw err;
      } finally {
        stopLoading();
      }
    });
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        حذف مشتری
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="حذف مشتری"
        description={`آیا از حذف مشتری ${customerName} مطمئن هستید؟ این کار غیرقابل بازگشت است و تمام سفارش‌های مرتبط نیز حذف خواهند شد.`}
        size="sm"
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex items-center gap-3 text-text-muted">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm">این کار باعث حذف تمام سفارش‌ها، پرداخت‌ها و فایل‌های مرتبط با این مشتری می‌شود.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={pending}>
              {pending ? "در حال حذف..." : "بله، حذف شود"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}