import "server-only";
import { prisma } from "@/lib/db";
import { parseJSON, type StockState, getStockState } from "@/lib/utils";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  image: string | null;
  categoryName: string;
  categorySlug: string;
  colors: string[];
  stock: number;
  stockState: StockState;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  soldCount: number;
  sku: string;
};

const listInclude = {
  category: { select: { name: true, slug: true } },
  variants: {
    where: { isActive: true },
    select: { id: true, stock: true, price: true, color: true, storage: true, ram: true, sku: true, lowStockThreshold: true },
  },
  reviews: { select: { rating: true } },
} as const;

type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  currency: string;
  images: string;
  colors: string;
  sku: string;
  isNew: boolean;
  soldCount: number;
  category: { name: string; slug: string };
  variants: { stock: number; price: number; lowStockThreshold: number }[];
  reviews: { rating: number }[];
};

export function toSummary(product: ProductWithRelations): ProductSummary {
  const images = parseJSON<string[]>(product.images, []);
  const variants = product.variants;
  const stock = variants.reduce((sum, v) => sum + v.stock, 0);
  const minPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : product.basePrice;
  const rating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  const threshold = variants.length ? Math.max(...variants.map((v) => v.lowStockThreshold)) : 5;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    shortDescription: product.shortDescription,
    price: minPrice,
    compareAtPrice: product.compareAtPrice,
    currency: product.currency,
    image: images[0] ?? null,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    colors: parseJSON<string[]>(product.colors, []),
    stock,
    stockState: getStockState(stock, threshold),
    rating,
    reviewCount: product.reviews.length,
    isNew: product.isNew,
    soldCount: product.soldCount,
    sku: product.sku,
  };
}

export type ProductFilters = {
  q?: string;
  category?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  storage?: string;
  ram?: string;
  inStock?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
};

export async function searchProducts(filters: ProductFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? PRODUCTS_PER_PAGE;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { sku: { contains: q } },
      { shortDescription: { contains: q } },
    ];
  }
  if (filters.category) where.category = { slug: filters.category };
  if (filters.brands?.length) where.brand = { in: filters.brands };
  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    where.basePrice = {
      ...(typeof filters.minPrice === "number" ? { gte: filters.minPrice } : {}),
      ...(typeof filters.maxPrice === "number" ? { lte: filters.maxPrice } : {}),
    };
  }
  const variantSome: Record<string, unknown> = { isActive: true };
  if (filters.storage) variantSome.storage = filters.storage;
  if (filters.ram) variantSome.ram = filters.ram;
  if (filters.inStock) variantSome.stock = { gt: 0 };
  if (Object.keys(variantSome).length > 1) where.variants = { some: variantSome };

  const orderBy = (() => {
    switch (filters.sort) {
      case "price-asc":
        return { basePrice: "asc" as const };
      case "price-desc":
        return { basePrice: "desc" as const };
      case "newest":
        return { createdAt: "desc" as const };
      case "popular":
        return { soldCount: "desc" as const };
      default:
        return [{ featured: "desc" as const }, { soldCount: "desc" as const }];
    }
  })();

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: listInclude,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: (rows as unknown as ProductWithRelations[]).map(toSummary),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getFilterFacets() {
  const [brandRows, variantRows, priceRange] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
    prisma.productVariant.findMany({ where: { isActive: true }, select: { storage: true, ram: true } }),
    prisma.product.aggregate({ where: { status: "ACTIVE" }, _min: { basePrice: true }, _max: { basePrice: true } }),
  ]);

  const storage = Array.from(new Set(variantRows.map((v) => v.storage).filter(Boolean))).sort();
  const ram = Array.from(new Set(variantRows.map((v) => v.ram).filter(Boolean))).sort();

  return {
    brands: brandRows.map((b) => b.brand),
    storage,
    ram,
    minPrice: priceRange._min.basePrice ?? 0,
    maxPrice: priceRange._max.basePrice ?? 100000,
  };
}

export async function getProductDetail(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!product) return null;

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const rating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  return { product, stock, rating };
}

export async function getRelatedProducts(productId: string, categoryId: string, take = 4) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: productId } },
    include: listInclude,
    orderBy: { soldCount: "desc" },
    take,
  });
  return (rows as unknown as ProductWithRelations[]).map(toSummary);
}

export async function getFeaturedProducts(take = 4) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: listInclude,
    orderBy: { soldCount: "desc" },
    take,
  });
  return (rows as unknown as ProductWithRelations[]).map(toSummary);
}

export async function getPopularProducts(take = 8) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: listInclude,
    orderBy: { soldCount: "desc" },
    take,
  });
  return (rows as unknown as ProductWithRelations[]).map(toSummary);
}

export async function getNewArrivals(take = 4) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: listInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return (rows as unknown as ProductWithRelations[]).map(toSummary);
}

export async function getAccessoryProducts(take = 8) {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", category: { slug: { not: "smartphones" } } },
    include: listInclude,
    orderBy: { soldCount: "desc" },
    take,
  });
  return (rows as unknown as ProductWithRelations[]).map(toSummary);
}

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    productCount: c._count.products,
  }));
}

export type PosProduct = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  categoryName: string;
  categorySlug: string;
  image: string | null;
  variants: {
    id: string;
    color: string;
    storage: string;
    ram: string;
    sku: string;
    price: number;
    stock: number;
  }[];
};

export async function searchPosProducts(q: string, take = 12): Promise<PosProduct[]> {
  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (q.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term } },
      { brand: { contains: term } },
      { sku: { contains: term } },
      { variants: { some: { sku: { contains: term } } } },
    ];
  }

  const rows = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true, slug: true } },
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
    orderBy: { soldCount: "desc" },
    take,
  });

  return rows.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    image: parseJSON<string[]>(product.images, [])[0] ?? null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      storage: variant.storage,
      ram: variant.ram,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    })),
  }));
}
