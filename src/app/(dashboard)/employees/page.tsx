import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fullName } from "@/lib/utils";
import { toJalali } from "@/lib/jalali";
import { EmployeeDeleteModal } from "@/components/employees/employee-delete-modal";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="کارمندان"
        description="تیم چاپخانه و صفحه عملکرد هر نفر"
        actions={
          <Link
            href="/employees/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-[#1a1610] hover:bg-accent-hover"
          >
            کارمند جدید
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employees.length === 0 ? (
          <EmptyState title="کارمندی ثبت نشده" className="md:col-span-2 xl:col-span-3" />
        ) : (
          employees.map((emp) => (
            <div key={emp.id}>
              <Link href={`/employees/${emp.id}`}>
                <Card className="h-full transition hover:border-accent/30 cursor-pointer">
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{fullName(emp.firstName, emp.lastName)}</h3>
                        <p className="text-sm text-text-muted">{emp.title || "بدون عنوان"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <Badge tone={emp.isActive ? "success" : "default"}>
                            {emp.isActive ? "فعال" : "غیرفعال"}
                          </Badge>
                          {emp.isDefaultAssignee ? <Badge tone="accent">پیش‌فرض</Badge> : null}
                        </div>
                        <EmployeeDeleteModal employeeId={emp.id} employeeName={fullName(emp.firstName, emp.lastName)} />
                      </div>
                    </div>
                    <p className="text-sm text-text-dim">{emp.phone || "بدون شماره"}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">سفارش‌ها</span>
                      <span>{emp._count.orders}</span>
                    </div>
                    <p className="text-xs text-text-dim">شروع همکاری: {toJalali(emp.startedAt)}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}