"use client";

import { useTransition } from "react";
import { addPaymentAction } from "@/app/actions/orders";
import { FancySelect } from "@/components/ui/fancy-select";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";

export function PaymentForm({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startLoading();
    startTransition(async () => {
      try {
        await addPaymentAction(orderId, new FormData(e.currentTarget));
        showToast("success", "پرداخت با موفقیت ثبت شد.");
        e.currentTarget.reset();
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
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4 sm:grid sm:grid-cols-2 sm:gap-3 sm:items-end">
      <div className="sm:col-span-2">
        <Label htmlFor="amount">ثبت پرداخت</Label>
        <MoneyInput id="amount" name="amount" required />
      </div>
      <div>
        <Label htmlFor="method">روش</Label>
        <FancySelect
          name="method"
          defaultValue="CARD"
          searchable={false}
          options={[
            { value: "CARD", label: "کارت" },
            { value: "CARD_TO_CARD", label: "کارت به کارت" },
            { value: "CASH", label: "نقد" },
            { value: "TRANSFER", label: "انتقال" },
            { value: "OTHER", label: "سایر" },
          ]}
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notes">توضیح پرداخت</Label>
        <Input id="notes" name="notes" placeholder="توضیح پرداخت" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full sm:w-auto">
          {pending ? "در حال ثبت..." : "افزودن پرداخت"}
        </Button>
      </div>
    </form>
  );
}
