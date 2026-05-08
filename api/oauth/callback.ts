import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { registerOAuthRoutes } from "../../server/_core/oauth";

const app = express();
app.use(express.json({ limit: "10mb" }));
registerOAuthRoutes(app);

export default function handler(req: VercelRequest, res: VercelResponse) {
  req.url = `/api/oauth/callback${req.url === "/" ? "" : req.url}`;
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
