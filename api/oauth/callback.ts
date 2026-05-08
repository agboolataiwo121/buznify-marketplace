import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { registerOAuthRoutes } from "../../server/_core/oauth";

let app: express.Express | null = null;

function getApp() {
  if (app) return app;
  app = express();
  app.use(express.json({ limit: "10mb" }));
  registerOAuthRoutes(app);
  return app;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = getApp();
  // Ensure the URL matches what registerOAuthRoutes expects: /api/oauth/callback
  req.url = "/api/oauth/callback";
  return new Promise<void>((resolve, reject) => {
    expressApp(req as any, res as any, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
