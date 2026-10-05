"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

type FieldErrors = Record<string, string[] | undefined>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        setGeneralError(data.fieldErrors ? null : (data.error ?? "Unable to create your account."));
        return;
      }

      toast({ title: "Account created", description: "Welcome to SmartPOS Mobile Store.", tone: "success" });
      router.push("/account");
      router.refresh();
    } catch {
      setGeneralError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-content">Create your account</h1>
      <p className="mt-1 text-sm text-content-muted">Shop faster and track all your orders in one place.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Full name" htmlFor="name" required error={errors.name?.[0]}>
          <Input
            id="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.[0]}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          required
          hint="At least 8 characters, including a letter and a number."
          error={errors.password?.[0]}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </Field>

        {generalError ? (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
            {generalError}
          </p>
        ) : null}

        <Button type="submit" loading={loading} size="lg" className="w-full">
          <UserPlus className="h-4 w-4" /> Create account
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-content-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
