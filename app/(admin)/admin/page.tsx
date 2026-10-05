import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { OrderStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/ui/misc";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const since = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);

  const [
    revenueAll,
    revenueMonth,
    orderToday,
    customerCount,
    activeProducts,
    variantRows,
    recentOrders,
    topProducts,
    statusGroups,
    seriesOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.productVariant.findMany({
      where: { isActive: true },
      select: { id: true, stock: true, lowStockThreshold: true, sku: true, color: true, storage: true, product: { select: { name: true } } },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.product.findMany({ orderBy: { soldCount: "desc" }, take: 5, select: { id: true, name: true, soldCount: true, basePrice: true } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const lowStock = variantRows
    .filter((v) => v.stock <= v.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const series = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(since.getTime() + index * 24 * 60 * 60 * 1000);
    const key = day.toDateString();
    const dayOrders = seriesOrders.filter((order) => order.createdAt.toDateString() === key);
    return {
      date: day.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length,
    };
  });

  const pendingCount = statusGroups.find((group) => group.status === "PENDING")?._count ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content">Dashboard</h1>
          <p className="mt-1 text-sm text-content-muted">A live snapshot of your store&apos;s performance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/pos" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong">
            Open POS
          </Link>
          <Link href="/admin/orders" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-content hover:bg-surface-muted">
            Orders
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(revenueAll._sum.total ?? 0)}
          icon={DollarSign}
          hint={`${formatCurrency(revenueMonth._sum.total ?? 0)} this month`}
          tone="success"
        />
        <StatCard
          label="Total orders"
          value={formatNumber(revenueAll._count)}
          icon={ShoppingCart}
          hint={`${orderToday} placed today`}
          tone="brand"
        />
        <StatCard
          label="Customers"
          value={formatNumber(customerCount)}
          icon={Users}
          hint={`${pendingCount} pending order${pendingCount === 1 ? "" : "s"}`}
          tone="info"
        />
        <StatCard
          label="Low stock items"
          value={formatNumber(lowStock.length)}
          icon={AlertTriangle}
          hint={`${activeProducts} active products`}
          tone="warning"
        />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-content">Revenue — last 14 days</h2>
            <p className="text-xs text-content-muted">Cancelled orders are excluded.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
            <TrendingUp className="h-3.5 w-3.5" /> Live data
          </span>
        </div>
        <div className="mt-4">
          <SalesChart data={series} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-content">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState className="mt-4" title="No orders yet" description="Orders will appear here as customers check out." />
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <caption className="fk">Recent orders</caption>
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                    <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Customer</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 text-content-muted sm:table-cell">{order.customerName}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-right font-semibold text-content">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-content">
                <Package className="h-4 w-4 text-brand" /> Top products
              </h2>
              <Link href="/admin/products" className="text-xs font-semibold text-brand hover:underline">
                Manage
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {topProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-content-muted">{product.name}</span>
                  <span className="shrink-0 font-semibold text-content">{product.soldCount} sold</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-content">
                <AlertTriangle className="h-4 w-4 text-warning" /> Low stock
              </h2>
              <Link href="/admin/inventory" className="text-xs font-semibold text-brand hover:underline">
                Restock
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-content-muted">All variants are above their stock threshold.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {lowStock.map((variant) => (
                  <li key={variant.id} className="text-sm">
                    <p className="truncate text-content">{variant.product.name}</p>
                    <p className="text-xs text-content-muted">
                      {[variant.color, variant.storage].filter(Boolean).join(" · ")} ·{" "}
                      <span className={variant.stock === 0 ? "font-semibold text-danger" : "font-semibold text-warning"}>
                        {variant.stock} left
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-content">Orders by status</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {statusGroups.map((group) => (
                <li key={group.status} className="flex items-center justify-between">
                  <span className="text-content-muted">
                    {ORDER_STATUS_META[group.status as OrderStatus]?.label ?? group.status}
                  </span>
                  <span className="font-semibold text-content">{group._count}</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
              Manage orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
