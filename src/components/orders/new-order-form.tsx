"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Star, StarOff } from "lucide-react";
import { createOrderAction } from "@/app/actions/orders";
import { setDefaultCustomerAction, unsetDefaultCustomerAction } from "@/app/actions/entities";
import { FancySelect } from "@/components/ui/fancy-select";
import { MoneyInput } from "@/components/ui/money-input";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CustomerQuickCreateModal,
  type QuickCustomer,
} from "@/components/customers/customer-quick-create-modal";
import { fullName } from "@/lib/utils";

function findDefaultServiceId(services: ServiceOption[]): string | null {
  const copyService = services.find(
    (s) => s.name.includes("کپی برگه") || s.name.includes("کپی‌برداری")
  );
  return copyService?.id ?? services[0]?.id ?? null;
}

type CustomerOption = QuickCustomer;
type ServiceOption = { id: string; name: string; categoryName: string };
type EmployeeOption = { id: string; firstName: string; lastName: string; isDefaultAssignee?: boolean };

function validateForm(formData: FormData): string | null {
  const customerId = formData.get("customerId");
  const serviceId = formData.get("serviceId");
  const totalAmount = formData.get("totalAmount");

  if (!customerId || customerId === "") {
    return "مشتری را انتخاب کنید";
  }
  if (!serviceId || serviceId === "") {
    return "خدمت را انتخاب کنید";
  }
  if (totalAmount === "" || Number(totalAmount) <= 0) {
    return "مبلغ کل باید بیشتر از صفر باشد";
  }
  return null;
}

function DefaultCustomerToggle({
  isDefault,
  onToggle,
}: {
  isDefault: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      title={isDefault ? "حذف پیش‌فرض" : "تنظیم به عنوان پیش‌فرض"}
      className="shrink-0 p-2"
    >
      {isDefault ? <Star className="h-4 w-4 text-accent fill-current" /> : <StarOff className="h-4 w-4" />}
    </Button>
  );
}

