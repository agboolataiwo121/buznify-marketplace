import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  coupons,
  growthOrders,
  growthServices,
  notifications,
  orders,
  products,
  recentlyViewed,
  refundRequests,
  referrals,
  reviews,
  smsMessages,
  supportTickets,
  ticketMessages,
  users,
  vendorApiKeys,
  vendorPayouts,
  virtualNumbers,
  walletTransactions,
  wishlists,
  payments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  // Generate referral code on first insert
  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  values.referralCode = referralCode;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function updateUserPasswordHash(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function updateUserResetToken(
  userId: number,
  token: string | null,
  expiry: Date | null
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(users.id, userId));
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  return result[0];
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "vendor") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserBalance(userId: number, newBalance: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(opts: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  vendorId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (opts.category) conditions.push(eq(products.category, opts.category as any));
  if (opts.vendorId) conditions.push(eq(products.vendorId, opts.vendorId));
  if (opts.status) conditions.push(eq(products.status, opts.status as any));
  else conditions.push(eq(products.status, "active"));

  if (opts.search) {
    conditions.push(
      or(
        like(products.title, `%${opts.search}%`),
        like(products.description, `%${opts.search}%`)
      )
    );
  }

  return db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0)
    .orderBy(desc(products.totalSold));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ status: "inactive" }).where(eq(products.id, id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function updateOrderStatus(
  id: number,
  status: typeof orders.$inferSelect["status"],
  deliveryData?: unknown
) {
  const db = await getDb();
  if (!db) return;
  const updateData: Partial<typeof orders.$inferInsert> = { status };
  if (deliveryData) {
    updateData.deliveryData = deliveryData;
    updateData.deliveredAt = new Date();
  }
  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

export async function getAllOrders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).limit(limit).offset(offset).orderBy(desc(orders.createdAt));
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export async function createWalletTransaction(data: typeof walletTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(walletTransactions).values(data);
}

export async function getWalletTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50);
}

// ─── Virtual Numbers ──────────────────────────────────────────────────────────
export async function getVirtualNumbers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(virtualNumbers)
    .where(eq(virtualNumbers.userId, userId))
    .orderBy(desc(virtualNumbers.createdAt));
}

export async function createVirtualNumber(data: typeof virtualNumbers.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(virtualNumbers).values(data);
  return result;
}

export async function getSmsMessages(numberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(smsMessages)
    .where(eq(smsMessages.numberId, numberId))
    .orderBy(desc(smsMessages.receivedAt));
}

export async function addSmsMessage(data: typeof smsMessages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(smsMessages).values(data);
}

export async function updateVirtualNumber(
  id: number,
  data: Partial<typeof virtualNumbers.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(virtualNumbers).set(data).where(eq(virtualNumbers.id, id));
}

