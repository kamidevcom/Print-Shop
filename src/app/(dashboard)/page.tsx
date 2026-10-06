import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/orders/status-badge";
import { formatMoney, fullName, formatNumber, remainingAmount } from "@/lib/utils";
import { toJalaliDateTime } from "@/lib/jalali";
import { ACTIVE_STATUSES, IN_PROGRESS_STATUSES } from "@/lib/order-state";
import { OrderStatus } from "@/lib/domain";
import { startOfDay, endOfDay } from "date-fns";

export default async function DashboardPage() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [
    todayOrders,
    inProgressCount,
    readyCount,
    deliveredToday,
    overdueOrders,
    todayList,
    openOrdersForDebt,
  ] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.order.count({
      where: { status: { in: IN_PROGRESS_STATUSES } },
    }),
    prisma.order.count({ where: { status: OrderStatus.READY } }),
    prisma.order.count({
      where: {
        status: OrderStatus.DELIVERED,
        deliveredAt: { gte: dayStart, lte: dayEnd },
      },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        expectedAt: { lt: now },
      },
      take: 5,
      orderBy: { expectedAt: "asc" },
      include: {
        customer: true,
        service: true,
        assignee: true,
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        customer: true,
        service: true,
        assignee: true,
      },
    }),
    prisma.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
      include: { payments: true },
    }),
  ]);

  const customerDebt = openOrdersForDebt.reduce((sum, o) => {
    const paid = o.payments.reduce((p, pay) => p + pay.amount, 0);
    return sum + remainingAmount(o.totalAmount, o.discount, paid);
  }, 0);

  return (
    <div>
      <PageHeader
        title="داشبورد"
        description="نمای کلی عملیات امروز چاپخانه"
        actions={
          <Link
            href="/orders/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-[#1a1610] shadow-[0_8px_24px_rgba(196,165,116,0.25)] transition hover:bg-accent-hover"
          >
            سفارش سریع
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="سفارش‌های امروز" value={formatNumber(todayOrders)} tone="accent" />
        <StatCard label="در حال انجام" value={formatNumber(inProgressCount)} />
        <StatCard label="آماده تحویل" value={formatNumber(readyCount)} tone="success" />
        <StatCard label="تحویل‌شده امروز" value={formatNumber(deliveredToday)} />
        <StatCard label="دیرکرد" value={formatNumber(overdueOrders.length)} tone="danger" />
        <StatCard label="بدهی مشتریان" value={formatMoney(customerDebt)} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>سفارش‌های امروز</CardTitle>
            <Link href="/orders" className="text-sm text-accent hover:text-accent-hover">
              مشاهده همه
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {todayList.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-muted">هنوز سفارشی برای امروز ثبت نشده.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-dim">
                    <th className="px-3 py-3 text-right font-medium whitespace-nowrap">سفارش</th>
                    <th className="px-3 py-3 text-right font-medium whitespace-nowrap">مشتری</th>
                    <th className="px-3 py-3 text-right font-medium whitespace-nowrap">خدمت</th>
                    <th className="px-3 py-3 text-right font-medium whitespace-nowrap">انجام‌دهنده</th>
                    <th className="px-3 py-3 text-right font-medium whitespace-nowrap">تحویل</th>
                    <th className="px-3 py-3 text-right font-medium whitespace-nowrap">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {todayList.map((order) => (
                    <tr key={order.id} className="border-b border-border/70 hover:bg-surface-hover/40">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link href={`/orders/${order.id}`} className="text-accent">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {fullName(order.customer.firstName, order.customer.lastName)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{order.service.name}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {order.assignee
                          ? fullName(order.assignee.firstName, order.assignee.lastName)
                          : "—"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{toJalaliDateTime(order.expectedAt)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge status={order.status} />
                          <PriorityBadge priority={order.priority} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سفارش‌های دیرکرد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">دیرکردی وجود ندارد.</p>
            ) : (
              overdueOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border border-border bg-bg-elevated/60 p-3 transition hover:border-danger/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {fullName(order.customer.firstName, order.customer.lastName)} · {order.service.name}
                  </p>
                  <p className="mt-1 text-xs text-danger">موعد: {toJalaliDateTime(order.expectedAt)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
