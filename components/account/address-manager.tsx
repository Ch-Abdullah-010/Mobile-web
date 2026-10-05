"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export type AccountAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const EMPTY = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  country: "Pakistan",
  isDefault: false,
};

type FieldErrors = Record<string, string[] | undefined>;

export function AddressManager({ addresses }: { addresses: AccountAddress[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AccountAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  }

  function startEdit(address: AccountAddress) {
    setEditing(address);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        editing ? `/api/account/addresses/${editing.id}` : "/api/account/addresses",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({ title: "Could not save address", description: data.error, tone: "error" });
        return;
      }

      toast({ title: editing ? "Address updated" : "Address saved", tone: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        toast({ title: "Could not delete address", description: data.error, tone: "error" });
        return;
      }
      toast({ title: "Address removed", tone: "success" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-content">Saved addresses</h2>
        <Button onClick={startCreate} size="sm">
          <Plus className="h-4 w-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-content-subtle" />
          <p className="mt-3 font-medium text-content">No saved addresses</p>
          <p className="mt-1 text-sm text-content-muted">Add an address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-content">{address.label}</span>
                {address.isDefault ? (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-strong">
                    Default
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium text-content">{address.fullName}</p>
              <p className="text-sm text-content-muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city} {address.postalCode}
                <br />
                {address.country}
                <br />
                {address.phone}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(address)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-soft"
                  loading={deletingId === address.id}
                  onClick={() => remove(address.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit address" : "Add a new address"}
        description="This address can be reused at checkout."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button form="address-form" type="submit" loading={loading}>
              {editing ? "Save changes" : "Save address"}
            </Button>
          </>
        }
      >
        <form id="address-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Label" htmlFor="label" error={errors.label?.[0]}>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="Home, Office…"
            />
          </Field>
          <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.[0]}>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            />
          </Field>
          <Field label="Phone" htmlFor="phone" required error={errors.phone?.[0]}>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </Field>
          <Field label="City" htmlFor="city" required error={errors.city?.[0]}>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
          </Field>
          <Field label="Street address" htmlFor="line1" required error={errors.line1?.[0]} className="sm:col-span-2">
            <Input
              id="line1"
              value={form.line1}
              onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
            />
          </Field>
          <Field label="Apartment, suite (optional)" htmlFor="line2" error={errors.line2?.[0]} className="sm:col-span-2">
            <Input
              id="line2"
              value={form.line2}
              onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
            />
          </Field>
          <Field label="Postal code" htmlFor="postalCode" required error={errors.postalCode?.[0]}>
            <Input
              id="postalCode"
              value={form.postalCode}
              onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
            />
          </Field>
          <Field label="Country" htmlFor="country" required error={errors.country?.[0]}>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
            />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox
              label="Set as default address"
              checked={form.isDefault}
              onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
