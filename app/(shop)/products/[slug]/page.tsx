import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Share2, ShieldCheck, Truck } from "lucide-react";
import { getProductDetail, getRelatedProducts } from "@/lib/queries";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { ProductPurchase, type PurchaseVariant } from "@/components/product-purchase";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, Rating, SectionHeading } from "@/components/ui/misc";
import { Tabs } from "@/components/ui/tabs";
import { SITE } from "@/lib/constants";
import { absoluteUrl, discountPercent, parseJSON, relativeTime } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) return { title: "Product not found" };
  const { product } = data;
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `/products/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) notFound();

  const { product, stock, rating } = data;
  const specs = parseJSON<Record<string, string>>(product.specs, {});
  const colors = parseJSON<string[]>(product.colors, []);
  const images = parseJSON<string[]>(product.images, []);
  const related = await getRelatedProducts(product.id, product.categoryId);

  const variants: PurchaseVariant[] = product.variants.map((v) => ({
    id: v.id,
    color: v.color,
    storage: v.storage,
    ram: v.ram,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    lowStockThreshold: v.lowStockThreshold,
  }));

  const prices = product.variants.map((v) => v.price);
  const discount = discountPercent(Math.min(...prices), product.compareAtPrice);

  const specEntries = [
    product.display ? { key: "Display", value: product.display } : null,
    product.camera ? { key: "Camera", value: product.camera } : null,
    product.battery ? { key: "Battery", value: product.battery } : null,
    product.warranty ? { key: "Warranty", value: product.warranty } : null,
    ...Object.entries(specs).map(([key, value]) => ({ key, value })),
  ].filter(Boolean) as { key: string; value: string }[];

  return (
    <div className="container-page py-8">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.shortDescription,
            sku: product.sku,
            brand: { "@type": "Brand", name: product.brand },
            category: product.category.name,
            ...(colors.length ? { color: colors.join(", ") } : {}),
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: product.currency,
              lowPrice: Math.min(...prices),
              highPrice: Math.max(...prices),
              offerCount: product.variants.length,
              availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: absoluteUrl(`/products/${product.slug}`),
            },
            ...(product.reviews.length > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: rating.toFixed(1),
                    reviewCount: product.reviews.length,
                  },
                }
              : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
              { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/products/${product.slug}`) },
            ],
          },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.category.name, href: `/products?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
            <ProductVisual
              name={product.name}
              categorySlug={product.category.slug}
              brand={product.brand}
              image={images[0] ?? null}
              priority
              className="aspect-square w-full"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            {discount > 0 ? (
              <div className="absolute left-4 top-4">
                <Badge tone="danger">-{discount}% off</Badge>
              </div>
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((image, index) => (
                <ProductVisual
                  key={image}
                  name={`${product.name} view ${index + 1}`}
                  categorySlug={product.category.slug}
                  brand={product.brand}
                  image={image}
                  className="aspect-square rounded-lg border border-border"
                  sizes="140px"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{product.brand}</Badge>
            {product.isNew ? <Badge tone="info">New arrival</Badge> : null}
            {product.featured ? <Badge tone="success">Featured</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-content">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {product.reviews.length > 0 ? (
              <Rating value={rating} count={product.reviews.length} showValue />
            ) : (
              <span className="text-sm text-content-muted">No reviews yet</span>
            )}
            <span className="text-sm text-content-subtle">SKU: {product.sku}</span>
          </div>
          <p className="mt-4 text-content-muted">{product.shortDescription}</p>

          <div className="my-6 border-t border-border" />

          <ProductPurchase
            productId={product.id}
            slug={product.slug}
            name={product.name}
            brand={product.brand}
            categorySlug={product.category.slug}
            image={images[0] ?? null}
            variants={variants}
          />

          <ul className="mt-6 grid gap-3 rounded-xl border border-border bg-surface-muted p-4 sm:grid-cols-3">
            <li className="flex items-center gap-2 text-xs font-medium text-content-muted">
              <Truck className="h-4 w-4 text-brand" /> Nationwide delivery
            </li>
            <li className="flex items-center gap-2 text-xs font-medium text-content-muted">
              <ShieldCheck className="h-4 w-4 text-brand" /> {product.warranty} warranty
            </li>
            <li className="flex items-center gap-2 text-xs font-medium text-content-muted">
              <Check className="h-4 w-4 text-brand" /> 7-day return window
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-14">
        <Tabs
          tabs={[
            {
              label: "Description",
              content: (
                <div className="max-w-3xl space-y-4 text-content-muted">
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                  {colors.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-content">Available colours:</span>
                      {colors.map((color) => (
                        <Badge key={color} tone="neutral">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            },
            {
              label: "Specifications",
              content: (
                <div className="max-w-3xl overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <caption className="fk">Product specifications</caption>
                    <tbody>
                      {specEntries.map((entry, index) => (
                        <tr key={entry.key} className={index % 2 ? "bg-surface-muted" : "bg-surface"}>
                          <th scope="row" className="w-48 px-4 py-3 text-left font-medium text-content-muted">
                            {entry.key}
                          </th>
                          <td className="px-4 py-3 text-content">{entry.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              label: "Reviews",
              count: product.reviews.length,
              content:
                product.reviews.length === 0 ? (
                  <p className="text-content-muted">No reviews yet for this product.</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-content-subtle">
                      Reviews shown are sample data included for demonstration.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {product.reviews.map((review) => (
                        <article key={review.id} className="rounded-xl border border-border bg-surface p-5">
                          <div className="flex items-center justify-between gap-3">
                            <Rating value={review.rating} />
                            <time className="text-xs text-content-subtle" dateTime={review.createdAt.toISOString()}>
                              {relativeTime(review.createdAt)}
                            </time>
                          </div>
                          {review.title ? (
                            <h3 className="mt-3 text-sm font-semibold text-content">{review.title}</h3>
                          ) : null}
                          <p className="mt-2 text-sm text-content-muted">{review.comment}</p>
                          <p className="mt-3 text-xs font-medium text-content">{review.authorName}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ),
            },
          ]}
        />
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow="You may also like"
            title={`More from ${product.category.name}`}
            action={
              <Link href={`/products?category=${product.category.slug}`} className="text-sm font-semibold text-brand hover:underline">
                View category
              </Link>
            }
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex items-center gap-2 text-xs text-content-subtle">
        <Share2 className="h-3.5 w-3.5" />
        <span>
          Prices in {SITE.currency}. Specifications are provided for demonstration purposes.
        </span>
      </div>
    </div>
  );
}
