import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Store identity, pricing rules and inventory defaults."
        actions={
          <Link href="/admin/emails" className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-content hover:bg-surface-muted">
            View email log
          </Link>
        }
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
