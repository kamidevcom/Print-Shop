"use client";

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
  return (
    <form className="mb-6 grid gap-3 rounded-2xl border border-border bg-surface/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <FancySelect
        name="status"
        defaultValue={status || ""}
        searchable={false}
        options={[
          { value: "", label: "همه وضعیت‌ها" },
          ...Object.values(OrderStatus).map((s) => ({
            value: s,
            label: ORDER_STATUS_LABELS[s],
          })),
        ]}
      />
      <FancySelect
        name="priority"
        defaultValue={priority || ""}
        searchable={false}
        options={[
          { value: "", label: "همه اولویت‌ها" },
          ...Object.values(OrderPriority).map((p) => ({
            value: p,
            label: PRIORITY_LABELS[p],
          })),
        ]}
      />
      <FancySelect
        name="assigneeId"
        defaultValue={assigneeId || ""}
        options={[
          { value: "", label: "همه کارمندان" },
          ...employees.map((e) => ({
            value: e.id,
            label: fullName(e.firstName, e.lastName),
          })),
        ]}
      />
      <FancySelect
        name="overdue"
        defaultValue={overdue || ""}
        searchable={false}
        options={[
          { value: "", label: "همه موعدها" },
          { value: "1", label: "فقط دیرکرد" },
        ]}
      />
      <Button type="submit" variant="secondary" className="sm:col-span-2 lg:col-span-4 lg:w-fit">
        اعمال فیلتر
      </Button>
    </form>
  );
}
