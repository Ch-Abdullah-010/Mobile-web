import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories, products, customers, settings, productImagePaths } from "./seed-data";

const prisma = new PrismaClient();

// Deterministic pseudo-random generator so seeded demo data is reproducible.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260918);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

function colorCode(color: string) {
  const alpha = color.replace(/[^a-zA-Z]/g, "");
  return (alpha.slice(0, 3) || "STD").toUpperCase();
}

const reviewComments = [
  "Genuine product and sealed box. Delivery was quick and the packaging was excellent.",
  "Great value for the price. Battery easily lasts a full day of heavy use.",
  "Camera quality is impressive in daylight and low-light shots are decent too.",
  "Bought this for my brother and he loves it. Official warranty card was included.",
  "Display is bright and colours look great. Build feels premium in the hand.",
  "Works exactly as described. Customer support answered all my questions.",
  "Good product but slightly heavy. Performance is smooth for daily apps.",
  "Fast charging is a lifesaver. Very happy with the purchase.",
  "Sound quality is rich with good bass. Paired instantly with my phone.",
  "Solid build quality and the fit is perfect. Would recommend.",
  "Exactly what I expected. Will definitely order again from SmartPOS.",
  "Decent product for the price point. Does the job well.",
];

const statusFlow: Record<string, string[]> = {
  PENDING: ["PENDING"],
  CONFIRMED: ["PENDING", "CONFIRMED"],
  PROCESSING: ["PENDING", "CONFIRMED", "PROCESSING"],
  SHIPPED: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"],
  DELIVERED: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
  CANCELLED: ["PENDING", "CANCELLED"],
};

