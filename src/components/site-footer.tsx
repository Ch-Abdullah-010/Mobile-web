import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Smartphone } from "lucide-react";
import { FOOTER_NAV, SITE } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-surface-muted">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <Smartphone className="h-5 w-5" />
            </span>
            <span className="text-base font-bold text-content">SmartPOS Mobile Store</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-content-muted">{SITE.description}</p>
          <ul className="mt-5 space-y-2 text-sm text-content-muted">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{SITE.address}</span>
            </li>
            <li>
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 hover:text-brand">
                <Phone className="h-4 w-4 text-brand" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-brand">
                <Mail className="h-4 w-4 text-brand" />
                {SITE.email}
              </a>
            </li>
          </ul>
          <p className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-content-muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            Genuine products with official warranty
          </p>
        </div>

        <FooterColumn title="Shop" links={FOOTER_NAV.shop} />
        <FooterColumn title="Help" links={FOOTER_NAV.help} />
        <FooterColumn title="Company" links={FOOTER_NAV.company} />
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-content-muted sm:flex-row">
          <p>
            © {year} {SITE.fullName}. University portfolio project — demo data.
          </p>
          <p>Payments shown are simulated for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-content">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-content-muted transition-colors hover:text-brand">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
