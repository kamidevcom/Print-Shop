import { createCustomerAction } from "@/app/actions/entities";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CUSTOMER_TYPE_LABELS, CustomerType } from "@/lib/domain";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="مشتری جدید" description="ثبت اطلاعات مشتری چاپخانه" />
      <Card>
        <CardContent>
          <form action={createCustomerAction} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">نام</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div>
              <Label htmlFor="mobile">موبایل</Label>
              <Input id="mobile" name="mobile" required />
            </div>
            <div>
              <Label htmlFor="type">نوع مشتری</Label>
              <Select id="type" name="type" defaultValue={CustomerType.NORMAL}>
                {Object.values(CustomerType).map((type) => (
                  <option key={type} value={type}>
                    {CUSTOMER_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">آدرس</Label>
              <Input id="address" name="address" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">توضیحات</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">ذخیره مشتری</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
