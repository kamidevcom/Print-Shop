import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployeePerformance } from "@/lib/queries/employees";
import { updateEmployeeAction } from "@/app/actions/entities";
import { currentJalaliYearMonth } from "@/lib/jalali";
import { PageHeader, StatCard } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatMoney, formatNumber, fullName } from "@/lib/utils";
import { toJalali } from "@/lib/jalali";

const monthNames = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const current = currentJalaliYearMonth();
  const year = Number(sp.year || current.year);
  const month = Number(sp.month || current.month);

  const data = await getEmployeePerformance(id, year, month);
  if (!data) notFound();

  const { employee, stats, commission, orders, monthDeliveredCount } = data;
  const updateWithId = updateEmployeeAction.bind(null, id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={fullName(employee.firstName, employee.lastName)}
        description={`${employee.title || "بدون عنوان"} · شروع همکاری ${toJalali(employee.startedAt)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="کل سفارش‌ها" value={formatNumber(stats.total)} />
        <StatCard label="تکمیل‌شده" value={formatNumber(stats.delivered)} tone="success" />
        <StatCard label="در حال انجام" value={formatNumber(stats.inProgress)} tone="accent" />
        <StatCard label="لغوشده" value={formatNumber(stats.cancelled)} tone="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سهم ماهانه کارمند</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="year">سال</Label>
              <Input id="year" name="year" type="number" defaultValue={year} className="w-28" />
            </div>
            <div>
              <Label htmlFor="month">ماه</Label>
              <Select id="month" name="month" defaultValue={String(month)} className="w-40">
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" variant="secondary">
              محاسبه
            </Button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={`مجموع کار ${monthNames[month - 1]}`}
              value={formatMoney(commission.total)}
              hint={`${formatNumber(monthDeliveredCount)} سفارش تحویل‌شده`}
            />
            <StatCard label="نرخ سهم" value={commission.percentLabel} tone="accent" />
            <StatCard label="مبلغ سهم" value={formatMoney(commission.commission)} tone="success" />
            <StatCard
              label="مجموع مبلغ سفارش‌های اختصاص‌یافته"
              value={formatMoney(stats.assignedTotalAmount)}
              hint="کل دوره (بدون لغو)"
            />
          </div>
          <p className="text-xs text-text-dim">
            زیر ۱۰۰ میلیون: ۳٪ · ۱۰۰ تا ۲۰۰ میلیون: ۵٪ · بالای ۲۰۰ میلیون: ۷٪ — فقط سفارش‌های تحویل‌شده همان ماه
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
<Card>
          <CardHeader>
            <CardTitle>ویرایش مشخصات</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateWithId} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">نام</Label>
                <Input id="firstName" name="firstName" defaultValue={employee.firstName} required />
              </div>
              <div>
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input id="lastName" name="lastName" defaultValue={employee.lastName} required />
              </div>
              <div>
                <Label htmlFor="phone">شماره تماس</Label>
                <Input id="phone" name="phone" defaultValue={employee.phone ?? ""} />
              </div>
              <div>
                <Label htmlFor="title">عنوان</Label>
                <Input id="title" name="title" defaultValue={employee.title ?? ""} />
              </div>
              <div>
                <Label htmlFor="startedAt">تاریخ شروع</Label>
                <Input
                  id="startedAt"
                  name="startedAt"
                  type="date"
                  defaultValue={employee.startedAt.toISOString().slice(0, 10)}
                />
              </div>
              <div>
                <Label htmlFor="isActive">وضعیت</Label>
                <Select id="isActive" name="isActive" defaultValue={employee.isActive ? "true" : "false"}>
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="isDefaultAssignee">انجام‌دهنده پیش‌فرض</Label>
                <Select
                  id="isDefaultAssignee"
                  name="isDefaultAssignee"
                  defaultValue={employee.isDefaultAssignee ? "true" : "false"}
                >
                  <option value="false">خیر</option>
                  <option value="true">بله</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">توضیحات</Label>
                <Textarea id="notes" name="notes" defaultValue={employee.notes ?? ""} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">ذخیره</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سفارش‌های اختصاص‌یافته</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">سفارشی اختصاص داده نشده.</p>
            ) : (
              orders.slice(0, 20).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated/50 p-3 hover:border-accent/30"
                >
                  <div>
                    <p className="font-medium">
                      #{order.orderNumber} · {order.service.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {fullName(order.customer.firstName, order.customer.lastName)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm">{formatMoney(order.totalAmount - order.discount)}</p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
