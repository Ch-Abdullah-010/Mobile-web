"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CreditCard,
  FolderTree,
  Home,
  LayoutDashboard,
  Mail,
  MapPin,
  Package,
  ScanBarcode,
  Settings,
  ShoppingCart,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Boxes,
  CreditCard,
  FolderTree,
  Home,
  LayoutDashboard,
  Mail,
  MapPin,
  Package,
  ScanBarcode,
  Settings,
  ShoppingCart,
  User,
  Users,
};

export function SideNav({
  items,
  ariaLabel,
  className,
}: {
  items: { label: string; href: string; icon?: string; exact?: boolean }[];
  ariaLabel: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className={cn("flex gap-1 lg:flex-col", className)}>
      {items.map((item) => {
        const Icon = item.icon ? ICONS[item.icon] : undefined;
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand text-white shadow-sm"
                : "text-content-muted hover:bg-surface-sunken hover:text-content"
            )}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
