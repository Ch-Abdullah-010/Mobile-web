/**
 * One-off migration of image gallery data for existing SmartPOS databases.
 * Sets Product.images for every seeded product without reseeding (preserves
 * orders, reviews and customer accounts).
 *
 * Run: npx tsx scripts/set-product-images.ts
 */
import { PrismaClient } from "@prisma/client";
import { products, productImagePaths } from "../prisma/seed-data";

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  for (const p of products) {
    const images = JSON.stringify(p.images ?? productImagePaths(p.slug));
    const result = await prisma.product.updateMany({
      where: { slug: p.slug },
      data: { images },
    });
    if (result.count > 0) updated++;
  }
  console.log(`Updated ${updated}/${products.length} products`);
}

main()
  .finally(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });