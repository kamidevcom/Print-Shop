import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderPriority, OrderStatus } from "@/lib/domain";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { OrdersFilterBar } from "@/components/orders/orders-filter-bar";
import { OrderTableRow } from "@/components/orders/order-table-row";
import { ACTIVE_STATUSES } from "@/lib/order-state";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assigneeId?: string;
    overdue?: string;
  }>;
}) {
  const sp = await searchParams;
  const now = new Date();

  const where = {
    ...(sp.status ? { status: sp.status as OrderStatus } : {}),
    ...(sp.priority ? { priority: sp.priority as OrderPriority } : {}),
    ...(sp.assigneeId ? { assigneeId: sp.assigneeId } : {}),
    ...(sp.overdue === "1"
      ? { status: { in: ACTIVE_STATUSES }, expectedAt: { lt: now } }
      : {}),
  };

  const [orders, employees] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: true,
        service: { include: { category: true } },
        assignee: true,
      },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="سفارش‌ها"
        description="مدیریت چرخه کامل سفارش چاپخانه"
        actions={
          <Link
            href="/orders/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-[#1a1610] hover:bg-accent-hover"
          >
            سفارش سریع
          </Link>
        }
      />

      <OrdersFilterBar
        status={sp.status}
        priority={sp.priority}
        assigneeId={sp.assigneeId}
        overdue={sp.overdue}
        employees={employees}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {orders.length === 0 ? (
            <EmptyState title="سفارشی یافت نشد" className="m-5" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-dim">
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">سفارش</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">مشتری</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">خدمت</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">انجام‌دهنده</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">مبلغ</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">تحویل</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">وضعیت</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderTableRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}