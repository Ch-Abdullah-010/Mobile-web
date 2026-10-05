import "server-only";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export type EmailTemplate =
  | "welcome"
  | "order_confirmation"
  | "order_status"
  | "shipping_notification"
  | "password_reset"
  | "contact_message";

type OrderEmailItem = { name: string; quantity: number; lineTotal: number };

type EmailData = {
  name?: string;
  email?: string;
  orderNumber?: string;
  status?: string;
  total?: number;
  items?: OrderEmailItem[];
  resetToken?: string;
  message?: string;
  subject?: string;
};

/**
 * Renders an email from a template. In production this is where you would use a
 * transactional provider (Resend, SendGrid, Postmark) or SMTP via Nodemailer.
 * For this prototype every message is delivered to the in-app Email Inbox so the
 * workflow can be demonstrated without real credentials.
 */
function render(template: EmailTemplate, data: EmailData): { subject: string; body: string } {
  const signature = `\n\n—\n${SITE.fullName}\n${SITE.phone} · ${SITE.email}`;
  const itemLines = (data.items ?? [])
    .map((i) => `  • ${i.name} × ${i.quantity} — ${formatCurrency(i.lineTotal)}`)
    .join("\n");

  switch (template) {
    case "welcome":
      return {
        subject: `Welcome to ${SITE.fullName}`,
        body: `Hi ${data.name ?? "there"},\n\nYour SmartPOS account has been created successfully. You can now track orders, save addresses and check out faster.\n\nStart shopping: ${SITE.url}/products${signature}`,
      };
    case "order_confirmation":
      return {
        subject: `Order ${data.orderNumber} confirmed`,
        body: `Hi ${data.name ?? "there"},\n\nThank you for your order. We have received order ${data.orderNumber}.\n\nItems:\n${itemLines}\n\nTotal: ${formatCurrency(data.total ?? 0)}\n\nYou can track this order any time from your account.${signature}`,
      };
    case "order_status":
      return {
        subject: `Order ${data.orderNumber} is now ${data.status}`,
        body: `Hi ${data.name ?? "there"},\n\nYour order ${data.orderNumber} has been updated to: ${data.status}.\n\nTrack order: ${SITE.url}/account/orders${signature}`,
      };
    case "shipping_notification":
      return {
        subject: `Your order ${data.orderNumber} has shipped`,
        body: `Hi ${data.name ?? "there"},\n\nGood news — order ${data.orderNumber} has been handed over to our courier and is on its way.\n\nTrack order: ${SITE.url}/account/orders${signature}`,
      };
    case "password_reset":
      return {
        subject: "Reset your SmartPOS password",
        body: `Hi ${data.name ?? "there"},\n\nUse the reset code below to choose a new password. This code expires in 30 minutes.\n\nReset code: ${data.resetToken}\n\nIf you did not request this, you can safely ignore this email.${signature}`,
      };
    case "contact_message":
      return {
        subject: `New contact message: ${data.subject ?? ""}`,
        body: `Name: ${data.name}\nEmail: ${data.email ?? "—"}\n\n${data.message}${signature}`,
      };
    default:
      return { subject: "SmartPOS notification", body: data.message ?? "" };
  }
}

export async function sendEmail(input: {
  to: string;
  template: EmailTemplate;
  data?: EmailData;
}): Promise<{ status: "SENT" | "FAILED" }> {
  const { subject, body } = render(input.template, input.data ?? {});
  const provider = process.env.EMAIL_PROVIDER ?? "mock";

  try {
    // NOTE: With provider "smtp" integrate a transactional provider here.
    // Credentials must be read from server-only environment variables and
    // never exposed to the client.
    if (provider === "smtp") {
      throw new Error(
        "SMTP transport is not configured in this demo build. Set EMAIL_PROVIDER=mock or configure a provider."
      );
    }

    await prisma.emailLog.create({
      data: { to: input.to, subject, template: input.template, body, status: "SENT" },
    });
    return { status: "SENT" };
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        to: input.to,
        subject,
        template: input.template,
        body,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return { status: "FAILED" };
  }
}

export async function sendEmailSafe(input: {
  to: string;
  template: EmailTemplate;
  data?: EmailData;
}) {
  try {
    return await sendEmail(input);
  } catch {
    return { status: "FAILED" as const };
  }
}
