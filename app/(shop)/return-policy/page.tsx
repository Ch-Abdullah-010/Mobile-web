import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "How returns and refunds work at SmartPOS Mobile Store.",
  alternates: { canonical: "/return-policy" },
};

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      title="Return & Refund Policy"
      updated="September 2026"
      intro="We want you to be confident in every purchase. This policy explains when and how you can return an item."
      sections={[
        {
          heading: "Return window",
          body: [
            "You may request a return within 7 days of delivery if the item is faulty, damaged or not as described.",
            "Products must be returned in their original packaging with all accessories.",
          ],
        },
        {
          heading: "Warranty claims",
          body: [
            "Manufacturer warranty covers manufacturing defects for the period stated on the product page.",
            "Warranty does not cover accidental or liquid damage.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            "Approved refunds are issued using the original payment method where possible.",
            "Cash on delivery orders are refunded through a bank transfer to the customer's account.",
          ],
        },
        {
          heading: "How to start a return",
          body: [
            "Contact our support team with your order number and a short description of the issue.",
            "Our team will confirm the next steps and arrange collection or in-store drop-off.",
          ],
        },
      ]}
    />
  );
}
