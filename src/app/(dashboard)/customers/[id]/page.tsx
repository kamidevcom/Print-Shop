import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCustomerStats, paidFromPayments } from "@/lib/queries/customers";
import { updateCustomerAction } from "@/app/actions/entities";
import { PageHeader, StatCard } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatMoney, fullName, remainingAmount } from "@/lib/utils";
import { toJalali, toJalaliDateTime } from "@/lib/jalali";
import { CUSTOMER_TYPE_LABELS, CustomerType } from "@/lib/domain";
import { CustomerDeleteModal } from "@/components/customers/customer-delete-modal";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const stats = await getCustomerStats(id);
  const orders = await prisma.order.findMany({
    where: { customerId: id },
    include: { service: true, assignee: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  const updateWithId = updateCustomerAction.bind(null, id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={fullName(customer.firstName, customer.lastName)}
        description={`ثبت‌شده در ${toJalali(customer.createdAt)} · ${customer.mobile}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">
              {CUSTOMER_TYPE_LABELS[customer.type as CustomerType] ?? customer.type}
            </Badge>
            <Link
              href={`/orders/new?customerId=${customer.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-[#1a1610] hover:bg-accent-hover"
            >
              سفارش جدید
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="تعداد سفارش" value={String(stats.orderCount)} />
        <StatCard label="مجموع خرید" value={formatMoney(stats.totalPurchase)} tone="accent" />
        <StatCard label="بدهی" value={formatMoney(stats.debt)} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ویرایش اطلاعات</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateWithId} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">نام</Label>
                <Input id="firstName" name="firstName" defaultValue={customer.firstName} required />
              </div>
              <div>
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input id="lastName" name="lastName" defaultValue={customer.lastName} required />
              </div>
              <div>
                <Label htmlFor="mobile">موبایل</Label>
                <Input id="mobile" name="mobile" defaultValue={customer.mobile} required />
              </div>
              <div>
                <Label htmlFor="type">نوع مشتری</Label>
                <Select id="type" name="type" defaultValue={customer.type || CustomerType.NORMAL}>
                  {Object.values(CustomerType).map((type) => (
                    <option key={type} value={type}>
                      {CUSTOMER_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">آدرس</Label>
                <Input id="address" name="address" defaultValue={customer.address ?? ""} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">توضیحات</Label>
                <Textarea id="notes" name="notes" defaultValue={customer.notes ?? ""} />
              </div>
              <div>
                <Label htmlFor="isActive">وضعیت</Label>
                <Select id="isActive" name="isActive" defaultValue={customer.isActive ? "true" : "false"}>
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </Select>
              </div>
              <div className="sm:col-span-2 flex items-end">
                <Button type="submit">ذخیره تغییرات</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سابقه سفارش‌ها</CardTitle>
              <CustomerDeleteModal
                customerId={customer.id}
                customerName={fullName(customer.firstName, customer.lastName)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">سفارشی ثبت نشده.</p>
            ) : (
              orders.map((order) => {
                const paid = paidFromPayments(order.payments);
                const remaining = remainingAmount(order.totalAmount, order.discount, paid);
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block rounded-xl border border-border bg-bg-elevated/50 p-4 transition hover:border-accent/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">#{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {order.service.name} · {toJalaliDateTime(order.createdAt)}
                    </p>
                    <p className="mt-2 text-sm">
                      {formatMoney(order.totalAmount - order.discount)} · باقی‌مانده{" "}
                      <span className="text-warning">{formatMoney(remaining)}</span>
                    </p>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}