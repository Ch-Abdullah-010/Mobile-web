import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { getCategoriesWithCounts, getFilterFacets, searchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { Checkbox, Field, Input, Label, Select } from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse smartphones, earbuds, chargers, power banks, cases, screen protectors, smart watches and speakers with clear specifications and live stock.",
  alternates: { canonical: "/products" },
};

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;

  const q = first(sp.q);
  const category = first(sp.category);
  const brands = toArray(sp.brand);
  const storage = first(sp.storage);
  const ram = first(sp.ram);
  const minPrice = sp.minPrice ? Number(first(sp.minPrice)) : undefined;
  const maxPrice = sp.maxPrice ? Number(first(sp.maxPrice)) : undefined;
  const inStock = first(sp.inStock) === "true";
  const sort = first(sp.sort) ?? "featured";
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);

  const [result, facets, categories] = await Promise.all([
    searchProducts({
      q,
      category,
      brands,
      storage,
      ram,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      inStock,
      sort,
      page,
    }),
    getFilterFacets(),
    getCategoriesWithCounts(),
  ]);

  function hrefWith(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      q,
      category,
      brand: brands.length ? brands.join(",") : undefined,
      storage,
      ram,
      minPrice: minPrice ? String(minPrice) : undefined,
      maxPrice: maxPrice ? String(maxPrice) : undefined,
      inStock: inStock ? "true" : undefined,
      sort: sort !== "featured" ? sort : undefined,
    };
    for (const [key, value] of Object.entries({ ...base, ...overrides })) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  const activeFilters = [
    category ? { label: categories.find((c) => c.slug === category)?.name ?? category, href: hrefWith({ category: undefined }) } : null,
    ...brands.map((brand) => ({ label: brand, href: hrefWith({ brand: brands.filter((b) => b !== brand).join(",") || undefined }) })),
    storage ? { label: `Storage: ${storage}`, href: hrefWith({ storage: undefined }) } : null,
    ram ? { label: `RAM: ${ram}`, href: hrefWith({ ram: undefined }) } : null,
    inStock ? { label: "In stock", href: hrefWith({ inStock: undefined }) } : null,
    minPrice || maxPrice
      ? { label: `${formatCurrency(minPrice ?? facets.minPrice)} – ${formatCurrency(maxPrice ?? facets.maxPrice)}`, href: hrefWith({ minPrice: undefined, maxPrice: undefined }) }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-content-muted">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-content">Products</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-content">
            {q ? `Search results for “${q}”` : category ? categories.find((c) => c.slug === category)?.name ?? "Products" : "All products"}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            {result.total} {result.total === 1 ? "product" : "products"} found
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-content-muted">Sort by</span>
          <div className="flex flex-wrap gap-1.5">
            {SORTS.map((option) => (
              <Link
                key={option.value}
                href={hrefWith({ sort: option.value === "featured" ? undefined : option.value })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  sort === option.value
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-content-muted hover:bg-surface-muted"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={hrefWith({ category: undefined })}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            !category ? "border-brand bg-brand-soft text-brand-strong" : "border-border text-content-muted hover:bg-surface-muted"
          }`}
        >
          All categories
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={hrefWith({ category: c.slug })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              category === c.slug ? "border-brand bg-brand-soft text-brand-strong" : "border-border text-content-muted hover:bg-surface-muted"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-content-subtle">Filters</span>
          {activeFilters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-content hover:bg-surface-muted"
            >
              {filter.label}
              <X className="h-3 w-3 text-content-subtle" />
            </Link>
          ))}
          <Link href="/products" className="text-xs font-semibold text-brand hover:underline">
            Clear all
          </Link>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <details className="rounded-xl border border-border bg-surface p-4 lg:open" open>
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-content lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </summary>
            <form method="get" action="/products" className="mt-4 space-y-5 lg:mt-0">
              {q ? <input type="hidden" name="q" value={q} /> : null}
              {category ? <input type="hidden" name="category" value={category} /> : null}
              {sort !== "featured" ? <input type="hidden" name="sort" value={sort} /> : null}

              <fieldset>
                <legend className="text-sm font-semibold text-content">Brand</legend>
                <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">
                  {facets.brands.map((brand) => (
                    <Checkbox
                      key={brand}
                      name="brand"
                      value={brand}
                      label={brand}
                      defaultChecked={brands.includes(brand)}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-content">Price (PKR)</legend>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Min" htmlFor="minPrice">
                    <Input
                      id="minPrice"
                      name="minPrice"
                      type="number"
                      min={0}
                      defaultValue={minPrice ?? undefined}
                      placeholder={String(facets.minPrice)}
                    />
                  </Field>
                  <Field label="Max" htmlFor="maxPrice">
                    <Input
                      id="maxPrice"
                      name="maxPrice"
                      type="number"
                      min={0}
                      defaultValue={maxPrice ?? undefined}
                      placeholder={String(facets.maxPrice)}
                    />
                  </Field>
                </div>
              </fieldset>

              {facets.storage.length > 0 ? (
                <Field label="Storage" htmlFor="storage">
                  <Select id="storage" name="storage" defaultValue={storage ?? ""}>
                    <option value="">Any storage</option>
                    {facets.storage.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}

              {facets.ram.length > 0 ? (
                <Field label="RAM" htmlFor="ram">
                  <Select id="ram" name="ram" defaultValue={ram ?? ""}>
                    <option value="">Any RAM</option>
                    {facets.ram.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}

              <div>
                <Label>Availability</Label>
                <div className="mt-2">
                  <Checkbox name="inStock" value="true" label="In stock only" defaultChecked={inStock} />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className={buttonClasses({ className: "flex-1" })}>
                  Apply filters
                </button>
                <Link href="/products" className={buttonClasses({ variant: "outline" })}>
                  Reset
                </Link>
              </div>
            </form>
          </details>
        </aside>

        <div>
          {result.items.length === 0 ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="No products match your filters"
              description="Try removing some filters or searching for a different term."
              action={
                <Link href="/products" className={buttonClasses()}>
                  Clear filters
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
                {result.items.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 3} />
                ))}
              </div>
              <div className="mt-10">
                <Pagination
                  currentPage={result.page}
                  totalPages={result.totalPages}
                  basePath="/products"
                  params={{
                    q,
                    category,
                    brand: brands.length ? brands.join(",") : undefined,
                    storage,
                    ram,
                    minPrice: minPrice ? String(minPrice) : undefined,
                    maxPrice: maxPrice ? String(maxPrice) : undefined,
                    inStock: inStock ? "true" : undefined,
                    sort: sort !== "featured" ? sort : undefined,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
