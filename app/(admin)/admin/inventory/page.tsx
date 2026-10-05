import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InventoryTable } from "@/components/admin/inventory-table";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false, follow: false },
};

export default async function AdminInventoryPage() {
  const [variants, movements] = await Promise.all([
    prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { product: { name: "asc" } },
    }),
    prisma.inventoryMovement.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { variant: { include: { product: { select: { name: true } } } } },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Track stock levels across every product variant and record movements."
      />

      <InventoryTable
        variants={variants.map((variant) => ({
          id: variant.id,
          productName: variant.product.name,
          productSku: variant.product.sku,
          color: variant.color,
          storage: variant.storage,
          ram: variant.ram,
          sku: variant.sku,
          stock: variant.stock,
          lowStockThreshold: variant.lowStockThreshold,
        }))}
      />

      <section className="mt-8">
        <h2 className="text-base font-semibold text-content">Recent stock movements</h2>
        {movements.length === 0 ? (
          <p className="mt-2 text-sm text-content-muted">No stock movements recorded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {movements.map((movement) => (
              <li key={movement.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-content">{movement.variant.product.name}</p>
                  <p className="text-xs text-content-muted">
                    {movement.type} · {movement.reason || "No reason given"} · {relativeTime(movement.createdAt)}
                  </p>
                </div>
                <span
                  className={
                    movement.quantity >= 0
                      ? "font-semibold text-success"
                      : "font-semibold text-danger"
                  }
                >
                  {movement.quantity >= 0 ? "+" : ""}
                  {movement.quantity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
