"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FancySelect } from "@/components/ui/fancy-select";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/order-state";
import { OrderPriority, OrderStatus } from "@/lib/domain";
import { fullName } from "@/lib/utils";

export function OrdersFilterBar({
  status,
  priority,
  assigneeId,
  overdue,
  employees,
}: {
  status?: string;
  priority?: string;
  assigneeId?: string;
  overdue?: string;
  employees: { id: string; firstName: string; lastName: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    for (const [key, value] of formData.entries()) {
      const stringValue = String(value);
      if (stringValue) {
        params.set(key, stringValue);
      } else {
        params.delete(key);
      }
    }
    router.push(`/orders?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-surface/60 p-3"
    >
      <div className="flex-1 min-w-[140px]">
        <FancySelect
          name="status"
          defaultValue={status || ""}
          searchable={false}
          options={[
            { value: "", label: "وضعیت" },
            ...Object.values(OrderStatus).map((s) => ({
              value: s,
              label: ORDER_STATUS_LABELS[s],
            })),
          ]}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <FancySelect
          name="priority"
          defaultValue={priority || ""}
          searchable={false}
          options={[
            { value: "", label: "اولویت" },
            ...Object.values(OrderPriority).map((p) => ({
              value: p,
              label: PRIORITY_LABELS[p],
            })),
          ]}
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <FancySelect
          name="assigneeId"
          defaultValue={assigneeId || ""}
          options={[
            { value: "", label: "کارمند" },
            ...employees.map((e) => ({
              value: e.id,
              label: fullName(e.firstName, e.lastName),
            })),
          ]}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <FancySelect
          name="overdue"
          defaultValue={overdue || ""}
          searchable={false}
          options={[
            { value: "", label: "موعد" },
            { value: "1", label: "دیرکرد" },
          ]}
        />
      </div>
      <Button type="submit" variant="secondary" className="shrink-0 h-11 px-4">
        اعمال
      </Button>
    </form>
  );
}
