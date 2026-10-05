"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Store } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function AdminUserMenu({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-content transition-colors hover:bg-surface-muted"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-strong">
          {getInitials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight">{user.name}</span>
          <span className="block text-[11px] leading-tight text-content-muted">Administrator</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-content-subtle" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg"
          >
            <Link
              href="/"
              role="menuitem"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-content hover:bg-surface-sunken"
            >
              <Store className="h-4 w-4 text-content-subtle" /> View storefront
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
