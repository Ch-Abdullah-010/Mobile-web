import { prisma } from "@/lib/db";
import { fromZodError, fail, ok } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Use a generic message so we never reveal whether an email is registered.
  if (!user || !user.isActive) {
    return fail("Incorrect email or password.", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return fail("Incorrect email or password.", 401);
  }

  await createSession(user);
  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
