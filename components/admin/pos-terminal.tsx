"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import type { PosProduct } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ProductVisual } from "@/components/product-visual";
import { cn, formatCurrency } from "@/lib/utils";

type CartLine = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  image: string | null;
  price: number;
  stock: number;
  quantity: number;
};

type Receipt = {
  orderNumber: string;
  total: number;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  tax: number;
  paymentMethod: string;
  customerName: string;
};

export function PosTerminal({ defaultTaxRate }: { defaultTaxRate: number }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const loadProducts = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pos/products?q=${encodeURIComponent(term)}&take=12`);
      const data = await response.json();
      if (response.ok) setProducts(data.products);
    } catch {
      toast({ title: "Could not load products", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handle = setTimeout(() => loadProducts(query), 300);
    return () => clearTimeout(handle);
  }, [query, loadProducts]);

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);
  const appliedDiscount = Math.min(discount, subtotal);
  const tax = Math.round(((subtotal - appliedDiscount) * taxRate) / 100);
  const total = subtotal - appliedDiscount + tax;

  function addVariant(product: PosProduct, variant: PosProduct["variants"][number]) {
    if (variant.stock <= 0) return;
    setLines((prev) => {
      const existing = prev.find((line) => line.variantId === variant.id);
      if (existing) {
        return prev.map((line) =>
          line.variantId === variant.id
            ? { ...line, quantity: Math.min(line.stock, line.quantity + 1) }
            : line
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantLabel: [variant.color, variant.storage, variant.ram].filter(Boolean).join(" · "),
          image: product.image,
          price: variant.price,
          stock: variant.stock,
          quantity: 1,
        },
      ];
    });
  }

  function setQuantity(variantId: string, quantity: number) {
    setLines((prev) =>
      prev
        .map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: Math.max(0, Math.min(line.stock, quantity)) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  function removeLine(variantId: string) {
    setLines((prev) => prev.filter((line) => line.variantId !== variantId));
  }

  function resetSale() {
    setLines([]);
    setDiscount(0);
    setTaxRate(defaultTaxRate);
    setPaymentMethod("CASH");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
  }

  async function completeSale() {
    if (lines.length === 0) {
      toast({ title: "Cart is empty", description: "Add at least one product.", tone: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          })),
          discount: appliedDiscount,
          taxRate,
          paymentMethod,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Sale failed", description: data.error, tone: "error" });
        return;
      }

      setReceipt({
        orderNumber: data.orderNumber,
        total: data.total,
        lines,
        subtotal,
        discount: appliedDiscount,
        tax,
        paymentMethod,
        customerName: customerName || "Walk-in Customer",
      });
      toast({ title: "Sale completed", description: `Order ${data.orderNumber}`, tone: "success" });
      resetSale();
      loadProducts(query);
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <section className="min-w-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, brand or SKU…"
            aria-label="Search products for sale"
            className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm shadow-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        <div className="mt-4 space-y-3">
          {loading && products.length === 0 ? (
            <p className="text-sm text-content-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-strong bg-surface-muted p-6 text-center text-sm text-content-muted">
              No products found.
            </p>
          ) : (
            products.map((product) => (
              <article key={product.id} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <ProductVisual
                    name={product.name}
                    categorySlug={product.categorySlug}
                    brand={product.brand}
                    image={product.image}
                    className="h-14 w-14 shrink-0 rounded-lg border border-border"
                    sizes="56px"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-content">{product.name}</p>
                    <p className="text-xs text-content-muted">
                      {product.brand} · {product.categoryName} · {product.sku}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const disabled = variant.stock <= 0;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => addVariant(product, variant)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                          disabled
                            ? "cursor-not-allowed border-border bg-surface-muted text-content-subtle line-through"
                            : "border-border bg-surface hover:border-brand/40 hover:bg-brand-soft"
                        )}
                      >
                        <span className="block font-semibold text-content">
                          {[variant.color, variant.storage, variant.ram].filter(Boolean).join(" · ")}
                        </span>
                        <span className="block text-content-muted">
                          {formatCurrency(variant.price)} · {disabled ? "out of stock" : `${variant.stock} in stock`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="xl:sticky xl:top-24 xl:h-fit">
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-content">
              <ShoppingCart className="h-4 w-4 text-brand" /> Current sale
            </h2>
            {lines.length > 0 ? (
              <button
                type="button"
                onClick={resetSale}
                className="text-xs font-semibold text-danger hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="max-h-72 overflow-y-auto p-4">
            {lines.length === 0 ? (
              <p className="py-6 text-center text-sm text-content-muted">
                Select a variant to start a sale.
              </p>
            ) : (
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.variantId} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-content">{line.name}</p>
                      <p className="text-xs text-content-muted">{line.variantLabel}</p>
                      <p className="mt-1 text-xs font-semibold text-content">{formatCurrency(line.price)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-content-muted hover:bg-surface-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={line.quantity >= line.stock}
                          onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-content-muted hover:bg-surface-muted disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.variantId)}
                        className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount (PKR)" htmlFor="pos-discount">
                <Input
                  id="pos-discount"
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                />
              </Field>
              <Field label="Tax rate (%)" htmlFor="pos-tax">
                <Input
                  id="pos-tax"
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Customer name" htmlFor="pos-customer">
                <Input
                  id="pos-customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in"
                />
              </Field>
              <Field label="Phone" htmlFor="pos-phone">
                <Input
                  id="pos-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Optional"
                />
              </Field>
            </div>
            <Field label="Email (for receipt)" htmlFor="pos-email">
              <Input
                id="pos-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Optional"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                  paymentMethod === "CASH" ? "border-brand bg-brand-soft text-brand-strong" : "border-border text-content-muted hover:bg-surface-muted"
                )}
              >
                <Banknote className="h-4 w-4" /> Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors",
                  paymentMethod === "CARD" ? "border-brand bg-brand-soft text-brand-strong" : "border-border text-content-muted hover:bg-surface-muted"
                )}
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
            </div>

            <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-content-muted">Subtotal</dt>
                <dd className="text-content">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-content-muted">Discount</dt>
                <dd className="text-content">-{formatCurrency(appliedDiscount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-content-muted">Tax</dt>
                <dd className="text-content">{formatCurrency(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt className="text-content">Total</dt>
                <dd className="text-content">{formatCurrency(total)}</dd>
              </div>
            </dl>

            <Button onClick={completeSale} loading={submitting} size="lg" className="w-full">
              <Receipt className="h-4 w-4" /> Complete sale
            </Button>
          </div>
        </div>
      </aside>

      <Modal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        title="Sale completed"
        description={receipt ? `Order ${receipt.orderNumber}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print receipt
            </Button>
            <Button onClick={() => setReceipt(null)}>New sale</Button>
          </>
        }
      >
        {receipt ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-content-muted">
              <span>Customer</span>
              <span className="font-medium text-content">{receipt.customerName}</span>
            </div>
            <ul className="space-y-2 border-y border-border py-3">
              {receipt.lines.map((line) => (
                <li key={line.variantId} className="flex justify-between gap-3">
                  <span className="text-content-muted">
                    {line.name} <span className="text-xs">({line.variantLabel})</span> × {line.quantity}
                  </span>
                  <span className="font-medium text-content">{formatCurrency(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-content-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-content-muted">
              <span>Discount</span>
              <span>-{formatCurrency(receipt.discount)}</span>
            </div>
            <div className="flex justify-between text-content-muted">
              <span>Tax</span>
              <span>{formatCurrency(receipt.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-content">
              <span>Total ({receipt.paymentMethod})</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
