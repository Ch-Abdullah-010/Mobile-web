"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type InventoryRow = {
  id: string;
  productName: string;
  productSku: string;
  color: string;
  storage: string;
  ram: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
};

export function InventoryTable({ variants }: { variants: InventoryRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [type, setType] = useState<"PURCHASE" | "ADJUSTMENT" | "RETURN">("PURCHASE");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return variants.filter((variant) => {
      if (lowOnly && variant.stock > variant.lowStockThreshold) return false;
      if (!term) return true;
      return [variant.productName, variant.productSku, variant.sku, variant.color]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [variants, q, lowOnly]);

  const lowCount = variants.filter((v) => v.stock <= v.lowStockThreshold).length;

  function openAdjust(variant: InventoryRow) {
    setSelected(variant);
    setType("PURCHASE");
    setQuantity(1);
    setReason("");
  }

  async function submit() {
    if (!selected) return;
    const signed = type === "ADJUSTMENT" ? quantity : Math.abs(quantity);
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selected.id, type, quantity: signed, reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Adjustment failed", description: data.error, tone: "error" });
        return;
      }
      toast({ title: "Stock updated", description: `New stock: ${data.stock}`, tone: "success" });
      setSelected(null);
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product or SKU"
            aria-label="Search inventory"
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => setLowOnly((v) => !v)}
          aria-pressed={lowOnly}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors",
            lowOnly ? "border-warning bg-warning-soft text-warning" : "border-border bg-surface text-content-muted hover:bg-surface-muted"
          )}
        >
          <ArrowDownUp className="h-4 w-4" /> Low stock only ({lowCount})
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="fk">Inventory by variant</caption>
          <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Product</th>
              <th scope="col" className="px-4 py-3 font-semibold">Variant</th>
              <th scope="col" className="px-4 py-3 font-semibold">SKU</th>
              <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-content-muted">
                  No variants match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((variant) => {
                const state =
                  variant.stock <= 0
                    ? { label: "Out of stock", tone: "danger" as const }
                    : variant.stock <= variant.lowStockThreshold
                      ? { label: "Low", tone: "warning" as const }
                      : { label: "OK", tone: "success" as const };
                return (
                  <tr key={variant.id} className="hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <p className="font-medium text-content">{variant.productName}</p>
                      <p className="font-mono text-[11px] text-content-subtle">{variant.productSku}</p>
                    </td>
                    <td className="px-4 py-3 text-content-muted">
                      {[variant.color, variant.storage, variant.ram].filter(Boolean).join(" · ") || "Default"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-content-muted">{variant.sku}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-content">{variant.stock}</span>
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => openAdjust(variant)}>
                        Adjust
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Adjust stock"
        description={
          selected
            ? `${selected.productName} — ${[selected.color, selected.storage].filter(Boolean).join(" · ")}`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={submit} loading={submitting}>Apply adjustment</Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-content-muted">
              Current stock: <span className="font-semibold text-content">{selected.stock}</span>
            </p>
            <Field label="Movement type" htmlFor="inv-type">
              <Select id="inv-type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option value="PURCHASE">Stock in (purchase)</option>
                <option value="RETURN">Customer return</option>
                <option value="ADJUSTMENT">Manual adjustment (use negative to reduce)</option>
              </Select>
            </Field>
            <Field
              label="Quantity"
              htmlFor="inv-qty"
              hint={type === "ADJUSTMENT" ? "Use a negative number to reduce stock." : "Must be positive."}
            >
              <Input
                id="inv-qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Reason" htmlFor="inv-reason" hint="Optional, stored with the movement.">
              <Textarea id="inv-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
