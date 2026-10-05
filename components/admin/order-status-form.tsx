"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { ORDER_STATUS_FLOW, ORDER_STATUS_META, type OrderStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

const PAYMENT_OPTIONS = ["UNPAID", "PAID", "REFUNDED"] as const;

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const options: OrderStatus[] = [...ORDER_STATUS_FLOW, "CANCELLED"];

  async function submit() {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, note }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Could not update order", description: data.error, tone: "error" });
        return;
      }
      toast({ title: "Order updated", description: "The customer has been notified by email.", tone: "success" });
      setNote("");
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-content">Update order</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Order status" htmlFor="order-status">
          <Select id="order-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {options.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_META[value].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Payment status" htmlFor="payment-status">
          <Select id="payment-status" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            {PAYMENT_OPTIONS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Note (optional)" htmlFor="order-note" className="sm:col-span-2">
          <Textarea
            id="order-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Shown on the order timeline"
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print invoice
        </Button>
        <Button type="button" onClick={submit} loading={submitting}>
          Save status
        </Button>
      </div>
    </div>
  );
}
