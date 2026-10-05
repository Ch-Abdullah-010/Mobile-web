"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cn, formatCurrency, getStockState, stockLabel } from "@/lib/utils";

export type PurchaseVariant = {
  id: string;
  color: string;
  storage: string;
  ram: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};

function variantLabel(variant: PurchaseVariant) {
  return [variant.color, variant.storage, variant.ram].filter(Boolean).join(" · ");
}

export function ProductPurchase({
  productId,
  slug,
  name,
  brand,
  categorySlug,
  image,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  image: string | null;
  variants: PurchaseVariant[];
}) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const selected = variants.find((v) => v.id === variantId) ?? firstAvailable;
  if (!selected) return null;

  const state = getStockState(selected.stock, selected.lowStockThreshold);

  function addToCart() {
    cart.addItem(
      {
        productId,
        variantId: selected.id,
        slug,
        name,
        variantLabel: variantLabel(selected),
        price: selected.price,
        image,
        categorySlug,
        brand,
        stock: selected.stock,
      },
      quantity
    );
    toast({
      title: "Added to cart",
      description: `${name} (${variantLabel(selected)}) × ${quantity}`,
      tone: "success",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold text-content">{formatCurrency(selected.price)}</p>
        <p
          className={cn(
            "mt-1 text-sm font-medium",
            state === "out-of-stock" ? "text-danger" : state === "low-stock" ? "text-warning" : "text-success"
          )}
        >
          {stockLabel(state, selected.stock)}
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-content">
          Choose a variant
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {variants.map((variant) => {
            const active = variant.id === selected.id;
            const disabled = variant.stock <= 0;
            return (
              <button
                key={variant.id}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => {
                  setVariantId(variant.id);
                  setQuantity(1);
                }}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand-strong"
                    : "border-border bg-surface hover:border-brand/40 hover:bg-surface-muted",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="font-medium">
                  {variantLabel(variant)}
                  <span className="ml-2 font-mono text-[11px] text-content-subtle">{variant.sku}</span>
                </span>
                <span className="shrink-0 font-semibold">{formatCurrency(variant.price)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, selected.stock)}
          disabled={selected.stock <= 0}
        />
        <p className="text-sm text-content-muted">
          Subtotal: <span className="font-semibold text-content">{formatCurrency(selected.price * quantity)}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={addToCart} disabled={selected.stock <= 0} size="lg" className="flex-1">
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </Button>
        <Button
          onClick={() => {
            addToCart();
            router.push("/checkout");
          }}
          disabled={selected.stock <= 0}
          variant="secondary"
          size="lg"
          className="flex-1"
        >
          <Zap className="h-4 w-4" /> Buy now
        </Button>
      </div>
    </div>
  );
}
