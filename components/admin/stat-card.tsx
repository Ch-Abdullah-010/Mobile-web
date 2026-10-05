import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "brand",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "brand" | "success" | "warning" | "info" | "danger" | "neutral";
}) {
  const tones = {
    brand: "bg-brand-soft text-brand-strong",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-surface-sunken text-content-muted",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-content-muted">{label}</p>
        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-content">{value}</p>
      {hint ? <p className="mt-1 text-xs text-content-subtle">{hint}</p> : null}
    </div>
  );
}
