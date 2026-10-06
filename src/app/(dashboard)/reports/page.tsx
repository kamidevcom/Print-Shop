import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/lib/domain";
import { PageHeader, StatCard } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/orders/status-badge";
import { ACTIVE_STATUSES } from "@/lib/order-state";
import { formatMoney, fullName, remainingAmount, formatNumber } from "@/lib/utils";
import { toJalaliDateTime } from "@/lib/jalali";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function ReportsPage() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [overdue, monthOrders, employees] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        expectedAt: { lt: now },
      },
      include: { customer: true, service: true, assignee: true },
      orderBy: { expectedAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { not: OrderStatus.CANCELLED },
      },
      include: { payments: true },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      include: {
        orders: {
          where: {
            status: OrderStatus.DELIVERED,
            deliveredAt: { gte: monthStart, lte: monthEnd },
          },
        },
      },
    }),
  ]);

  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount - o.discount, 0);
  const monthPaid = monthOrders.reduce(
    (sum, o) => sum + o.payments.reduce((p, pay) => p + pay.amount, 0),
    0,
  );
  const monthDebt = monthOrders.reduce((sum, o) => {
    const paid = o.payments.reduce((p, pay) => p + pay.amount, 0);
    return sum + remainingAmount(o.totalAmount, o.discount, paid);
  }, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="گزارش‌ها" description="خلاصه مالی و عملکرد ماه جاری" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="فروش ماه" value={formatMoney(monthRevenue)} tone="accent" />
        <StatCard label="دریافت‌شده" value={formatMoney(monthPaid)} tone="success" />
        <StatCard label="بدهی باز (سفارش‌های ماه)" value={formatMoney(monthDebt)} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>سفارش‌های دیرکرد ({formatNumber(overdue.length)})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdue.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">دیرکردی نیست.</p>
            ) : (
              overdue.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border border-border p-3 hover:border-danger/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {fullName(order.customer.firstName, order.customer.lastName)} · {order.service.name}
                  </p>
                  <p className="mt-1 text-xs text-danger">{toJalaliDateTime(order.expectedAt)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عملکرد کارمندان (تحویل ماه جاری)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {employees.map((emp) => {
              const total = emp.orders.reduce((sum, o) => sum + o.totalAmount - o.discount, 0);
              return (
                <Link
                  key={emp.id}
                  href={`/employees/${emp.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-accent/30"
                >
                  <div>
                    <p className="font-medium">{fullName(emp.firstName, emp.lastName)}</p>
                    <p className="text-xs text-text-muted">{emp.orders.length} سفارش تحویل‌شده</p>
                  </div>
                  <p className="text-sm text-accent">{formatMoney(total)}</p>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
