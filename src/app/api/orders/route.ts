import { prisma } from "@/lib/db";
import { fail, fromZodError, getApiUser, ok, readJson } from "@/lib/api";
import { checkoutSchema } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import { applySaleToInventory, nextOrderNumber, type SaleLine } from "@/lib/orders";
import { sendEmailSafe } from "@/lib/email";
import { parseJSON } from "@/lib/utils";

class SaleError extends Error {}

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) return fail("Please sign in to place an order.", 401);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = checkoutSchema.safeParse(body);
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
        if (
          !variant ||
          !variant.isActive ||
          variant.productId !== item.productId ||
          variant.product.status !== "ACTIVE"
        ) {
          throw new SaleError("One of the items in your cart is no longer available.");
        }
        if (variant.stock < item.quantity) {
          throw new SaleError(
            `Only ${variant.stock} left in stock for ${variant.product.name} (${variant.color}).`
          );
        }
        const image = parseJSON<string[]>(variant.product.images, [])[0] ?? null;
        lines.push({
          productId: variant.productId,
          variantId: variant.id,
          name: `${variant.product.name}${
            variant.storage || variant.color ? ` — ${[variant.color, variant.storage].filter(Boolean).join(", ")}` : ""
          }`,
          sku: variant.sku,
          image,
          price: variant.price,
          quantity: item.quantity,
        });
      }

      const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
      const shipping =
        subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFlatRate;
      const tax = Math.round((subtotal * settings.taxRate) / 100);
      const total = subtotal + shipping + tax;
      const paid = input.paymentMethod === "CARD";
      const orderNumber = await nextOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          channel: "ONLINE",
          status: "PENDING",
          paymentStatus: paid ? "PAID" : "UNPAID",
          paymentMethod: input.paymentMethod,
          customerName: input.fullName,
          customerEmail: input.email,
          customerPhone: input.phone,
          shippingLine1: input.address,
          shippingCity: input.city,
          shippingPostal: input.postalCode,
          shippingCountry: input.country,
          subtotal,
          discount: 0,
          shipping,
          tax,
          total,
          currency: settings.currency,
          notes: input.notes || null,
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
            create: {
              method: input.paymentMethod,
              provider: "DEMO",
              amount: total,
              status: paid ? "PAID" : "PENDING",
              reference: paid ? "DEMO-CARD-TXN" : null,
            },
          },
          history: { create: { status: "PENDING", note: "Order placed by customer" } },
        },
        include: { items: true },
      });

      await applySaleToInventory(tx, lines, orderNumber);
      return { order, lines, total };
    });

    await sendEmailSafe({
      to: input.email,
      template: "order_confirmation",
      data: {
        name: input.fullName,
        orderNumber: result.order.orderNumber,
        total: result.total,
        items: result.lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          lineTotal: l.price * l.quantity,
        })),
      },
    });

    const addressCount = await prisma.address.count({ where: { userId: user.id } });
    if (addressCount === 0) {
      await prisma.address.create({
        data: {
          userId: user.id,
          label: "Home",
          fullName: input.fullName,
          phone: input.phone,
          line1: input.address,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: true,
        },
      });
    }

    return ok(
      { orderId: result.order.id, orderNumber: result.order.orderNumber, total: result.total },
      201
    );
  } catch (error) {
    if (error instanceof SaleError) return fail(error.message, 409);
    throw error;
  }
}
