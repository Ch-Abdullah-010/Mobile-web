import {
  BatteryCharging,
  Headphones,
  Package,
  Plug,
  Shield,
  ShieldCheck,
  Smartphone,
  Speaker,
  Watch,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Headphones,
  Plug,
  BatteryCharging,
  Shield,
  ShieldCheck,
  Watch,
  Speaker,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Package;
  return <Icon className={className} aria-hidden />;
}
