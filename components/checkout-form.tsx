"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type FieldErrors = Record<string, string[] | undefined>;

export function CheckoutForm({
  user,
  addresses,
  settings,
}: {
  user: { name: string; email: string; phone: string | null };
  addresses: Address[];
  settings: { shippingFlatRate: number; freeShippingThreshold: number; taxRate: number };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, subtotal, clear } = useCart();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedAddress, setSelectedAddress] = useState<string>(defaultAddress?.id ?? "new");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    fullName: defaultAddress?.fullName ?? user.name,
    email: user.email,
    phone: defaultAddress?.phone ?? user.phone ?? "",
    address: defaultAddress?.line1 ?? "",
    city: defaultAddress?.city ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
    country: defaultAddress?.country ?? "Pakistan",
  });

  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFlatRate;
  const tax = Math.round((subtotal * settings.taxRate) / 100);
  const total = subtotal + shipping + tax;

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function chooseAddress(id: string) {
    setSelectedAddress(id);
    if (id === "new") return;
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    setForm({
      fullName: address.fullName,
      email: user.email,
      phone: address.phone,
      address: address.line1,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (items.length === 0) {
      toast({ title: "Your cart is empty", tone: "warning" });
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          notes,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({ title: "Could not place order", description: data.error, tone: "error" });
        return;
      }

      clear();
      toast({ title: "Order placed", description: `Your order ${data.orderNumber} is confirmed.`, tone: "success" });
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch {
      toast({ title: "Network error", description: "Please try again.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted p-8 text-center">
        <p className="font-semibold text-content">Your cart is empty</p>
        <p className="mt-1 text-sm text-content-muted">Add products before checking out.</p>
        <Button className="mt-5" onClick={() => router.push("/products")}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
      <div className="space-y-8">
        {addresses.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-content">Saved addresses</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer flex-col rounded-xl border p-4 text-sm transition-colors ${
                    selectedAddress === address.id
                      ? "border-brand bg-brand-soft"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="addressChoice"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={() => chooseAddress(address.id)}
                      className="accent-[var(--brand)]"
                    />
                    <span className="font-semibold text-content">{address.label}</span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-content-muted">
                        Default
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 text-content-muted">{address.fullName}</span>
                  <span className="text-content-muted">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city} {address.postalCode}
                  </span>
                  <span className="text-content-muted">{address.phone}</span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-4 text-sm transition-colors ${
                  selectedAddress === "new"
                    ? "border-brand bg-brand-soft"
                    : "border-border bg-surface hover:bg-surface-muted"
                }`}
              >
                <input
                  type="radio"
                  name="addressChoice"
                  value="new"
                  checked={selectedAddress === "new"}
                  onChange={() => chooseAddress("new")}
                  className="accent-[var(--brand)]"
                />
                <span className="font-semibold text-content">Use a new address</span>
              </label>
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="text-lg font-semibold text-content">Delivery details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.[0]}>
              <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" required />
            </Field>
            <Field label="Phone" htmlFor="phone" required error={errors.phone?.[0]}>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" required />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email?.[0]} className="sm:col-span-2">
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" required />
            </Field>
            <Field label="Street address" htmlFor="address" required error={errors.address?.[0]} className="sm:col-span-2">
              <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} autoComplete="street-address" required />
            </Field>
            <Field label="City" htmlFor="city" required error={errors.city?.[0]}>
              <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" required />
            </Field>
            <Field label="Postal code" htmlFor="postalCode" required error={errors.postalCode?.[0]}>
              <Input id="postalCode" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} autoComplete="postal-code" required />
            </Field>
            <Field label="Country" htmlFor="country" required error={errors.country?.[0]} className="sm:col-span-2">
              <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} autoComplete="country-name" required />
            </Field>
            <Field label="Order notes (optional)" htmlFor="notes" className="sm:col-span-2">
              <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions, landmark, preferred time…" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-content">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                paymentMethod === "COD" ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="mt-1 accent-[var(--brand)]"
              />
              <span>
                <span className="flex items-center gap-2 font-semibold text-content">
                  <Truck className="h-4 w-4 text-brand" /> Cash on Delivery
                </span>
                <span className="mt-1 block text-xs text-content-muted">Pay in cash when your order arrives.</span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                paymentMethod === "CARD" ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "CARD"}
                onChange={() => setPaymentMethod("CARD")}
                className="mt-1 accent-[var(--brand)]"
              />
              <span>
                <span className="flex items-center gap-2 font-semibold text-content">
                  <CreditCard className="h-4 w-4 text-brand" /> Demo Card Payment
                </span>
                <span className="mt-1 block text-xs text-content-muted">
                  Simulated payment for demonstration — no real charge is made.
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-32 lg:h-fit">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-content">Your order</h2>
          <ul className="mt-4 space-y-3 border-b border-border pb-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-content">{item.name}</span>
                  <span className="block text-xs text-content-muted">
                    {item.variantLabel} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-medium text-content">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-content-muted">Subtotal</dt>
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
          <Button type="submit" size="lg" loading={loading} className="mt-6 w-full">
            <Lock className="h-4 w-4" /> Place order
          </Button>
          <p className="mt-3 text-center text-xs text-content-subtle">
            By placing your order you agree to our terms and policies.
          </p>
        </div>
      </aside>
    </form>
  );
}
