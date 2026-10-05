import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Delivery times, charges and tracking for SmartPOS Mobile Store orders.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      updated="September 2026"
      intro="We deliver genuine smartphones and accessories across Pakistan. The details below explain how shipping works in this demonstration store."
      sections={[
        {
          heading: "Delivery charges",
          body: [
            "A flat delivery charge of Rs 200 applies to orders below Rs 100,000.",
            "Orders of Rs 100,000 and above qualify for free delivery.",
          ],
        },
        {
          heading: "Delivery times",
          body: [
            "Orders are typically prepared within 1 business day and delivered within 2–5 business days, depending on your city.",
            "Remote areas may require additional time.",
          ],
        },
        {
          heading: "Order tracking",
          body: [
            "Every order has a unique order number (for example SP-10026).",
            "You can follow the status of your order from the Orders section of your account.",
          ],
        },
        {
          heading: "Cash on delivery",
          body: [
            "Cash on delivery is available. Payment is collected when the courier hands over your parcel.",
          ],
        },
      ]}
    />
  );
}
