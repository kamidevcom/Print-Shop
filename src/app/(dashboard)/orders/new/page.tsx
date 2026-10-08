import { prisma } from "@/lib/prisma";
import { getDefaultCustomerAction } from "@/app/actions/entities";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { NewOrderForm } from "@/components/orders/new-order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const [customers, services, employees, defaultCustomer] = await Promise.all([
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, mobile: true },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, isDefaultAssignee: true },
    }),
    getDefaultCustomerAction(),
  ]);

  // Use URL param customerId, or default customer from database
  const effectiveDefaultCustomerId = customerId || defaultCustomer?.id;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="سفارش سریع" description="ثبت سفارش جدید برای مشتری چاپخانه" />
      <Card>
        <CardContent>
          <NewOrderForm
            customers={customers}
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              categoryName: s.category.name,
            }))}
            employees={employees}
            defaultCustomerId={effectiveDefaultCustomerId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
