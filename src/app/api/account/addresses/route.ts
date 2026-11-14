import { prisma } from "@/lib/db";
import { fail, fromZodError, getApiUser, ok, readJson } from "@/lib/api";
import { addressSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return fail("Please sign in.", 401);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const existingCount = await prisma.address.count({ where: { userId: user.id } });
  const makeDefault = data.isDefault || existingCount === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId: user.id,
        label: data.label || "Home",
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: makeDefault,
      },
    });
  });

  return ok({ address }, 201);
}
