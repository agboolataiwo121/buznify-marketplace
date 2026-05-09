import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addSmsMessage,
  addTicketMessage,
  createCoupon,
  createNotification,
  createOrder,
  createProduct,
  createReferral,
  createReview,
  createTicket,
  createVirtualNumber,
  createWalletTransaction,
  deleteProduct,
  getAllCoupons,
  getAllOrders,
  getAllTickets,
  getAllUsers,
  getCouponByCode,
  getDb,
  getGrowthServices,
  getNotifications,
  getOrderById,
  getOrdersByUser,
  getProductById,
  getProducts,
  getReferralsByReferrer,
  getReviewsByProduct,
  getSmsMessages,
  getTicketById,
  getTicketMessages,
  getTicketsByUser,
  getUserById,
  getVirtualNumbers,
  getWalletTransactions,
  getTransactionHistory,
  getAdminTransactions,
  incrementCouponUsage,
  markAllNotificationsRead,
  markNotificationRead,
  seedDemoProducts,
  seedGrowthServices,
  updateOrderStatus,
  updateProduct,
  updateTicketStatus,
  updateUserBalance,
  updateUserRole,
  // Phase 12 new helpers
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addRecentlyViewed,
  getRecentlyViewed,
  createGrowthOrder,
  getGrowthOrdersByUser,
  updateGrowthOrderStatus,
  getAllGrowthOrders,
  createRefundRequest,
  getRefundRequestsByUser,
  getAllRefundRequests,
  updateRefundStatus,
  updatePayoutStatus,
  updateVirtualNumber,
  getVirtualNumberById,
  getVirtualNumberByApiOrderId,
  getVendorApiKeys,
  createVendorApiKey,
  revokeVendorApiKey,
  getVendorPayouts,
  createVendorPayout,
  getAllVendorPayouts,
  updateUserProfile,
} from "./db";
import { products, users, referrals, orders as ordersTable, growthOrders as growthOrdersTable, siteSettings, productCategories } from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
import {
  getProfile as fivesimGetProfile,
  getProducts as fivesimGetProducts,
  getCountries as fivesimGetCountries,
  getPricesByCountryAndProduct as fivesimGetPrices,
  buyActivationNumber as fivesimBuyNumber,
  checkOrder as fivesimCheckOrder,
  finishOrder as fivesimFinishOrder,
  cancelOrder as fivesimCancelOrder,
  banOrder as fivesimBanOrder,
} from "./fivesim";
import {
  smmGetAllServices,
  smmGetServices,
  smmPlaceOrder,
  smmGetOrderStatus,
  smmGetBalance,
  smmRefillOrder,
  smmCancelOrder,
  detectPlatform,
  normalizeSmmStatus,
  type SmmPanel,
} from "./smm";
import {
  initializeTransaction as paystackInit,
  verifyTransaction as paystackVerify,
  generateReference,
  getPaystackBalance,
} from "./paystack";
import {
  createPayment,
  getPaymentByReference,
  updatePayment,
  getPaymentsByUser,
  getAllPayments,
  getUserByEmail,
  updateUserPasswordHash,
  updateUserResetToken,
  getUserByResetToken,
} from "./db";
import bcrypt from "bcryptjs";
import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetEmail,
} from "./email";
import { updateUserTwoFactor } from "./db";
import {
  sanitizeHtml,
  verifyCaptcha,
  recordFailedLogin,
  isLockedOut,
  clearLoginAttempts,
  checkDepositVelocity,
  logSecurityEvent,
  encryptValue,
  decryptValue,
} from "./security";
import { sendEmailVerificationEmail } from "./email";
import {
  setEmailVerifyToken,
  getUserByEmailVerifyToken,
  markEmailVerified,
  getSecurityLogs,
  setFraudFlag,
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    /** Register with email + password */
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2).max(64),
          email: z.string().email(),
          password: z.string().min(8).max(128),
          captchaToken: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { sdk } = await import("./_core/sdk");
        const { ONE_YEAR_MS } = await import("@shared/const");
        const ip = ctx.req.ip ?? ctx.req.socket?.remoteAddress ?? "unknown";
        // CAPTCHA verification
        const captchaOk = await verifyCaptcha(input.captchaToken, ip);
        if (!captchaOk) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });
        }
        // Check if email already taken
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        // Create a unique openId for email-auth users
        const openId = `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Insert user
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await db.insert(users).values({
          openId,
          name: input.name,
          email: input.email,
          loginMethod: "email",
          passwordHash,
          emailVerified: false,
          referralCode,
          lastSignedIn: new Date(),
        });
        const user = await getUserByEmail(input.email);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Issue session cookie
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name ?? "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        // Send welcome email (fire-and-forget)
        if (user.email) {
          sendWelcomeEmail(user.email, user.name ?? "there").catch(() => {});
        }
        // Send email verification link
        if (user.email && !user.emailVerified) {
          const crypto = await import("crypto");
          const verifyToken = crypto.randomBytes(32).toString("hex");
          const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await setEmailVerifyToken(user.id, verifyToken, expiry);
          const origin = (ctx.req.headers.origin as string) || "https://buznify-mktp-kunzevat.manus.space";
          sendEmailVerificationEmail(user.email, { verifyToken, origin, name: user.name ?? undefined }).catch(() => {});
        }
        await logSecurityEvent({ userId: user.id, action: "register", metadata: { email: input.email }, ipAddress: ctx.req.ip ?? "unknown" });
        return { success: true, user: { id: user.id, name: user.name, email: user.email } };
      }),

    /** Login with email + password */
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
          captchaToken: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { sdk } = await import("./_core/sdk");
        const { ONE_YEAR_MS } = await import("@shared/const");
        const ip = ctx.req.ip ?? ctx.req.socket?.remoteAddress ?? "unknown";
        // CAPTCHA verification
        const captchaOk = await verifyCaptcha(input.captchaToken, ip);
        if (!captchaOk) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });
        }
        // Account lockout check
        const lockStatus = isLockedOut(input.email);
        if (lockStatus.locked) {
          const minutesLeft = lockStatus.lockedUntil ? Math.ceil((lockStatus.lockedUntil - Date.now()) / 60000) : 30;
          await logSecurityEvent({ action: "login_locked", metadata: { email: input.email }, ipAddress: ip });
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Account temporarily locked. Try again in ${minutesLeft} minute(s).` });
        }
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          recordFailedLogin(input.email);
          await logSecurityEvent({ action: "login_failed", metadata: { email: input.email, reason: "user_not_found" }, ipAddress: ip });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          const lockResult = recordFailedLogin(input.email);
          await logSecurityEvent({ userId: user.id, action: "login_failed", metadata: { attempts: lockResult.attempts }, ipAddress: ip });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        if (!user.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Account is suspended" });
        }
        clearLoginAttempts(input.email);
        // If 2FA is enabled, do not issue session yet — return requires2FA flag
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          await logSecurityEvent({ userId: user.id, action: "2fa_login", metadata: { step: "password_ok" }, ipAddress: ip });
          return { success: true, requires2FA: true, email: user.email, user: null };
        }
        // Issue session cookie
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name ?? "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        await logSecurityEvent({ userId: user.id, action: "login_success", ipAddress: ip });
        return { success: true, requires2FA: false, email: user.email, user: { id: user.id, name: user.name, email: user.email } };
      }),

    /** Request password reset — returns token (in production, email it) */
    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        origin: z.string().url().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        // Always return success to prevent user enumeration
        if (!user || !user.passwordHash) return { success: true };
        // Use crypto.randomBytes for a cryptographically secure token
        const { randomBytes } = await import("crypto");
        const token = randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        await updateUserResetToken(user.id, token, expiry);
        // Use origin from frontend so the link works on any domain
        const origin = input.origin || process.env.APP_ORIGIN || "https://buznify-mktp-kunzevat.manus.space";
        sendPasswordResetEmail(user.email!, { resetToken: token, origin }).catch(() => {});
        // Log the reset request for security audit
        logSecurityEvent({ userId: user.id, action: "password_reset_request", ipAddress: ctx.req.ip ?? "unknown" }).catch(() => {});
        // Never return the token — user must use the emailed link
        return { success: true };
      }),

    /** Verify email address using the token sent by email */
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmailVerifyToken(input.token);
        if (!user) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired verification link." });
        }
        if (user.emailVerifyExpiry && new Date() > user.emailVerifyExpiry) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Verification link has expired. Please request a new one." });
        }
        await markEmailVerified(user.id);
        await logSecurityEvent({ userId: user.id, action: "email_verified", ipAddress: ctx.req.ip ?? "unknown" });
        return { success: true };
      }),
    /** Resend email verification link */
    resendVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.emailVerified) {
        return { success: true, message: "Email already verified." };
      }
      if (!user.email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No email address on file." });
      }
      const crypto = await import("crypto");
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await setEmailVerifyToken(user.id, verifyToken, expiry);
      const origin = (ctx.req.headers.origin as string) || "https://buznify-mktp-kunzevat.manus.space";
      sendEmailVerificationEmail(user.email, { verifyToken, origin, name: user.name ?? undefined }).catch(() => {});
      return { success: true, message: "Verification email sent." };
    }),
    /** Setup TOTP 2FA — generates a secret and returns a QR code data URL */
    setup2FA: protectedProcedure.mutation(async ({ ctx }) => {
      const { generateSecret, generateURI } = await import("otplib");
      const QRCode = await import("qrcode");
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      // Generate a new secret
      const secret = generateSecret();
      // Build the otpauth URI
      const label = user.email ?? user.name ?? `user-${user.id}`;
      const otpauthUrl = generateURI({ issuer: "Buznify", label, secret });
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.default.toDataURL(otpauthUrl);
      // Store secret (not yet enabled — user must verify first)
      await updateUserTwoFactor(user.id, { twoFactorSecret: secret, twoFactorEnabled: false });
      return { secret, qrCodeDataUrl, otpauthUrl };
    }),

    /** Verify a TOTP token and enable 2FA */
    verify2FA: protectedProcedure
      .input(z.object({ token: z.string().min(6).max(8) }))
      .mutation(async ({ input, ctx }) => {
        const { verify } = await import("otplib");
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        if (!user.twoFactorSecret) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "2FA not set up. Call setup2FA first." });
        }
        const result = await verify({ token: input.token, secret: user.twoFactorSecret });
        if (!result.valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid verification code. Please try again." });
        }
        await updateUserTwoFactor(user.id, { twoFactorEnabled: true });
        return { success: true };
      }),

    /** Disable 2FA — requires password confirmation */
    disable2FA: protectedProcedure
      .input(z.object({ password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        if (!user.twoFactorEnabled) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "2FA is not enabled" });
        }
        // Require password verification (OAuth users without password can skip)
        if (user.passwordHash) {
          const valid = await bcrypt.compare(input.password, user.passwordHash);
          if (!valid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
          }
        }
        await updateUserTwoFactor(user.id, { twoFactorSecret: null, twoFactorEnabled: false });
        return { success: true };
      }),

    /** Complete 2FA login — verify TOTP token and issue session */
    complete2FALogin: publicProcedure
      .input(z.object({ email: z.string().email(), token: z.string().min(6).max(8) }))
      .mutation(async ({ input, ctx }) => {
        const { sdk } = await import("./_core/sdk");
        const { ONE_YEAR_MS } = await import("@shared/const");
        const { verify } = await import("otplib");
        const user = await getUserByEmail(input.email);
        if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "2FA not configured for this account" });
        }
        const result = await verify({ token: input.token, secret: user.twoFactorSecret });
        if (!result.valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid 2FA code" });
        }
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name ?? "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user: { id: user.id, name: user.name, email: user.email } };
      }),

    /** Get 2FA status for the current user */
    get2FAStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return { enabled: user.twoFactorEnabled ?? false };
    }),

    /** Reset password using token */
    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string().min(1),
          newPassword: z.string().min(8).max(128),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByResetToken(input.token);
        if (!user) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token" });
        }
        if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Reset token has expired. Please request a new reset link." });
        }
        const passwordHash = await bcrypt.hash(input.newPassword, 12);
        await updateUserPasswordHash(user.id, passwordHash);
        await updateUserResetToken(user.id, null, null);
        // Log the successful password reset
        logSecurityEvent({ userId: user.id, action: "password_reset_complete", ipAddress: ctx.req.ip ?? "unknown" }).catch(() => {});
        return { success: true };
      }),
  }),

  // ── Products ──────────────────────────────────────────────────────────────
  products: router({
    listCategories: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const cats = await db
        .select()
        .from(productCategories)
        .where(eq(productCategories.enabled, true))
        .orderBy(productCategories.sortOrder, productCategories.createdAt);
      // Build tree: top-level categories with children array
      const parents = cats.filter((c: any) => c.parentId === null || c.parentId === undefined);
      return parents.map((p: any) => ({
        ...p,
        children: cats.filter((c: any) => c.parentId === p.id),
      }));
    }),
    getSubcategories: publicProcedure
      .input(z.object({ parentId: z.number().int() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(productCategories)
          .where(eq(productCategories.parentId, input.parentId))
          .orderBy(productCategories.sortOrder);
      }),

    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
          subcategoryId: z.number().int().optional(),
        })
      )
      .query(async ({ input }) => {
        // Seed demo data on first call
        await seedGrowthServices();
        return getProducts(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        return product;
      }),

    create: adminProcedure
      .input(
        z.object({
          category: z.enum([
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
          ]),
          title: z.string().min(3).max(255),
          description: z.string().optional(),
          price: z.string(),
          originalPrice: z.string().optional(),
          stock: z.number().min(0),
          platform: z.string().optional(),
          deliveryType: z.enum(["instant", "manual"]).default("instant"),
          deliveryData: z.any().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createProduct({
          ...input,
          vendorId: ctx.user.id,
          status: ctx.user.role === "admin" ? "active" : "pending",
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          originalPrice: z.string().optional(),
          stock: z.number().optional(),
          platform: z.string().optional(),
          imageUrl: z.string().optional(),
          deliveryType: z.enum(["instant", "manual"]).optional(),
          deliveryData: z.any().optional(),
          featured: z.boolean().optional(),
          tags: z.array(z.string()).optional(),
          status: z.enum(["active", "inactive", "pending", "rejected"]).optional(),
          category: z.enum([
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
          ]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        if (product.vendorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await updateProduct(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        if (product.vendorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await deleteProduct(input.id);
        return { success: true };
      }),

    vendorProducts: adminProcedure.query(async ({ ctx }) => {
      return getProducts({ vendorId: ctx.user.id, status: undefined });
    }),
    bulkUpdate: adminProcedure
      .input(z.object({
        ids: z.array(z.number()).min(1),
        updates: z.object({
          status: z.enum(["active", "inactive", "pending", "rejected"]).optional(),
          category: z.enum(["social_media_accounts", "streaming_accounts", "gaming_accounts", "virtual_numbers", "growth_services", "ai_tools", "digital_subscriptions", "gaming_currency", "proxy_networking", "verification_services"]).optional(),
          priceAdjustment: z.object({
            type: z.enum(["set", "increase_pct", "decrease_pct", "increase_fixed", "decrease_fixed"]),
            value: z.number().min(0),
          }).optional(),
          stock: z.number().min(0).optional(),
          featured: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { ids, updates } = input;
        let updated = 0;
        for (const id of ids) {
          const product = await getProductById(id);
          const patch: Record<string, unknown> = {};
          if (updates.status !== undefined) patch.status = updates.status;
          if (updates.category !== undefined) patch.category = updates.category;
          if (updates.featured !== undefined) patch.featured = updates.featured;
          if (updates.stock !== undefined) patch.stock = updates.stock;
          if (updates.priceAdjustment) {
            const { type, value } = updates.priceAdjustment;
            const current = Number(product?.price ?? 0);
            if (type === "set") patch.price = value.toString();
            else if (type === "increase_pct") patch.price = (current * (1 + value / 100)).toFixed(2);
            else if (type === "decrease_pct") patch.price = Math.max(0.01, current * (1 - value / 100)).toFixed(2);
            else if (type === "increase_fixed") patch.price = (current + value).toFixed(2);
            else if (type === "decrease_fixed") patch.price = Math.max(0.01, current - value).toFixed(2);
          }
          if (Object.keys(patch).length > 0) {
            await updateProduct(id, patch as Parameters<typeof updateProduct>[1]);
            updated++;
          }
        }
        return { updated };
      }),
     bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input }) => {
        let deleted = 0;
        for (const id of input.ids) {
          try { await deleteProduct(id); deleted++; } catch { /* skip */ }
        }
        return { deleted };
      }),

    /** Related products: same category, exclude current product */
    getRelated: publicProcedure
      .input(z.object({ productId: z.number(), category: z.string().optional(), limit: z.number().default(6) }))
      .query(async ({ input }) => {
        const all = await getProducts({ limit: 100, status: "active" });
        return all
          .filter(p => p.id !== input.productId && (!input.category || p.category === input.category))
          .sort(() => Math.random() - 0.5)
          .slice(0, input.limit);
      }),

    /** AI-powered product recommendations based on category/history */
    getRecommendations: publicProcedure
      .input(z.object({ categories: z.array(z.string()).optional(), limit: z.number().default(8) }))
      .query(async ({ input }) => {
        const all = await getProducts({ limit: 200, status: "active" });
        if (!input.categories?.length) {
          return all.sort(() => Math.random() - 0.5).slice(0, input.limit);
        }
        const matched = all.filter(p => input.categories!.includes(p.category));
        const others = all.filter(p => !input.categories!.includes(p.category));
        return [...matched, ...others].slice(0, input.limit);
      }),

    /** AI natural language search assistant */
    aiSearch: publicProcedure
      .input(z.object({ query: z.string().min(2).max(500) }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const all = await getProducts({ limit: 200, status: "active" });
        const catalog = all.slice(0, 50).map(p => `ID:${p.id} | ${p.title} | ${p.category} | $${p.price}`).join("\n");
        const prompt = `You are a product search assistant for Buznify digital marketplace. Given the user's search query, return a JSON array of up to 6 product IDs from the catalog that best match.\n\nCatalog:\n${catalog}\n\nUser query: "${input.query}"\n\nReturn ONLY a JSON array of numbers like [1, 5, 12]. No explanation.`;
        try {
          const response = await invokeLLM({ messages: [{ role: "user" as const, content: prompt }] });
          const content = (response as { choices: Array<{ message: { content: string } }> }).choices?.[0]?.message?.content ?? "[]";
          const ids: number[] = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] ?? "[]");
          const results = all.filter(p => ids.includes(p.id));
          return { results, query: input.query };
        } catch {
          const keyword = input.query.toLowerCase();
          const results = all.filter(p => p.title.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword)).slice(0, 6);
          return { results, query: input.query };
        }
      }),
  }),
  // ── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1).default(1),
          couponCode: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        if (product.status !== "active") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Product is not available" });
        }
        if (product.stock < input.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
        }

        const unitPrice = parseFloat(product.price);
        let totalAmount = unitPrice * input.quantity;
        let discountAmount = 0;
        let couponId: number | undefined;

        // Apply coupon
        if (input.couponCode) {
          const coupon = await getCouponByCode(input.couponCode);
          if (coupon && coupon.isActive && coupon.usedCount < coupon.usageLimit) {
            if (coupon.discountType === "percentage") {
              discountAmount = (totalAmount * parseFloat(coupon.discountValue)) / 100;
            } else {
              discountAmount = parseFloat(coupon.discountValue);
            }
            totalAmount = Math.max(0, totalAmount - discountAmount);
            couponId = coupon.id;
          }
        }

        // Check wallet balance
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balance = parseFloat(user.balance ?? "0");
        if (balance < totalAmount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient balance. You need $${totalAmount.toFixed(2)} but have $${balance.toFixed(2)}`,
          });
        }

        // Deduct balance
        const newBalance = (balance - totalAmount).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);

        // Create wallet transaction
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "purchase",
          amount: totalAmount.toFixed(2),
          balanceBefore: balance.toFixed(2),
          balanceAfter: newBalance,
          description: `Purchase: ${product.title}`,
          referenceId: `prod_${product.id}`,
          status: "completed",
        });

        // Increment coupon usage
        if (couponId) await incrementCouponUsage(couponId);

        // Create order with delivery data (instant delivery)
        const deliveryData =
          product.deliveryType === "instant" ? product.deliveryData : null;

        await createOrder({
          userId: ctx.user.id,
          productId: product.id,
          vendorId: product.vendorId,
          quantity: input.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          couponId,
          status: product.deliveryType === "instant" ? "completed" : "processing",
          deliveryData,
          deliveredAt: product.deliveryType === "instant" ? new Date() : undefined,
        });

        // Update product stock
        const db = await getDb();
        if (db) {
          await db
            .update(products)
            .set({
              stock: product.stock - input.quantity,
              totalSold: (product.totalSold ?? 0) + input.quantity,
            })
            .where(eq(products.id, product.id));
        }

        // Create notification
        await createNotification({
          userId: ctx.user.id,
          type: "order_completed",
          title: "Order Completed",
          message: `Your order for "${product.title}" has been ${product.deliveryType === "instant" ? "delivered" : "placed"}.`,
          referenceId: `order_${product.id}`,
        });

        // Send order confirmation email (fire-and-forget)
        const orderUser = await getUserById(ctx.user.id);
        if (orderUser?.email) {
          // Get the newly created order for its ID
          const latestOrders = await getOrdersByUser(ctx.user.id);
          const latestOrder = latestOrders[0];
          if (latestOrder) {
            sendOrderConfirmationEmail(orderUser.email, {
              orderId: String(latestOrder.id),
              productTitle: product.title,
              quantity: input.quantity,
              totalPrice: Math.round(totalAmount * 100),
              deliveryType: product.deliveryType,
            }).catch(() => {});
            // If instant delivery, also send delivery email
            if (product.deliveryType === "instant" && deliveryData) {
              sendOrderDeliveredEmail(orderUser.email, {
                orderId: String(latestOrder.id),
                productTitle: product.title,
                deliveryData: typeof deliveryData === "string" ? deliveryData : JSON.stringify(deliveryData, null, 2),
              }).catch(() => {});
            }
          }
        }

        return {
          success: true,
          deliveryData: product.deliveryType === "instant" ? deliveryData : null,
          status: product.deliveryType === "instant" ? "completed" : "processing",
        };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return getOrdersByUser(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),
  }),

  // ── Wallet ────────────────────────────────────────────────────────────────
  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return { balance: parseFloat(user?.balance ?? "0") };
    }),

    deposit: protectedProcedure
      .input(z.object({ amount: z.number().min(1).max(10000) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const currentBalance = parseFloat(user.balance ?? "0");
        const newBalance = (currentBalance + input.amount).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "deposit",
          amount: input.amount.toFixed(2),
          balanceBefore: currentBalance.toFixed(2),
          balanceAfter: newBalance,
          description: "Wallet deposit",
          status: "completed",
        });
        return { success: true, newBalance: parseFloat(newBalance) };
      }),

    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      return getWalletTransactions(ctx.user.id);
    }),
    /** Paginated, filterable transaction history with Paystack payment metadata */
    getHistory: protectedProcedure
      .input(
        z.object({
          type: z.enum(["all", "deposit", "withdrawal", "purchase", "refund", "referral_reward", "admin_credit"]).default("all"),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(5).max(50).default(10),
        })
      )
      .query(async ({ input, ctx }) => {
        return getTransactionHistory(ctx.user.id, {
          type: input.type,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),

    /** Admin: paginated wallet transactions for ALL users, searchable by email or reference */
    adminTransactions: adminProcedure
      .input(
        z.object({
          search: z.string().default(""),
          type: z.enum(["all", "deposit", "withdrawal", "purchase", "refund", "referral_reward", "admin_credit"]).default("all"),
          status: z.enum(["all", "pending", "completed", "failed"]).default("all"),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(5).max(100).default(20),
        })
      )
      .query(async ({ input }) => {
        return getAdminTransactions({
          search: input.search,
          type: input.type,
          status: input.status,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),
    withdraw: protectedProcedure
      .input(z.object({ amount: z.number().min(1).max(10000) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const currentBalance = parseFloat(user.balance ?? "0");
        if (currentBalance < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }
        const newBalance = (currentBalance - input.amount).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "withdrawal",
          amount: input.amount.toFixed(2),
          balanceBefore: currentBalance.toFixed(2),
          balanceAfter: newBalance,
          description: "Wallet withdrawal",
          status: "completed",
        });
        return { success: true, newBalance: parseFloat(newBalance) };
      }),
  }),

  // ── Growth Services (SMMKings + Peakerr live API) ────────────────────────
  growth: router({
    /**
     * Fetch live services from SMMKings and Peakerr, merged and enriched.
     * Optionally filter by platform or serviceType.
     */
    listLive: publicProcedure
      .input(
        z.object({
          platform: z.string().optional(),
          serviceType: z.string().optional(),
          panel: z.enum(["smmkings", "peakerr", "all"]).default("all"),
        })
      )
      .query(async ({ input }) => {
        const services = input.panel === "all"
          ? await smmGetAllServices()
          : await smmGetServices(input.panel as SmmPanel);

        return services
          .map((s) => ({
            ...s,
            platform: detectPlatform(s.name, s.category),
            serviceType: s.type.toLowerCase(),
            ratePerThousand: parseFloat(s.rate),
            minQty: parseInt(s.min, 10),
            maxQty: parseInt(s.max, 10),
          }))
          .filter((s) => {
            if (input.platform && s.platform !== input.platform) return false;
            if (input.serviceType && !s.serviceType.toLowerCase().includes(input.serviceType.toLowerCase())) return false;
            return true;
          });
      }),

    /** Place a real order on SMMKings or Peakerr, deduct wallet, store in DB */
    placeOrder: protectedProcedure
      .input(
        z.object({
          panel: z.enum(["smmkings", "peakerr"]),
          serviceId: z.number(),
          serviceName: z.string(),
          targetUrl: z.string().url("Must be a valid URL"),
          quantity: z.number().min(10).max(1000000),
          totalPrice: z.number().min(0.001),
          speedLabel: z.enum(["slow", "medium", "fast", "instant"]).optional().default("medium"),
          dripFeed: z.boolean().optional().default(false),
          dripInterval: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balance = parseFloat(user.balance ?? "0");
        if (balance < input.totalPrice) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient balance. Need $${input.totalPrice.toFixed(4)}, have $${balance.toFixed(2)}`,
          });
        }

        // Place order on panel
        let apiOrderId: string | undefined;
        try {
          const result = await smmPlaceOrder(
            input.panel as SmmPanel,
            input.serviceId,
            input.targetUrl,
            input.quantity
          );
          apiOrderId = String(result.order);
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Panel error: ${(err as Error).message}`,
          });
        }

        // Deduct wallet
        const newBalance = (balance - input.totalPrice).toFixed(6);
        await updateUserBalance(ctx.user.id, newBalance);
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "purchase",
          amount: input.totalPrice.toFixed(6),
          balanceBefore: balance.toFixed(2),
          balanceAfter: newBalance,
          description: `SMM Order: ${input.serviceName} x${input.quantity} → ${input.targetUrl}`,
          referenceId: apiOrderId,
          status: "completed",
        });

        // Store in DB
        const db = await getDb();
        if (db) {
          await db.insert(growthOrdersTable).values({
            userId: ctx.user.id,
            serviceId: input.serviceId,
            targetUrl: input.targetUrl,
            quantity: input.quantity,
            totalAmount: input.totalPrice.toFixed(6),
            status: "processing",
            deliveredCount: 0,
            apiOrderId,
            panel: input.panel as "smmkings" | "peakerr",
            apiServiceId: input.serviceId,
            speedLabel: input.speedLabel ?? "medium",
            dripFeed: input.dripFeed ?? false,
            dripInterval: input.dripInterval,
            notes: input.serviceName,
          });
        }

        await createNotification({
          userId: ctx.user.id,
          type: "order_completed",
          title: "Growth Order Placed",
          message: `Order #${apiOrderId} for ${input.quantity} ${input.serviceName} is now processing.`,
        });

        return { success: true, apiOrderId, newBalance: parseFloat(newBalance) };
      }),

    /** Get live status of a growth order from the panel */
    getOrderStatus: protectedProcedure
      .input(z.object({ growthOrderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db
          .select()
          .from(growthOrdersTable)
          .where(eq(growthOrdersTable.id, input.growthOrderId))
          .limit(1);
        const order = rows[0];
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (!order.apiOrderId || !order.panel || order.panel === "manual") {
          return { ...order, liveStatus: null };
        }
        try {
          const live = await smmGetOrderStatus(order.panel as SmmPanel, order.apiOrderId);
          const newStatus = normalizeSmmStatus(live.status);
          // Sync to DB
          await db.update(growthOrdersTable).set({
            status: newStatus,
            startCount: live.start_count ? parseInt(live.start_count, 10) : undefined,
            remains: live.remains ? parseInt(live.remains, 10) : undefined,
            deliveredCount: live.start_count && live.remains
              ? Math.max(0, parseInt(live.start_count, 10) + order.quantity - parseInt(live.remains, 10))
              : order.deliveredCount,
          }).where(eq(growthOrdersTable.id, order.id));
          return { ...order, status: newStatus, liveStatus: live };
        } catch {
          return { ...order, liveStatus: null };
        }
      }),

    /** List all growth orders for the current user */
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(growthOrdersTable)
        .where(eq(growthOrdersTable.userId, ctx.user.id))
        .orderBy(desc(growthOrdersTable.createdAt))
        .limit(100);
    }),

    /** Request a refill for a dropped order */
    refillOrder: protectedProcedure
      .input(z.object({ growthOrderId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db.select().from(growthOrdersTable).where(eq(growthOrdersTable.id, input.growthOrderId)).limit(1);
        const order = rows[0];
        if (!order || order.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        if (!order.apiOrderId || !order.panel || order.panel === "manual") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Order not eligible for refill" });
        }
        await smmRefillOrder(order.panel as SmmPanel, order.apiOrderId);
        await db.update(growthOrdersTable).set({ refillRequested: true }).where(eq(growthOrdersTable.id, order.id));
        return { success: true };
      }),

    /** Cancel an eligible order */
    cancelOrder: protectedProcedure
      .input(z.object({ growthOrderId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db.select().from(growthOrdersTable).where(eq(growthOrdersTable.id, input.growthOrderId)).limit(1);
        const order = rows[0];
        if (!order || order.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        if (!order.apiOrderId || !order.panel || order.panel === "manual") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Order not eligible for cancellation" });
        }
        await smmCancelOrder(order.panel as SmmPanel, order.apiOrderId);
        await db.update(growthOrdersTable).set({ status: "cancelled", cancelRequested: true }).where(eq(growthOrdersTable.id, order.id));
        return { success: true };
      }),

    /** Admin: get panel balances */
    getPanelBalances: adminProcedure.query(async () => {
      const [kings, peakerr] = await Promise.allSettled([
        smmGetBalance("smmkings"),
        smmGetBalance("peakerr"),
      ]);
      return {
        smmkings: kings.status === "fulfilled" ? kings.value : null,
        peakerr: peakerr.status === "fulfilled" ? peakerr.value : null,
      };
    }),

    /** Legacy: list seeded growth services from DB (kept for backwards compat) */
    list: publicProcedure
      .input(z.object({ platform: z.string().optional() }))
      .query(async ({ input }) => {
        await seedGrowthServices();
        return getGrowthServices(input.platform);
      }),

    massOrder: protectedProcedure
      .input(z.object({
        orders: z.array(z.object({
          panel: z.enum(["smmkings", "peakerr"]),
          serviceId: z.number(),
          serviceName: z.string(),
          targetUrl: z.string().url(),
          quantity: z.number().min(10).max(1000000),
          totalPrice: z.number().min(0.001),
          speedLabel: z.enum(["slow", "medium", "fast", "instant"]).optional().default("medium"),
          dripFeed: z.boolean().optional().default(false),
          dripInterval: z.number().optional(),
        })).min(1).max(50),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const totalCost = input.orders.reduce((s, o) => s + o.totalPrice, 0);
        const balance = parseFloat(user.balance ?? "0");
        if (balance < totalCost) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient balance. Need $${totalCost.toFixed(4)}, have $${balance.toFixed(2)}` });
        }
        const results: { serviceName: string; apiOrderId?: string; error?: string }[] = [];
        let remainingBalance = balance;
        const db = await getDb();
        for (const order of input.orders) {
          try {
            const result = await smmPlaceOrder(order.panel as SmmPanel, order.serviceId, order.targetUrl, order.quantity);
            const apiOrderId = String(result.order);
            remainingBalance -= order.totalPrice;
            await updateUserBalance(ctx.user.id, remainingBalance.toFixed(6));
            await createWalletTransaction({
              userId: ctx.user.id,
              type: "purchase",
              amount: order.totalPrice.toFixed(6),
              balanceBefore: (remainingBalance + order.totalPrice).toFixed(2),
              balanceAfter: remainingBalance.toFixed(6),
              description: `Mass Order: ${order.serviceName} x${order.quantity}`,
              referenceId: apiOrderId,
              status: "completed",
            });
            if (db) {
              await db.insert(growthOrdersTable).values({
                userId: ctx.user.id,
                serviceId: order.serviceId,
                targetUrl: order.targetUrl,
                quantity: order.quantity,
                totalAmount: order.totalPrice.toFixed(6),
                status: "processing",
                deliveredCount: 0,
                apiOrderId,
                panel: order.panel as "smmkings" | "peakerr",
                apiServiceId: order.serviceId,
                speedLabel: order.speedLabel ?? "medium",
                dripFeed: order.dripFeed ?? false,
                dripInterval: order.dripInterval,
                notes: order.serviceName,
              });
            }
            results.push({ serviceName: order.serviceName, apiOrderId });
          } catch (err) {
            results.push({ serviceName: order.serviceName, error: (err as Error).message });
          }
        }
        return { results, newBalance: remainingBalance };
      }),
  }),

  // ── Virtual Numbers (5sim API) ───────────────────────────────────────────
  virtualNumbers: router({
    /** List all active virtual number orders for the current user */
    myNumbers: protectedProcedure.query(async ({ ctx }) => {
      return getVirtualNumbers(ctx.user.id);
    }),

    /** Get live products/prices from 5sim for a given country (public) */
    getProducts: publicProcedure
      .input(z.object({ country: z.string().default("russia"), operator: z.string().default("any") }))
      .query(async ({ input }) => {
        try {
          return await fivesimGetProducts(input.country, input.operator);
        } catch (e) {
          console.error("[5sim] getProducts error:", e);
          return {};
        }
      }),

    /** Get list of countries from 5sim (public) */
    getCountries: publicProcedure.query(async () => {
      try {
        return await fivesimGetCountries();
      } catch (e) {
        console.error("[5sim] getCountries error:", e);
        return {};
      }
    }),

    /** Get prices for a specific country + product (public) */
    getPrices: publicProcedure
      .input(z.object({ country: z.string(), product: z.string() }))
      .query(async ({ input }) => {
        try {
          return await fivesimGetPrices(input.country, input.product);
        } catch (e) {
          console.error("[5sim] getPrices error:", e);
          return {};
        }
      }),

    /** Get 5sim account balance (admin only) */
    getApiBalance: adminProcedure.query(async () => {
      try {
        const profile = await fivesimGetProfile();
        return { balance: profile.balance, rating: profile.rating };
      } catch (e) {
        console.error("[5sim] getProfile error:", e);
        return { balance: 0, rating: 0 };
      }
    }),

    /** Buy a real virtual number via 5sim */
    purchase: protectedProcedure
      .input(
        z.object({
          country: z.string(),
          countryCode: z.string(),
          countryName: z.string(),
          product: z.string(),
          operator: z.string().default("any"),
          maxPrice: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balance = parseFloat(user.balance ?? "0");

        if (balance < 0.1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance. Please top up your wallet." });
        }

        let order;
        try {
          order = await fivesimBuyNumber(input.country, input.operator, input.product, input.maxPrice);
        } catch (err: any) {
          const msg = err?.message ?? "Failed to purchase number";
          if (msg.includes("not enough user balance")) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "5sim account balance is insufficient. Please contact support." });
          }
          if (msg.includes("no free phones")) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "No numbers available for this service/country. Try another country." });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msg });
        }

        const price = order.price;

        if (balance < price) {
          try { await fivesimCancelOrder(order.id); } catch {}
          throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient balance. Need $${price.toFixed(2)}.` });
        }

        const newBalance = (balance - price).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);

        const expiresAt = new Date(order.expires);
        await createVirtualNumber({
          userId: ctx.user.id,
          number: order.phone,
          countryCode: input.countryCode,
          countryName: input.countryName,
          service: input.product,
          operator: order.operator,
          apiOrderId: order.id,
          price: price.toFixed(2),
          status: "active",
          expiresAt,
        });

        await createWalletTransaction({
          userId: ctx.user.id,
          type: "purchase",
          amount: price.toFixed(2),
          balanceBefore: balance.toFixed(2),
          balanceAfter: newBalance,
          description: `Virtual number (${input.product}): ${order.phone}`,
          referenceId: `vn_${order.id}`,
          status: "completed",
        });

        await createNotification({
          userId: ctx.user.id,
          type: "order_completed",
          title: "Virtual Number Purchased",
          message: `Your number ${order.phone} is active. Waiting for SMS from ${input.product}.`,
        });

        return {
          success: true,
          number: order.phone,
          orderId: order.id,
          expires: order.expires,
          price,
        };
      }),

    /** Poll 5sim for SMS on an order */
    checkSms: protectedProcedure
      .input(z.object({ localId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const vn = await getVirtualNumberById(input.localId);
        if (!vn || vn.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (!vn.apiOrderId) {
          return { status: "active", sms: await getSmsMessages(vn.id) };
        }

        const order = await fivesimCheckOrder(vn.apiOrderId);

        if (order.sms && order.sms.length > 0) {
          const existing = await getSmsMessages(vn.id);
          const existingKeys = new Set(existing.map((s) => s.sender + s.message));
          for (const sms of order.sms) {
            const key = sms.sender + sms.text;
            if (!existingKeys.has(key)) {
              await addSmsMessage({
                numberId: vn.id,
                sender: sms.sender,
                message: sms.text,
                receivedAt: new Date(sms.date),
              });
            }
          }
        }

        const statusMap: Record<string, "active" | "expired" | "cancelled" | "finished" | "banned"> = {
          PENDING: "active",
          RECEIVED: "active",
          CANCELED: "cancelled",
          TIMEOUT: "expired",
          FINISHED: "finished",
          BANNED: "banned",
        };
        const newStatus = statusMap[order.status] ?? "active";
        if (newStatus !== vn.status) {
          await updateVirtualNumber(vn.id, { status: newStatus });
        }

        return {
          status: order.status,
          sms: await getSmsMessages(vn.id),
        };
      }),

    /** Finish an order */
    finishOrder: protectedProcedure
      .input(z.object({ localId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const vn = await getVirtualNumberById(input.localId);
        if (!vn || vn.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        if (!vn.apiOrderId) throw new TRPCError({ code: "BAD_REQUEST", message: "No API order" });
        await fivesimFinishOrder(vn.apiOrderId);
        await updateVirtualNumber(vn.id, { status: "finished" });
        return { success: true };
      }),

    /** Cancel an order (refund if no SMS received) */
    cancelOrder: protectedProcedure
      .input(z.object({ localId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const vn = await getVirtualNumberById(input.localId);
        if (!vn || vn.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        if (!vn.apiOrderId) {
          await updateVirtualNumber(vn.id, { status: "cancelled" });
          return { success: true, refunded: false };
        }
        try {
          await fivesimCancelOrder(vn.apiOrderId);
          await updateVirtualNumber(vn.id, { status: "cancelled" });
          const user = await getUserById(ctx.user.id);
          if (user) {
            const price = parseFloat(vn.price ?? "0");
            const bal = parseFloat(user.balance ?? "0");
            const newBal = (bal + price).toFixed(2);
            await updateUserBalance(ctx.user.id, newBal);
            await createWalletTransaction({
              userId: ctx.user.id,
              type: "refund",
              amount: price.toFixed(2),
              balanceBefore: bal.toFixed(2),
              balanceAfter: newBal,
              description: `Refund: cancelled virtual number ${vn.number}`,
              referenceId: `vn_cancel_${vn.apiOrderId}`,
              status: "completed",
            });
          }
          return { success: true, refunded: true };
        } catch (err: any) {
          const msg = err?.message ?? "";
          if (msg.includes("order has sms")) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel: SMS already received." });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msg });
        }
      }),

    /** Ban a number (report as banned, get refund) */
    banNumber: protectedProcedure
      .input(z.object({ localId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const vn = await getVirtualNumberById(input.localId);
        if (!vn || vn.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        if (!vn.apiOrderId) throw new TRPCError({ code: "BAD_REQUEST", message: "No API order" });
        await fivesimBanOrder(vn.apiOrderId);
        await updateVirtualNumber(vn.id, { status: "banned" });
        const user = await getUserById(ctx.user.id);
        if (user) {
          const price = parseFloat(vn.price ?? "0");
          const bal = parseFloat(user.balance ?? "0");
          const newBal = (bal + price).toFixed(2);
          await updateUserBalance(ctx.user.id, newBal);
          await createWalletTransaction({
            userId: ctx.user.id,
            type: "refund",
            amount: price.toFixed(2),
            balanceBefore: bal.toFixed(2),
            balanceAfter: newBal,
            description: `Refund: banned virtual number ${vn.number}`,
            referenceId: `vn_ban_${vn.apiOrderId}`,
            status: "completed",
          });
        }
        return { success: true };
      }),

    /** Get SMS messages for a local virtual number record */
    getSms: protectedProcedure
      .input(z.object({ numberId: z.number() }))
      .query(async ({ input, ctx }) => {
        const nums = await getVirtualNumbers(ctx.user.id);
        const num = nums.find((n) => n.id === input.numberId);
        if (!num) throw new TRPCError({ code: "FORBIDDEN" });
        return getSmsMessages(input.numberId);
      }),
  }),

  // ── Referrals ─────────────────────────────────────────────────────────────
  referrals: router({
    getMyReferrals: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return {
        referralCode: user?.referralCode ?? "",
        referrals: await getReferralsByReferrer(ctx.user.id),
      };
    }),
    leaderboard: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select({
          referrerId: referrals.referrerId,
          totalReferrals: sql<number>`COUNT(*)`,
          totalEarned: sql<string>`SUM(CAST(${referrals.rewardAmount} AS DECIMAL(10,2)))`,
        })
        .from(referrals)
        .where(eq(referrals.status, "credited"))
        .groupBy(referrals.referrerId)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10);
      // Attach user names
      const enriched = await Promise.all(
        rows.map(async (r) => {
          const u = await getUserById(r.referrerId);
          return {
            rank: 0,
            name: u?.name ?? "Anonymous",
            totalReferrals: Number(r.totalReferrals),
            totalEarned: parseFloat(r.totalEarned ?? "0"),
          };
        })
      );
      return enriched.map((e, i) => ({ ...e, rank: i + 1 }));
    }),
  }),

  // ── Coupons ───────────────────────────────────────────────────────────────
  coupons: router({
    validate: protectedProcedure
      .input(z.object({ code: z.string(), orderAmount: z.number() }))
      .query(async ({ input }) => {
        const coupon = await getCouponByCode(input.code);
        if (!coupon || !coupon.isActive || coupon.usedCount >= coupon.usageLimit) {
          return { valid: false, message: "Invalid or expired coupon" };
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return { valid: false, message: "Coupon has expired" };
        }
        const minOrder = parseFloat(coupon.minOrderAmount ?? "0");
        if (input.orderAmount < minOrder) {
          return { valid: false, message: `Minimum order amount is $${minOrder}` };
        }
        let discount = 0;
        if (coupon.discountType === "percentage") {
          discount = (input.orderAmount * parseFloat(coupon.discountValue)) / 100;
        } else {
          discount = parseFloat(coupon.discountValue);
        }
        return {
          valid: true,
          discount,
          discountType: coupon.discountType,
          discountValue: parseFloat(coupon.discountValue),
          message: `Coupon applied! You save $${discount.toFixed(2)}`,
        };
      }),

    // Admin
    list: adminProcedure.query(async () => getAllCoupons()),
    create: adminProcedure
      .input(
        z.object({
          code: z.string().min(3).max(32),
          discountType: z.enum(["percentage", "fixed"]),
          discountValue: z.string(),
          usageLimit: z.number().default(100),
          minOrderAmount: z.string().optional(),
          expiresAt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createCoupon({
          ...input,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
        return { success: true };
      }),
  }),

  // ── Reviews ───────────────────────────────────────────────────────────────
  reviews: router({
    getByProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => getReviewsByProduct(input.productId)),

    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          orderId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createReview({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
  }),

  // ── Support ───────────────────────────────────────────────────────────────
  support: router({
    myTickets: protectedProcedure.query(async ({ ctx }) => getTicketsByUser(ctx.user.id)),

    getTicket: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const ticket = await getTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const messages = await getTicketMessages(input.id);
        return { ticket, messages };
      }),

    createTicket: protectedProcedure
      .input(
        z.object({
          subject: z.string().min(5).max(255),
          category: z.enum(["billing", "technical", "account", "order", "other"]),
          priority: z.enum(["low", "medium", "high", "urgent"]),
          message: z.string().min(10),
          orderId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { message, ...ticketData } = input;
        const result = await createTicket({ ...ticketData, userId: ctx.user.id });
        const db = await getDb();
        if (db) {
          const tickets = await getTicketsByUser(ctx.user.id);
          const latest = tickets[0];
          if (latest) {
            await addTicketMessage({
              ticketId: latest.id,
              userId: ctx.user.id,
              message,
              isStaff: false,
            });
          }
        }
        return { success: true };
      }),

    addMessage: protectedProcedure
      .input(z.object({ ticketId: z.number(), message: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await addTicketMessage({
          ticketId: input.ticketId,
          userId: ctx.user.id,
          message: input.message,
          isStaff: ctx.user.role === "admin",
        });
        return { success: true };
      }),

    /** AI-powered reply suggestion for admins */
    suggestReply: adminProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        const messages = await getTicketMessages(input.ticketId);
        const { invokeLLM } = await import("./_core/llm");
        const convo = messages.slice(-6).map(m => `${m.isStaff ? "Support" : "User"}: ${m.message}`).join("\n");
        const prompt = `You are a helpful support agent for Buznify, a digital marketplace. Write a concise, professional reply to this support ticket.\n\nSubject: ${ticket.subject}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\n\nConversation:\n${convo}\n\nWrite a helpful reply (2-4 sentences, no markdown headers, direct and friendly):`;
        const response = await invokeLLM({ messages: [{ role: "user" as const, content: prompt }] });
        const suggestion = (response as { choices: Array<{ message: { content: string } }> }).choices?.[0]?.message?.content ?? "";
        return { suggestion };
      }),
    // Admin
    allTickets: adminProcedure.query(async () => getAllTickets()),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["open", "in_progress", "resolved", "closed"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateTicketStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    getAll: protectedProcedure.query(async ({ ctx }) => getNotifications(ctx.user.id)),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationRead(input.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    getStats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { users: 0, orders: 0, products: 0, revenue: 0 };
      const [allUsers, allOrders, allProducts] = await Promise.all([
        getAllUsers(1000),
        getAllOrders(1000),
        getProducts({ limit: 1000, status: "active" }),
      ]);
      const revenue = allOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      return {
        users: allUsers.length,
        orders: allOrders.length,
        products: allProducts.length,
        revenue: revenue.toFixed(2),
        recentOrders: allOrders.slice(0, 10),
        recentUsers: allUsers.slice(0, 10),
      };
    }),

    /** Revenue chart: daily revenue + orders for the last N days */
    getRevenueChart: adminProcedure
      .input(z.object({ days: z.number().min(7).max(90).default(30) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const allOrders = await getAllOrders(5000);
        const now = Date.now();
        const msPerDay = 86_400_000;
        const buckets: Record<string, { date: string; revenue: number; orders: number; growth: number }> = {};
        for (let i = input.days - 1; i >= 0; i--) {
          const d = new Date(now - i * msPerDay);
          const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          buckets[key] = { date: key, revenue: 0, orders: 0, growth: 0 };
        }
        for (const order of allOrders) {
          const age = now - new Date(order.createdAt).getTime();
          if (age > input.days * msPerDay) continue;
          const key = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (buckets[key]) {
            buckets[key].orders++;
            if (order.status === "completed") buckets[key].revenue += parseFloat(order.totalAmount);
          }
        }
        // Also include growth orders
        const growthOrders = await getAllGrowthOrders(5000);
        for (const go of growthOrders) {
          const age = now - new Date(go.createdAt).getTime();
          if (age > input.days * msPerDay) continue;
          const key = new Date(go.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (buckets[key]) buckets[key].growth += parseFloat(go.totalAmount);
        }
        return Object.values(buckets).map(b => ({ ...b, revenue: parseFloat(b.revenue.toFixed(2)), growth: parseFloat(b.growth.toFixed(2)) }));
      }),

    /** User growth chart: new signups per day */
    getUserGrowthChart: adminProcedure
      .input(z.object({ days: z.number().min(7).max(90).default(30) }))
      .query(async ({ input }) => {
        const allUsers = await getAllUsers(5000);
        const now = Date.now();
        const msPerDay = 86_400_000;
        const buckets: Record<string, { date: string; users: number }> = {};
        for (let i = input.days - 1; i >= 0; i--) {
          const d = new Date(now - i * msPerDay);
          const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          buckets[key] = { date: key, users: 0 };
        }
        for (const user of allUsers) {
          const age = now - new Date(user.createdAt).getTime();
          if (age > input.days * msPerDay) continue;
          const key = new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (buckets[key]) buckets[key].users++;
        }
        return Object.values(buckets);
      }),

    getUsers: adminProcedure.query(async () => getAllUsers(100)),

    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        await updateUserRole(input.userId, input.role);
        await logSecurityEvent({ userId: input.userId, adminId: ctx.user.id, action: "role_changed", metadata: { newRole: input.role } });
        return { success: true };
      }),

    getProducts: adminProcedure.query(async () => getProducts({ limit: 100, status: undefined })),

    approveProduct: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateProduct(input.id, { status: "active" });
        return { success: true };
      }),

    rejectProduct: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateProduct(input.id, { status: "rejected" });
        return { success: true };
      }),

    getOrders: adminProcedure.query(async () => getAllOrders(100)),

    seedDemo: adminProcedure.mutation(async ({ ctx }) => {
      await seedDemoProducts(ctx.user.id);
      await seedGrowthServices();
      return { success: true };
    }),

    creditUser: adminProcedure
      .input(z.object({ userId: z.number(), amount: z.number().min(0.01) }))
      .mutation(async ({ input }) => {
        const user = await getUserById(input.userId);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const currentBalance = parseFloat(user.balance ?? "0");
        const newBalance = (currentBalance + input.amount).toFixed(2);
        await updateUserBalance(input.userId, newBalance);
        await createWalletTransaction({
          userId: input.userId,
          type: "admin_credit",
          amount: input.amount.toFixed(2),
          balanceBefore: currentBalance.toFixed(2),
          balanceAfter: newBalance,
          description: "Admin credit",
          status: "completed",
        });
         return { success: true };
      }),

    broadcastNotification: adminProcedure
      .input(z.object({ title: z.string().min(1).max(100), message: z.string().min(1).max(500), type: z.enum(["info", "success", "warning"]).default("info") }))
      .mutation(async ({ input }) => {
        const users = await getAllUsers(5000);
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({ title: `[Broadcast] ${input.title}`, content: `${input.message}\n\nSent to ${users.length} users.` });
        return { success: true, sentTo: users.length };
      }),

    getServiceCategories: adminProcedure.query(async () => {
      const categories = [
        { id: "social_media_accounts", label: "Social Media Accounts", enabled: true },
        { id: "streaming_accounts", label: "Streaming Accounts", enabled: true },
        { id: "gaming_accounts", label: "Gaming Accounts", enabled: true },
        { id: "virtual_numbers", label: "Virtual Numbers", enabled: true },
        { id: "growth_services", label: "Growth Services", enabled: true },
      ];
      const db = await getDb();
      if (!db) return categories;
      const rows = await db.select().from(siteSettings).where(sql`${siteSettings.key} LIKE 'category_enabled_%'`);
      return categories.map(cat => {
        const row = rows.find((r: { key: string; value: string }) => r.key === `category_enabled_${cat.id}`);
        return { ...cat, enabled: row ? row.value !== "false" : true };
      });
    }),

    updateServiceCategory: adminProcedure
      .input(z.object({ categoryId: z.string(), enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const key = `category_enabled_${input.categoryId}`;
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
        if (existing.length > 0) {
          await db.update(siteSettings).set({ value: input.enabled ? "true" : "false" }).where(eq(siteSettings.key, key));
        } else {
          await db.insert(siteSettings).values({ key, value: input.enabled ? "true" : "false" });
        }
        return { success: true };
      }),

    /** Admin: paginated security event log */
    getSecurityLogs: adminProcedure
      .input(z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(5).max(100).default(25),
      }))
      .query(async ({ input }) => {
        return getSecurityLogs({
          userId: input.userId,
          action: input.action,
          search: input.search,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),
    getAiAnalyticsSummary: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { summary: "No data available." };
      const [allOrders, allUsers, allProducts] = await Promise.all([
        getAllOrders(1000),
        getAllUsers(1000),
        getProducts({ limit: 1000, status: undefined }),
      ]);
      const revenue = allOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + parseFloat(o.totalAmount ?? "0"), 0);
      const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const newUsers7d = allUsers.filter(u => new Date(u.createdAt).getTime() > last7).length;
      const newOrders7d = allOrders.filter(o => new Date(o.createdAt).getTime() > last7).length;
      const topProduct = allProducts.sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0))[0];
      const { invokeLLM } = await import("./_core/llm");
      const prompt = `You are a business analytics assistant. Summarize this marketplace data in 3-4 concise sentences highlighting key trends, opportunities, and any concerns:\n- Total revenue: $${revenue.toFixed(2)}\n- Total users: ${allUsers.length} (${newUsers7d} new in last 7 days)\n- Total orders: ${allOrders.length} (${newOrders7d} in last 7 days)\n- Active products: ${allProducts.filter(p => p.status === "active").length}\n- Top selling product: ${topProduct?.title ?? "N/A"} (${topProduct?.totalSold ?? 0} sold)`;
      const response = await invokeLLM({ messages: [{ role: "user" as const, content: prompt }] });
      const summary = (response as any).choices?.[0]?.message?.content ?? "Unable to generate summary.";
      return { summary, stats: { revenue: revenue.toFixed(2), users: allUsers.length, newUsers7d, orders: allOrders.length, newOrders7d } };
    }),

    // ── Category Management ───────────────────────────────────────────────
    listCategories: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const cats = await db.select().from(productCategories).orderBy(productCategories.sortOrder, productCategories.createdAt);
      // Return tree: parents with children nested
      const parents = cats.filter((c: any) => c.parentId === null || c.parentId === undefined);
      return parents.map((p: any) => ({
        ...p,
        children: cats.filter((c: any) => c.parentId === p.id),
      }));
    }),

    createCategory: adminProcedure
      .input(z.object({
        slug: z.string().min(2).max(64).regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
        label: z.string().min(2).max(128),
        icon: z.string().max(64).default("Tag"),
        description: z.string().max(255).optional(),
        color: z.string().max(128).default("from-violet-500/20 to-purple-500/20"),
        borderColor: z.string().max(128).default("border-violet-500/20 hover:border-violet-500/40"),
        iconColor: z.string().max(64).default("text-violet-400"),
        sortOrder: z.number().int().default(0),
        parentId: z.number().int().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Check slug uniqueness
        const existing = await db.select({ id: productCategories.id }).from(productCategories).where(eq(productCategories.slug, input.slug));
        if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "A category with this slug already exists." });
        await db.insert(productCategories).values({
          slug: input.slug,
          label: input.label,
          icon: input.icon,
          description: input.description,
          color: input.color,
          borderColor: input.borderColor,
          iconColor: input.iconColor,
          sortOrder: input.sortOrder,
          parentId: input.parentId ?? null,
          enabled: true,
        });
        return { success: true };
      }),

    updateCategory: adminProcedure
      .input(z.object({
        id: z.number().int(),
        label: z.string().min(2).max(128).optional(),
        icon: z.string().max(64).optional(),
        description: z.string().max(255).optional(),
        color: z.string().max(128).optional(),
        borderColor: z.string().max(128).optional(),
        iconColor: z.string().max(64).optional(),
        sortOrder: z.number().int().optional(),
        parentId: z.number().int().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...fields } = input;
        const updates: Record<string, unknown> = {};
        if (fields.label !== undefined) updates.label = fields.label;
        if (fields.icon !== undefined) updates.icon = fields.icon;
        if (fields.description !== undefined) updates.description = fields.description;
        if (fields.color !== undefined) updates.color = fields.color;
        if (fields.borderColor !== undefined) updates.borderColor = fields.borderColor;
        if (fields.iconColor !== undefined) updates.iconColor = fields.iconColor;
        if (fields.sortOrder !== undefined) updates.sortOrder = fields.sortOrder;
        if (fields.parentId !== undefined) updates.parentId = fields.parentId;
        if (Object.keys(updates).length === 0) return { success: true };
        await db.update(productCategories).set(updates).where(eq(productCategories.id, id));
        return { success: true };
      }),

    toggleCategory: adminProcedure
      .input(z.object({ id: z.number().int(), enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(productCategories).set({ enabled: input.enabled }).where(eq(productCategories.id, input.id));
        return { success: true };
      }),

    deleteCategory: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(productCategories).where(eq(productCategories.id, input.id));
        return { success: true };
      }),

    seedDefaultCategories: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const defaults = [
        { slug: "social_media_accounts", label: "Social Media Accounts", icon: "Instagram", color: "from-pink-500/20 to-purple-500/20", borderColor: "border-pink-500/20 hover:border-pink-500/40", iconColor: "text-pink-400", sortOrder: 1 },
        { slug: "streaming_accounts", label: "Streaming Accounts", icon: "Tv", color: "from-red-500/20 to-orange-500/20", borderColor: "border-red-500/20 hover:border-red-500/40", iconColor: "text-red-400", sortOrder: 2 },
        { slug: "gaming_accounts", label: "Gaming Accounts", icon: "Gamepad2", color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/20 hover:border-blue-500/40", iconColor: "text-blue-400", sortOrder: 3 },
        { slug: "gaming_currency", label: "Gaming Currency", icon: "Coins", color: "from-yellow-500/20 to-amber-500/20", borderColor: "border-yellow-500/20 hover:border-yellow-500/40", iconColor: "text-yellow-400", sortOrder: 4 },
        { slug: "ai_tools", label: "AI Tools", icon: "Bot", color: "from-sky-500/20 to-blue-500/20", borderColor: "border-sky-500/20 hover:border-sky-500/40", iconColor: "text-sky-400", sortOrder: 5 },
        { slug: "digital_subscriptions", label: "Digital Subscriptions", icon: "CreditCard", color: "from-indigo-500/20 to-violet-500/20", borderColor: "border-indigo-500/20 hover:border-indigo-500/40", iconColor: "text-indigo-400", sortOrder: 6 },
        { slug: "proxy_networking", label: "Proxy & Networking", icon: "Globe", color: "from-slate-500/20 to-gray-500/20", borderColor: "border-slate-500/20 hover:border-slate-500/40", iconColor: "text-slate-400", sortOrder: 7 },
        { slug: "verification_services", label: "Verification Services", icon: "ShieldCheck", color: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-500/20 hover:border-green-500/40", iconColor: "text-green-400", sortOrder: 8 },
        { slug: "virtual_numbers", label: "Virtual Numbers", icon: "Phone", color: "from-emerald-500/20 to-teal-500/20", borderColor: "border-emerald-500/20 hover:border-emerald-500/40", iconColor: "text-emerald-400", sortOrder: 9 },
        { slug: "growth_services", label: "Growth Services", icon: "TrendingUp", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/20 hover:border-violet-500/40", iconColor: "text-violet-400", sortOrder: 10 },
      ];
      for (const cat of defaults) {
        const existing = await db.select({ id: productCategories.id }).from(productCategories).where(eq(productCategories.slug, cat.slug));
        if (existing.length === 0) {
          await db.insert(productCategories).values({ ...cat, enabled: true });
        }
      }
      return { seeded: defaults.length };
    }),
  }),
  // ── AI Chat ──────────────────────────────────────────────────────────────
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          message: z.string().min(1).max(1000),
          history: z
            .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
            .optional()
            .default([]),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const systemPrompt = `You are Buznify AI, a helpful support assistant for Buznify — a premium digital marketplace platform where users can buy social media accounts, streaming accounts, gaming accounts, virtual numbers, and social media growth services.

Key facts about Buznify:
- Instant automated delivery for all digital products
- Wallet-based payment system (users deposit funds, then spend)
- Referral program: earn 5% commission on referrals
- Loyalty points system: earn points on every purchase
- Support tickets for complex issues
- Vendor system: approved vendors can list products
- Virtual numbers: temporary numbers for SMS verification, auto-refresh
- Growth services: followers, subscribers, views, likes for major platforms

Be concise, friendly, and helpful. If you cannot answer something, direct the user to open a support ticket at /support. Never make up specific pricing — tell users to check the marketplace.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...input.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const reply = (response as { choices: Array<{ message: { content: string } }> }).choices?.[0]?.message?.content ?? "I'm sorry, I couldn't process your request. Please try again or open a support ticket.";
        return { reply };
      }),

    generateDescription: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(200),
          category: z.string(),
          platform: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const prompt = `Write a compelling product description for a digital marketplace listing.
