import type { Metadata } from "next";
import { DollarSign, Percent, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { CategoryChart } from "@/components/admin/category-chart";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_META, PAYMENT_METHODS, type OrderStatus } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [orders, items, statusGroups, methodGroups, unitsAgg, recent, previous] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: {
        price: true,
        quantity: true,
        name: true,
        product: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.groupBy({ by: ["paymentMethod"], _count: true, _sum: { total: true } }),
    prisma.orderItem.aggregate({
      where: { order: { status: { not: "CANCELLED" } } },
      _sum: { quantity: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { total: true },
    }),
  ]);

  const monthly = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const label = month.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    const monthOrders = orders.filter(
      (order) => order.createdAt.getFullYear() === month.getFullYear() && order.createdAt.getMonth() === month.getMonth()
    );
    return {
      date: label,
      revenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
      orders: monthOrders.length,
    };
  });

  const categoryTotals = new Map<string, number>();
  const productTotals = new Map<string, { revenue: number; units: number }>();
  let totalRevenue = 0;
  for (const item of items) {
    const line = item.price * item.quantity;
    totalRevenue += line;
    const category = item.product?.category.name ?? "Uncategorised";
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + line);
    const current = productTotals.get(item.name) ?? { revenue: 0, units: 0 };
    productTotals.set(item.name, { revenue: current.revenue + line, units: current.units + item.quantity });
  }

  const categoryData = Array.from(categoryTotals.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = Array.from(productTotals.entries())
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const orderCount = monthly.reduce((sum, month) => sum + month.orders, 0) || recent._count;
  const averageOrderValue = recent._count > 0 ? (recent._sum.total ?? 0) / recent._count : 0;
  const recentRevenue = recent._sum.total ?? 0;
  const previousRevenue = previous._sum.total ?? 0;
  const growth = previousRevenue > 0 ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports" description="Sales performance across products, categories and channels." />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} tone="success" />
        <StatCard label="Units sold" value={formatNumber(unitsAgg._sum.quantity ?? 0)} icon={ShoppingBag} tone="brand" />
        <StatCard label="Avg. order value" value={formatCurrency(averageOrderValue)} icon={Percent} tone="info" hint={`${orderCount} recorded orders`} />
        <StatCard
          label="30-day growth"
          value={growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`}
          icon={growth !== null && growth < 0 ? TrendingDown : TrendingUp}
          tone={growth !== null && growth < 0 ? "danger" : "success"}
          hint={`${formatCurrency(recentRevenue)} in the last 30 days`}
        />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-content">Revenue by month</h2>
        <div className="mt-4">
          <SalesChart data={monthly} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-content">Revenue by category</h2>
          <div className="mt-4">
            <CategoryChart data={categoryData} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-content">Top products by revenue</h2>
          <ul className="mt-4 space-y-3">
            {topProducts.map((product) => (
              <li key={product.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-content-muted">{product.name}</span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold text-content">{formatCurrency(product.revenue)}</span>
                  <span className="block text-xs text-content-subtle">{product.units} units</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5">
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
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-content">Revenue by payment method</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {methodGroups.map((group) => (
              <li key={group.paymentMethod} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <Badge tone="neutral">{PAYMENT_METHODS[group.paymentMethod] ?? group.paymentMethod}</Badge>
                </span>
                <span className="text-right">
                  <span className="block font-semibold text-content">{formatCurrency(group._sum.total ?? 0)}</span>
                  <span className="block text-xs text-content-subtle">{group._count} orders</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
