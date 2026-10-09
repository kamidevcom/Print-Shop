"use client";

import { useState, useTransition } from "react";
import { createCustomerQuickAction } from "@/app/actions/entities";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CUSTOMER_TYPE_LABELS, CustomerType } from "@/lib/domain";

export type QuickCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  type?: string;
};

export function CustomerQuickCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: QuickCustomer) => void;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="مشتری جدید"
      description="اگر مشتری در لیست نیست، اینجا سریع ثبت کنید."
      size="lg"
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await createCustomerQuickAction(formData);
            if ("error" in result && result.error) {
              setError(result.error);
              return;
            }
            if ("customer" in result && result.customer) {
              onCreated(result.customer);
              onClose();
            }
          });
        }}
      >
        <div>
          <Label htmlFor="qc-firstName">نام</Label>
          <Input id="qc-firstName" name="firstName" required />
        </div>
        <div>
          <Label htmlFor="qc-lastName">نام خانوادگی</Label>
          <Input id="qc-lastName" name="lastName" required />
        </div>
        <div>
          <Label htmlFor="qc-mobile">موبایل</Label>
          <Input id="qc-mobile" name="mobile" required />
        </div>
        <div>
          <Label htmlFor="qc-type">نوع مشتری</Label>
          <Select id="qc-type" name="type" defaultValue={CustomerType.NORMAL}>
            {Object.values(CustomerType).map((type) => (
              <option key={type} value={type}>
                {CUSTOMER_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="qc-address">آدرس</Label>
          <Input id="qc-address" name="address" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="qc-notes">توضیحات</Label>
          <Textarea id="qc-notes" name="notes" />
        </div>
        {error ? <p className="sm:col-span-2 text-sm text-danger">{error}</p> : null}
        <div className="flex items-center justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "در حال ذخیره..." : "ثبت مشتری"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
