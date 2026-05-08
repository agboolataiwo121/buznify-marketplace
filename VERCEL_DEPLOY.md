# Buznify — Vercel Deployment Guide

This guide walks you through deploying Buznify to Vercel from your GitHub repository.

---

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- A MySQL-compatible database accessible from the internet:
  - **Recommended:** [PlanetScale](https://planetscale.com) (free tier, serverless-friendly)
  - **Alternative:** [TiDB Cloud](https://tidbcloud.com) or [Railway MySQL](https://railway.app)

---

## Step 1 — Import the GitHub Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `buznify-marketplace` from your GitHub account
4. Click **Import**

---

## Step 2 — Configure Build Settings

In the Vercel project settings, set:

| Setting | Value |
|---|---|
| **Framework Preset** | Other |
| **Build Command** | `pnpm run build:vercel` |
| **Output Directory** | `dist/public` |
| **Install Command** | `pnpm install` |

> These are already set in `vercel.json` — Vercel should pick them up automatically.

---

## Step 3 — Add Environment Variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string (see format below) |
| `JWT_SECRET` | Random 64-char secret for session cookies |
| `VITE_APP_ID` | Your Manus OAuth App ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `OWNER_OPEN_ID` | Your Manus user OpenID |
| `OWNER_NAME` | Your name |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API URL |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API key (server-side) |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus API key (frontend) |
| `VITE_FRONTEND_FORGE_API_URL` | Manus API URL (frontend) |

### DATABASE_URL format (PlanetScale example):
```
mysql://USERNAME:PASSWORD@HOST/DATABASE?ssl={"rejectUnauthorized":true}
```

### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 4 — Run Database Migrations

After your first deployment, run migrations against your production database:

```bash
# Locally, with your production DATABASE_URL set:
DATABASE_URL="your-production-db-url" pnpm db:push
```

---

## Step 5 — Deploy

Click **Deploy** in Vercel. The build will:
1. Run `pnpm install`
2. Run `pnpm run build:vercel` (Vite builds the React frontend to `dist/public`)
3. Vercel automatically bundles the `api/` serverless functions

Your app will be live at `https://buznify-marketplace.vercel.app` (or your custom domain).

---

## Architecture on Vercel

```
Vercel Edge
├── dist/public/          ← Vite-built React SPA (static files)
├── api/trpc/[...trpc].ts ← tRPC serverless function (all /api/trpc/* requests)
├── api/oauth/callback.ts ← OAuth callback serverless function
└── api/storage/[...path].ts ← Storage proxy serverless function
```

All routing is handled by `vercel.json`.

---

## Troubleshooting

**"Cannot find module" errors in serverless functions**
→ Make sure `pnpm install` ran successfully. Check the Vercel build logs.

**Database connection errors**
→ Ensure your `DATABASE_URL` is set correctly and the database allows connections from Vercel's IP ranges (or use `0.0.0.0/0` for development).

**OAuth redirect errors**
→ Add your Vercel domain to the allowed redirect URLs in your Manus OAuth app settings.

**Cold start latency**
→ This is normal for serverless functions on the free tier. Upgrade to Vercel Pro for always-on functions.
