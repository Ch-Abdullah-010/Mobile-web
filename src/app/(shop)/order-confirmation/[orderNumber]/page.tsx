import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ORDER_STATUS_META, PAYMENT_METHODS, type OrderStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/order-confirmation/[orderNumber]">) {
  const { orderNumber } = await params;
  const user = await requireUser();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: true,
      history: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  const statusMeta = ORDER_STATUS_META[order.status as OrderStatus] ?? ORDER_STATUS_META.PENDING;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-success/20 bg-success-soft p-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-content">Thank you, your order is placed!</h1>
          <p className="mt-2 text-content-muted">
            Your order number is <span className="font-mono font-semibold text-content">{order.orderNumber}</span>.
            A confirmation email has been sent to {order.customerEmail}.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
            <Badge tone="neutral">{PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}</Badge>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-content">
              <Package className="h-4 w-4 text-brand" /> Items
            </h2>
            <ul className="mt-3 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    <span className="block font-medium text-content">{item.name}</span>
                    <span className="block text-xs text-content-muted">
                      {item.sku} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-content">{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-content-muted">Subtotal</dt>
                <dd className="text-content">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-content-muted">Delivery</dt>
                <dd className="text-content">{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-content-muted">Tax</dt>
                <dd className="text-content">{formatCurrency(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-content">Delivery to</h2>
            <address className="mt-3 text-sm not-italic text-content-muted">
              <span className="block font-medium text-content">{order.customerName}</span>
              {order.shippingLine1}
              <br />
              {order.shippingCity} {order.shippingPostal}
              <br />
              {order.shippingCountry}
              <br />
              {order.customerPhone}
            </address>
            <h2 className="mt-5 flex items-center gap-2 text-sm font-semibold text-content">
              <Mail className="h-4 w-4 text-brand" /> Payment
            </h2>
            <p className="mt-2 text-sm text-content-muted">
              {PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod} ·{" "}
              <span className="font-medium text-content">
                {order.payments[0]?.status === "PAID" ? "Paid" : "Pay on delivery"}
              </span>
            </p>
            {order.paymentMethod === "CARD" ? (
              <p className="mt-2 text-xs text-content-subtle">
                This card payment is simulated for demonstration purposes.
              </p>
            ) : null}
          </section>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/account/orders/${order.orderNumber}`} className={buttonClasses()}>
            Track this order
          </Link>
          <Link href="/products" className={buttonClasses({ variant: "outline" })}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
