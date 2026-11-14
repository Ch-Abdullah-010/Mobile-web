import "server-only";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";

export type StoreSettings = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  taxRate: number;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  posDefaultTaxRate: number;
};

const DEFAULTS: StoreSettings = {
  storeName: SITE.fullName,
  storeEmail: SITE.email,
  storePhone: SITE.phone,
  storeAddress: SITE.address,
  currency: SITE.currency,
  taxRate: 0,
  shippingFlatRate: 200,
  freeShippingThreshold: 100000,
  lowStockThreshold: 5,
  posDefaultTaxRate: 0,
};

export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.keys(DEFAULTS) } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const num = (key: keyof StoreSettings) => {
    const raw = map.get(key);
    const parsed = Number(raw);
    return raw !== undefined && Number.isFinite(parsed) ? parsed : (DEFAULTS[key] as number);
  };
  const str = (key: keyof StoreSettings) => map.get(key) ?? (DEFAULTS[key] as string);

  return {
    storeName: str("storeName"),
    storeEmail: str("storeEmail"),
    storePhone: str("storePhone"),
    storeAddress: str("storeAddress"),
    currency: str("currency"),
    taxRate: num("taxRate"),
    shippingFlatRate: num("shippingFlatRate"),
    freeShippingThreshold: num("freeShippingThreshold"),
    lowStockThreshold: num("lowStockThreshold"),
    posDefaultTaxRate: num("posDefaultTaxRate"),
  };
}

export async function saveSettings(input: StoreSettings) {
  const entries: [string, string][] = [
    ["storeName", input.storeName],
    ["storeEmail", input.storeEmail],
    ["storePhone", input.storePhone],
    ["storeAddress", input.storeAddress],
    ["currency", input.currency],
    ["taxRate", String(input.taxRate)],
    ["shippingFlatRate", String(input.shippingFlatRate)],
    ["freeShippingThreshold", String(input.freeShippingThreshold)],
    ["lowStockThreshold", String(input.lowStockThreshold)],
    ["posDefaultTaxRate", String(input.posDefaultTaxRate)],
  ];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
    )
  );
}
