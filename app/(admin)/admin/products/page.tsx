import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/form";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductVisual } from "@/components/product-visual";
import { getCategoriesWithCounts } from "@/lib/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "ALL";
  const categoryId = params.category ?? "ALL";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [{ name: { contains: q } }, { brand: { contains: q } }, { sku: { contains: q } }];
  }
  if (status !== "ALL") where.status = status;
  if (categoryId !== "ALL") where.categoryId = categoryId;

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        variants: { select: { stock: true, lowStockThreshold: true, isActive: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getCategoriesWithCounts(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${formatNumber(total)} product${total === 1 ? "" : "s"} in the catalogue.`}
        actions={
          <Link href="/admin/products/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong">
            <Plus className="h-4 w-4" /> New product
          </Link>
        }
      />

      <form className="mb-4 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_180px_200px_auto]">
        <Field label="Search" htmlFor="q">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <Input id="q" name="q" defaultValue={q} placeholder="Name, brand or SKU" className="pl-9" />
          </div>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={status}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </Field>
        <Field label="Category" htmlFor="category">
          <Select id="category" name="category" defaultValue={categoryId}>
            <option value="ALL">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="outline" className="w-full">Filter</Button>
        </div>
      </form>

      {products.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting the filters or add a new product." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="fk">Product catalogue</caption>
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const stock = product.variants
                  .filter((v) => v.isActive)
                  .reduce((sum, v) => sum + v.stock, 0);
                const low = product.variants.some(
                  (v) => v.isActive && v.stock <= v.lowStockThreshold
                );
                return (
                  <tr key={product.id} className="hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductVisual
                          name={product.name}
                          categorySlug="smartphones"
                          brand={product.brand}
                          className="h-10 w-10 shrink-0 rounded-lg border border-border"
                          sizes="40px"
                        />
                        <div className="min-w-0">
                          <Link href={`/admin/products/${product.id}/edit`} className="block truncate font-semibold text-content hover:text-brand">
                            {product.name}
                          </Link>
                          <span className="font-mono text-[11px] text-content-subtle">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-content-muted">{product.category.name}</td>
                    <td className="px-4 py-3 font-medium text-content">{formatCurrency(product.basePrice)}</td>
                    <td className="px-4 py-3">
                      <span className={low ? "font-semibold text-warning" : "text-content-muted"}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={product.status === "ACTIVE" ? "success" : product.status === "ARCHIVED" ? "neutral" : "warning"}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-sm font-semibold text-brand hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/admin/products"
          params={{ q, status, category: categoryId }}
        />
      </div>
    </div>
  );
}
