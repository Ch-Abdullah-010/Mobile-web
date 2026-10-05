import { ok } from "@/lib/api";
import { deleteSession } from "@/lib/auth/session";

export async function POST() {
  await deleteSession();
  return ok({ success: true });
}
