import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { CartProvider } from "@/components/cart-provider";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.fullName} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "SmartPOS",
    "mobile store",
    "smartphones",
    "mobile accessories",
    "phone shop",
    "buy phone online",
    "POS system",
  ],
  authors: [{ name: SITE.fullName }],
  openGraph: {
    type: "website",
    siteName: SITE.fullName,
    title: `${SITE.fullName} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.fullName} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-surface text-content">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
