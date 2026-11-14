import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { posSaleSchema } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import { applySaleToInventory, nextOrderNumber, type SaleLine } from "@/lib/orders";
import { sendEmailSafe } from "@/lib/email";
import { parseJSON } from "@/lib/utils";

class PosError extends Error {}

export async function POST(request: Request) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = posSaleSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  const settings = await getSettings();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const variantIds = input.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });
      const byId = new Map(variants.map((v) => [v.id, v]));

      const lines: SaleLine[] = [];
      for (const item of input.items) {
        const variant = byId.get(item.variantId);
        if (!variant || !variant.isActive || variant.productId !== item.productId) {
          throw new PosError("One of the selected items is unavailable.");
        }
        if (variant.stock < item.quantity) {
          throw new PosError(`Insufficient stock for ${variant.product.name} (${variant.color}).`);
        }
        const image = parseJSON<string[]>(variant.product.images, [])[0] ?? null;
        lines.push({
          productId: variant.productId,
          variantId: variant.id,
          name: `${variant.product.name} — ${[variant.color, variant.storage].filter(Boolean).join(", ")}`,
          sku: variant.sku,
          image,
          price: variant.price,
          quantity: item.quantity,
        });
      }

      const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
      const discount = Math.min(input.discount, subtotal);
      const tax = Math.round(((subtotal - discount) * input.taxRate) / 100);
      const total = subtotal - discount + tax;
      const orderNumber = await nextOrderNumber(tx);

      const customerEmail = input.customerEmail || "walk-in@smartpos.example";
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: null,
          channel: "POS",
          status: "DELIVERED",
          paymentStatus: "PAID",
          paymentMethod: input.paymentMethod,
          customerName: input.customerName || "Walk-in Customer",
          customerEmail,
          customerPhone: input.customerPhone || "N/A",
          subtotal,
          discount,
          shipping: 0,
          tax,
          total,
          currency: settings.currency,
          notes: "In-store sale created from POS",
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              name: l.name,
              sku: l.sku,
              image: l.image,
              price: l.price,
              quantity: l.quantity,
              lineTotal: l.price * l.quantity,
            })),
          },
          payments: {
            create: { method: input.paymentMethod, provider: "POS", amount: total, status: "PAID", reference: `POS-${Date.now()}` },
          },
          history: { create: { status: "DELIVERED", note: "Sold in-store via POS" } },
        },
      });

      await applySaleToInventory(tx, lines, orderNumber);
      return { order, total, change: 0 };
    });

    if (input.customerEmail) {
      await sendEmailSafe({
        to: input.customerEmail,
        template: "order_confirmation",
        data: {
          name: input.customerName || "Customer",
          orderNumber: result.order.orderNumber,
          total: result.total,
          items: [],
        },
      });
    }

    return ok(
      { orderId: result.order.id, orderNumber: result.order.orderNumber, total: result.total },
      201
    );
  } catch (error) {
    if (error instanceof PosError) return fail(error.message, 409);
    throw error;
  }
}
