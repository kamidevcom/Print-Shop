"use client";

import { addPaymentAction } from "@/app/actions/orders";
import { FancySelect } from "@/components/ui/fancy-select";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentForm({ orderId }: { orderId: string }) {
  const payWithId = addPaymentAction.bind(null, orderId);

  return (
    <form action={payWithId} className="space-y-3 border-t border-border pt-4 sm:grid sm:grid-cols-2 sm:gap-3 sm:items-end">
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
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          افزودن پرداخت
        </Button>
      </div>
    </form>
  );
}
