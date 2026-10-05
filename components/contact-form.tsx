"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

type FieldErrors = Record<string, string[] | undefined>;

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({ title: "Could not send message", description: data.error, tone: "error" });
        return;
      }

      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ title: "Message sent", description: data.message, tone: "success" });
    } catch {
      toast({ title: "Network error", description: "Please try again.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={errors.name?.[0]}>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.[0]}>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
          />
        </Field>
      </div>
      <Field label="Subject" htmlFor="subject" required error={errors.subject?.[0]}>
        <Input
          id="subject"
          name="subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          required
        />
      </Field>
      <Field label="Message" htmlFor="message" required error={errors.message?.[0]}>
        <Textarea
          id="message"
          name="message"
          rows={6}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          required
        />
      </Field>
      <Button type="submit" loading={loading} size="lg">
        <Send className="h-4 w-4" /> Send message
      </Button>
    </form>
  );
}
