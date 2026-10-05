import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PosTerminal } from "@/components/admin/pos-terminal";

export const metadata: Metadata = {
  title: "Point of Sale",
  robots: { index: false, follow: false },
};

export default async function AdminPosPage() {
  const settings = await getSettings();

  return (
    <div>
      <AdminPageHeader
        title="Point of Sale"
        description="Ring up in-store sales. Stock and order records update instantly."
      />
      <PosTerminal defaultTaxRate={settings.posDefaultTaxRate} />
    </div>
  );
}
