import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { parseJSON } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { where: { isActive: true }, orderBy: { price: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  const specsObject = parseJSON<Record<string, string>>(product.specs, {});
  const images = parseJSON<string[]>(product.images, []);

  const defaultValues: Partial<ProductFormValues> = {
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    sku: product.sku,
    categoryId: product.categoryId,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    display: product.display ?? "",
    camera: product.camera ?? "",
    battery: product.battery ?? "",
    warranty: product.warranty ?? "",
    imageUrl: images[0] ?? "",
    specs: Object.entries(specsObject).map(([key, value]) => ({ key, value })),
    featured: product.featured,
    isNew: product.isNew,
    status: product.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      storage: variant.storage,
      ram: variant.ram,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      lowStockThreshold: variant.lowStockThreshold,
    })),
  };

  return (
    <div>
      <AdminPageHeader title={`Edit ${product.name}`} description={`SKU ${product.sku}`} />
      <ProductForm categories={categories} productId={product.id} defaultValues={defaultValues} />
    </div>
  );
}
