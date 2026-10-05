import { prisma } from "@/lib/db";
import { fromZodError, fail, ok } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { sendEmailSafe } from "@/lib/email";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("An account with this email already exists.", 409);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await sendEmailSafe({ to: user.email, template: "welcome", data: { name: user.name } });
  await createSession(user);

  return ok({ user: { id: user.id, name: user.name, email: user.email } }, 201);
}
