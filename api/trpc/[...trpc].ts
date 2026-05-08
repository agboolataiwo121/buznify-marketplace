import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createContext } from "../../server/_core/context";
import { appRouter } from "../../server/routers";

// Singleton Express app — reused across warm invocations for performance
let app: express.Express | null = null;

function getApp() {
  if (app) return app;

  app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext,
  });

  // Mount at /api/trpc so the path matching works correctly
  app.use("/api/trpc", trpcMiddleware);

  return app;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = getApp();

  // Vercel passes the path after /api/trpc/[...trpc] as req.url
  // We need to reconstruct the full /api/trpc/... path for Express
  const originalUrl = req.url ?? "/";
  // If the URL already starts with /api/trpc, keep it; otherwise prepend
  if (!originalUrl.startsWith("/api/trpc")) {
    req.url = `/api/trpc${originalUrl.startsWith("/") ? originalUrl : `/${originalUrl}`}`;
  }

  return new Promise<void>((resolve, reject) => {
    expressApp(req as any, res as any, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
