import { prisma } from "@/lib/db";
import { fromZodError, fail, ok } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body");
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { email, token, password } = parsed.data;
  const key = `password_reset_${email}`;
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return fail("This reset code is invalid or has expired.", 400);

  let stored: { token: string; expiresAt: string };
  try {
    stored = JSON.parse(setting.value);
  } catch {
    return fail("This reset code is invalid or has expired.", 400);
  }

  if (stored.token !== token || new Date(stored.expiresAt).getTime() < Date.now()) {
    return fail("This reset code is invalid or has expired.", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail("This reset code is invalid or has expired.", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  });
  await prisma.setting.delete({ where: { key } });

  return ok({ success: true, message: "Your password has been updated." });
}
