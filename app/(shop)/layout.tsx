import { getCurrentUser } from "@/lib/auth/dal";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user ? { name: user.name, email: user.email, role: user.role } : null} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
