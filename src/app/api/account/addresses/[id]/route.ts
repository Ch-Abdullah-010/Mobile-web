import { prisma } from "@/lib/db";
import { fail, fromZodError, getApiUser, ok, readJson } from "@/lib/api";
import { addressSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getApiUser();
  if (!user) return fail("Please sign in.", 401);

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!existing) return fail("Address not found.", 404);

  const data = parsed.data;
  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id },
      data: {
        ...(data.label !== undefined ? { label: data.label } : {}),
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.line1 !== undefined ? { line1: data.line1 } : {}),
        ...(data.line2 !== undefined ? { line2: data.line2 || null } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.postalCode !== undefined ? { postalCode: data.postalCode } : {}),
        ...(data.country !== undefined ? { country: data.country } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
      },
    });
  });

  return ok({ address });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getApiUser();
  if (!user) return fail("Please sign in.", 401);

  const { id } = await params;
  const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!existing) return fail("Address not found.", 404);

  await prisma.address.delete({ where: { id } });
  return ok({ success: true });
}
