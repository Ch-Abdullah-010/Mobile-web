export const SITE = {
  name: "SmartPOS",
  fullName: "SmartPOS Mobile Store",
  tagline: "Smart Shopping. Smarter Management.",
  description:
    "Shop the latest smartphones and mobile accessories with clear specifications, secure checkout and complete order tracking. SmartPOS Mobile Store — Smart Shopping. Smarter Management.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "support@smartpos.example",
  phone: "+92 21 1234567",
  address: "Shop 101, Tech Plaza, Main Boulevard, Lahore, Pakistan",
  currency: "PKR",
} as const;

export const SHOP_NAV = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export const FOOTER_NAV = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Smartphones", href: "/products?category=smartphones" },
    { label: "Accessories", href: "/products?category=audio" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Track Order", href: "/account/orders" },
  ],
  help: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return & Refund Policy", href: "/return-policy" },
  ],
  company: [
    { label: "About SmartPOS", href: "/about" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; description: string; tone: "neutral" | "info" | "warning" | "success" | "danger" | "brand" }
> = {
  PENDING: { label: "Pending", description: "Order received, awaiting confirmation", tone: "warning" },
  CONFIRMED: { label: "Confirmed", description: "Order confirmed by our team", tone: "info" },
  PROCESSING: { label: "Processing", description: "Preparing your items for dispatch", tone: "brand" },
  SHIPPED: { label: "Shipped", description: "Handed over to the courier", tone: "info" },
  DELIVERED: { label: "Delivered", description: "Order delivered successfully", tone: "success" },
  CANCELLED: { label: "Cancelled", description: "Order was cancelled", tone: "danger" },
};

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" | "brand" }
> = {
  UNPAID: { label: "Unpaid", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export const PAYMENT_METHODS: Record<string, string> = {
  COD: "Cash on Delivery",
  CARD: "Demo Card Payment",
  CASH: "Cash (In-store)",
};

export const PRODUCTS_PER_PAGE = 12;

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "POS", href: "/admin/pos", icon: "ScanBarcode" },
  { label: "Products", href: "/admin/products", icon: "Package" },
  { label: "Categories", href: "/admin/categories", icon: "FolderTree" },
  { label: "Inventory", href: "/admin/inventory", icon: "Boxes" },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Reports", href: "/admin/reports", icon: "BarChart3" },
  { label: "Email Inbox", href: "/admin/emails", icon: "Mail" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];
