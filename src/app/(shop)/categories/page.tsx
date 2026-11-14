import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoriesWithCounts } from "@/lib/queries";
import { CategoryIcon } from "@/components/category-icon";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore all product categories at SmartPOS Mobile Store — smartphones, audio, charging, power banks, covers, screen protectors, smart watches and speakers.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Browse</p>
        <h1 className="mt-2 text-3xl font-bold text-content sm:text-4xl">Product categories</h1>
        <p className="mt-3 text-content-muted">
          Every category is stocked with genuine products and clear specifications. Pick a category to see
          available models, variants and live stock.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-strong transition-colors group-hover:bg-brand group-hover:text-white">
              <CategoryIcon name={category.icon} className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-content">{category.name}</h2>
            <p className="mt-1 flex-1 text-sm text-content-muted">{category.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              {category.productCount} products <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/products" className={buttonClasses({ variant: "outline", size: "lg" })}>
          Browse all products
        </Link>
      </div>
    </div>
  );
}