async function main() {
  console.log("Clearing existing data...");
  await prisma.emailLog.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating categories...");
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        image: "",
        sortOrder: c.sortOrder,
      },
    });
    categoryMap.set(c.slug, created.id);
  }

  console.log("Creating products and variants...");
  type VariantMeta = { id: string; productId: string; sku: string; name: string; price: number; stock: number };
  const variantMeta: VariantMeta[] = [];
  const variantProductName = new Map<string, string>();

  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        sku: p.sku,
        categoryId: categoryMap.get(p.category)!,
        description: p.description,
        shortDescription: p.shortDescription,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice ?? null,
        images: JSON.stringify(p.images ?? productImagePaths(p.slug)),
        colors: JSON.stringify(p.variants.map((v) => v.color)),
        storageOptions: JSON.stringify(Array.from(new Set(p.variants.map((v) => v.storage).filter(Boolean)))),
        ramOptions: JSON.stringify(Array.from(new Set(p.variants.map((v) => v.ram).filter(Boolean)))),
        display: p.display ?? null,
        camera: p.camera ?? null,
        battery: p.battery ?? null,
        warranty: p.warranty ?? "1 Year",
        specs: JSON.stringify(p.specs),
        featured: p.featured ?? false,
        isNew: p.isNew ?? false,
        soldCount: p.soldCount,
        viewCount: p.soldCount * between(3, 9),
      },
    });

    const seen = new Set<string>();
    for (const v of p.variants) {
      let sku = `${p.sku}-${colorCode(v.color)}`;
      if (v.storage) sku += `-${v.storage.replace(/[^0-9]/g, "")}`;
      if (seen.has(sku)) sku += `-${seen.size}`;
      seen.add(sku);
      const variant = await prisma.productVariant.create({
        data: {
          productId: created.id,
          sku,
          color: v.color,
          storage: v.storage ?? "",
          ram: v.ram ?? "",
          price: v.price,
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold ?? 5,
        },
      });
      variantMeta.push({
        id: variant.id,
        productId: created.id,
        sku,
        name: created.name,
        price: v.price,
        stock: v.stock,
      });
      variantProductName.set(variant.id, created.name);
    }
  }

  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.create({
    data: {
      name: "SmartPOS Admin",
      email: "admin@smartpos.dev",
      passwordHash: adminPassword,
      phone: "+92 21 1234567",
      role: "ADMIN",
      isDemo: true,
    },
  });

  const customerPassword = await bcrypt.hash("Customer@123", 10);
  const customerRecords: { id: string; name: string; email: string; phone: string; line1: string; city: string; postal: string }[] = [];
  for (const c of customers) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        passwordHash: customerPassword,
        phone: c.phone,
        role: "CUSTOMER",
        isDemo: true,
        addresses: {
          create: {
            label: "Home",
            fullName: c.name,
            phone: c.phone,
            line1: c.line1,
            city: c.city,
            postalCode: c.postal,
            country: "Pakistan",
            isDefault: true,
          },
        },
      },
    });
    customerRecords.push({ id: user.id, name: c.name, email: c.email, phone: c.phone, line1: c.line1, city: c.city, postal: c.postal });
  }

  console.log("Creating reviews...");
  const allProducts = await prisma.product.findMany({ select: { id: true, categoryId: true } });
  const smartphoneCatId = categoryMap.get("smartphones")!;
  for (const product of allProducts) {
    const count = product.categoryId === smartphoneCatId ? between(2, 4) : between(1, 3);
    for (let i = 0; i < count; i++) {
      const reviewer = pick(customerRecords);
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: reviewer.id,
          authorName: reviewer.name,
          rating: rand() > 0.25 ? 5 : between(3, 4),
          title: pick(["Excellent purchase", "Highly recommended", "Great value", "Very satisfied", "Good product"]),
          comment: pick(reviewComments),
          isDemo: true,
        },
      });
    }
  }

  console.log("Creating demo orders...");
  const allVariants = await prisma.productVariant.findMany();
  const statusPlan: { status: string; count: number }[] = [
    { status: "DELIVERED", count: 10 },
    { status: "SHIPPED", count: 4 },
    { status: "PROCESSING", count: 3 },
    { status: "CONFIRMED", count: 3 },
    { status: "PENDING", count: 3 },
    { status: "CANCELLED", count: 2 },
  ];
  const statuses: string[] = [];
  for (const sp of statusPlan) for (let i = 0; i < sp.count; i++) statuses.push(sp.status);

  const soldByVariant: Record<string, number> = {};
  let orderSeq = 10001;
  const now = Date.now();

  for (const status of statuses) {
    const customer = pick(customerRecords);
    const itemCount = between(1, 3);
    const chosen = new Set<string>();
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      let variant = pick(allVariants);
      let guard = 0;
      while (chosen.has(variant.id) && guard++ < 5) variant = pick(allVariants);
      if (chosen.has(variant.id)) continue;
      chosen.add(variant.id);
      const quantity = status === "CANCELLED" ? between(1, 2) : between(1, 2);
      items.push({ variant, quantity });
    }
    if (items.length === 0) continue;

    let subtotal = 0;
    for (const it of items) subtotal += it.variant.price * it.quantity;
    const discount = rand() > 0.7 ? Math.round((subtotal * 0.05) / 50) * 50 : 0;
    const shipping = subtotal - discount >= 100000 ? 0 : 200;
    const tax = 0;
    const total = subtotal - discount + shipping + tax;

    const daysAgo = between(0, 29);
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - between(0, 20) * 60 * 60 * 1000);
    const paid = ["DELIVERED", "SHIPPED", "PROCESSING"].includes(status);
    const paymentMethod = rand() > 0.45 ? "CARD" : "COD";

    const order = await prisma.order.create({
      data: {
        orderNumber: `SP-${orderSeq++}`,
        userId: customer.id,
        channel: "ONLINE",
        status,
        paymentStatus: paid ? "PAID" : status === "CANCELLED" ? "UNPAID" : "UNPAID",
        paymentMethod,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingLine1: customer.line1,
        shippingCity: customer.city,
        shippingPostal: customer.postal,
        shippingCountry: "Pakistan",
        subtotal,
        discount,
        shipping,
        tax,
        total,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: items.map((it) => ({
            productId: it.variant.productId,
            variantId: it.variant.id,
            name: variantProductName.get(it.variant.id) ?? it.variant.sku,
            sku: it.variant.sku,
            price: it.variant.price,
            quantity: it.quantity,
            lineTotal: it.variant.price * it.quantity,
          })),
        },
        payments: {
          create: {
            method: paymentMethod,
            provider: "DEMO",
            amount: total,
            status: paid ? "PAID" : "PENDING",
            reference: `TXN-${orderSeq}-${between(100000, 999999)}`,
            createdAt,
          },
        },
      },
    });

    const flow = statusFlow[status];
    for (let i = 0; i < flow.length; i++) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: flow[i],
          note:
            i === 0
              ? "Order placed successfully."
              : flow[i] === "CANCELLED"
                ? "Order cancelled by customer request."
                : `Order marked as ${flow[i].toLowerCase()}.`,
          createdAt: new Date(createdAt.getTime() + i * 6 * 60 * 60 * 1000),
        },
      });
    }

    if (status !== "CANCELLED") {
      for (const it of items) {
        soldByVariant[it.variant.id] = (soldByVariant[it.variant.id] ?? 0) + it.quantity;
      }
    }
  }

  console.log("Creating inventory movements...");
  for (const variant of allVariants) {
    const sold = soldByVariant[variant.id] ?? 0;
    const initial = variant.stock + sold;
    await prisma.inventoryMovement.create({
      data: {
        variantId: variant.id,
        type: "INITIAL",
        quantity: initial,
        reason: "Opening stock",
      },
    });
    if (sold > 0) {
      await prisma.inventoryMovement.create({
        data: {
          variantId: variant.id,
          type: "SALE",
          quantity: -sold,
          reason: "Demo orders",
        },
      });
    }
  }

  console.log("Creating settings...");
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.create({ data: { key, value } });
  }

  await prisma.emailLog.create({
    data: {
      to: "aisha.khan@example.com",
      subject: "Welcome to SmartPOS Mobile Store",
      template: "welcome",
      body: "Your SmartPOS account has been created successfully.",
      status: "SENT",
    },
  });

  const counts = {
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    customers: await prisma.user.count({ where: { role: "CUSTOMER" } }),
    orders: await prisma.order.count(),
    reviews: await prisma.review.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
