"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { Plus, Save, Trash2 } from "lucide-react";
import { productInputSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";

export type ProductFormValues = {
  name: string;
  slug: string;
  brand: string;
  sku: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  display: string;
  camera: string;
  battery: string;
  warranty: string;
  imageUrl: string;
  specs: { key: string; value: string }[];
  featured: boolean;
  isNew: boolean;
  status: "ACTIVE" | "INACTIVE";
  variants: {
    id?: string;
    color: string;
    storage: string;
    ram: string;
    sku: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
  }[];
};

const emptyVariant = {
  color: "",
  storage: "",
  ram: "",
  sku: "",
  price: 0,
  stock: 0,
  lowStockThreshold: 5,
};

function num(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function numOrNull(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function ProductForm({
  categories,
  productId,
  defaultValues,
}: {
  categories: { id: string; name: string }[];
  productId?: string;
  defaultValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      brand: "",
      sku: "",
      categoryId: categories[0]?.id ?? "",
      description: "",
      shortDescription: "",
      basePrice: 0,
      compareAtPrice: null,
      display: "",
      camera: "",
      battery: "",
      warranty: "1 Year",
      imageUrl: "",
      specs: [],
      featured: false,
      isNew: false,
      status: "ACTIVE",
      variants: [emptyVariant],
      ...defaultValues,
    },
  });

  const variants = useFieldArray({ control, name: "variants" });
  const specs = useFieldArray({ control, name: "specs" });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      slug: values.slug?.trim() || slugify(values.name),
      basePrice: num(values.basePrice),
      compareAtPrice: numOrNull(values.compareAtPrice),
      specs: values.specs.filter((s) => s.key.trim() && s.value.trim()),
      variants: values.variants.map((v) => ({
        ...v,
        price: num(v.price),
        stock: Math.max(0, Math.round(num(v.stock))),
        lowStockThreshold: Math.max(0, Math.round(num(v.lowStockThreshold))),
      })),
    };

    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path.length) {
          setError(issue.path.join(".") as FieldPath<ProductFormValues>, { message: issue.message });
        }
      }
      toast({
        title: "Please review the form",
        description: parsed.error.issues[0]?.message,
        tone: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: "Could not save product", description: data.error, tone: "error" });
        return;
      }
      toast({ title: productId ? "Product updated" : "Product created", tone: "success" });
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-base font-semibold text-content">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
            <Input
              id="name"
              {...register("name", {
                onBlur: (e) => {
                  if (!getValues("slug")) setValue("slug", slugify(e.target.value));
                },
              })}
            />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Used in the URL, e.g. /products/galaxy-s25" error={errors.slug?.message}>
            <Input id="slug" {...register("slug")} />
          </Field>
          <Field label="SKU" htmlFor="sku" required error={errors.sku?.message}>
            <Input id="sku" {...register("sku")} />
          </Field>
          <Field label="Brand" htmlFor="brand" required error={errors.brand?.message}>
            <Input id="brand" {...register("brand")} />
          </Field>
          <Field label="Category" htmlFor="categoryId" required error={errors.categoryId?.message}>
            <Select id="categoryId" {...register("categoryId")}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Short description" htmlFor="shortDescription" required error={errors.shortDescription?.message} className="sm:col-span-2">
            <Input id="shortDescription" {...register("shortDescription")} placeholder="One-line summary shown on cards" />
          </Field>
          <Field label="Description" htmlFor="description" required error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="description" rows={4} {...register("description")} />
          </Field>
          <Field label="Image URL" htmlFor="imageUrl" hint="Optional. Leave blank to use the generated illustration." error={errors.imageUrl?.message} className="sm:col-span-2">
            <Input id="imageUrl" {...register("imageUrl")} placeholder="https://…" />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-base font-semibold text-content">Pricing & specs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Base price (PKR)" htmlFor="basePrice" required error={errors.basePrice?.message}>
            <Input id="basePrice" type="number" min={0} step="1" {...register("basePrice", { valueAsNumber: true })} />
          </Field>
          <Field label="Compare-at price" htmlFor="compareAtPrice" error={errors.compareAtPrice?.message}>
            <Input id="compareAtPrice" type="number" min={0} step="1" {...register("compareAtPrice", { valueAsNumber: true })} />
          </Field>
          <Field label="Warranty" htmlFor="warranty" error={errors.warranty?.message}>
            <Input id="warranty" {...register("warranty")} />
          </Field>
          <Field label="Display" htmlFor="display" error={errors.display?.message}>
            <Input id="display" {...register("display")} />
          </Field>
          <Field label="Camera" htmlFor="camera" error={errors.camera?.message}>
            <Input id="camera" {...register("camera")} />
          </Field>
          <Field label="Battery" htmlFor="battery" error={errors.battery?.message}>
            <Input id="battery" {...register("battery")} />
          </Field>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-content">Specifications</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => specs.append({ key: "", value: "" })}>
              <Plus className="h-3.5 w-3.5" /> Add spec
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {specs.fields.map((row, index) => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input placeholder="Key (e.g. Display)" {...register(`specs.${index}.key`)} />
                <Input placeholder="Value" {...register(`specs.${index}.value`)} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove spec" onClick={() => specs.remove(index)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-content">Variants</h2>
          <Button type="button" size="sm" variant="outline" onClick={() => variants.append(emptyVariant)}>
            <Plus className="h-3.5 w-3.5" /> Add variant
          </Button>
        </div>
        {errors.variants?.root?.message || errors.variants?.message ? (
          <p role="alert" className="mt-2 text-xs font-medium text-danger">
            {errors.variants?.root?.message ?? errors.variants?.message}
          </p>
        ) : null}
        <div className="mt-4 space-y-4">
          {variants.fields.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Colour" error={errors.variants?.[index]?.color?.message}>
                  <Input {...register(`variants.${index}.color`)} />
                </Field>
                <Field label="Storage">
                  <Input {...register(`variants.${index}.storage`)} placeholder="128GB" />
                </Field>
                <Field label="RAM">
                  <Input {...register(`variants.${index}.ram`)} placeholder="8GB" />
                </Field>
                <Field label="Variant SKU" hint="Optional, auto-generated">
                  <Input {...register(`variants.${index}.sku`)} />
                </Field>
                <Field label="Price (PKR)" error={errors.variants?.[index]?.price?.message}>
                  <Input type="number" min={0} {...register(`variants.${index}.price`, { valueAsNumber: true })} />
                </Field>
                <Field label="Stock" error={errors.variants?.[index]?.stock?.message}>
                  <Input type="number" min={0} {...register(`variants.${index}.stock`, { valueAsNumber: true })} />
                </Field>
                <Field label="Low-stock threshold">
                  <Input type="number" min={0} {...register(`variants.${index}.lowStockThreshold`, { valueAsNumber: true })} />
                </Field>
                {variants.fields.length > 1 ? (
                  <div className="flex items-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => variants.remove(index)}>
                      <Trash2 className="h-4 w-4 text-danger" /> Remove variant
                    </Button>
                  </div>
                ) : null}
              </div>
              <input type="hidden" {...register(`variants.${index}.id`)} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-base font-semibold text-content">Visibility</h2>
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Featured on home page" {...register("featured")} />
          <Checkbox label="Mark as new arrival" {...register("isNew")} />
        </div>
        <div className="mt-4 max-w-xs">
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          <Save className="h-4 w-4" /> {productId ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
