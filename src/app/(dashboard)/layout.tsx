"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopSearch } from "@/components/layout/top-search";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar
        userName={null}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-h-screen flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-bg/80 px-4 py-3 lg:px-6 lg:py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition hover:border-accent/40 hover:text-accent"
              onClick={() => setSidebarOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="h-5 w-5" />
            </button>
            <TopSearch />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-text-dim lg:block">چاپ کیان تاش · عملیات روزانه</div>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
