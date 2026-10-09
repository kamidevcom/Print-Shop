"use client";

import { useTransition } from "react";
import { updateOrderAction } from "@/app/actions/orders";
import { FancySelect } from "@/components/ui/fancy-select";
import { MoneyInput } from "@/components/ui/money-input";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";
import { fullName } from "@/lib/utils";

type Employee = { id: string; firstName: string; lastName: string };

export function OrderEditForm({
  orderId,
  serviceLabel,
  assigneeId,
  priority,
  totalAmount,
  discount,
  expectedAt,
  description,
  internalNote,
  employees,
}: {
  orderId: string;
  serviceLabel: string;
  assigneeId: string | null;
  priority: string;
  totalAmount: number;
  discount: number;
  expectedAt: Date | null;
  description: string | null;
  internalNote: string | null;
  employees: Employee[];
}) {
  const [pending, startTransition] = useTransition();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startLoading();
    startTransition(async () => {
      try {
        await updateOrderAction(orderId, new FormData(e.currentTarget));
        showToast("success", "سفارش با موفقیت به‌روزرسانی شد.");
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
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-6 lg:grid-cols-12">
      <div className="sm:col-span-6 lg:col-span-12">
        <Label>خدمت</Label>
        <div className="flex h-11 items-center rounded-xl border border-border bg-bg-elevated/60 px-3.5 text-sm text-text-muted">
          {serviceLabel}
        </div>
        <p className="mt-1 text-xs text-text-dim">خدمت هنگام ایجاد ثابت می‌ماند (برای تاریخچه).</p>
      </div>

      <div className="sm:col-span-6 lg:col-span-8">
        <Label>انجام‌دهنده</Label>
        <FancySelect
          name="assigneeId"
          defaultValue={assigneeId ?? ""}
          options={[
            { value: "", label: "بدون تخصیص" },
            ...employees.map((e) => ({
              value: e.id,
              label: fullName(e.firstName, e.lastName),
            })),
          ]}
        />
      </div>

      <div className="sm:col-span-6 lg:col-span-4">
        <Label>اولویت</Label>
        <FancySelect
          name="priority"
          defaultValue={priority}
          searchable={false}
          options={[
            { value: "NORMAL", label: "عادی" },
            { value: "URGENT", label: "فوری" },
            { value: "VERY_URGENT", label: "خیلی فوری" },
          ]}
        />
      </div>

      <div className="sm:col-span-6 lg:col-span-6">
        <Label htmlFor="totalAmount">مبلغ کل</Label>
        <MoneyInput id="totalAmount" name="totalAmount" defaultValue={totalAmount} />
      </div>
      <div className="sm:col-span-6 lg:col-span-6">
        <Label htmlFor="discount">تخفیف</Label>
        <MoneyInput id="discount" name="discount" defaultValue={discount} />
      </div>

      <div className="sm:col-span-6 lg:col-span-12">
        <Label>تاریخ تحویل</Label>
        <PersianDatePicker name="expectedAt" defaultValue={expectedAt} />
      </div>

      <div className="sm:col-span-6 lg:col-span-12">
        <Label htmlFor="description">توضیحات سفارش</Label>
        <Textarea id="description" name="description" defaultValue={description ?? ""} />
      </div>
      <div className="sm:col-span-6 lg:col-span-12">
        <Label htmlFor="internalNote">یادداشت داخلی</Label>
        <Textarea id="internalNote" name="internalNote" defaultValue={internalNote ?? ""} />
      </div>
      <div className="sm:col-span-6 lg:col-span-12">
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
