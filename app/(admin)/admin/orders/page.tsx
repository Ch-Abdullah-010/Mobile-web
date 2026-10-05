import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badges";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; channel?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "ALL";
  const payment = params.payment ?? "ALL";
  const channel = params.channel ?? "ALL";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } },
      { customerEmail: { contains: q } },
    ];
  }
  if (status !== "ALL") where.status = status;
  if (payment !== "ALL") where.paymentStatus = payment;
  if (channel !== "ALL") where.channel = channel;

  const [total, orders, revenue] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.aggregate({ where: { ...where, status: { not: "CANCELLED" } }, _sum: { total: true } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description={`${formatNumber(total)} matching orders · ${formatCurrency(revenue._sum.total ?? 0)} revenue.`}
      />

      <form className="mb-4 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[1fr_170px_170px_150px_auto]">
        <Field label="Search" htmlFor="q">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <Input id="q" name="q" defaultValue={q} placeholder="Order number or customer" className="pl-9" />
          </div>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={status}>
            <option value="ALL">All statuses</option>
            {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Payment" htmlFor="payment">
          <Select id="payment" name="payment" defaultValue={payment}>
            <option value="ALL">All payments</option>
            {["UNPAID", "PAID", "REFUNDED"].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Channel" htmlFor="channel">
          <Select id="channel" name="channel" defaultValue={channel}>
            <option value="ALL">All channels</option>
            <option value="ONLINE">Online</option>
            <option value="POS">POS</option>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="outline" className="w-full">Filter</Button>
        </div>
      </form>

      {orders.length === 0 ? (
        <EmptyState title="No orders found" description="Try adjusting the filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <caption className="fk">All orders</caption>
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Channel</th>
                <th scope="col" className="px-4 py-3 font-semibold">Items</th>
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
                    <p className="mt-0.5 text-[11px] text-content-subtle">
                      {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-content">{order.customerName}</p>
                    <p className="text-xs text-content-muted">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={order.channel === "POS" ? "brand" : "neutral"}>{order.channel}</Badge>
                  </td>
                  <td className="px-4 py-3 text-content-muted">{order._count.items}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3 text-right font-semibold text-content">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/admin/orders"
          params={{ q, status, payment, channel }}
        />
      </div>
    </div>
  );
}
