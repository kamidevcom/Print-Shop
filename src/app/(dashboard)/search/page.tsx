import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fullName } from "@/lib/utils";
import { StatusBadge } from "@/components/orders/status-badge";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (!query) {
    return (
      <div>
        <PageHeader title="جستجو" description="عبارتی وارد کنید." />
      </div>
    );
  }

  const orderNumber = Number(query.replace("#", ""));
  const [customers, orders, services] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { mobile: { contains: query } },
        ],
      },
      take: 20,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          ...(Number.isFinite(orderNumber) ? [{ orderNumber }] : []),
          { description: { contains: query } },
          { service: { name: { contains: query } } },
          {
            customer: {
              OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { mobile: { contains: query } },
              ],
            },
          },
        ],
      },
      include: { customer: true, service: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
      include: { category: true },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="نتایج جستجو" description={`عبارت: ${query}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>مشتریان ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customers.map((c) => (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="block rounded-xl border border-border p-3 hover:border-accent/30"
              >
                {fullName(c.firstName, c.lastName)}
                <p className="text-xs text-text-muted">{c.mobile}</p>
              </Link>
            ))}
            {customers.length === 0 ? <p className="text-sm text-text-muted">موردی نیست</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سفارش‌ها ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="block rounded-xl border border-border p-3 hover:border-accent/30"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span>#{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {fullName(o.customer.firstName, o.customer.lastName)} · {o.service.name}
                </p>
              </Link>
            ))}
            {orders.length === 0 ? <p className="text-sm text-text-muted">موردی نیست</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>خدمات ({services.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-3">
                <p>{s.name}</p>
                <p className="text-xs text-text-muted">{s.category.name}</p>
              </div>
            ))}
            {services.length === 0 ? <p className="text-sm text-text-muted">موردی نیست</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
