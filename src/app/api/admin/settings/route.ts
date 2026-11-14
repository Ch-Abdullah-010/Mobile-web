import { fail, fromZodError, ok, readJson, requireApiAdmin } from "@/lib/api";
import { settingsSchema } from "@/lib/validation";
import { getSettings, saveSettings } from "@/lib/settings";

export async function PUT(request: Request) {
  const admin = await requireApiAdmin();
  if (!admin) return fail("Admin access required.", 403);

  const body = await readJson(request);
  if (!body) return fail("Invalid request body");

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const current = await getSettings();
  await saveSettings({ ...parsed.data, currency: current.currency });

  return ok({ success: true, message: "Settings saved." });
}
