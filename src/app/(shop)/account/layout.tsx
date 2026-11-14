import { requireUser } from "@/lib/auth/dal";
import { SideNav } from "@/components/side-nav";

const NAV = [
  { label: "Overview", href: "/account", icon: "Home", exact: true },
  { label: "My Orders", href: "/account/orders", icon: "ShoppingCart" },
  { label: "Addresses", href: "/account/addresses", icon: "MapPin" },
  { label: "Profile", href: "/account/profile", icon: "User" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="container-page py-10">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-content">My account</h1>
        <p className="mt-1 text-sm text-content-muted">
          Signed in as <span className="font-medium text-content">{user.email}</span>
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <div className="overflow-x-auto pb-1">
            <SideNav items={NAV} ariaLabel="Account navigation" />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
