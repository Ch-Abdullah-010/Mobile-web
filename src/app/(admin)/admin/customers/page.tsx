import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { Input } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatCurrency, formatNumber, relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const where: Record<string, unknown> = { role: "CUSTOMER" };
  if (q) {
    where.OR = [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }];
  }

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { orders: true } } },
    }),
  ]);

  const spend = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: customers.map((c) => c.id) }, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });
  const spendMap = new Map(spend.map((row) => [row.userId, row._sum.total ?? 0]));

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description={`${formatNumber(total)} registered customer${total === 1 ? "" : "s"}.`}
      />

      <form className="mb-4 flex max-w-md gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <Input name="q" defaultValue={q} placeholder="Search name, email or phone" aria-label="Search customers" className="pl-9" />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-lg border border-border-strong bg-surface px-4 text-sm font-semibold text-content hover:bg-surface-muted"
        >
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Registered customers will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="fk">Registered customers</caption>
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                <th scope="col" className="px-4 py-3 font-semibold">Orders</th>
                <th scope="col" className="px-4 py-3 font-semibold">Total spent</th>
                <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-content">{customer.name}</p>
                    <p className="text-xs text-content-muted">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-content-muted">{customer.phone || "—"}</td>
                  <td className="px-4 py-3 text-content-muted">{customer._count.orders}</td>
                  <td className="px-4 py-3 font-medium text-content">
                    {formatCurrency(spendMap.get(customer.id) ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-content-muted">{relativeTime(customer.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-brand hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/customers" params={{ q }} />
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-content-muted">
        <Badge tone="info">Privacy</Badge>
        Customer data is only visible to signed-in administrators.
      </p>
    </div>
  );
}
