import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createContext } from "../../server/_core/context";
import { appRouter } from "../../server/routers";

// Create a minimal Express app to reuse the tRPC Express middleware
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/api/trpc", trpcMiddleware);

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Rewrite the URL so Express sees /api/trpc/...
  req.url = `/api/trpc${req.url}`;
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
