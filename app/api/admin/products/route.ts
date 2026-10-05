import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { productInputSchema } from "@/lib/validation";
import { buildProductData, syncVariants } from "@/lib/admin";

export async function POST(request: Request) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: buildProductData(input) });
      await syncVariants(tx, created.id, created.sku, input.variants);
      return tx.product.findUniqueOrThrow({ where: { id: created.id } });
    });

    return ok({ product }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("A product with this slug or SKU already exists.", 409);
    }
    throw error;
  }
}
