import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SmartPOS Mobile Store handles your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      intro="This policy explains what information we collect when you use the SmartPOS Mobile Store website and how we use it. This is a university demonstration project, so the data here is sample data."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Account details you provide when registering, such as your name, email address and phone number.",
            "Order details including items purchased, delivery address and payment method.",
            "Basic technical information required to operate and secure the website.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "To create and manage your account, process orders and provide customer support.",
            "To send order confirmations and status updates.",
            "To improve the catalogue, inventory accuracy and overall shopping experience.",
          ],
        },
        {
          heading: "Passwords and security",
          body: [
            "Passwords are stored using strong one-way hashing and are never kept in plain text.",
            "Sessions are protected using signed, HTTP-only cookies.",
          ],
        },
        {
          heading: "Data retention",
          body: [
            "Order records are retained so that you can view your purchase history and so that reports remain accurate.",
            "Because this is a demo project, data may be reset when the database is re-seeded.",
          ],
        },
        {
          heading: "Contact",
          body: ["To request a copy or deletion of your demo account data, contact our support team."],
        },
      ]}
    />
  );
}
