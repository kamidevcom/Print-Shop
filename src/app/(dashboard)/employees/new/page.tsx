import { createEmployeeAction } from "@/app/actions/entities";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export const dynamic = "force-dynamic";

export default function NewEmployeePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="کارمند جدید" description="ثبت عضو تیم چاپخانه" />
      <Card>
        <CardContent>
          <form action={createEmployeeAction} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">نام</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input id="lastName" name="lastName" required />
            </div>
            <div>
              <Label htmlFor="phone">شماره تماس</Label>
              <Input id="phone" name="phone" />
            </div>
            <div>
              <Label htmlFor="title">عنوان / نقش</Label>
              <Input id="title" name="title" placeholder="مثلاً اپراتور چاپ" />
            </div>
            <div>
              <Label htmlFor="startedAt">تاریخ شروع همکاری</Label>
              <Input id="startedAt" name="startedAt" type="date" />
            </div>
            <div>
              <Label htmlFor="isDefaultAssignee">انجام‌دهنده پیش‌فرض</Label>
              <Select id="isDefaultAssignee" name="isDefaultAssignee" defaultValue="false">
                <option value="false">خیر</option>
                <option value="true">بله</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="username">نام کاربری</Label>
              <Input id="username" name="username" required />
            </div>
            <div>
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">توضیحات</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">ذخیره</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
