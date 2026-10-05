"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "animate-in-up w-full max-w-lg rounded-t-2xl bg-surface shadow-lg sm:rounded-2xl",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            {title ? <h2 className="text-lg font-semibold text-content">{title}</h2> : null}
            {description ? (
              <p className="mt-1 text-sm text-content-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-surface-sunken hover:text-content"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children ? <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div> : null}
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
