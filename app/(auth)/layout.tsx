import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <header className="container-page flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2" aria-label="SmartPOS Mobile Store home">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <Smartphone className="h-5 w-5" />
          </span>
          <span className="text-base font-bold text-content">SmartPOS Mobile Store</span>
        </Link>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="container-page py-6 text-center text-xs text-content-subtle">
        <Link href="/" className="hover:text-brand">
          Back to store
        </Link>
      </footer>
    </div>
  );
}
