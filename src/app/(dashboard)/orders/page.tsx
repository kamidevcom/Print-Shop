import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderPriority, OrderStatus } from "@/lib/domain";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { OrdersFilterBar } from "@/components/orders/orders-filter-bar";
import { OrderTableRow } from "@/components/orders/order-table-row";
import { ACTIVE_STATUSES } from "@/lib/order-state";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assigneeId?: string;
    overdue?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(sp.status ? { status: sp.status as OrderStatus } : {}),
    ...(sp.priority ? { priority: sp.priority as OrderPriority } : {}),
    ...(sp.assigneeId ? { assigneeId: sp.assigneeId } : {}),
    ...(sp.overdue === "1"
      ? { status: { in: ACTIVE_STATUSES }, expectedAt: { lt: now } }
      : {}),
  };

  const [orders, totalOrders, employees] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        customer: true,
        service: { include: { category: true } },
        assignee: true,
      },
    }),
    prisma.order.count({ where }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(sp);
    params.set("page", String(p));
    return `/orders?${params.toString()}`;
  };

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
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-dim">
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">سفارش</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">مشتری</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">خدمت</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">انجام‌دهنده</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">مبلغ</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">ثبت</th>
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-sm text-text-muted">
                    صفحه {page} از {totalPages} — مجموع {totalOrders} سفارش
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => window.location.href = buildPageUrl(page - 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => window.location.href = buildPageUrl(page + 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}