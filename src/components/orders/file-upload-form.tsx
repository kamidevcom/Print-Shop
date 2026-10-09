"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function FileUploadForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("orderId", orderId);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        showToast("error", "آپلود ناموفق بود.");
        return;
      }
      showToast("success", "فایل با موفقیت آپلود شد.");
      form.reset();
      router.refresh();
    } catch {
      showToast("error", "خطا در آپلود فایل.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:items-end">
      <div className="sm:col-span-2">
        <Label htmlFor="file">فایل</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notes">توضیح فایل</Label>
        <Input id="notes" name="notes" placeholder="مثلاً نسخه نهایی" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full sm:w-auto">
          {pending ? "در حال آپلود..." : "آپلود فایل"}
        </Button>
      </div>
    </form>
  );
}
