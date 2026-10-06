"use client";

import Link from "next/link";
import { formatMoney, fullName } from "@/lib/utils";
import { toJalaliDateTime } from "@/lib/jalali";
import { CUSTOMER_TYPE_LABELS, CustomerType } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleHelp, Trash2, AlertTriangle } from "lucide-react";
import { CustomerDeleteModal } from "./customer-delete-modal";

type CustomerRowData = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  type: string;
  isActive: boolean;
  orderCount: number;
  totalPurchase: number;
  debt: number;
  lastOrderAt: Date | string | null;
  lastOrderNumber: number | string | null;
};

export function CustomerTableRow({ customer }: { customer: CustomerRowData }) {
  const isActive = customer.isActive;
  const debt = customer.debt;
  const totalPurchase = customer.totalPurchase;

  return (
    <tr className="border-b border-border hover:bg-surface-hover transition-colors">
      <td className="px-4 py-3 text-right">
        <div>
          <Link href={`/customers/${customer.id}`} className="font-medium text-accent hover:underline">
            {fullName(customer.firstName, customer.lastName)}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <Badge tone={isActive ? "success" : "default"}>
          {CUSTOMER_TYPE_LABELS[customer.type as CustomerType] ?? customer.type}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className="font-mono text-sm">{customer.mobile}</span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap font-medium tabular-nums">
        {customer.orderCount}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap font-medium tabular-nums">
        {formatMoney(totalPurchase)}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap font-medium tabular-nums">
        <span className={cn(debt > 0 ? "text-danger" : "text-success")}>
          {formatMoney(debt)}
        </span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {customer.lastOrderAt ? toJalaliDateTime(customer.lastOrderAt) : <span className="text-text-dim">—</span>}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <Badge tone={isActive ? "success" : "default"}>
          {isActive ? "فعال" : "غیرفعال"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/customers/${customer.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition hover:bg-surface-hover hover:text-text"
            aria-label="مشاهده مشتری"
          >
            <CircleHelp className="h-4 w-4" />
          </Link>
          <CustomerDeleteModal customerId={customer.id} customerName={fullName(customer.firstName, customer.lastName)} />
        </div>
      </td>
    </tr>
  );
}