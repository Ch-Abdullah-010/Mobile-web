import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ordering, delivery, payments, warranty and returns at SmartPOS Mobile Store.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse the catalogue, open a product, choose your preferred variant and quantity, then add it to your cart. When you are ready, proceed to checkout, confirm your delivery details and place the order.",
  },
  {
    q: "Do I need an account to buy?",
    a: "Yes. An account lets you check out securely and track your orders from the Orders section of your account. Registration takes less than a minute.",
  },
  {
    q: "What payment methods are available?",
    a: "You can choose Cash on Delivery, or a simulated card payment. Card payments in this demonstration store are not processed and no real money is charged.",
  },
  {
    q: "How much is delivery?",
    a: "Delivery is a flat Rs 200 for orders below Rs 100,000. Orders of Rs 100,000 and above qualify for free delivery.",
  },
  {
    q: "How can I track my order?",
    a: "Go to Account → Orders and open the order. You will see its current status, a timeline of updates and the items you purchased.",
  },
  {
    q: "Are the products genuine and covered by warranty?",
    a: "Yes. Each product is listed with its specifications and warranty period. Warranty covers manufacturing defects as described in our return policy.",
  },
  {
    q: "Can I return a product?",
    a: "You can request a return within 7 days of delivery if the item is faulty, damaged or not as described. See our Return & Refund Policy for details.",
  },
  {
    q: "What is SmartPOS?",
    a: "SmartPOS is the management system behind this store. It powers the online catalogue and provides an admin dashboard with a point-of-sale screen, inventory tracking, order management and reports.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Help centre</p>
        <h1 className="mt-2 text-3xl font-bold text-content sm:text-4xl">Frequently asked questions</h1>
        <p className="mt-4 text-content-muted">
          Everything you need to know about shopping with SmartPOS Mobile Store. Still stuck? Our team is one
          message away.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQS.map((item) => (
          <details key={item.q} className="group rounded-xl border border-border bg-surface p-5 shadow-xs">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-semibold text-content">
              {item.q}
              <span className="text-lg leading-none text-content-subtle transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-content-muted">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-surface-muted p-8 text-center">
        <h2 className="text-xl font-bold text-content">Still have a question?</h2>
        <p className="mt-2 text-sm text-content-muted">
          Send us a message and we will get back to you as soon as possible.
        </p>
        <Link href="/contact" className={buttonClasses({ className: "mt-5" })}>
          Contact support
        </Link>
      </div>
    </div>
  );
}
