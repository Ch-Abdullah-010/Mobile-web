import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { productInputSchema } from "@/lib/validation";
import { buildProductData, syncVariants } from "@/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return fail("Product not found.", 404);

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id }, data: buildProductData(input) });
      await syncVariants(tx, id, updated.sku, input.variants);
      return tx.product.findUniqueOrThrow({ where: { id } });
    });
    return ok({ product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("A product with this slug or SKU already exists.", 409);
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const { id } = await params;
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) return fail("Product not found.", 404);

  if (existing._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { status: "INACTIVE" } });
    return ok({ success: true, archived: true, message: "Product has order history, so it was archived instead of deleted." });
  }

  await prisma.product.delete({ where: { id } });
  return ok({ success: true, archived: false });
}
