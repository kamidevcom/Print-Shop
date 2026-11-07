"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersPaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function OrdersPagination({ page, totalPages, searchParams }: OrdersPaginationProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  function buildPageUrl(p: number): string {
    const params = new URLSearchParams(currentSearchParams);
    params.set("page", String(p));
    return `/orders?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm text-text-muted">
        صفحه {page} از {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1}
          onClick={() => router.push(buildPageUrl(page - 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={page === totalPages}
          onClick={() => router.push(buildPageUrl(page + 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}