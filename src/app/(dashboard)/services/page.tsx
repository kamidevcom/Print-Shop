import { prisma } from "@/lib/prisma";
import {
  createCategoryAction,
  createServiceAction,
  toggleCategoryAction,
  toggleServiceAction,
} from "@/app/actions/entities";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      services: { orderBy: { name: "asc" } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="خدمات" description="دسته‌بندی و خدمات قابل مدیریت از پنل" />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>افزودن دسته / خدمت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <form action={createCategoryAction} className="space-y-3">
              <Label htmlFor="catName">دسته جدید</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input id="catName" name="name" placeholder="مثلاً لمینت" required className="flex-1" />
                <Button type="submit" variant="secondary" className="sm:w-auto">
                  افزودن دسته
                </Button>
              </div>
            </form>

            <form action={createServiceAction} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="categoryId">دسته</Label>
                <Select id="categoryId" name="categoryId" required defaultValue="">
                  <option value="" disabled>
                    انتخاب دسته
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="serviceName">نام خدمت</Label>
                <Input id="serviceName" name="name" required />
              </div>
              <div>
                <Label htmlFor="basePrice">قیمت پایه (اختیاری)</Label>
                <Input id="basePrice" name="basePrice" type="number" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">افزودن خدمت</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{category.name}</CardTitle>
                  <Badge tone={category.isActive ? "success" : "default"}>
                    {category.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await toggleCategoryAction(category.id, !category.isActive);
                  }}
                >
                  <Button type="submit" size="sm" variant="ghost">
                    {category.isActive ? "غیرفعال" : "فعال"}
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.services.length === 0 ? (
                  <p className="text-sm text-text-muted">خدمتی در این دسته نیست.</p>
                ) : (
                  category.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated/40 px-3 py-2.5"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-text-dim">
                          {service.basePrice != null ? formatMoney(service.basePrice) : "بدون قیمت پایه"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={service.isActive ? "accent" : "default"}>
                          {service.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                        <form
                          action={async () => {
                            "use server";
                            await toggleServiceAction(service.id, !service.isActive);
                          }}
                        >
                          <Button type="submit" size="sm" variant="ghost">
                            تغییر
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
