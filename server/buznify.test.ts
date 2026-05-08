import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn().mockResolvedValue({ id: 1, referralCode: "TEST123" }),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  updateUserBalance: vi.fn().mockResolvedValue(undefined),
  getProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(null),
  createProduct: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue({ insertId: 1 }),
  getOrderById: vi.fn().mockResolvedValue(null),
  getOrdersByUser: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  createWalletTransaction: vi.fn().mockResolvedValue(undefined),
  getWalletTransactions: vi.fn().mockResolvedValue([]),
  getNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getTicketsByUser: vi.fn().mockResolvedValue([]),
  getTicketById: vi.fn().mockResolvedValue(null),
  getTicketMessages: vi.fn().mockResolvedValue([]),
  createTicket: vi.fn().mockResolvedValue({ insertId: 1 }),
  addTicketMessage: vi.fn().mockResolvedValue(undefined),
  updateTicketStatus: vi.fn().mockResolvedValue(undefined),
  getAllTickets: vi.fn().mockResolvedValue([]),
  getVirtualNumbers: vi.fn().mockResolvedValue([]),
  createVirtualNumber: vi.fn().mockResolvedValue({ insertId: 1 }),
  getSmsMessages: vi.fn().mockResolvedValue([]),
  addSmsMessage: vi.fn().mockResolvedValue(undefined),
  getReferralsByReferrer: vi.fn().mockResolvedValue([]),
  createReferral: vi.fn().mockResolvedValue(undefined),
  getCouponByCode: vi.fn().mockResolvedValue(null),
  getAllCoupons: vi.fn().mockResolvedValue([]),
  createCoupon: vi.fn().mockResolvedValue(undefined),
  incrementCouponUsage: vi.fn().mockResolvedValue(undefined),
  getReviewsByProduct: vi.fn().mockResolvedValue([]),
  createReview: vi.fn().mockResolvedValue(undefined),
  getGrowthServices: vi.fn().mockResolvedValue([]),
  seedGrowthServices: vi.fn().mockResolvedValue(undefined),
  seedDemoProducts: vi.fn().mockResolvedValue(undefined),
  createNotification: vi.fn().mockResolvedValue(undefined),
  getPlatformStats: vi.fn().mockResolvedValue({ users: 0, orders: 0, products: 0, revenue: "0.00", recentOrders: [] }),
  approveProduct: vi.fn().mockResolvedValue(undefined),
  rejectProduct: vi.fn().mockResolvedValue(undefined),
}));

// ── Context helpers ───────────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({ role: "admin", openId: "admin-user" });
}

// ── Auth tests ────────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns current user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.email).toBe("test@example.com");
  });

  it("logout clears cookie and returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

// ── Wallet tests ──────────────────────────────────────────────────────────────
describe("wallet", () => {
  it("getBalance returns balance object", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.wallet.getBalance();
    expect(result).toHaveProperty("balance");
    expect(typeof result.balance).toBe("number");
  });

  it("getTransactions returns array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.wallet.getTransactions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deposit with valid amount returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.wallet.deposit({ amount: 10 });
    expect(result.success).toBe(true);
    expect(result.newBalance).toBeDefined();
  });

  it("deposit with negative amount throws", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.wallet.deposit({ amount: -5 })).rejects.toThrow();
  });
});

// ── Products tests ────────────────────────────────────────────────────────────
describe("products", () => {
  it("list returns array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("getById throws NOT_FOUND for non-existent product", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.products.getById({ id: 9999 })).rejects.toThrow("NOT_FOUND");
  });
});

// ── Orders tests ──────────────────────────────────────────────────────────────
describe("orders", () => {
  it("myOrders returns array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Notifications tests ───────────────────────────────────────────────────────
describe("notifications", () => {
  it("getAll returns array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.getAll();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Support tests ─────────────────────────────────────────────────────────────
describe("support", () => {
  it("myTickets returns array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.support.myTickets();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getTicket throws NOT_FOUND for non-existent ticket", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.support.getTicket({ id: 9999 })).rejects.toThrow("NOT_FOUND");
  });
});

// ── Coupons tests ─────────────────────────────────────────────────────────────
describe("coupons", () => {
  it("validate returns invalid for non-existent coupon", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.coupons.validate({ code: "INVALID_CODE", orderAmount: 10 });
    expect(result.valid).toBe(false);
  });
});

// ── Virtual numbers tests ─────────────────────────────────────────────────────
describe("virtualNumbers", () => {
  it("myNumbers returns array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.virtualNumbers.myNumbers();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── Referrals tests ───────────────────────────────────────────────────────────
describe("referrals", () => {
  it("getMyReferrals returns referral code and array", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referrals.getMyReferrals();
    expect(result).toHaveProperty("referralCode");
    expect(Array.isArray(result.referrals)).toBe(true);
  });
});

// ── Admin tests ───────────────────────────────────────────────────────────────
describe("admin", () => {
  it("getStats requires admin role", async () => {
    const ctx = makeCtx(); // user role
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getStats()).rejects.toThrow();
  });

  it("getStats succeeds for admin", async () => {
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getStats();
    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("orders");
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("revenue");
  });

  it("getUsers requires admin role", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getUsers()).rejects.toThrow();
  });
});
