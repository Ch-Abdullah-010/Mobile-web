import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { categoryInputSchema } from "@/lib/validation";
import { buildCategoryData } from "@/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return fail("Category not found.", 404);

  try {
    const category = await prisma.category.update({ where: { id }, data: buildCategoryData(parsed.data) });
    return ok({ category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("A category with this name or slug already exists.", 409);
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const { id } = await params;
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) return fail("Category not found.", 404);
  if (existing._count.products > 0) {
    return fail("Move or delete the products in this category first.", 409);
  }

  await prisma.category.delete({ where: { id } });
  return ok({ success: true });
}
