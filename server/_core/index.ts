import "dotenv/config";
import express from "express";
import multer from "multer";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { validateWebhookSignature } from "../paystack";
import { ngnToUsd } from "../currency";
import rateLimit from "express-rate-limit";
import {
  getPaymentByReference,
  updatePayment,
  getUserById,
  updateUserBalance,
  createWalletTransaction,
  updateUserProfile,
  setFraudFlag,
  getWithdrawalByReference,
  updateWithdrawalStatus,
} from "../db";
import { checkDepositVelocity, logSecurityEvent } from "../security";
import { storagePut } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1); // trust first proxy (required for rate-limit behind reverse proxy)
  const server = createServer(app);

  // ── Paystack Webhook ──────────────────────────────────────────────────────
  // MUST be registered BEFORE express.json() so we can access the raw body
  app.post(
    "/api/webhooks/paystack",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const sig = req.headers["x-paystack-signature"] as string;
        const rawBody = (req.body as Buffer).toString("utf8");

        if (!validateWebhookSignature(rawBody, sig)) {
          res.status(401).json({ error: "Invalid signature" });
          return;
        }

        const event = JSON.parse(rawBody) as {
          event: string;
          data: {
            reference: string;
            amount: number;
            channel: string;
            id: number;
            gateway_response: string;
            paid_at: string | null;
          };
        };

        if (event.event === "charge.success") {
          const data = event.data;
          const reference = data.reference;
          const payment = await getPaymentByReference(reference);

          if (payment && payment.status !== "success") {
            const paidNaira = data.amount / 100;
            const amountUsd = await ngnToUsd(paidNaira);

            const user = await getUserById(payment.userId);
            if (user) {
              // Anti-fraud: velocity check — flag if >3 deposits in 5 minutes
              const velocityExceeded = checkDepositVelocity(`user_${payment.userId}`);
              if (velocityExceeded) {
                await setFraudFlag(payment.userId, true);
                await logSecurityEvent({
                  userId: payment.userId,
                  action: "suspicious_deposit",
                  metadata: { reference, amountUsd, channel: data.channel },
                });
                console.warn(`[Fraud] User ${payment.userId} flagged for rapid deposits`);
              }
              const balanceBefore = parseFloat(user.balance ?? "0");
              const balanceAfter = balanceBefore + amountUsd;
              await updateUserBalance(payment.userId, balanceAfter.toFixed(6));
              await logSecurityEvent({
                userId: payment.userId,
                action: "admin_action",
                metadata: { type: "deposit_credited", reference, amountUsd, channel: data.channel },
              });
              await createWalletTransaction({
                userId: payment.userId,
                type: "deposit",
                amount: amountUsd.toFixed(6),
                balanceBefore: balanceBefore.toFixed(6),
                balanceAfter: balanceAfter.toFixed(6),
                description: `Paystack deposit ₦${paidNaira.toFixed(0)} via ${data.channel}`,
                referenceId: reference,
                status: "completed",
              });
            }

            await updatePayment(reference, {
              status: "success",
              amountUsd: amountUsd.toFixed(6),
              channel: data.channel,
              paystackId: String(data.id),
              gatewayResponse: data.gateway_response,
              paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
            });
          }
        }

        res.json({ received: true });
      } catch (err) {
        console.error("[Paystack Webhook] Error:", err);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  );

  // ── Stripe Webhook ───────────────────────────────────────────────────────
  // MUST be registered BEFORE express.json() so raw body is available for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const sig = req.headers["stripe-signature"] as string;
        const rawBody = req.body as Buffer;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

        let event: import("stripe").Stripe.Event;
        try {
          const { getStripe } = await import("../stripe");
          event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
          console.error("[Stripe Webhook] Signature verification failed:", err);
          res.status(400).json({ error: "Webhook signature verification failed" });
          return;
        }

        // Handle test events
        if (event.id.startsWith("evt_test_")) {
          console.log("[Stripe Webhook] Test event detected");
          res.json({ verified: true });
          return;
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as import("stripe").Stripe.Checkout.Session;
          const reference = session.metadata?.reference;
          if (!reference) {
            res.json({ received: true });
            return;
          }
          const payment = await getPaymentByReference(reference);
          if (payment && payment.status !== "success") {
            const amountUsd = (session.amount_total ?? 0) / 100;
            const user = await getUserById(payment.userId);
            if (user) {
              const { checkDepositVelocity: checkVelocity, logSecurityEvent: logEvent } = await import("../security");
              const velocityExceeded = checkVelocity(`user_${payment.userId}`);
              if (velocityExceeded) {
                const { setFraudFlag } = await import("../db");
                await setFraudFlag(payment.userId, true);
                await logEvent({ userId: payment.userId, action: "suspicious_deposit", metadata: { reference, amountUsd, channel: "stripe" } });
              }
              const balanceBefore = parseFloat(user.balance ?? "0");
              const balanceAfter = balanceBefore + amountUsd;
              await updateUserBalance(payment.userId, balanceAfter.toFixed(6));
              await createWalletTransaction({
                userId: payment.userId,
                type: "deposit",
                amount: amountUsd.toFixed(6),
                balanceBefore: balanceBefore.toFixed(6),
                balanceAfter: balanceAfter.toFixed(6),
                description: `Stripe deposit $${amountUsd.toFixed(2)} via card`,
                referenceId: reference,
                status: "completed",
              });
              // In-app notification
              const { createNotification } = await import("../db");
              await createNotification({
                userId: payment.userId,
                type: "wallet_credit",
                title: "Wallet Funded",
                message: `$${amountUsd.toFixed(2)} has been added to your wallet via Stripe.`,
                referenceId: reference,
              });
            }
            await updatePayment(reference, {
              status: "success",
              amountUsd: amountUsd.toFixed(6),
              channel: "card",
              paystackId: session.id,
              gatewayResponse: "paid",
              paidAt: new Date(),
            });
          }
        }

        res.json({ received: true });
      } catch (err) {
        console.error("[Stripe Webhook] Error:", err);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  // General API: 200 requests per minute per IP
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
  });
  // Auth endpoints: 10 attempts per 15 minutes per IP
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth attempts, please try again later." },
  });
  // Payment endpoints: 20 per 10 minutes per IP
  const paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment requests, please slow down." },
  });
  app.use("/api/trpc", apiLimiter);
  app.use("/api/oauth", authLimiter);
  app.use("/api/trpc/payment", paymentLimiter);

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
  app.post("/api/upload/avatar", upload.single("avatar"), async (req, res) => {
    try {
      const { sdk } = await import("./sdk");
      const { COOKIE_NAME } = await import("@shared/const");
      const token = req.cookies?.[COOKIE_NAME];
      if (!token) { res.status(401).json({ error: "Unauthorized" }); return; }
      const session = await sdk.verifySession(token);
      if (!session) { res.status(401).json({ error: "Unauthorized" }); return; }
      // Look up by openId
      const { getDb } = await import("../db");
      const { users: usersTable } = await import("../../drizzle/schema");
      const { eq: eqOp } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) { res.status(500).json({ error: "DB unavailable" }); return; }
      const rows = await db.select().from(usersTable).where(eqOp(usersTable.openId, session.openId)).limit(1);
      const dbUser2 = rows[0];
      if (!dbUser2) { res.status(401).json({ error: "User not found" }); return; }
      if (!req.file) { res.status(400).json({ error: "No file provided" }); return; }
      const ext = req.file.mimetype.split("/")[1] ?? "jpg";
      const key = `avatars/user-${dbUser2.id}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      await updateUserProfile(dbUser2.id, { avatarUrl: url });
      res.json({ success: true, avatarUrl: url });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
