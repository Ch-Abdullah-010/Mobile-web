import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import {
  getAccessoryProducts,
  getCategoriesWithCounts,
  getFeaturedProducts,
  getNewArrivals,
  getPopularProducts,
  searchProducts,
} from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ProductVisual } from "@/components/product-visual";
import { SITE } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: `${SITE.fullName} — ${SITE.tagline}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

const VALUE_PROPS = [
  { icon: ShieldCheck, title: "Official warranty", text: "Every device is covered by the manufacturer's official warranty." },
  { icon: Truck, title: "Nationwide delivery", text: "Fast courier delivery across Pakistan with order tracking." },
  { icon: CreditCard, title: "Flexible payments", text: "Pay by cash on delivery or a simulated card checkout." },
  { icon: Headphones, title: "Real support", text: "Talk to our team before and after your purchase." },
];

export default async function HomePage() {
  const [categories, featured, newArrivals, popular, accessories, reviewRows, productCount] =
    await Promise.all([
      getCategoriesWithCounts(),
      getFeaturedProducts(4),
      getNewArrivals(4),
      getPopularProducts(8),
      getAccessoryProducts(4),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { product: { select: { name: true, slug: true } } },
      }),
      searchProducts({ perPage: 1 }),
    ]);

  const heroProduct = featured[0] ?? popular[0];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.fullName,
            url: SITE.url,
            email: SITE.email,
            telephone: SITE.phone,
            description: SITE.description,
            address: { "@type": "PostalAddress", streetAddress: SITE.address, addressCountry: "PK" },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.fullName,
            url: SITE.url,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE.url}/products?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border bg-surface-muted">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge tone="brand" className="mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Smart Shopping. Smarter Management.
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight text-content sm:text-5xl">
              The latest smartphones & accessories, <span className="text-gradient-brand">all in one store</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-content-muted">
              Compare clear specifications, choose the right variant, check real stock levels and track every
              order from your account. Powered by the SmartPOS management system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products?category=smartphones" className={buttonClasses({ size: "lg" })}>
                Shop smartphones <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products" className={buttonClasses({ variant: "outline", size: "lg" })}>
                Browse all products
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-content-subtle">Products</dt>
                <dd className="text-2xl font-bold text-content">{formatNumber(productCount.total)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-content-subtle">Categories</dt>
                <dd className="text-2xl font-bold text-content">{categories.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-content-subtle">Warranty</dt>
                <dd className="text-2xl font-bold text-content">Official</dd>
              </div>
            </dl>
          </div>

          {heroProduct ? (
            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-lg">
                <ProductVisual
                  name={heroProduct.name}
                  categorySlug={heroProduct.categorySlug}
                  brand={heroProduct.brand}
                  image={heroProduct.image}
                  priority
                  className="aspect-square w-full rounded-xl"
                  sizes="(max-width: 1024px) 80vw, 420px"
                />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-content-subtle">
                      {heroProduct.brand}
                    </p>
                    <p className="font-semibold text-content">{heroProduct.name}</p>
                  </div>
                  <Badge tone="success">In stock</Badge>
                </div>
              </div>
              <div className="absolute -left-4 top-10 hidden rounded-xl border border-border bg-surface px-4 py-3 shadow-md sm:block">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-content">
                  <BadgeCheck className="h-4 w-4 text-success" /> Genuine products
                </p>
              </div>
              <div className="absolute -bottom-4 right-4 hidden rounded-xl border border-border bg-surface px-4 py-3 shadow-md sm:block">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-content">
                  <PackageCheck className="h-4 w-4 text-brand" /> Live stock levels
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-content">{title}</p>
                <p className="text-xs text-content-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          description="From flagship smartphones to everyday essentials, find exactly what you need."
          action={
            <Link href="/products" className={buttonClasses({ variant: "outline", size: "sm" })}>
              All products <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-strong transition-colors group-hover:bg-brand group-hover:text-white">
                <CategoryIcon name={category.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-content">{category.name}</span>
                <span className="block text-xs text-content-muted">{category.productCount} products</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="Popular right now"
            title="Featured products"
            description="Hand-picked devices and accessories loved by our customers."
            action={
              <Link href="/products?sort=popular" className={buttonClasses({ variant: "outline", size: "sm" })}>
                View more <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-accent-soft p-8">
            <Badge tone="brand" className="mb-4">Accessories</Badge>
            <h2 className="text-2xl font-bold text-content sm:text-3xl">
              Everything that goes with your phone
            </h2>
            <p className="mt-3 text-content-muted">
              Earbuds, fast chargers, power banks, protective cases, screen protectors, smart watches and
              speakers — all tested for compatibility.
            </p>
            <Link href="/products?category=audio" className={buttonClasses({ className: "mt-6", size: "lg" })}>
              Shop accessories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {accessories.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="Just landed"
            title="New arrivals"
            description="The newest additions to our shelves."
            action={
              <Link href="/products?sort=newest" className={buttonClasses({ variant: "outline", size: "sm" })}>
                See what&apos;s new <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Customer feedback"
          title="What shoppers say"
          description="Sample reviews from our demo dataset, shown to illustrate the review experience."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviewRows.map((review) => (
            <figure key={review.id} className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-1" aria-label={`Rated ${review.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-border-strong"}`}
                  />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm text-content-muted">&quot;{review.comment}&quot;</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-content">{review.authorName}</span>
                <span className="block text-xs text-content-subtle">
                  on{" "}
                  <Link href={`/products/${review.product.slug}`} className="hover:text-brand">
                    {review.product.name}
                  </Link>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="rounded-2xl bg-surface-dark px-8 py-12 text-center text-content-invert">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to find your next device?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            Browse the full catalogue, add items to your cart and check out in minutes. Create an account to
            track your orders.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products" className={buttonClasses({ size: "lg" })}>
              Start shopping
            </Link>
            <Link
              href="/auth/register"
              className={buttonClasses({ variant: "outline", size: "lg", className: "border-white/30 bg-transparent text-white hover:bg-white/10" })}
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