Product title: "${input.title}"
Category: ${input.category.replace(/_/g, " ")}
${input.platform ? `Platform: ${input.platform}` : ""}

Write 2-3 sentences that are persuasive, highlight key benefits, mention instant delivery, and build trust. Keep it under 100 words. Do not use bullet points. Do not include pricing.`;
        const response = await invokeLLM({
          messages: [
            { role: "system" as const, content: "You are a professional copywriter for a digital products marketplace. Write compelling, concise product descriptions." },
            { role: "user" as const, content: prompt },
          ],
        });
        const description = (response as { choices: Array<{ message: { content: string } }> }).choices?.[0]?.message?.content?.trim() ?? "";
        return { description };
      }),
  }),
  // ── Wishlist ──────────────────────────────────────────────────────────────
  wishlist: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await getWishlist(ctx.user.id);
      // Enrich with product data
      const enriched = await Promise.all(items.map(async (item) => {
        const product = await getProductById(item.productId);
        return { ...item, product };
      }));
      return enriched.filter(i => i.product !== undefined);
    }),
    add: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await addToWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeFromWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
  }),

  // ── Recently Viewed ───────────────────────────────────────────────────────
  recentlyViewed: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await getRecentlyViewed(ctx.user.id, 8);
      const enriched = await Promise.all(items.map(async (item) => {
        const product = await getProductById(item.productId);
        return { ...item, product };
      }));
      return enriched.filter(i => i.product !== undefined);
    }),
    track: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await addRecentlyViewed(ctx.user.id, input.productId);
        return { success: true };
      }),
  }),

  // ── Growth Orders ─────────────────────────────────────────────────────────
  growthOrders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getGrowthOrdersByUser(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        targetUrl: z.string().url(),
        quantity: z.number().min(1),
        dripFeed: z.boolean().optional().default(false),
        dripInterval: z.number().optional(),
        speedLabel: z.enum(["slow", "medium", "fast", "instant"]).optional().default("medium"),
      }))
      .mutation(async ({ ctx, input }) => {
        const services = await getGrowthServices();
        const service = services.find(s => s.id === input.serviceId);
        if (!service) throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
        const pricePerUnit = parseFloat(service.price);
        const totalAmount = (pricePerUnit * input.quantity / service.quantity).toFixed(2);
        const userBalance = parseFloat(ctx.user.balance ?? "0");
        if (userBalance < parseFloat(totalAmount)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient wallet balance" });
        }
        // Deduct balance
        const newBalance = (userBalance - parseFloat(totalAmount)).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "purchase",
          amount: totalAmount,
          balanceBefore: ctx.user.balance ?? "0",
          balanceAfter: newBalance,
          description: `Growth order: ${service.title} x${input.quantity}`,
        });
        const order = await createGrowthOrder({
          userId: ctx.user.id,
          serviceId: input.serviceId,
          targetUrl: input.targetUrl,
          quantity: input.quantity,
          totalAmount,
          status: "processing",
          deliveredCount: 0,
          dripFeed: input.dripFeed,
          dripInterval: input.dripInterval,
          speedLabel: input.speedLabel,
        });
        await createNotification({
          userId: ctx.user.id,
          type: "order_completed",
          title: "Growth Order Placed",
          message: `Your order for ${input.quantity} ${service.serviceType} on ${service.platform} has been placed and is now processing.`,
        });
        return { success: true, order };
      }),
    requestRefill: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await updateGrowthOrderStatus(input.orderId, "processing");
        return { success: true };
      }),
    requestCancel: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(growthOrdersTable).set({ cancelRequested: true }).where(eq(growthOrdersTable.id, input.orderId));
        return { success: true };
      }),
    adminList: adminProcedure.query(async () => {
      return getAllGrowthOrders(200);
    }),
    adminUpdate: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "processing", "completed", "partial", "cancelled", "refunded"]),
        deliveredCount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateGrowthOrderStatus(input.orderId, input.status, input.deliveredCount);
        return { success: true };
      }),
  }),

  // ── Refund Requests ───────────────────────────────────────────────────────
  refunds: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getRefundRequestsByUser(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        orderId: z.number().optional(),
        growthOrderId: z.number().optional(),
        reason: z.string().min(10).max(1000),
        amount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const req = await createRefundRequest({
          userId: ctx.user.id,
          orderId: input.orderId,
          growthOrderId: input.growthOrderId,
          reason: input.reason,
          amount: input.amount,
          status: "pending",
        });
        await createNotification({
          userId: ctx.user.id,
          type: "system",
          title: "Refund Request Submitted",
          message: "Your refund request has been submitted and is under review. We will respond within 24 hours.",
        });
        return { success: true, req };
      }),
    adminList: adminProcedure.query(async () => {
      return getAllRefundRequests(200);
    }),
    adminProcess: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateRefundStatus(input.id, input.status, input.adminNote);
        if (input.status === "approved") {
          // Credit user wallet
          const allRefunds = await getAllRefundRequests(1000);
          const refund = allRefunds.find(r => r.id === input.id);
          if (refund) {
            const user = await getUserById(refund.userId);
            if (user) {
              const newBal = (parseFloat(user.balance ?? "0") + parseFloat(refund.amount)).toFixed(2);
              await updateUserBalance(refund.userId, newBal);
              await createWalletTransaction({
                userId: refund.userId,
                type: "refund",
                amount: refund.amount,
                balanceBefore: user.balance ?? "0",
                balanceAfter: newBal,
                description: `Refund approved for request #${refund.id}`,
              });
              await createNotification({
                userId: refund.userId,
                type: "wallet_credit",
                title: "Refund Approved",
                message: `Your refund of $${refund.amount} has been approved and credited to your wallet.`,
              });
            }
          }
        }
        return { success: true };
      }),
  }),

  // ── Payments (Paystack) ──────────────────────────────────────────────────
  payment: router({
    /**
     * Initialize a Paystack transaction for wallet top-up.
     * Returns the access_code needed by the Paystack Popup JS.
     */
    initiate: protectedProcedure
      .input(
        z.object({
          amountNaira: z.number().min(100, "Minimum deposit is ₦100").max(1_000_000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        if (!user.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Please update your email before making a deposit" });

        const reference = generateReference(ctx.user.id);

        // Persist pending payment record
        await createPayment({
          userId: ctx.user.id,
          reference,
          amountNaira: input.amountNaira.toFixed(2),
          currency: "NGN",
          status: "pending",
          metadata: JSON.stringify({ userId: ctx.user.id }),
        });

        const data = await paystackInit({
          email: user.email,
          amountNaira: input.amountNaira,
          reference,
          metadata: { userId: ctx.user.id, userName: user.name },
        });

        // Store access_code for popup
        await updatePayment(reference, { accessCode: data.access_code });

        return {
          reference,
          accessCode: data.access_code,
          authorizationUrl: data.authorization_url,
        };
      }),

    /**
     * Verify a completed Paystack transaction and credit the user's wallet.
     * Safe to call multiple times — idempotent via reference check.
     */
    verify: protectedProcedure
      .input(z.object({ reference: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const payment = await getPaymentByReference(input.reference);
        if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
        if (payment.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        // Already processed — return cached result
        if (payment.status === "success") {
          return { success: true, alreadyCredited: true, amountNaira: parseFloat(payment.amountNaira) };
        }

        const data = await paystackVerify(input.reference);

        if (data.status !== "success") {
          await updatePayment(input.reference, { status: data.status as any, gatewayResponse: data.gateway_response });
          throw new TRPCError({ code: "BAD_REQUEST", message: `Payment ${data.status}: ${data.gateway_response}` });
        }

        // Verify amount matches
        const paidNaira = data.amount / 100; // Paystack returns kobo
        const expectedNaira = parseFloat(payment.amountNaira);
        if (Math.abs(paidNaira - expectedNaira) > 1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Amount mismatch — please contact support" });
        }

        // Credit wallet (convert NGN to USD at ~1 NGN = 0.00065 USD)
        const NGN_TO_USD = 0.00065;
        const amountUsd = paidNaira * NGN_TO_USD;

        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balanceBefore = parseFloat(user.balance ?? "0");
        const balanceAfter = balanceBefore + amountUsd;

        await updateUserBalance(ctx.user.id, balanceAfter.toFixed(6));

        await createWalletTransaction({
          userId: ctx.user.id,
          type: "deposit",
          amount: amountUsd.toFixed(6),
          balanceBefore: balanceBefore.toFixed(6),
          balanceAfter: balanceAfter.toFixed(6),
          description: `Paystack deposit ₦${paidNaira.toFixed(0)} via ${data.channel}`,
          referenceId: input.reference,
          status: "completed",
        });

        await updatePayment(input.reference, {
          status: "success",
          amountUsd: amountUsd.toFixed(6),
          channel: data.channel,
          paystackId: String(data.id),
          gatewayResponse: data.gateway_response,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        });

        return { success: true, alreadyCredited: false, amountNaira: paidNaira, amountUsd };
      }),

    /** Get the current user's payment history */
    history: protectedProcedure.query(async ({ ctx }) => {
      return getPaymentsByUser(ctx.user.id);
    }),

    /** Admin: get all payments */
    adminAll: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getAllPayments(input.limit, input.offset);
      }),

    /** Admin: get Paystack account balance */
    adminBalance: adminProcedure.query(async () => {
      return getPaystackBalance();
    }),
  }),

  // ── API Keys (any authenticated user) ────────────────────────────────────
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getVendorApiKeys(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({ label: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const { nanoid } = await import("nanoid");
        const rawKey = `buz_${nanoid(32)}`;
        const keyHash = Buffer.from(rawKey).toString("base64");
        await createVendorApiKey({
          vendorId: ctx.user.id,
          keyHash,
          label: input.label,
          isActive: true,
        });
        return { success: true, key: rawKey };
      }),
    revoke: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await revokeVendorApiKey(input.id);
        return { success: true };
      }),
  }),
  // ── Payouts (any authenticated user) ─────────────────────────────────────
  payouts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getVendorPayouts(ctx.user.id);
    }),
    request: protectedProcedure
      .input(z.object({
        amount: z.string(),
        method: z.string(),
        destination: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balance = parseFloat(user.balance ?? "0");
        const amount = parseFloat(input.amount);
        if (amount <= 0 || amount > balance) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }
        await createVendorPayout({
          vendorId: ctx.user.id,
          amount: input.amount,
          method: input.method as any,
          destination: input.destination,
          status: "pending",
        });
        const newBal = (balance - amount).toFixed(6);
        await updateUserBalance(ctx.user.id, newBal);
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "withdrawal",
          amount: input.amount,
          balanceBefore: balance.toFixed(6),
          balanceAfter: newBal,
          description: `Payout request via ${input.method}`,
          status: "pending",
        });
        return { success: true };
      }),
    adminList: adminProcedure.query(async () => {
      return getAllVendorPayouts(200);
    }),
    adminProcess: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["processing", "paid", "rejected"]), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await updatePayoutStatus(input.id, input.status, input.notes);
        return { success: true };
      }),
  }),
  // ── Profile ────────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        balance: parseFloat(user.balance ?? "0"),
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
        referralCode: user.referralCode,
      };
    }),
    updateName: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(64) }))
      .mutation(async ({ input, ctx }) => {
        await updateUserProfile(ctx.user.id, { name: input.name });
        return { success: true };
      }),
    updateAvatar: protectedProcedure
      .input(z.object({ avatarUrl: z.string().url() }))
      .mutation(async ({ input, ctx }) => {
        await updateUserProfile(ctx.user.id, { avatarUrl: input.avatarUrl });
        return { success: true };
      }),
    purchaseHistory: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ input, ctx }) => {
        const userOrders = await getOrdersByUser(ctx.user.id);
        return userOrders.slice(0, input?.limit ?? 50);
      }),
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1, "Current password is required"),
          newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
          confirmPassword: z.string().min(1, "Please confirm your new password"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.newPassword !== input.confirmPassword) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
        }
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        // If the user signed up via OAuth (no password), skip current password check
        if (user.passwordHash) {
          const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
          if (!valid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
          }
          // Prevent reusing the same password
          const same = await bcrypt.compare(input.newPassword, user.passwordHash);
          if (same) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "New password must be different from the current password" });
          }
        }
        const newHash = await bcrypt.hash(input.newPassword, 12);
        await updateUserProfile(ctx.user.id, { passwordHash: newHash });
        return { success: true };
      }),
    getOrderReceipt: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        // Ensure the order belongs to the requesting user
        if (order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        const product = await getProductById(order.productId);
        const user = await getUserById(ctx.user.id);
        return {
          orderId: order.id,
          orderDate: order.createdAt,
          deliveredAt: order.deliveredAt,
          status: order.status,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount ?? "0.00",
          notes: order.notes,
          product: product
            ? {
                id: product.id,
                title: product.title,
                category: product.category,
                platform: product.platform,
              }
            : null,
          buyer: {
            name: user?.name ?? "Customer",
            email: user?.email ?? "",
          },
        };
      }),
  }),
  // ── Scheduled endpoint ────────────────────────────────────────────────────
  scheduled: router({
    updateContent: publicProcedure
      .input(z.object({ type: z.string(), data: z.any() }))
      .mutation(async ({ input }) => {
        // Placeholder for scheduled task integration
        return { success: true, type: input.type };
      }),
  }),
});

export type AppRouter = typeof appRouter;
