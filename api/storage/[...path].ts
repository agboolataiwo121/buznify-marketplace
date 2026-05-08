import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { registerStorageProxy } from "../../server/_core/storageProxy";

const app = express();
registerStorageProxy(app);

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Map /api/storage/... to /manus-storage/...
  const pathSegment = (req.query.path as string[] | undefined)?.join("/") ?? "";
  req.url = `/manus-storage/${pathSegment}`;
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
