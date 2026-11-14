import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = 14,
  showValue = false,
}: {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
}) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            width={size}
            height={size}
            className={cn(
              star <= rounded ? "fill-amber-400 text-amber-400" : "text-border-strong"
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-xs font-semibold text-content">{value.toFixed(1)}</span>
      ) : null}
      {typeof count === "number" ? (
        <span className="text-xs text-content-muted">({count})</span>
      ) : null}
    </div>
  );
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-content-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-content-subtle" aria-hidden /> : null}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-content">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-bold text-content sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 text-content-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface text-content-subtle shadow-xs">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-content">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-content-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}
