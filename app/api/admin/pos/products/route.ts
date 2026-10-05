import { fail, ok, requireApiAdmin } from "@/lib/api";
import { searchPosProducts } from "@/lib/queries";

export async function GET(request: Request) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const take = Math.min(24, Math.max(1, Number(searchParams.get("take") ?? 12) || 12));

  const products = await searchPosProducts(q, take);
  return ok({ products });
}
