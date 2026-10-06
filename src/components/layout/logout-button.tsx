"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-text-muted transition hover:bg-surface-hover hover:text-text"
      >
        <LogOut className="h-4 w-4" />
        خروج
      </button>
    </form>
  );
}
