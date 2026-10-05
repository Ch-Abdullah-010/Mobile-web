import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/misc";
import { ProductVisual } from "@/components/product-visual";
import type { ProductSummary } from "@/lib/queries";
import { discountPercent, formatCurrency, stockLabel } from "@/lib/utils";

export function ProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const out = product.stockState === "out-of-stock";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block">
        <ProductVisual
          name={product.name}
          categorySlug={product.categorySlug}
          brand={product.brand}
          image={product.image}
          priority={priority}
          className="aspect-square w-full"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 ? <Badge tone="danger">-{discount}%</Badge> : null}
          {product.isNew ? <Badge tone="brand">New</Badge> : null}
          {out ? <Badge tone="neutral">Out of stock</Badge> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-content-subtle">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-content">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-brand">
            {product.name}
          </Link>
        </h3>

        {product.reviewCount > 0 ? (
          <div className="mt-2">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
        ) : (
          <p className="mt-2 text-xs text-content-subtle">No reviews yet</p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-content">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <span className="text-sm text-content-subtle line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <p className={`mt-1 text-xs font-medium ${out ? "text-content-subtle" : product.stockState === "low-stock" ? "text-warning" : "text-success"}`}>
            {stockLabel(product.stockState, product.stock)}
          </p>
        </div>
      </div>
    </article>
  );
}
