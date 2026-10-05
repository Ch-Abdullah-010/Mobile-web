import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { ShoppingCart, Wallet } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer detail",
  robots: { index: false, follow: false },
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!customer || customer.role !== "CUSTOMER") notFound();

  const orders = customer.orders;
  const totalSpent = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <AdminPageHeader
        title={customer.name}
        description={`Customer since ${customer.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`}
        actions={
          customer.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Disabled</Badge>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders placed" value={String(orders.length)} icon={ShoppingCart} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} icon={Wallet} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-lg font-bold text-brand-strong">
              {getInitials(customer.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-content">{customer.name}</p>
              <p className="truncate text-sm text-content-muted">{customer.email}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-content-muted">
              <Mail className="h-4 w-4 text-content-subtle" /> {customer.email}
            </p>
            <p className="flex items-center gap-2 text-content-muted">
              <Phone className="h-4 w-4 text-content-subtle" /> {customer.phone || "Not provided"}
            </p>
          </div>

          <h2 className="mt-6 text-sm font-semibold text-content">Saved addresses</h2>
          {customer.addresses.length === 0 ? (
            <p className="mt-2 text-sm text-content-muted">No saved addresses.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {customer.addresses.map((address) => (
                <li key={address.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium text-content">
                    <MapPin className="h-3.5 w-3.5 text-content-subtle" /> {address.label}
                    {address.isDefault ? <Badge tone="brand">Default</Badge> : null}
                  </p>
                  <p className="mt-1 text-content-muted">
                    {address.fullName}, {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    <br />
                    {address.city}, {address.postalCode}, {address.country}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-base font-semibold text-content">Recent orders</h2>
          {orders.length === 0 ? (
            <EmptyState className="mt-4" title="No orders yet" description="This customer has not placed any orders." />
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[560px] text-sm">
                <caption className="fk">Customer orders</caption>
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Payment</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-content-muted">
                        {order.createdAt.toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3 text-right font-semibold text-content">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
