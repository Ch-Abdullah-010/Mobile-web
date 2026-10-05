import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { CreditCard, DollarSign, RotateCcw, Wallet } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;

function tone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "PAID") return "success";
  if (status === "FAILED") return "danger";
  if (status === "REFUNDED") return "neutral";
  return "warning";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "ALL";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const where: Record<string, unknown> = {};
  if (status !== "ALL") where.status = status;

  const [total, payments, paid, pending, refunded] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { order: { select: { id: true, orderNumber: true, customerName: true } } },
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "REFUNDED" }, _sum: { amount: true } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <AdminPageHeader title="Payments" description="Every payment record captured from online and POS sales." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected" value={formatCurrency(paid._sum.amount ?? 0)} icon={DollarSign} tone="success" />
        <StatCard label="Pending" value={formatCurrency(pending._sum.amount ?? 0)} icon={Wallet} tone="warning" />
        <StatCard label="Refunded" value={formatCurrency(refunded._sum.amount ?? 0)} icon={RotateCcw} tone="neutral" />
        <StatCard label="Records" value={formatNumber(total)} icon={CreditCard} tone="info" />
      </div>

      <form className="mb-4 flex max-w-xs items-end gap-3">
        <Field label="Status" htmlFor="status" className="flex-1">
          <Select id="status" name="status" defaultValue={status}>
            <option value="ALL">All statuses</option>
            {["PENDING", "PAID", "FAILED", "REFUNDED"].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {payments.length === 0 ? (
        <EmptyState title="No payments found" description="Payment records will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="fk">Payment records</caption>
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                <th scope="col" className="px-4 py-3 font-semibold">Method</th>
                <th scope="col" className="px-4 py-3 font-semibold">Provider</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-content">{payment.reference ?? "—"}</p>
                    <p className="text-[11px] text-content-subtle">
                      {payment.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${payment.order.id}`} className="font-mono text-xs font-semibold text-brand hover:underline">
                      {payment.order.orderNumber}
                    </Link>
                    <p className="text-xs text-content-muted">{payment.order.customerName}</p>
                  </td>
                  <td className="px-4 py-3 text-content-muted">
                    {PAYMENT_METHODS[payment.method] ?? payment.method}
                  </td>
                  <td className="px-4 py-3 text-content-muted">{payment.provider}</td>
                  <td className="px-4 py-3"><Badge tone={tone(payment.status)}>{payment.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-semibold text-content">{formatCurrency(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-content-muted">
        Demo notice: payments are simulated for this portfolio project. No real card data is processed or stored.
      </p>

      <div className="mt-6">
        <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/payments" params={{ status }} />
      </div>
    </div>
  );
}
