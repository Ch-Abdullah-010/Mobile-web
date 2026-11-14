"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-muted px-6 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-content">Something went wrong</h1>
      <p className="mt-3 max-w-md text-content-muted">
        An unexpected error occurred while loading this page. You can try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg border border-border-strong bg-surface px-5 text-sm font-semibold text-content hover:bg-surface-muted"
        >
          Back to home
        </Link>
      </div>
      {error.digest ? <p className="mt-8 font-mono text-xs text-content-subtle">Reference: {error.digest}</p> : null}
    </main>
  );
}
