import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { registerStorageProxy } from "../../server/_core/storageProxy";

let app: express.Express | null = null;

function getApp() {
  if (app) return app;
  app = express();
  registerStorageProxy(app);
  return app;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = getApp();
  // Map /api/storage/some/path → /manus-storage/some/path
  const pathSegments = (req.query.path as string[] | undefined) ?? [];
  req.url = `/manus-storage/${pathSegments.join("/")}`;
  return new Promise<void>((resolve, reject) => {
    expressApp(req as any, res as any, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