export function NewOrderForm({
  customers: initialCustomers,
  services,
  employees,
  defaultCustomerId: propDefaultCustomerId,
}: {
  customers: CustomerOption[];
  services: ServiceOption[];
  employees: EmployeeOption[];
  defaultCustomerId?: string;
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [customerId, setCustomerId] = useState(propDefaultCustomerId || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const defaultAssigneeId =
    employees.find((e) => e.isDefaultAssignee)?.id ?? "";

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
  };

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        value: c.id,
        label: fullName(c.firstName, c.lastName),
        hint: c.mobile,
      })),
    [customers],
  );

  const serviceOptions = useMemo(
    () =>
      services.map((s) => ({
        value: s.id,
        label: s.name,
        hint: s.categoryName,
      })),
    [services],
  );

  const employeeOptions = useMemo(
    () => [
      { value: "", label: "بدون تخصیص" },
      ...employees.map((e) => ({
        value: e.id,
        label: fullName(e.firstName, e.lastName),
      })),
    ],
    [employees],
  );

  // Find default service (کپی برگه)
  const defaultServiceId = useMemo(
    () => findDefaultServiceId(services),
    [services]
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await createOrderAction(formData);
      } catch (err: unknown) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
        throw err;
      }
    });
  }

  async function handleToggleDefault() {
    startTransition(async () => {
      if (customerId) {
        if (customerId === propDefaultCustomerId) {
          await unsetDefaultCustomerAction(customerId);
        } else {
          await setDefaultCustomerAction(customerId);
        }
      }
    });
  }

  const isDefaultCustomer = Boolean(customerId && customerId === propDefaultCustomerId);

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-6 lg:grid-cols-12">
        <div className="sm:col-span-6 lg:col-span-8">
          <Label>مشتری</Label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <FancySelect
                name="customerId"
                options={customerOptions}
                value={customerId}
                onChange={handleCustomerChange}
                placeholder="انتخاب مشتری"
                required
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 px-3"
              title="مشتری جدید"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">جدید</span>
            </Button>
            {customerId && (
              <DefaultCustomerToggle
                isDefault={isDefaultCustomer}
                onToggle={handleToggleDefault}
              />
            )}
          </div>
        </div>

        <div className="sm:col-span-6 lg:col-span-4">
          <Label>انجام‌دهنده</Label>
          <FancySelect
            name="assigneeId"
            options={employeeOptions}
            defaultValue={defaultAssigneeId}
            placeholder="انجام‌دهنده"
            searchable
          />
        </div>

        <div className="sm:col-span-6 lg:col-span-8">
          <Label>خدمت</Label>
          <FancySelect
            name="serviceId"
            options={serviceOptions}
            defaultValue={defaultServiceId || ""}
            placeholder="انتخاب خدمت"
            required
          />
        </div>

        <div className="sm:col-span-6 lg:col-span-4">
          <Label>اولویت</Label>
          <FancySelect
            name="priority"
            options={[
              { value: "NORMAL", label: "عادی" },
              { value: "URGENT", label: "فوری" },
              { value: "VERY_URGENT", label: "خیلی فوری" },
            ]}
            defaultValue="NORMAL"
            searchable={false}
          />
        </div>

        <div className="sm:col-span-6 lg:col-span-4">
          <Label htmlFor="totalAmount">مبلغ کل</Label>
          <MoneyInput id="totalAmount" name="totalAmount" defaultValue={0} required />
        </div>
        <div className="sm:col-span-6 lg:col-span-4">
          <Label htmlFor="discount">تخفیف</Label>
          <MoneyInput id="discount" name="discount" defaultValue={0} />
        </div>
        <div className="sm:col-span-6 lg:col-span-4">
          <Label htmlFor="initialPaid">بیانه (پرداخت اولیه)</Label>
          <MoneyInput id="initialPaid" name="initialPaid" defaultValue={0} />
        </div>

        <div className="sm:col-span-6 lg:col-span-6">
          <Label>روش پرداخت</Label>
          <FancySelect
            name="paymentMethod"
            options={[
              { value: "CARD", label: "کارت" },
              { value: "CARD_TO_CARD", label: "کارت به کارت" },
              { value: "CASH", label: "نقد" },
              { value: "TRANSFER", label: "انتقال" },
              { value: "OTHER", label: "سایر" },
            ]}
            defaultValue="CARD"
            searchable={false}
          />
        </div>

        <div className="sm:col-span-6 lg:col-span-6">
          <Label>تاریخ تحویل</Label>
          <PersianDatePicker name="expectedAt" />
        </div>

        <div className="sm:col-span-6 lg:col-span-6">
          <Label>تاریخ و ساعت ثبت سفارش</Label>
          <PersianDatePicker name="createdAt" defaultValue={new Date()} />
          <p className="mt-1 text-xs text-text-dim">پیش‌فرض: لحظه جاری. برای سفارش‌های قبلی تاریخ دلخواه انتخاب کنید.</p>
        </div>

        <div className="sm:col-span-6 lg:col-span-12">
          <Label htmlFor="description">توضیحات سفارش</Label>
          <Textarea id="description" name="description" />
        </div>
        <div className="sm:col-span-6 lg:col-span-12">
          <Label htmlFor="internalNote">یادداشت داخلی</Label>
          <Textarea
            id="internalNote"
            name="internalNote"
            placeholder="مثلاً مشتری فایل نهایی را فردا می‌آورد."
          />
        </div>
        {error ? <p className="sm:col-span-6 lg:col-span-12 text-sm text-danger">{error}</p> : null}
        <div className="sm:col-span-6 lg:col-span-12">
          <Button type="submit" disabled={pending}>
            {pending ? "در حال ثبت..." : "ثبت سفارش"}
          </Button>
        </div>
      </form>

      <CustomerQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(customer) => {
          setCustomers((prev) => [customer, ...prev.filter((c) => c.id !== customer.id)]);
          setCustomerId(customer.id);
        }}
      />
    </>
  );
}
