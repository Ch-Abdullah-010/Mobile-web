import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your SmartPOS Mobile Store cart before checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-content">Your cart</h1>
        <p className="mt-1 text-sm text-content-muted">Review your items, then proceed to checkout.</p>
      </header>
      <CartView
        shippingFlatRate={settings.shippingFlatRate}
        freeShippingThreshold={settings.freeShippingThreshold}
        taxRate={settings.taxRate}
      />
    </div>
  );
}
