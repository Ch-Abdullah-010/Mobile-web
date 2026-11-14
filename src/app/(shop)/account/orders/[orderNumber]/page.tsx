import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Package, X } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badges";
import { Breadcrumbs } from "@/components/ui/misc";
import { ORDER_STATUS_FLOW, ORDER_STATUS_META, PAYMENT_METHODS, type OrderStatus } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

export default async function AccountOrderDetailPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const user = await requireUser();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, history: { orderBy: { createdAt: "asc" } }, payments: true },
  });

  if (!order || order.userId !== user.id) notFound();

  const cancelled = order.status === "CANCELLED";
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status as OrderStatus);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: order.orderNumber },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <h2 className="font-mono text-lg font-bold text-content">{order.orderNumber}</h2>
          <p className="text-xs text-content-muted">
            Placed on{" "}
            {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-content">Order progress</h3>
        {cancelled ? (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
            <X className="h-4 w-4" /> This order was cancelled.
          </p>
        ) : (
          <ol className="mt-4 space-y-0">
            {ORDER_STATUS_FLOW.map((status, index) => {
              const done = index <= currentIndex;
              const meta = ORDER_STATUS_META[status];
              const historyEntry = order.history.find((entry) => entry.status === status);
              return (
                <li key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                        done ? "border-brand bg-brand text-white" : "border-border bg-surface text-content-subtle"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    {index < ORDER_STATUS_FLOW.length - 1 ? (
                      <span className={cn("h-8 w-px", index < currentIndex ? "bg-brand" : "bg-border")} />
                    ) : null}
                  </div>
                  <div className="pb-6">
                    <p className={cn("text-sm font-medium", done ? "text-content" : "text-content-subtle")}>
                      {meta.label}
                    </p>
                    <p className="text-xs text-content-muted">{meta.description}</p>
                    {historyEntry ? (
                      <p className="mt-0.5 text-xs text-content-subtle">
                        {historyEntry.createdAt.toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {historyEntry.note ? ` · ${historyEntry.note}` : ""}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-content">
            <Package className="h-4 w-4 text-brand" /> Items
          </h3>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
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
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-content">Delivery address</h3>
            <address className="mt-2 text-sm not-italic text-content-muted">
              <span className="block font-medium text-content">{order.customerName}</span>
              {order.shippingLine1}
              <br />
              {order.shippingCity} {order.shippingPostal}
              <br />
              {order.shippingCountry}
              <br />
              {order.customerPhone}
            </address>
            <h3 className="mt-4 text-sm font-semibold text-content">Payment</h3>
            <p className="mt-1 text-sm text-content-muted">{PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}</p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-content">Summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
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
                <dt className="text-content">Total</dt>
                <dd className="text-content">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </section>

          <Link
            href="/products"
            className="block rounded-xl border border-dashed border-border-strong bg-surface-muted p-4 text-center text-sm font-semibold text-brand hover:bg-surface"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
