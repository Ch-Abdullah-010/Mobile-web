import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with SmartPOS Mobile Store for sales, support and warranty enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const details = [
    { icon: MapPin, label: "Address", value: SITE.address },
    { icon: Phone, label: "Phone", value: SITE.phone, href: `tel:${SITE.phone}` },
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Clock, label: "Store hours", value: "Mon – Sat, 10:00 – 21:00" },
  ];

  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Get in touch</p>
        <h1 className="mt-2 text-3xl font-bold text-content sm:text-4xl">We&apos;d love to hear from you</h1>
        <p className="mt-4 text-content-muted">
          Questions about a product, an order or a warranty claim? Send us a message and our team will respond.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8">
          <h2 className="text-xl font-semibold text-content">Send a message</h2>
          <p className="mt-1 text-sm text-content-muted">
            Messages are delivered to our support team. In this demo they are stored in the admin Email Inbox.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-4">
          {details.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5 shadow-xs">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-content-subtle">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-medium text-content hover:text-brand">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-content">{value}</p>
                )}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted p-5 text-sm text-content-muted">
            Store visits are welcome during opening hours. For warranty claims, please bring your order number
            and proof of purchase.
          </div>
        </aside>
      </div>
    </div>
  );
}
