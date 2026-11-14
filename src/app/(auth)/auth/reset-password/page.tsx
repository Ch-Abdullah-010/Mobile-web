import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: true },
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/auth/reset-password">) {
  const sp = await searchParams;
  const email = typeof sp.email === "string" ? sp.email : "";
  return <ResetPasswordForm initialEmail={email} />;
}
