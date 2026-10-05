"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dropdown({
  trigger,
  children,
  align = "right",
  label = "Open menu",
}: {
  trigger?: React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: "left" | "right";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-content-muted transition-colors hover:bg-surface-muted hover:text-content"
      >
        {trigger ?? <MoreVertical className="h-4 w-4" />}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-40 mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  onClick,
  href,
  danger,
  children,
  className,
}: {
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
    danger ? "text-danger hover:bg-danger-soft" : "text-content hover:bg-surface-sunken",
    className
  );
  if (href) {
    return (
      <a href={href} className={classes} role="menuitem">
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} role="menuitem">
      {children}
    </button>
  );
}
