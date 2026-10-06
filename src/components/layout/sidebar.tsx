"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Layers,
  BarChart3,
  Printer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/layout/logout-button";

const links = [
  { href: "/", label: "داشبورد", icon: LayoutDashboard },
  { href: "/orders", label: "سفارش‌ها", icon: ClipboardList },
  { href: "/customers", label: "مشتریان", icon: Users },
  { href: "/employees", label: "کارمندان", icon: UserCog },
  { href: "/services", label: "خدمات", icon: Layers },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
];

export function Sidebar({
  userName,
  isOpen,
  onClose,
}: {
  userName?: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-bg-elevated/95 shadow-[var(--shadow-soft)] backdrop-blur-md transition-transform duration-200 ease-in-out",
          "lg:sticky lg:top-0 lg:border-r-0 lg:border-l",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          "fixed lg:static inset-y-0 right-0 z-50",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 lg:justify-start lg:py-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/20 shrink-0">
              <Printer className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-wide text-accent">چاپ کیان تاش</p>
              <p className="text-xs text-text-dim">سیستم مدیریت چاپخانه</p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden rounded-xl p-2 text-text-muted transition hover:bg-surface-hover hover:text-text"
            onClick={onClose}
            aria-label="بستن منو"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-text-muted hover:bg-surface-hover hover:text-text",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <p className="mb-3 truncate px-1 text-sm text-text-muted">{userName ?? "کاربر"}</p>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
