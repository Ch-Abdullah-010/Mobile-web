import { prisma } from "@/lib/db";
import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { orderStatusSchema } from "@/lib/validation";
import { sendEmailSafe } from "@/lib/email";
import { ORDER_STATUS_META } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const { status, note, paymentStatus } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return fail("Order not found.", 404);

  const statusChanged = status !== order.status;
  let nextPaymentStatus = paymentStatus ?? order.paymentStatus;
  if (status === "DELIVERED" && order.paymentMethod === "COD" && nextPaymentStatus === "UNPAID") {
    nextPaymentStatus = "PAID";
  }
  if (status === "CANCELLED" && order.paymentStatus === "PAID") {
    nextPaymentStatus = "REFUNDED";
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status, paymentStatus: nextPaymentStatus } });

    if (statusChanged) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: note || ORDER_STATUS_META[status].description,
        },
      });
    }

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "RETURN",
            quantity: item.quantity,
            reason: `Order ${order.orderNumber} cancelled`,
            reference: order.orderNumber,
          },
        });
      }
    }

    if (nextPaymentStatus === "PAID") {
      await tx.payment.updateMany({ where: { orderId: id, status: "PENDING" }, data: { status: "PAID" } });
    } else if (nextPaymentStatus === "REFUNDED") {
      await tx.payment.updateMany({ where: { orderId: id, status: { not: "REFUNDED" } }, data: { status: "REFUNDED" } });
    }
  });

  if (statusChanged) {
    const data = {
      name: order.customerName,
      orderNumber: order.orderNumber,
      status: ORDER_STATUS_META[status].label,
    };
    await sendEmailSafe({
      to: order.customerEmail,
      template: status === "SHIPPED" ? "shipping_notification" : "order_status",
      data,
    });
  }

  return ok({ success: true });
}
