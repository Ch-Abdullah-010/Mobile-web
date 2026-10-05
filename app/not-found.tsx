import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-muted px-6 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
        <Compass className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">404 — Not found</p>
      <h1 className="mt-2 text-3xl font-bold text-content">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-content-muted">
        The page may have been moved or the link is incorrect. Try browsing the shop or search for a product instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong">
          <Home className="h-4 w-4" /> Back to home
        </Link>
        <Link href="/products" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong bg-surface px-5 text-sm font-semibold text-content hover:bg-surface-muted">
          <Search className="h-4 w-4" /> Browse products
        </Link>
      </div>
      <p className="mt-10 text-xs text-content-subtle">
        Looking for your orders? Visit{" "}
        <Link href="/account/orders" className="font-semibold text-brand hover:underline">
          order tracking
        </Link>
        .
      </p>
    </main>
  );
}
