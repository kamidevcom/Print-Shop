"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="جستجو: مشتری، موبایل، شماره سفارش، خدمت..."
        className="pr-10"
      />
    </form>
  );
}
