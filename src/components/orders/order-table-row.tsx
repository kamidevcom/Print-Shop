"use client";

import { useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle, XCircle, CircleHelp, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus, OrderPriority } from "@/lib/domain";
import type { Order as PrismaOrder } from "@prisma/client";
import { OrderDeleteModal } from "./order-delete-modal";
import { changeOrderStatusAction } from "@/app/actions/orders";
import { getAllowedTransitions } from "@/lib/order-state";
import { useLoading } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type OrderWithRelations = PrismaOrder & {
  customer: { firstName: string; lastName: string; mobile: string };
  service: { name: string; category: { name: string } };
  assignee: { firstName: string; lastName: string } | null;
};

const statusConfig: Record<OrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  NEW: { label: "جدید", icon: CircleHelp, className: "text-yellow-600 bg-yellow-100" },
  REVIEWING: { label: "در بررسی", icon: CheckCircle2, className: "text-blue-600 bg-blue-100" },
  IN_PROGRESS: { label: "در حال انجام", icon: Clock, className: "text-purple-600 bg-purple-100" },
  READY: { label: "آماده", icon: CheckCircle2, className: "text-green-600 bg-green-100" },
  DELIVERED: { label: "تحویل داده شده", icon: CheckCircle2, className: "text-slate-600 bg-slate-100" },
  CANCELLED: { label: "لغو شده", icon: XCircle, className: "text-red-600 bg-red-100" },
  ON_HOLD: { label: "معلق", icon: AlertTriangle, className: "text-orange-600 bg-orange-100" },
  NEEDS_REVISION: { label: "نیاز به بازبینی", icon: XCircle, className: "text-red-600 bg-red-100" },
};

const priorityConfig: Record<OrderPriority, { label: string; className: string }> = {
  NORMAL: { label: "عادی", className: "text-blue-600 bg-blue-100" },
  URGENT: { label: "فوری", className: "text-orange-600 bg-orange-100" },
  VERY_URGENT: { label: "خیلی فوری", className: "text-red-600 bg-red-100" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, icon: Icon, className } = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: OrderPriority }) {
  const { label, className } = priorityConfig[priority];
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", className)}>{label}</span>;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function OrderTableRow({ order }: { order: OrderWithRelations }) {
  const isOverdue = order.expectedAt && new Date(order.expectedAt) < new Date() && !["DELIVERED", "CANCELLED"].includes(order.status);
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
  const assigneeName = order.assignee ? `${order.assignee.firstName} ${order.assignee.lastName}` : null;
  const [pendingStatus, startTransition] = useTransition();
  const { startLoading, stopLoading } = useLoading();
  const { showToast } = useToast();

  const canDeliver = getAllowedTransitions(order.status as OrderStatus).includes(OrderStatus.DELIVERED);

  async function handleDeliver() {
    startLoading();
    startTransition(async () => {
      try {
        await changeOrderStatusAction(order.id, OrderStatus.DELIVERED);
        showToast("success", `سفارش #${order.orderNumber} به عنوان تحویل شده علامت‌گذاری شد.`);
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
    <tr className={cn("border-b border-border hover:bg-surface-hover transition-colors", isOverdue && "bg-red-50/30")}>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <Link href={`/orders/${order.id}`} className="font-mono text-accent hover:underline">
          #{order.id.slice(-6).toUpperCase()}
        </Link>
      </td>
      <td className="px-4 py-3 text-right">
        <div>
          <p className="font-medium">{customerName}</p>
          <p className="text-xs text-text-dim">{order.customer.mobile}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div>
          <p className="font-medium">{order.service.name}</p>
          <p className="text-xs text-text-dim">{order.service.category.name}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {assigneeName ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            {assigneeName}
          </span>
        ) : (
          <span className="text-text-dim">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap font-medium tabular-nums">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <span className={cn("font-medium", isOverdue && "text-red-600")}>
          {formatDate(order.createdAt)}
          {isOverdue && <span title="معوق"><AlertTriangle className="inline h-3.5 w-3.5 text-red-500" aria-label="معوق" /></span>}
        </span>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <StatusBadge status={order.status as OrderStatus} />
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <PriorityBadge priority={order.priority as OrderPriority} />
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition hover:bg-surface-hover hover:text-text"
            aria-label="مشاهده سفارش"
          >
            <CircleHelp className="h-4 w-4" />
          </Link>
          {canDeliver && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={pendingStatus}
              className="h-8 px-3"
              onClick={handleDeliver}
            >
              <Truck className="h-3.5 w-3.5 mr-1" />
              تحویل
            </Button>
          )}
          <OrderDeleteModal orderId={order.id} orderNumber={String(order.orderNumber)} />
        </div>
      </td>
    </tr>
  );
}