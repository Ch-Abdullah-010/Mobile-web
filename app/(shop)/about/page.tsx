import type { Metadata } from "next";
import Link from "next/link";
import { Award, MapPin, ShieldCheck, Store, Target, Users } from "lucide-react";
import { SITE } from "@/lib/constants";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about SmartPOS Mobile Store — a modern mobile phone and accessories retailer powered by the SmartPOS management system.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldCheck, title: "Genuine products", text: "We only list products with clear specifications and official warranty coverage." },
  { icon: Users, title: "Customer first", text: "Transparent pricing, honest stock information and support before and after purchase." },
  { icon: Target, title: "Smart management", text: "Our SmartPOS system keeps inventory, orders and payments accurate in real time." },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Our story</p>
        <h1 className="mt-2 text-3xl font-bold text-content sm:text-4xl">
          A modern mobile store, run on SmartPOS
        </h1>
        <p className="mt-4 text-content-muted">
          {SITE.fullName} is a demonstration retail business built to showcase a complete e-commerce and
          point-of-sale experience. From browsing the catalogue to checkout, order tracking and in-store
          sales, everything runs on one connected system.
        </p>
      </header>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {[
          { icon: Store, title: "One storefront", text: "A responsive online shop for smartphones and accessories." },
          { icon: Award, title: "One dashboard", text: "A complete admin area for products, stock, orders and reporting." },
          { icon: MapPin, title: "One location", text: SITE.address },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-border bg-surface p-6 shadow-xs">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-content">{title}</h2>
            <p className="mt-1.5 text-sm text-content-muted">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-2xl bg-surface-muted p-8">
        <h2 className="text-2xl font-bold text-content">What we care about</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-brand shadow-xs">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-content">{title}</p>
                <p className="text-sm text-content-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-bold text-content">Visit us or shop online</h2>
        <p className="mx-auto mt-3 max-w-xl text-content-muted">
          Browse the catalogue online or drop by our store. Our team is happy to help you choose the right
          device.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/products" className={buttonClasses({ size: "lg" })}>
            Shop products
          </Link>
          <Link href="/contact" className={buttonClasses({ variant: "outline", size: "lg" })}>
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
