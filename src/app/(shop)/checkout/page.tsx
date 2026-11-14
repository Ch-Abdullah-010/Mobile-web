import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your SmartPOS Mobile Store order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await requireUser();
  const [addresses, settings] = await Promise.all([
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    }),
    getSettings(),
  ]);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-content">Checkout</h1>
        <p className="mt-1 text-sm text-content-muted">
          Confirm your delivery details and choose how you&apos;d like to pay.
        </p>
      </header>
      <CheckoutForm
        user={{ name: user.name, email: user.email, phone: user.phone }}
        addresses={addresses.map((address) => ({
          id: address.id,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
          isDefault: address.isDefault,
        }))}
        settings={{
          shippingFlatRate: settings.shippingFlatRate,
          freeShippingThreshold: settings.freeShippingThreshold,
          taxRate: settings.taxRate,
        }}
      />
    </div>
  );
}
