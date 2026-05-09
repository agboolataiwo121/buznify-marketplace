import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  referralCode: varchar("referralCode", { length: 16 }).unique(),
  referredBy: int("referredBy"),
  avatarUrl: text("avatarUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Email/Password auth fields
  passwordHash: text("passwordHash"),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  resetToken: varchar("resetToken", { length: 128 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  // Two-Factor Authentication
  twoFactorSecret: varchar("twoFactorSecret", { length: 64 }),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  // Email Verification
  emailVerifyToken: varchar("emailVerifyToken", { length: 128 }),
  emailVerifyExpiry: timestamp("emailVerifyExpiry"),
  // Security
  fraudFlagged: boolean("fraudFlagged").default(false).notNull(),
  fraudFlaggedAt: timestamp("fraudFlaggedAt"),
  loginAttempts: int("loginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  category: mysqlEnum("category", [
    "social_media_accounts",
    "streaming_accounts",
    "gaming_accounts",
    "virtual_numbers",
    "growth_services",
    "ai_tools",
    "digital_subscriptions",
    "gaming_currency",
    "proxy_networking",
    "verification_services",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  stock: int("stock").default(0).notNull(),
  platform: varchar("platform", { length: 64 }),
  deliveryType: mysqlEnum("deliveryType", ["instant", "manual"]).default("instant").notNull(),
  deliveryData: json("deliveryData"), // stored account credentials / delivery info
  imageUrl: text("imageUrl"),
  tags: json("tags"),
  status: mysqlEnum("status", ["active", "inactive", "pending", "rejected"]).default("pending").notNull(),
  totalSold: int("totalSold").default(0).notNull(),
  avgRating: decimal("avgRating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: int("reviewCount").default(0).notNull(),
  subcategoryId: int("subcategoryId"),  // FK → product_categories.id (optional)
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("minOrderAmount", { precision: 10, scale: 2 }).default("0.00"),
  usageLimit: int("usageLimit").default(100).notNull(),
  usedCount: int("usedCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  vendorId: int("vendorId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
  couponId: int("couponId"),
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded",
    "cancelled",
  ]).default("pending").notNull(),
  deliveryData: json("deliveryData"), // delivered credentials/info
  deliveredAt: timestamp("deliveredAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Wallet Transactions ──────────────────────────────────────────────────────
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "purchase", "refund", "referral_reward", "admin_credit"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balanceBefore", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: varchar("referenceId", { length: 64 }),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;

// ─── Virtual Numbers ──────────────────────────────────────────────────────────
export const virtualNumbers = mysqlTable("virtual_numbers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  countryCode: varchar("countryCode", { length: 4 }).notNull(),
  countryName: varchar("countryName", { length: 64 }).notNull(),
  service: varchar("service", { length: 64 }), // e.g. "whatsapp", "telegram"
  operator: varchar("operator", { length: 64 }), // e.g. "any", "vodafone"
  apiOrderId: int("apiOrderId"), // 5sim order ID for polling
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled", "finished", "banned"]).default("active").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VirtualNumber = typeof virtualNumbers.$inferSelect;

// ─── SMS Messages ─────────────────────────────────────────────────────────────
export const smsMessages = mysqlTable("sms_messages", {
  id: int("id").autoincrement().primaryKey(),
  numberId: int("numberId").notNull(),
  sender: varchar("sender", { length: 64 }),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
});

export type SmsMessage = typeof smsMessages.$inferSelect;

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  referredId: int("referredId").notNull(),
  rewardAmount: decimal("rewardAmount", { precision: 10, scale: 2 }).default("5.00").notNull(),
  status: mysqlEnum("status", ["pending", "credited", "cancelled"]).default("pending").notNull(),
  creditedAt: timestamp("creditedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  orderId: int("orderId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  isVerified: boolean("isVerified").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["billing", "technical", "account", "order", "other"]).default("other").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;

// ─── Ticket Messages ──────────────────────────────────────────────────────────
export const ticketMessages = mysqlTable("ticket_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  isStaff: boolean("isStaff").default(false).notNull(),
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "order_completed",
    "order_failed",
    "wallet_credit",
    "wallet_debit",
    "referral_reward",
    "ticket_reply",
    "system",
    "promotion",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  referenceId: varchar("referenceId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── Growth Services ──────────────────────────────────────────────────────────
export const growthServices = mysqlTable("growth_services", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", [
    "instagram",
    "tiktok",
    "youtube",
    "telegram",
    "twitter",
    "facebook",
  ]).notNull(),
  serviceType: mysqlEnum("serviceType", [
    "followers",
    "subscribers",
    "views",
    "likes",
    "comments",
    "members",
    "page_likes",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: varchar("deliveryTime", { length: 64 }).default("24-48 hours"),
  isActive: boolean("isActive").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrowthService = typeof growthServices.$inferSelect;

// ─── Wishlists ────────────────────────────────────────────────────────────────
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Wishlist = typeof wishlists.$inferSelect;

// ─── Recently Viewed ──────────────────────────────────────────────────────────
export const recentlyViewed = mysqlTable("recently_viewed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});
export type RecentlyViewed = typeof recentlyViewed.$inferSelect;

// ─── Vendor Payouts ───────────────────────────────────────────────────────────
export const vendorPayouts = mysqlTable("vendor_payouts", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["bank", "crypto", "paypal"]).default("bank").notNull(),
  destination: text("destination").notNull(), // bank account / crypto address / paypal email
  status: mysqlEnum("status", ["pending", "processing", "paid", "rejected"]).default("pending").notNull(),
  notes: text("notes"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VendorPayout = typeof vendorPayouts.$inferSelect;

// ─── Growth Orders ────────────────────────────────────────────────────────────
export const growthOrders = mysqlTable("growth_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  serviceId: int("serviceId").notNull(),
  targetUrl: varchar("targetUrl", { length: 512 }).notNull(),
  quantity: int("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "partial", "cancelled", "refunded"]).default("pending").notNull(),
  deliveredCount: int("deliveredCount").default(0).notNull(),
  dripFeed: boolean("dripFeed").default(false).notNull(),
  dripInterval: int("dripInterval"), // minutes between drip batches
  speedLabel: mysqlEnum("speedLabel", ["slow", "medium", "fast", "instant"]).default("medium").notNull(),
  refillRequested: boolean("refillRequested").default(false).notNull(),
  cancelRequested: boolean("cancelRequested").default(false).notNull(),
  notes: text("notes"),
  // SMM panel API fields
  apiOrderId: varchar("apiOrderId", { length: 64 }),
  panel: mysqlEnum("panel", ["smmkings", "peakerr", "manual"]).default("manual"),
  apiServiceId: int("apiServiceId"),
  startCount: int("startCount"),
  remains: int("remains"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GrowthOrder = typeof growthOrders.$inferSelect;

// ─── Refund Requests ──────────────────────────────────────────────────────────
export const refundRequests = mysqlTable("refund_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  growthOrderId: int("growthOrderId"),
  reason: text("reason").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RefundRequest = typeof refundRequests.$inferSelect;

// ─── Vendor API Keys ──────────────────────────────────────────────────────────
export const vendorApiKeys = mysqlTable("vendor_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VendorApiKey = typeof vendorApiKeys.$inferSelect;

// ─── Paystack Payments ────────────────────────────────────────────────────────
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reference: varchar("reference", { length: 128 }).notNull().unique(),
  amountNaira: decimal("amountNaira", { precision: 10, scale: 2 }).notNull(),
  amountUsd: decimal("amountUsd", { precision: 10, scale: 6 }),
  currency: varchar("currency", { length: 10 }).default("NGN").notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed", "abandoned"]).default("pending").notNull(),
  channel: varchar("channel", { length: 64 }),
  paystackId: varchar("paystackId", { length: 64 }),
  accessCode: varchar("accessCode", { length: 128 }),
  gatewayResponse: text("gatewayResponse"),
  paidAt: timestamp("paidAt"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Payment = typeof payments.$inferSelect;

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteSetting = typeof siteSettings.$inferSelect;
// ─── Product Categories ───────────────────────────────────────────────────────
export const productCategories = mysqlTable("product_categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  icon: varchar("icon", { length: 64 }).default("Tag").notNull(),
  description: varchar("description", { length: 255 }),
  color: varchar("color", { length: 128 }).default("from-violet-500/20 to-purple-500/20").notNull(),
  borderColor: varchar("borderColor", { length: 128 }).default("border-violet-500/20 hover:border-violet-500/40").notNull(),
  iconColor: varchar("iconColor", { length: 64 }).default("text-violet-400").notNull(),
  parentId: int("parentId"),  // null = top-level, set = subcategory
  enabled: boolean("enabled").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProductCategory = typeof productCategories.$inferSelect;

// ─── Security Logs ────────────────────────────────────────────────────────────
export const securityLogs = mysqlTable("security_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  adminId: int("adminId"),
  action: varchar("action", { length: 64 }).notNull(),
  metadata: text("metadata"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SecurityLog = typeof securityLogs.$inferSelect;
