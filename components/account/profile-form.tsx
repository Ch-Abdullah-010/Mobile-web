"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

type FieldErrors = Record<string, string[] | undefined>;

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string | null };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? "" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({ title: "Could not update profile", description: data.error, tone: "error" });
        return;
      }

      toast({ title: "Profile updated", tone: "success" });
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-surface p-6 shadow-xs" noValidate>
      <div>
        <h2 className="text-lg font-semibold text-content">Profile details</h2>
        <p className="mt-1 text-sm text-content-muted">Update your name and contact number.</p>
      </div>

      <Field label="Full name" htmlFor="name" required error={errors.name?.[0]}>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          autoComplete="name"
          required
        />
      </Field>

      <Field label="Email address" htmlFor="email" hint="Your email address cannot be changed in this demo.">
        <Input id="email" value={user.email} disabled readOnly />
      </Field>

      <Field label="Phone number" htmlFor="phone" error={errors.phone?.[0]}>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          autoComplete="tel"
          placeholder="+92 300 1234567"
        />
      </Field>

      <Button type="submit" loading={loading}>
        <Save className="h-4 w-4" /> Save changes
      </Button>
    </form>
  );
}
