import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/constants";

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = ORDER_STATUS_META[status as OrderStatus] ?? ORDER_STATUS_META.PENDING;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const meta = PAYMENT_STATUS_META[status as PaymentStatus] ?? PAYMENT_STATUS_META.UNPAID;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
