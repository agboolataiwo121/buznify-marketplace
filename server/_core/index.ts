import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { validateWebhookSignature } from "../paystack";
import {
  getPaymentByReference,
  updatePayment,
  getUserById,
  updateUserBalance,
  createWalletTransaction,
} from "../db";

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
            const NGN_TO_USD = 0.00065;
            const amountUsd = paidNaira * NGN_TO_USD;

            const user = await getUserById(payment.userId);
            if (user) {
              const balanceBefore = parseFloat(user.balance ?? "0");
              const balanceAfter = balanceBefore + amountUsd;
              await updateUserBalance(payment.userId, balanceAfter.toFixed(6));
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

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

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