export async function getVirtualNumberByApiOrderId(apiOrderId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(virtualNumbers)
    .where(eq(virtualNumbers.apiOrderId, apiOrderId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getVirtualNumberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(virtualNumbers)
    .where(eq(virtualNumbers.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export async function getReferralsByReferrer(referrerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, referrerId))
    .orderBy(desc(referrals.createdAt));
}

export async function createReferral(data: typeof referrals.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(referrals).values(data);
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  return result[0];
}

export async function incrementCouponUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1` })
    .where(eq(coupons.id, id));
}

export async function getAllCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function createCoupon(data: typeof coupons.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coupons).values(data);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function getReviewsByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(data: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviews).values(data);
  // Update product avg rating
  const allReviews = await getReviewsByProduct(data.productId);
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db
    .update(products)
    .set({
      avgRating: avg.toFixed(2),
      reviewCount: allReviews.length,
    })
    .where(eq(products.id, data.productId));
}

// ─── Support Tickets ──────────────────────────────────────────────────────────
export async function getTicketsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return result[0];
}

export async function createTicket(data: typeof supportTickets.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(supportTickets).values(data);
  return result;
}

export async function updateTicketStatus(
  id: number,
  status: typeof supportTickets.$inferSelect["status"]
) {
  const db = await getDb();
  if (!db) return;
  await db.update(supportTickets).set({ status }).where(eq(supportTickets.id, id));
}

export async function getTicketMessages(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(ticketMessages.createdAt);
}

export async function addTicketMessage(data: typeof ticketMessages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(ticketMessages).values(data);
  await db
    .update(supportTickets)
    .set({ status: "in_progress" })
    .where(eq(supportTickets.id, data.ticketId));
}

export async function getAllTickets(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).limit(limit).orderBy(desc(supportTickets.createdAt));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ─── Growth Services ──────────────────────────────────────────────────────────
export async function getGrowthServices(platform?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(growthServices.isActive, true)];
  if (platform) conditions.push(eq(growthServices.platform, platform as any));
  return db
    .select()
    .from(growthServices)
    .where(and(...conditions))
    .orderBy(growthServices.price);
}

export async function seedGrowthServices() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(growthServices).limit(1);
  if (existing.length > 0) return; // already seeded

  const services = [
    // Instagram
    { platform: "instagram" as const, serviceType: "followers" as const, title: "500 Instagram Followers", description: "Real-looking followers, gradual delivery", quantity: 500, price: "2.99", deliveryTime: "24-48 hours", featured: false },
    { platform: "instagram" as const, serviceType: "followers" as const, title: "1000 Instagram Followers", description: "High quality followers, safe delivery", quantity: 1000, price: "4.99", deliveryTime: "24-48 hours", featured: true },
    { platform: "instagram" as const, serviceType: "followers" as const, title: "5000 Instagram Followers", description: "Bulk followers package", quantity: 5000, price: "19.99", deliveryTime: "3-5 days", featured: false },
    { platform: "instagram" as const, serviceType: "likes" as const, title: "500 Instagram Likes", description: "Post likes, instant start", quantity: 500, price: "1.99", deliveryTime: "1-6 hours", featured: false },
    { platform: "instagram" as const, serviceType: "views" as const, title: "10K Instagram Views", description: "Reel/video views", quantity: 10000, price: "3.99", deliveryTime: "1-6 hours", featured: false },
    // TikTok
    { platform: "tiktok" as const, serviceType: "followers" as const, title: "1000 TikTok Followers", description: "Real TikTok followers", quantity: 1000, price: "5.99", deliveryTime: "24-48 hours", featured: true },
    { platform: "tiktok" as const, serviceType: "views" as const, title: "50K TikTok Views", description: "Video views, fast delivery", quantity: 50000, price: "4.99", deliveryTime: "1-6 hours", featured: false },
    { platform: "tiktok" as const, serviceType: "likes" as const, title: "1000 TikTok Likes", description: "Post likes", quantity: 1000, price: "2.99", deliveryTime: "1-6 hours", featured: false },
    // YouTube
    { platform: "youtube" as const, serviceType: "subscribers" as const, title: "500 YouTube Subscribers", description: "Real subscribers", quantity: 500, price: "9.99", deliveryTime: "3-7 days", featured: false },
    { platform: "youtube" as const, serviceType: "subscribers" as const, title: "1000 YouTube Subscribers", description: "High retention subscribers", quantity: 1000, price: "17.99", deliveryTime: "5-10 days", featured: true },
    { platform: "youtube" as const, serviceType: "views" as const, title: "10K YouTube Views", description: "High retention views", quantity: 10000, price: "7.99", deliveryTime: "3-5 days", featured: false },
    // Telegram
    { platform: "telegram" as const, serviceType: "members" as const, title: "500 Telegram Members", description: "Real group/channel members", quantity: 500, price: "3.99", deliveryTime: "24-48 hours", featured: false },
    { platform: "telegram" as const, serviceType: "members" as const, title: "2000 Telegram Members", description: "Bulk members package", quantity: 2000, price: "12.99", deliveryTime: "3-5 days", featured: true },
    // Twitter
    { platform: "twitter" as const, serviceType: "followers" as const, title: "500 Twitter Followers", description: "Real Twitter followers", quantity: 500, price: "3.99", deliveryTime: "24-48 hours", featured: false },
    { platform: "twitter" as const, serviceType: "followers" as const, title: "2000 Twitter Followers", description: "High quality followers", quantity: 2000, price: "12.99", deliveryTime: "3-5 days", featured: true },
    // Facebook
    { platform: "facebook" as const, serviceType: "page_likes" as const, title: "500 Facebook Page Likes", description: "Real page likes", quantity: 500, price: "4.99", deliveryTime: "24-48 hours", featured: false },
    { platform: "facebook" as const, serviceType: "page_likes" as const, title: "2000 Facebook Page Likes", description: "Bulk page likes", quantity: 2000, price: "14.99", deliveryTime: "3-5 days", featured: true },
  ];

  for (const service of services) {
    await db.insert(growthServices).values({ ...service, isActive: true });
  }
}

export async function seedDemoProducts(vendorId: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return;

  const demoProducts = [
    // Social Media Accounts
    { vendorId, category: "social_media_accounts" as const, title: "Instagram Account — 10K Followers", description: "Aged Instagram account with 10,000 real followers. Niche: Lifestyle. Full access provided.", price: "49.99", originalPrice: "79.99", stock: 5, platform: "Instagram", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 234, avgRating: "4.8", reviewCount: 89, featured: true },
    { vendorId, category: "social_media_accounts" as const, title: "TikTok Account — 50K Followers", description: "Verified TikTok account with 50K followers. High engagement rate. Niche: Entertainment.", price: "129.99", originalPrice: "199.99", stock: 3, platform: "TikTok", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 156, avgRating: "4.9", reviewCount: 67, featured: true },
    { vendorId, category: "social_media_accounts" as const, title: "Twitter Account — 5K Followers", description: "Aged Twitter/X account with 5,000 followers. Clean history.", price: "24.99", stock: 8, platform: "Twitter", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 312, avgRating: "4.7", reviewCount: 124, featured: false },
    // Streaming Accounts
    { vendorId, category: "streaming_accounts" as const, title: "Netflix Premium — 1 Month", description: "Netflix 4K UHD Premium plan. 4 screens simultaneously. Instant delivery.", price: "8.99", originalPrice: "15.99", stock: 50, platform: "Netflix", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 1240, avgRating: "4.9", reviewCount: 456, featured: true },
    { vendorId, category: "streaming_accounts" as const, title: "Spotify Premium — 3 Months", description: "Spotify Premium individual plan. No ads, offline listening.", price: "6.99", originalPrice: "12.99", stock: 30, platform: "Spotify", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 892, avgRating: "4.8", reviewCount: 334, featured: true },
    { vendorId, category: "streaming_accounts" as const, title: "Disney+ — 1 Month", description: "Disney+ premium account. Access to all content.", price: "5.99", stock: 25, platform: "Disney+", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 567, avgRating: "4.7", reviewCount: 201, featured: false },
    // Gaming Accounts
    { vendorId, category: "gaming_accounts" as const, title: "Valorant Account — Diamond Rank", description: "Valorant Diamond account. 200+ skins. Unranked available.", price: "89.99", originalPrice: "149.99", stock: 4, platform: "Valorant", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 78, avgRating: "4.9", reviewCount: 45, featured: true },
    { vendorId, category: "gaming_accounts" as const, title: "CSGO Account — Level 10 Faceit", description: "CS:GO account with Level 10 Faceit. 2000+ hours.", price: "59.99", stock: 6, platform: "CSGO", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 134, avgRating: "4.8", reviewCount: 67, featured: false },
    { vendorId, category: "gaming_accounts" as const, title: "Fortnite Account — 100+ Skins", description: "Fortnite account with 100+ rare skins including OG skins.", price: "149.99", originalPrice: "249.99", stock: 2, platform: "Fortnite", deliveryType: "instant" as const, deliveryData: { credentials: "demo_credentials" }, status: "active" as const, totalSold: 45, avgRating: "5.0", reviewCount: 23, featured: true },
  ];

  for (const product of demoProducts) {
    await db.insert(products).values(product);
  }
}

// ─── Wishlist Helpers ─────────────────────────────────────────────────────────
export async function getWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wishlists).where(eq(wishlists.userId, userId));
}
export async function addToWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return;
  // Check if already in wishlist
  const existing = await db.select().from(wishlists)
    .where(eq(wishlists.userId, userId))
    .limit(50);
  if (existing.find(w => w.productId === productId)) return;
  await db.insert(wishlists).values({ userId, productId });
}
export async function removeFromWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(wishlists)
    .where(eq(wishlists.userId, userId));
}

// ─── Recently Viewed Helpers ──────────────────────────────────────────────────
export async function addRecentlyViewed(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return;
  // Upsert: delete old entry and insert fresh
  await db.delete(recentlyViewed)
    .where(eq(recentlyViewed.userId, userId));
  await db.insert(recentlyViewed).values({ userId, productId });
}
export async function getRecentlyViewed(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recentlyViewed)
    .where(eq(recentlyViewed.userId, userId))
    .orderBy(desc(recentlyViewed.viewedAt))
    .limit(limit);
}

// ─── Growth Orders Helpers ────────────────────────────────────────────────────
export async function createGrowthOrder(data: typeof growthOrders.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(growthOrders).values(data);
  return result;
}
export async function getGrowthOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(growthOrders)
    .where(eq(growthOrders.userId, userId))
    .orderBy(desc(growthOrders.createdAt));
}
export async function updateGrowthOrderStatus(id: number, status: typeof growthOrders.$inferSelect["status"], deliveredCount?: number) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (deliveredCount !== undefined) updateData.deliveredCount = deliveredCount;
  await db.update(growthOrders).set(updateData).where(eq(growthOrders.id, id));
}
export async function getAllGrowthOrders(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(growthOrders).orderBy(desc(growthOrders.createdAt)).limit(limit);
}

// ─── Refund Request Helpers ───────────────────────────────────────────────────
export async function createRefundRequest(data: typeof refundRequests.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(refundRequests).values(data);
  return result;
}
export async function getRefundRequestsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(refundRequests)
    .where(eq(refundRequests.userId, userId))
    .orderBy(desc(refundRequests.createdAt));
}
export async function getAllRefundRequests(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(refundRequests).orderBy(desc(refundRequests.createdAt)).limit(limit);
}
export async function updateRefundStatus(id: number, status: "approved" | "rejected", adminNote?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(refundRequests).set({
    status,
    adminNote: adminNote ?? null,
    processedAt: new Date(),
  }).where(eq(refundRequests.id, id));
}

// ─── Vendor Payout Helpers ────────────────────────────────────────────────────
export async function createVendorPayout(data: typeof vendorPayouts.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(vendorPayouts).values(data);
  return result;
}
export async function getVendorPayouts(vendorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendorPayouts)
    .where(eq(vendorPayouts.vendorId, vendorId))
    .orderBy(desc(vendorPayouts.createdAt));
}
export async function getAllVendorPayouts(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendorPayouts).orderBy(desc(vendorPayouts.createdAt)).limit(limit);
}
export async function updatePayoutStatus(id: number, status: "processing" | "paid" | "rejected", notes?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendorPayouts).set({
    status,
    notes: notes ?? null,
    processedAt: new Date(),
  }).where(eq(vendorPayouts.id, id));
}

// ─── Vendor API Key Helpers ───────────────────────────────────────────────────
export async function getVendorApiKeys(vendorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vendorApiKeys).where(eq(vendorApiKeys.vendorId, vendorId));
}
export async function createVendorApiKey(data: typeof vendorApiKeys.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(vendorApiKeys).values(data);
  return result;
}
export async function revokeVendorApiKey(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(vendorApiKeys).set({ isActive: false }).where(eq(vendorApiKeys.id, id));
}

// ─── Payments (Paystack) ───────────────────────────────────────────────────────
export async function createPayment(data: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPaymentByReference(reference: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
  return rows[0] ?? null;
}

export async function updatePayment(reference: string, data: Partial<typeof payments.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payments).set(data).where(eq(payments.reference, reference));
}

export async function getPaymentsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)).limit(limit);
}

export async function getAllPayments(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);
}
