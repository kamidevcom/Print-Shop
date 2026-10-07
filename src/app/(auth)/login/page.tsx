import { Suspense } from "react";
import { Printer } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>
      <div className="lux-card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent ring-1 ring-accent/25">
            <Printer className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">ورود به چاپ کیان تاش</h1>
          <p className="mt-2 text-sm text-text-muted">سیستم مدیریت داخلی چاپخانه</p>
        </div>
        <Suspense fallback={<div className="text-sm text-text-muted">در حال بارگذاری...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
