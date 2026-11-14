import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageNumbers(current: number, total: number) {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  params = {},
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const numbers = pageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <Link
        href={buildHref(basePath, params, Math.max(1, currentPage - 1))}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition-colors",
          currentPage === 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-surface-muted"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>

      {numbers.map((num, i) => {
        const prev = numbers[i - 1];
        const gap = prev && num - prev > 1;
        return (
          <span key={num} className="flex items-center gap-1.5">
            {gap ? <span className="px-1 text-content-subtle">…</span> : null}
            <Link
              href={buildHref(basePath, params, num)}
              aria-current={num === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                num === currentPage
                  ? "border-brand bg-brand text-white"
                  : "border-border hover:bg-surface-muted"
              )}
            >
              {num}
            </Link>
          </span>
        );
      })}

      <Link
        href={buildHref(basePath, params, Math.min(totalPages, currentPage + 1))}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition-colors",
          currentPage === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-surface-muted"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
