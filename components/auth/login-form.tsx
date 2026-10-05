"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      toast({ title: `Welcome back, ${data.user.name.split(" ")[0]}!`, tone: "success" });
      const destination = next || (data.user.role === "ADMIN" ? "/admin" : "/account");
      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-content">Sign in</h1>
      <p className="mt-1 text-sm text-content-muted">Welcome back to SmartPOS Mobile Store.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </Field>

        {error ? (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} size="lg" className="w-full">
          <LogIn className="h-4 w-4" /> Sign in
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-content-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-semibold text-brand hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-border-strong bg-surface-muted p-4 text-xs text-content-muted">
        <p className="font-semibold text-content">Demo accounts</p>
        <p className="mt-1">Admin: admin@smartpos.dev / Admin@12345</p>
        <p>Customer: aisha.khan@example.com / Customer@123</p>
      </div>
    </div>
  );
}
