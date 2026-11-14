"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductVisual } from "@/components/product-visual";
import { Button, buttonClasses } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { EmptyState } from "@/components/ui/misc";
import { formatCurrency } from "@/lib/utils";

export function CartView({
  shippingFlatRate,
  freeShippingThreshold,
  taxRate,
}: {
  shippingFlatRate: number;
  freeShippingThreshold: number;
  taxRate: number;
}) {
  const { items, subtotal, count, setQuantity, removeItem, clear } = useCart();

  const shipping = items.length === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFlatRate;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + shipping + tax;
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse our catalogue and add products to your cart to get started."
        action={
          <Link href="/products" className={buttonClasses({ size: "lg" })}>
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {subtotal < freeShippingThreshold ? (
          <p className="rounded-xl border border-info/20 bg-info-soft px-4 py-3 text-sm text-info">
            Add {formatCurrency(remainingForFree)} more to qualify for free delivery.
          </p>
        ) : (
          <p className="rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-sm text-success">
            Your order qualifies for free delivery.
          </p>
        )}

        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 p-4">
              <Link href={`/products/${item.slug}`} className="shrink-0">
                <ProductVisual
                  name={item.name}
                  categorySlug={item.categorySlug}
                  brand={item.brand}
                  image={item.image}
                  className="h-24 w-24 rounded-lg border border-border"
                  sizes="96px"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-content">
                      <Link href={`/products/${item.slug}`} className="hover:text-brand">
                        {item.name}
                      </Link>
                    </h2>
                    {item.variantLabel ? (
                      <p className="text-xs text-content-muted">{item.variantLabel}</p>
                    ) : null}
                    <p className="mt-1 text-sm font-medium text-content">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="rounded-lg p-2 text-content-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    max={Math.max(1, item.stock)}
                    onChange={(next) => setQuantity(item.variantId, next)}
                  />
                  <p className="text-sm font-semibold text-content">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <Link href="/products" className="text-sm font-semibold text-brand hover:underline">
            Continue shopping
          </Link>
          <Button variant="ghost" size="sm" onClick={clear} className="text-danger hover:bg-danger-soft">
            Clear cart
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-32 lg:h-fit">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-content">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-content-muted">Items ({count})</dt>
              <dd className="font-medium text-content">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Delivery</dt>
              <dd className="font-medium text-content">{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Tax</dt>
              <dd className="font-medium text-content">{formatCurrency(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold text-content">Total</dt>
              <dd className="font-bold text-content">{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className={buttonClasses({ size: "lg", className: "mt-6 w-full" })}>
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-center text-xs text-content-subtle">
            Secure checkout · Cash on delivery or demo card payment
          </p>
        </div>
      </aside>
    </div>
  );
}
