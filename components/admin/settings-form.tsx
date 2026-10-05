"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { settingsSchema } from "@/lib/validation";
import type { StoreSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
    taxRate: settings.taxRate,
    shippingFlatRate: settings.shippingFlatRate,
    freeShippingThreshold: settings.freeShippingThreshold,
    lowStockThreshold: settings.lowStockThreshold,
    posDefaultTaxRate: settings.posDefaultTaxRate,
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const parsed = settingsSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Please review the settings", description: parsed.error.issues[0]?.message, tone: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Could not save settings", description: data.error, tone: "error" });
        return;
      }
      toast({ title: "Settings saved", tone: "success" });
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      noValidate
    >
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-base font-semibold text-content">Store details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name" htmlFor="storeName" required>
            <Input id="storeName" value={form.storeName} onChange={(e) => update("storeName", e.target.value)} />
          </Field>
          <Field label="Support email" htmlFor="storeEmail" required>
            <Input id="storeEmail" type="email" value={form.storeEmail} onChange={(e) => update("storeEmail", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="storePhone" required>
            <Input id="storePhone" value={form.storePhone} onChange={(e) => update("storePhone", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor="storeAddress" required>
            <Textarea id="storeAddress" rows={2} value={form.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-base font-semibold text-content">Pricing & inventory</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Tax rate (%)" htmlFor="taxRate" hint="Applied at online checkout.">
            <Input id="taxRate" type="number" min={0} max={100} value={form.taxRate} onChange={(e) => update("taxRate", Number(e.target.value) || 0)} />
          </Field>
          <Field label="Flat shipping (PKR)" htmlFor="shippingFlatRate">
            <Input id="shippingFlatRate" type="number" min={0} value={form.shippingFlatRate} onChange={(e) => update("shippingFlatRate", Number(e.target.value) || 0)} />
          </Field>
          <Field label="Free shipping over (PKR)" htmlFor="freeShippingThreshold">
            <Input id="freeShippingThreshold" type="number" min={0} value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", Number(e.target.value) || 0)} />
          </Field>
          <Field label="Low-stock threshold" htmlFor="lowStockThreshold" hint="Default for new variants.">
            <Input id="lowStockThreshold" type="number" min={0} value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", Number(e.target.value) || 0)} />
          </Field>
          <Field label="POS default tax rate (%)" htmlFor="posDefaultTaxRate">
            <Input id="posDefaultTaxRate" type="number" min={0} max={100} value={form.posDefaultTaxRate} onChange={(e) => update("posDefaultTaxRate", Number(e.target.value) || 0)} />
          </Field>
        </div>
        <p className="mt-4 text-xs text-content-muted">
          Storefront values update immediately after saving. The POS screen loads the default tax rate each time it opens.
        </p>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          <Save className="h-4 w-4" /> Save settings
        </Button>
      </div>
    </form>
  );
}
