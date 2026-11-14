"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message ?? "If an account exists, a reset code has been sent.");
      setSent(true);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-soft">
          <MailCheck className="h-6 w-6 text-success" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-content">Check your email</h1>
        <p className="mt-2 text-sm text-content-muted">{message}</p>
        <p className="mt-3 rounded-lg border border-dashed border-border-strong bg-surface-muted px-3 py-2 text-xs text-content-muted">
          This is a demo store, so the reset code is delivered to the admin Email Inbox instead of a real inbox.
        </p>
        <Button
          className="mt-5 w-full"
          onClick={() => {
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
          }}
        >
          <KeyRound className="h-4 w-4" /> Enter reset code
        </Button>
        <p className="mt-4 text-center text-sm text-content-muted">
          <Link href="/auth/login" className="font-semibold text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-content">Forgot your password?</h1>
      <p className="mt-1 text-sm text-content-muted">
        Enter your email and we&apos;ll send you a reset code.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Send reset code
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-content-muted">
        <Link href="/auth/login" className="font-semibold text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
