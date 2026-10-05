"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Smartphone,
  User as UserIcon,
  X,
} from "lucide-react";
import { SITE, SHOP_NAV } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { useCart } from "@/components/cart-provider";
import { buttonClasses } from "@/components/ui/button";

type HeaderUser = { name: string; email: string; role: string } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus whenever the route changes
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur">
      <div className="bg-surface-dark text-content-invert">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="truncate">Free delivery on orders over Rs 100,000 — genuine products with official warranty.</p>
          <a href={`tel:${SITE.phone}`} className="hidden font-medium hover:underline sm:block">
            {SITE.phone}
          </a>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label={`${SITE.fullName} home`}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <Smartphone className="h-5 w-5" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-base font-bold text-content">SmartPOS</span>
            <span className="text-[11px] font-medium text-content-muted">Mobile Store</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {SHOP_NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-soft text-brand-strong" : "text-content-muted hover:bg-surface-muted hover:text-content"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submitSearch} role="search" className="ml-auto hidden max-w-xs flex-1 md:block">
          <label htmlFor="site-search" className="fk">
            Search products
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones & accessories"
              className="h-10 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-sm text-content placeholder:text-content-subtle focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-muted hover:text-content"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-content transition-colors hover:bg-surface-muted"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-strong">
                  {getInitials(user.name)}
                </span>
                <span className="hidden max-w-24 truncate md:block">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-content-subtle" />
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg"
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-semibold text-content">{user.name}</p>
                    <p className="truncate text-xs text-content-muted">{user.email}</p>
                  </div>
                  <Link href="/account" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-content hover:bg-surface-sunken">
                    <UserIcon className="h-4 w-4 text-content-subtle" /> My Account
                  </Link>
                  <Link href="/account/orders" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-content hover:bg-surface-sunken">
                    <Package className="h-4 w-4 text-content-subtle" /> My Orders
                  </Link>
                  {user.role === "ADMIN" ? (
                    <Link href="/admin" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-content hover:bg-surface-sunken">
                      <LayoutDashboard className="h-4 w-4 text-content-subtle" /> Admin Dashboard
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={logout}
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-soft"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/auth/register" className={buttonClasses({ variant: "primary", size: "sm" })}>
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-content-muted hover:bg-surface-muted lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <div className="container-page space-y-3 py-4">
            <form onSubmit={submitSearch} role="search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="h-11 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </form>
            <nav aria-label="Mobile" className="grid gap-1">
              {SHOP_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-content hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="grid gap-1 border-t border-border pt-3">
              {user ? (
                <>
                  <Link href="/account" className="rounded-lg px-3 py-2.5 text-sm font-medium text-content hover:bg-surface-muted">
                    My Account
                  </Link>
                  <Link href="/account/orders" className="rounded-lg px-3 py-2.5 text-sm font-medium text-content hover:bg-surface-muted">
                    My Orders
                  </Link>
                  {user.role === "ADMIN" ? (
                    <Link href="/admin" className="rounded-lg px-3 py-2.5 text-sm font-medium text-content hover:bg-surface-muted">
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <button type="button" onClick={logout} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-soft">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-content hover:bg-surface-muted">
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="rounded-lg px-3 py-2.5 text-sm font-medium text-content hover:bg-surface-muted">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
