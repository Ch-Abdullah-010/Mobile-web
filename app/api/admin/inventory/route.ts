import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { inventoryAdjustSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = inventoryAdjustSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { variantId, type, quantity, reason } = parsed.data;
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { name: true } } },
  });
  if (!variant) return fail("Variant not found.", 404);

  if (type !== "ADJUSTMENT" && quantity < 0) {
    return fail("Quantity must be positive for this movement type.", 422);
  }
  const newStock = variant.stock + quantity;
  if (newStock < 0) {
    return fail(`Adjustment would make stock negative (current: ${variant.stock}).`, 422);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId,
        type,
        quantity,
        reason: reason || null,
        reference: `ADJ-${Date.now()}`,
      },
    });
    return updated;
  });

  return ok({ variant: result, stock: result.stock });
}
