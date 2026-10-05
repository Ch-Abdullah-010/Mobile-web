import "server-only";
import type { Prisma } from "@prisma/client";
import { makeOrderNumber } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

export async function nextOrderNumber(tx: Tx) {
  const setting = await tx.setting.upsert({
    where: { key: "order_seq" },
    create: { key: "order_seq", value: "0" },
    update: {},
  });

  let seq = Number(setting.value) || 0;
  if (seq === 0) {
    // First online/POS order: continue the sequence after seeded orders.
    seq = await tx.order.count();
  }
  const next = seq + 1;

  await tx.setting.update({ where: { key: "order_seq" }, data: { value: String(next) } });
  return makeOrderNumber(next);
}

export type SaleLine = {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
};

export async function applySaleToInventory(tx: Tx, lines: SaleLine[], reference: string) {
  for (const line of lines) {
    await tx.productVariant.update({
      where: { id: line.variantId },
      data: { stock: { decrement: line.quantity } },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: line.variantId,
        type: "SALE",
        quantity: -line.quantity,
        reason: `Sold via ${reference}`,
        reference,
      },
    });
    await tx.product.update({
      where: { id: line.productId },
      data: { soldCount: { increment: line.quantity } },
    });
  }
}
