import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data as object, typeof init === "number" ? { status: init } : init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function fromZodError(error: ZodError) {
  const flattened = error.flatten();
  return NextResponse.json(
    { error: "Please correct the highlighted fields.", fieldErrors: flattened.fieldErrors },
    { status: 422 }
  );
}

export async function getApiUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return user;
}

export async function requireApiAdmin() {
  const user = await getApiUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
