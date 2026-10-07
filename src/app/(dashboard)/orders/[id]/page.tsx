import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/orders/status-badge";
import { StatusActions } from "@/components/orders/status-actions";
import { FileUploadForm } from "@/components/orders/file-upload-form";
import { OrderEditForm } from "@/components/orders/order-edit-form";
import { PaymentForm } from "@/components/orders/payment-form";
import { formatMoney, fullName, remainingAmount } from "@/lib/utils";
import { toJalaliDateTime } from "@/lib/jalali";
import { PAYMENT_METHOD_LABELS, statusLabel } from "@/lib/order-state";
import { paidFromPayments } from "@/lib/queries/customers";
import { OrderDeleteModal } from "@/components/orders/order-delete-modal";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      service: { include: { category: true } },
      assignee: true,
      payments: { orderBy: { createdAt: "desc" } },
      files: { orderBy: { version: "desc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { firstName: "asc" },
  });

  const paid = paidFromPayments(order.payments);
  const remaining = remainingAmount(order.totalAmount, order.discount, paid);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`سفارش #${order.orderNumber}`}
        description={`${order.service.category.name} / ${order.service.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <PriorityBadge priority={order.priority} />
            <OrderDeleteModal orderId={order.id} orderNumber={String(order.orderNumber)} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoBlock
          label="مشتری"
          value={
            <Link href={`/customers/${order.customerId}`} className="text-accent">
              {fullName(order.customer.firstName, order.customer.lastName)}
            </Link>
          }
          hint={order.customer.mobile}
        />
        <InfoBlock
          label="انجام‌دهنده"
          value={
            order.assignee
              ? fullName(order.assignee.firstName, order.assignee.lastName)
              : "تخصیص نشده"
          }
        />
        <InfoBlock label="ثبت" value={toJalaliDateTime(order.createdAt)} />
        <InfoBlock
          label="تاریخ تحویل"
          value={toJalaliDateTime(order.expectedAt)}
          hint={order.deliveredAt ? `واقعی: ${toJalaliDateTime(order.deliveredAt)}` : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تغییر وضعیت</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusActions
            orderId={order.id}
            current={order.status as import("@/lib/domain").OrderStatus}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>جزئیات و ویرایش</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderEditForm
              orderId={order.id}
              serviceLabel={`${order.service.category.name} / ${order.service.name}`}
              assigneeId={order.assigneeId}
              priority={order.priority}
              totalAmount={order.totalAmount}
              discount={order.discount}
              expectedAt={order.expectedAt}
              description={order.description}
              internalNote={order.internalNote}
              employees={employees}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مالی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="مبلغ" value={formatMoney(order.totalAmount)} />
              <Row label="تخفیف" value={formatMoney(order.discount)} />
              <Row label="پرداخت‌شده" value={formatMoney(paid)} />
              <Row label="باقی‌مانده" value={formatMoney(remaining)} accent />
              <PaymentForm orderId={order.id} />
              <div className="space-y-2 border-t border-border pt-4">
                {order.payments.map((p) => (
                  <div key={p.id} className="rounded-lg bg-bg-elevated/50 px-3 py-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span>{formatMoney(p.amount)}</span>
                      <span className="text-text-dim">{PAYMENT_METHOD_LABELS[p.method]}</span>
                    </div>
                    <p className="mt-1 text-text-dim">{toJalaliDateTime(p.createdAt)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>فایل‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadForm orderId={order.id} />
              <div className="space-y-2">
                {order.files.length === 0 ? (
                  <p className="text-sm text-text-muted">فایلی آپلود نشده.</p>
                ) : (
                  order.files.map((f) => (
                    <a
                      key={f.id}
                      href={`/api/files/${f.id}`}
                      className="block rounded-xl border border-border bg-bg-elevated/40 px-3 py-2 text-sm hover:border-accent/30"
                    >
                      <div className="flex justify-between gap-2">
                        <span className="truncate">{f.fileName}</span>
                        <span className="text-text-dim">v{f.version}</span>
                      </div>
                      {f.notes ? <p className="mt-1 text-xs text-text-muted">{f.notes}</p> : null}
                    </a>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تاریخچه فعالیت</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-r border-border pr-5">
            {order.activities.map((activity) => (
              <li key={activity.id} className="relative">
                <span className="absolute -right-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="mt-1 text-xs text-text-dim">
                  {toJalaliDateTime(activity.createdAt)}
                  {activity.user ? ` · ${activity.user.name}` : ""}
                </p>
              </li>
            ))}
            {order.activities.length === 0 ? (
              <p className="text-sm text-text-muted">فعالیتی ثبت نشده.</p>
            ) : null}
          </ol>
          {order.statusHistory.length > 0 ? (
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-xs text-text-dim">مسیر وضعیت</p>
              <p className="text-sm text-text-muted">
                {order.statusHistory.map((h) => statusLabel(h.toStatus)).join(" ← ")}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="lux-card p-4">
      <p className="text-xs text-text-dim">{label}</p>
      <div className="mt-1 text-base font-medium">{value}</div>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className={accent ? "font-semibold text-warning" : "font-medium"}>{value}</span>
    </div>
  );
}