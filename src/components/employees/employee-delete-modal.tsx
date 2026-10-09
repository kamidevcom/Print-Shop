"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEmployeeAction } from "@/app/actions/entities";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useLoading } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";

export function EmployeeDeleteModal({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
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
        await deleteEmployeeAction(employeeId);
        showToast("success", `کارمند ${employeeName} با موفقیت حذف شد.`);
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
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
        className="hover:bg-danger/10 hover:text-danger p-1.5"
        aria-label="حذف کارمند"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="حذف کارمند"
        description={`آیا از حذف کارمند ${employeeName} مطمئن هستید؟ این کار غیرقابل بازگشت است.`}
        size="sm"
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex items-center gap-3 text-text-muted">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm">این کار باعث حذف تمام سفارش‌های تخصیص‌یافته به این کارمند می‌شود.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
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