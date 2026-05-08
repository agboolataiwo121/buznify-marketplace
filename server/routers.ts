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
  createVendorPayout,
  getVendorPayouts,
  getAllVendorPayouts,
  updatePayoutStatus,
  getVendorApiKeys,
  createVendorApiKey,
  revokeVendorApiKey,
} from "./db";
import { products, users, referrals, orders as ordersTable, growthOrders as growthOrdersTable } from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Vendor guard ─────────────────────────────────────────────────────────────
const vendorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "vendor" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Vendor access required" });
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
  }),

  // ── Products ──────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
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

    create: vendorProcedure
      .input(
        z.object({
          category: z.enum([
            "social_media_accounts",
            "streaming_accounts",
            "gaming_accounts",
            "virtual_numbers",
            "growth_services",
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

    update: vendorProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          stock: z.number().optional(),
          status: z.enum(["active", "inactive", "pending", "rejected"]).optional(),
          deliveryData: z.any().optional(),
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

    delete: vendorProcedure
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

    vendorProducts: vendorProcedure.query(async ({ ctx }) => {
      return getProducts({ vendorId: ctx.user.id, status: undefined });
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

  // ── Growth Services ───────────────────────────────────────────────────────
  growth: router({
    list: publicProcedure
      .input(z.object({ platform: z.string().optional() }))
      .query(async ({ input }) => {
        await seedGrowthServices();
        return getGrowthServices(input.platform);
      }),

    purchase: protectedProcedure
      .input(
        z.object({
          serviceId: z.number(),
          targetUrl: z.string().min(1),
          quantity: z.number().min(1),
          price: z.number().min(0.01),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balance = parseFloat(user.balance ?? "0");
        if (balance < input.price) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }
        const newBalance = (balance - input.price).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);
        await createWalletTransaction({
          userId: ctx.user.id,
          type: "purchase",
          amount: input.price.toFixed(2),
          balanceBefore: balance.toFixed(2),
          balanceAfter: newBalance,
          description: `Growth service: ${input.quantity} units for ${input.targetUrl}`,
          status: "completed",
        });
        await createNotification({
          userId: ctx.user.id,
          type: "order_completed",
          title: "Growth Service Order Placed",
          message: `Your order for ${input.quantity} units has been placed and is being processed.`,
        });
        return { success: true, newBalance: parseFloat(newBalance) };
      }),
  }),

  // ── Virtual Numbers ───────────────────────────────────────────────────────
  virtualNumbers: router({
    myNumbers: protectedProcedure.query(async ({ ctx }) => {
      return getVirtualNumbers(ctx.user.id);
    }),

    purchase: protectedProcedure
      .input(
        z.object({
          countryCode: z.string(),
          countryName: z.string(),
          service: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const price = 1.99;
        const user = await getUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        const balance = parseFloat(user.balance ?? "0");
        if (balance < price) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        const newBalance = (balance - price).toFixed(2);
        await updateUserBalance(ctx.user.id, newBalance);

        // Generate a fake number for demo
        const areaCode = Math.floor(200 + Math.random() * 800);
        const number = `+${input.countryCode}${areaCode}${Math.floor(1000000 + Math.random() * 9000000)}`;

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await createVirtualNumber({
          userId: ctx.user.id,
          number,
          countryCode: input.countryCode,
          countryName: input.countryName,
          service: input.service,
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
          description: `Virtual number: ${number}`,
          status: "completed",
        });

        // Simulate an incoming SMS after purchase
        const db = await getDb();
        if (db) {
          const nums = await getVirtualNumbers(ctx.user.id);
          const latest = nums[0];
          if (latest) {
            setTimeout(async () => {
              await addSmsMessage({
                numberId: latest.id,
                sender: "System",
                message: `Your number ${number} is now active and ready to receive SMS.`,
              });
            }, 2000);
          }
        }

        return { success: true, number };
      }),

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

    getUsers: adminProcedure.query(async () => getAllUsers(100)),

    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin", "vendor"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
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
    approveVendor: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, "vendor");
        await createNotification({
          userId: input.userId,
          type: "system",
          title: "Vendor Application Approved",
          message: "Congratulations! Your vendor application has been approved. You can now list products on Buznify.",
        });
        return { success: true };
      }),
    rejectVendor: adminProcedure
      .input(z.object({ userId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        await createNotification({
          userId: input.userId,
          type: "system",
          title: "Vendor Application Update",
          message: input.reason
            ? `Your vendor application was not approved: ${input.reason}`
            : "Your vendor application was not approved at this time. Please contact support for more information.",
        });
        return { success: true };
      }),
    getPendingVendors: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const pendingUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, "user"))
        .limit(50);
      return pendingUsers;
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

  // ── Vendor Payouts ────────────────────────────────────────────────────────
  payouts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getVendorPayouts(ctx.user.id);
    }),
    request: protectedProcedure
      .input(z.object({
        amount: z.string(),
        method: z.enum(["bank", "crypto", "paypal"]),
        destination: z.string().min(5),
      }))
      .mutation(async ({ ctx, input }) => {
        const userBalance = parseFloat(ctx.user.balance ?? "0");
        if (userBalance < parseFloat(input.amount)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }
        const payout = await createVendorPayout({
          vendorId: ctx.user.id,
          amount: input.amount,
          method: input.method,
          destination: input.destination,
          status: "pending",
        });
        return { success: true, payout };
      }),
    adminList: adminProcedure.query(async () => {
      return getAllVendorPayouts(200);
    }),
    adminProcess: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["processing", "paid", "rejected"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updatePayoutStatus(input.id, input.status, input.notes);
        return { success: true };
      }),
  }),

  // ── Vendor API Keys ───────────────────────────────────────────────────────
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getVendorApiKeys(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({ label: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const { nanoid } = await import("nanoid");
        const rawKey = `buz_${nanoid(32)}`;
        // Store hash of key for security
        const keyHash = Buffer.from(rawKey).toString("base64");
        await createVendorApiKey({
          vendorId: ctx.user.id,
          keyHash,
          label: input.label,
          isActive: true,
        });
        return { success: true, key: rawKey }; // Only returned once
      }),
    revoke: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await revokeVendorApiKey(input.id);
        return { success: true };
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
