import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/product-visual";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      history: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${order.createdAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}`}
        actions={
          <>
            <Badge tone={order.channel === "POS" ? "brand" : "neutral"}>{order.channel}</Badge>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="fk">Order items</caption>
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Item</th>
                  <th scope="col" className="px-4 py-3 font-semibold">SKU</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Qty</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductVisual
                          name={item.name}
                          categorySlug="smartphones"
                          brand=""
                          image={item.image}
                          className="h-10 w-10 shrink-0 rounded-lg border border-border"
                          sizes="40px"
                        />
                        <span className="font-medium text-content">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-content-muted">{item.sku}</td>
                    <td className="px-4 py-3 text-content-muted">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-content-muted">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-content">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-content">Customer</h2>
              <div className="mt-3 space-y-1 text-sm text-content-muted">
                <p className="flex items-center gap-2 text-content">
                  <User className="h-4 w-4 text-content-subtle" /> {order.customerName}
                </p>
                <p>{order.customerEmail}</p>
                <p>{order.customerPhone}</p>
                {order.user ? (
                  <Link href={`/admin/customers/${order.user.id}`} className="inline-block pt-1 text-sm font-semibold text-brand hover:underline">
                    View customer profile
                  </Link>
                ) : (
                  <Badge tone="neutral">Guest / walk-in</Badge>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-content">
                <MapPin className="h-4 w-4 text-content-subtle" /> Shipping address
              </h2>
              <div className="mt-3 text-sm text-content-muted">
                {order.shippingLine1 ? (
                  <address className="not-italic">
                    {order.shippingLine1}
                    {order.shippingLine2 ? <><br />{order.shippingLine2}</> : null}
                    <br />
                    {order.shippingCity}, {order.shippingPostal}
                    <br />
                    {order.shippingCountry}
                  </address>
                ) : (
                  <p>In-store pickup / no shipping address.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-content">Order timeline</h2>
            <ol className="mt-4 space-y-4">
              {order.history.map((entry) => (
                <li key={entry.id} className="relative border-l border-border pl-5">
                  <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-brand" aria-hidden />
                  <p className="text-sm font-semibold text-content">
                    {entry.status}
                  </p>
                  {entry.note ? <p className="text-xs text-content-muted">{entry.note}</p> : null}
                  <p className="text-[11px] text-content-subtle">
                    {entry.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-content">Summary</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-content-muted">Subtotal</dt><dd className="text-content">{formatCurrency(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-content-muted">Discount</dt><dd className="text-content">-{formatCurrency(order.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-content-muted">Shipping</dt><dd className="text-content">{formatCurrency(order.shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-content-muted">Tax</dt><dd className="text-content">{formatCurrency(order.tax)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-content-muted">
              Payment method: {PAYMENT_METHODS[order.paymentMethod] ?? order.paymentMethod}
            </p>
            {order.notes ? (
              <p className="mt-3 rounded-lg bg-surface-muted p-3 text-xs text-content-muted">
                <span className="font-semibold text-content">Notes:</span> {order.notes}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-content">Payments</h2>
            {order.payments.length === 0 ? (
              <p className="mt-2 text-sm text-content-muted">No payment records.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-content">{payment.method} · {payment.provider}</p>
                      <p className="font-mono text-[11px] text-content-subtle">{payment.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-content">{formatCurrency(payment.amount)}</p>
                      <Badge tone={payment.status === "PAID" ? "success" : payment.status === "FAILED" ? "danger" : "warning"}>
                        {payment.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
          />
        </aside>
      </div>
    </div>
  );
}
