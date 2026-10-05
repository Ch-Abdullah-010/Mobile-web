import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SmartPOS Mobile Store account.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return <LoginForm next={next} />;
}
