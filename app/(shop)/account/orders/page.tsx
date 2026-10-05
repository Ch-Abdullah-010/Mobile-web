import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { OrderStatusBadge } from "@/components/status-badges";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="Once you place an order, you'll be able to track it here."
        action={
          <Link href="/products" className={buttonClasses()}>
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-content">Order history</h2>
      {orders.map((order) => (
        <article key={order.id} className="rounded-xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-content">{order.orderNumber}</h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-xs text-content-muted">
                Placed on{" "}
                {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-content">{formatCurrency(order.total)}</p>
              <p className="text-xs text-content-muted">{order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
            {order.items.slice(0, 3).map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="truncate text-content-muted">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 text-content">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
            {order.items.length > 3 ? (
              <li className="text-xs text-content-subtle">+ {order.items.length - 3} more item(s)</li>
            ) : null}
          </ul>

          <div className="mt-4 flex justify-end">
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className={buttonClasses({ variant: "outline", size: "sm" })}
            >
              View details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
