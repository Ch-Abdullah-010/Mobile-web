import "server-only";
import type { Prisma } from "@prisma/client";
import type { ProductInput, CategoryInput } from "@/lib/validation";
import { slugify } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

export function buildProductData(input: ProductInput) {
  const colors = Array.from(new Set(input.variants.map((v) => v.color).filter(Boolean)));
  const storage = Array.from(
    new Set(input.variants.map((v) => v.storage).filter((v): v is string => Boolean(v)))
  );
  const ram = Array.from(
    new Set(input.variants.map((v) => v.ram).filter((v): v is string => Boolean(v)))
  );

  return {
    name: input.name,
    slug: input.slug || slugify(input.name),
    brand: input.brand,
    sku: input.sku,
    categoryId: input.categoryId,
    description: input.description,
    shortDescription: input.shortDescription,
    basePrice: input.basePrice,
    compareAtPrice: input.compareAtPrice ?? null,
    images: JSON.stringify(input.imageUrl ? [input.imageUrl] : []),
    colors: JSON.stringify(colors),
    storageOptions: JSON.stringify(storage),
    ramOptions: JSON.stringify(ram),
    display: input.display || null,
    camera: input.camera || null,
    battery: input.battery || null,
    warranty: input.warranty || "1 Year",
    specs: JSON.stringify(Object.fromEntries(input.specs.map((s) => [s.key, s.value]))),
    featured: input.featured,
    isNew: input.isNew,
    status: input.status,
  };
}

function variantSku(productSku: string, color: string, storage?: string, ram?: string) {
  const parts = [productSku, color, storage, ram].filter(Boolean).join("-");
  return slugify(parts).toUpperCase().slice(0, 60);
}

export async function syncVariants(tx: Tx, productId: string, productSku: string, variants: ProductInput["variants"]) {
  const keptIds: string[] = [];

  for (const variant of variants) {
    const sku = variant.sku || variantSku(productSku, variant.color, variant.storage, variant.ram);
    const data = {
      color: variant.color,
      storage: variant.storage || "",
      ram: variant.ram || "",
      sku,
      price: variant.price,
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
      isActive: true,
    };

    if (variant.id) {
      const updated = await tx.productVariant.update({ where: { id: variant.id }, data });
      keptIds.push(updated.id);
    } else {
      const created = await tx.productVariant.create({ data: { ...data, productId } });
      keptIds.push(created.id);
    }
  }

  await tx.productVariant.updateMany({
    where: { productId, id: { notIn: keptIds } },
    data: { isActive: false },
  });
}

export function buildCategoryData(input: CategoryInput) {
  return {
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    icon: input.icon || "Smartphone",
    sortOrder: input.sortOrder,
    image: "",
  };
}
