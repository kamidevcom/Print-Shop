import Link from "next/link";
import { listCustomersWithStats } from "@/lib/queries/customers";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomerTableRow } from "@/components/customers/customer-table-row";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await listCustomersWithStats(q);

  return (
    <div>
      <PageHeader
        title="مشتریان"
        description="مدیریت مشتریان و وضعیت بدهی"
        actions={
          <Link
            href="/customers/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-[#1a1610] hover:bg-accent-hover"
          >
            مشتری جدید
          </Link>
        }
      />

      <form className="mb-6 max-w-md">
        <Input name="q" defaultValue={q} placeholder="جستجو نام یا موبایل..." />
      </form>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {customers.length === 0 ? (
            <EmptyState title="مشتری‌ای یافت نشد" description="اولین مشتری را ثبت کنید." className="m-5" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-dim">
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">مشتری</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">نوع</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">موبایل</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">تعداد سفارش</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">مجموع خرید</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">بدهی</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">آخرین سفارش</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">وضعیت</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <CustomerTableRow key={c.id} customer={c} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}