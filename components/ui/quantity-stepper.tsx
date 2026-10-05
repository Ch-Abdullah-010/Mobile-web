"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = "md",
  label = "quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn =
    size === "sm"
      ? "h-8 w-8"
      : "h-10 w-10";

  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-surface"
      role="group"
      aria-label={`${label} selector`}
    >
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className={cn(
          "inline-flex items-center justify-center rounded-l-lg text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:cursor-not-allowed disabled:opacity-40",
          btn
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn("text-center text-sm font-semibold text-content", size === "sm" ? "w-9" : "w-12")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className={cn(
          "inline-flex items-center justify-center rounded-r-lg text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:cursor-not-allowed disabled:opacity-40",
          btn
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
