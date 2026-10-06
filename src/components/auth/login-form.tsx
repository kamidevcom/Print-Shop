"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginState = { error: string } | null;

async function submitLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const result = await loginAction(formData);
  return result ?? null;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(submitLogin, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <Label htmlFor="username">نام کاربری</Label>
        <Input id="username" name="username" defaultValue="admin" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password">رمز عبور</Label>
        <Input
          id="password"
          name="password"
          type="password"
          defaultValue="admin123"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}
