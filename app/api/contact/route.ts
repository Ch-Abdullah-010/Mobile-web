import { fail, fromZodError, ok, readJson } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { sendEmailSafe } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const settings = await getSettings();
  const { name, email, subject, message } = parsed.data;

  await sendEmailSafe({
    to: settings.storeEmail,
    template: "contact_message",
    data: { name, email, subject, message },
  });

  return ok({ success: true, message: "Thanks for reaching out. Our team will respond shortly." }, 201);
}
