import { prisma } from "@/lib/db";
import { fail, fromZodError, getApiUser, ok, readJson } from "@/lib/api";
import { profileSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const user = await getApiUser();
  if (!user) return fail("Please sign in.", 401);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  return ok({ success: true, message: "Profile updated." });
}
