import { prisma } from "@/lib/db";
import { fromZodError, fail, ok } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendEmailSafe } from "@/lib/email";

const RESET_TTL_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body");
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = String(Math.floor(100000 + Math.random() * 900000));
    const value = JSON.stringify({ token, expiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString() });
    await prisma.setting.upsert({
      where: { key: `password_reset_${email}` },
      create: { key: `password_reset_${email}`, value },
      update: { value },
    });
    await sendEmailSafe({
      to: email,
      template: "password_reset",
      data: { name: user.name, resetToken: token },
    });
  }

  // Always return success to avoid revealing whether an account exists.
  return ok({ success: true, message: "If an account exists, a reset code has been sent." });
}
