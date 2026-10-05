import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { categoryInputSchema } from "@/lib/validation";
import { buildCategoryData } from "@/lib/admin";

export async function POST(request: Request) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    const category = await prisma.category.create({ data: buildCategoryData(parsed.data) });
    return ok({ category }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("A category with this name or slug already exists.", 409);
    }
    throw error;
  }
}
