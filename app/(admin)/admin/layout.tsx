import Link from "next/link";
import { Smartphone } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { ADMIN_NAV } from "@/lib/constants";
import { SideNav } from "@/components/side-nav";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const navItems = ADMIN_NAV.map((item) =>
    item.href === "/admin" ? { ...item, exact: true } : item
  );

  return (
    <div className="flex min-h-dvh bg-surface-muted">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <Smartphone className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold text-content">SmartPOS</span>
            <span className="text-[11px] text-content-muted">Admin Console</span>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SideNav items={navItems} ariaLabel="Admin navigation" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-surface">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <Smartphone className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-content">SmartPOS Admin</span>
            </Link>
            <p className="hidden text-sm font-semibold text-content lg:block">Admin Console</p>
            <div className="ml-auto">
              <AdminUserMenu user={{ name: admin.name, email: admin.email }} />
            </div>
          </div>
          <div className="overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
            <SideNav items={navItems} ariaLabel="Admin navigation mobile" />
          </div>
        </header>

        <main id="main" className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
