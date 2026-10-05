import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package, ShoppingBag, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export default async function AccountOverviewPage() {
  const user = await requireUser();

  const [recentOrders, addressCount, totals, openCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.address.count({ where: { userId: user.id } }),
    prisma.order.aggregate({
      where: { userId: user.id, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({
      where: { userId: user.id, status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] } },
    }),
  ]);

  const stats = [
    { icon: ShoppingBag, label: "Total orders", value: formatNumber(totals._count) },
    { icon: Wallet, label: "Total spent", value: formatCurrency(totals._sum.total ?? 0) },
    { icon: Package, label: "Active orders", value: formatNumber(openCount) },
    { icon: MapPin, label: "Saved addresses", value: formatNumber(addressCount) },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xl font-bold text-content">{value}</p>
            <p className="text-xs text-content-muted">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-content">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-semibold text-brand hover:underline">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={ShoppingBag}
            title="No orders yet"
            description="When you place your first order it will appear here."
            action={
              <Link href="/products" className={buttonClasses()}>
                Start shopping
              </Link>
            }
          />
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <caption className="fk">Recent orders</caption>
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Payment</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-content">{order.orderNumber}</td>
                    <td className="hidden px-4 py-3 text-content-muted sm:table-cell">
                      {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="hidden px-4 py-3 sm:table-cell"><PaymentStatusBadge status={order.paymentStatus} /></td>
                    <td className="px-4 py-3 text-right font-semibold text-content">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
