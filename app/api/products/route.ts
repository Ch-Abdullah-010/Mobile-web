import { ok } from "@/lib/api";
import { searchProducts } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("perPage") ?? 12) || 12));

  const result = await searchProducts({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    inStock: searchParams.get("inStock") === "true",
    sort: searchParams.get("sort") ?? undefined,
    page,
    perPage,
  });

  return ok(result);
}
