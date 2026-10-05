"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { CategoryIcon } from "@/components/category-icon";
import { slugify } from "@/lib/utils";

const ICON_OPTIONS = [
  "Smartphone",
  "Headphones",
  "Plug",
  "BatteryCharging",
  "Shield",
  "ShieldCheck",
  "Watch",
  "Speaker",
];

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  productCount: number;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "Smartphone",
  sortOrder: 0,
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(category: CategoryRow) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      sortOrder: category.sortOrder,
    });
    setOpen(true);
  }

  async function submit() {
    const payload = { ...form, slug: form.slug.trim() || slugify(form.name) };
    setSubmitting(true);
    try {
      const response = await fetch(
        editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Could not save category", description: data.error, tone: "error" });
        return;
      }
      toast({ title: editingId ? "Category updated" : "Category created", tone: "success" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(category: CategoryRow) {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      toast({ title: "Could not delete category", description: data.error, tone: "error" });
      return;
    }
    toast({ title: "Category deleted", tone: "success" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="fk">Product categories</caption>
          <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-content-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Category</th>
              <th scope="col" className="px-4 py-3 font-semibold">Slug</th>
              <th scope="col" className="px-4 py-3 font-semibold">Products</th>
              <th scope="col" className="px-4 py-3 font-semibold">Order</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-surface-muted">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                      <CategoryIcon name={category.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-content">{category.name}</p>
                      <p className="max-w-xs truncate text-xs text-content-muted">{category.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-content-muted">{category.slug}</td>
                <td className="px-4 py-3 text-content-muted">{category.productCount}</td>
                <td className="px-4 py-3 text-content-muted">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(category)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-danger hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit category" : "New category"}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={submitting}>
              {editingId ? "Save changes" : "Create category"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" htmlFor="category-name" required>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Slug" htmlFor="category-slug" hint="Leave blank to generate from the name.">
            <Input
              id="category-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </Field>
          <Field label="Description" htmlFor="category-description" required>
            <Textarea
              id="category-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Icon" htmlFor="category-icon">
              <Select
                id="category-icon"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </Select>
            </Field>
            <Field label="Sort order" htmlFor="category-sort">
              <Input
                id="category-sort"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
