import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you use the SmartPOS Mobile Store website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="September 2026"
      intro="By using the SmartPOS Mobile Store website you agree to the following terms. This website is a university portfolio project provided for demonstration purposes."
      sections={[
        {
          heading: "Use of the website",
          body: [
            "You agree to use the website lawfully and not to misuse accounts, orders or other users' information.",
            "Product information is provided for demonstration and should not be treated as a commercial offer.",
          ],
        },
        {
          heading: "Accounts",
          body: [
            "You are responsible for keeping your login credentials secure.",
            "We may suspend accounts that are used abusively or fraudulently.",
          ],
        },
        {
          heading: "Pricing and availability",
          body: [
            "All prices are displayed in Pakistani Rupees (PKR).",
            "Stock is validated at checkout. If an item becomes unavailable, the order will not be placed.",
          ],
        },
        {
          heading: "Payments",
          body: [
            "Cash on delivery is supported. Card payments shown in this project are simulated and do not process real money.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "As a demonstration project, the website is provided as-is without commercial warranties.",
          ],
        },
      ]}
    />
  );
}
