import { z } from "zod";

const email = z.email({ error: "Enter a valid email address" }).trim().toLowerCase();

export const registerSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters" }).max(80),
  email,
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/[A-Za-z]/, { error: "Include at least one letter" })
    .regex(/[0-9]/, { error: "Include at least one number" }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Password is required" }),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  email,
  token: z.string().min(1, { error: "Reset code is required" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/[A-Za-z]/, { error: "Include at least one letter" })
    .regex(/[0-9]/, { error: "Include at least one number" }),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters" }).max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default("Home"),
  fullName: z.string().trim().min(2, { error: "Full name is required" }).max(80),
  phone: z.string().trim().min(7, { error: "Enter a valid phone number" }).max(30),
  line1: z.string().trim().min(4, { error: "Street address is required" }).max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, { error: "City is required" }).max(80),
  postalCode: z.string().trim().min(2, { error: "Postal code is required" }).max(20),
  country: z.string().trim().min(2, { error: "Country is required" }).max(80),
  isDefault: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: "Name is required" }).max(80),
  email,
  subject: z.string().trim().min(3, { error: "Subject is required" }).max(120),
  message: z.string().trim().min(10, { error: "Message must be at least 10 characters" }).max(2000),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Full name is required" }).max(80),
  email,
  phone: z.string().trim().min(7, { error: "Enter a valid phone number" }).max(30),
  address: z.string().trim().min(4, { error: "Street address is required" }).max(160),
  city: z.string().trim().min(2, { error: "City is required" }).max(80),
  postalCode: z.string().trim().min(2, { error: "Postal code is required" }).max(20),
  country: z.string().trim().min(2, { error: "Country is required" }).max(80),
  paymentMethod: z.enum(["COD", "CARD"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(cartItemSchema).min(1, { error: "Your cart is empty" }),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(3, { error: "Product name is required" }).max(120),
  slug: z.string().trim().min(3).max(140),
  brand: z.string().trim().min(2, { error: "Brand is required" }).max(60),
  sku: z.string().trim().min(3, { error: "SKU is required" }).max(40),
  categoryId: z.string().min(1, { error: "Select a category" }),
  description: z.string().trim().min(20, { error: "Description must be at least 20 characters" }),
  shortDescription: z.string().trim().min(5, { error: "Short description is required" }).max(160),
  basePrice: z.number().positive({ error: "Price must be greater than 0" }),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  display: z.string().trim().max(120).optional().or(z.literal("")),
  camera: z.string().trim().max(120).optional().or(z.literal("")),
  battery: z.string().trim().max(120).optional().or(z.literal("")),
  warranty: z.string().trim().max(80).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  specs: z.array(z.object({ key: z.string().trim().min(1), value: z.string().trim().min(1) })).default([]),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        color: z.string().trim().min(1, { error: "Colour is required" }).max(40),
        storage: z.string().trim().max(40).optional().or(z.literal("")),
        ram: z.string().trim().max(40).optional().or(z.literal("")),
        sku: z.string().trim().max(60).optional().or(z.literal("")),
        price: z.number().positive({ error: "Variant price must be greater than 0" }),
        stock: z.number().int().min(0),
        lowStockThreshold: z.number().int().min(0).default(5),
      })
    )
    .min(1, { error: "Add at least one variant" }),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, { error: "Category name is required" }).max(60),
  slug: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10, { error: "Description must be at least 10 characters" }).max(400),
  icon: z.string().trim().min(1).max(40).default("Smartphone"),
  sortOrder: z.number().int().min(0).default(0),
});

export const inventoryAdjustSchema = z.object({
  variantId: z.string().min(1),
  type: z.enum(["PURCHASE", "ADJUSTMENT", "RETURN"]),
  quantity: z.number().int().refine((v) => v !== 0, { error: "Quantity cannot be zero" }),
  reason: z.string().trim().max(200).optional().or(z.literal("")),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
});

export const posSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1, { error: "Add at least one product" }),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  paymentMethod: z.enum(["CASH", "CARD"]).default("CASH"),
  customerName: z.string().trim().max(80).optional().or(z.literal("")),
  customerEmail: z.string().trim().max(120).optional().or(z.literal("")),
  customerPhone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(80),
  storeEmail: z.string().trim().min(3).max(120),
  storePhone: z.string().trim().min(3).max(40),
  storeAddress: z.string().trim().min(3).max(200),
  taxRate: z.number().min(0).max(100),
  shippingFlatRate: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  lowStockThreshold: z.number().int().min(0),
  posDefaultTaxRate: z.number().min(0).max(100),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
