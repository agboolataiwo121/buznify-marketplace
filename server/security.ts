/**
 * server/security.ts
 * Centralised security utilities:
 *   - Input sanitisation (HTML/XSS stripping via DOMPurify)
 *   - Cloudflare Turnstile CAPTCHA server-side verification
 *   - Account lockout helpers (failed login tracking)
 *   - AES-256-GCM encryption/decryption for sensitive values (API keys)
 *   - Security event logging helpers
 */

import DOMPurify from "isomorphic-dompurify";
import crypto from "crypto";

// ─── Input Sanitisation ───────────────────────────────────────────────────────

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      result[key] = sanitizeHtml(result[key] as string);
    }
  }
  return result as T;
}

// ─── Cloudflare Turnstile CAPTCHA ─────────────────────────────────────────────

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyCaptcha(token: string | undefined | null, remoteip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret === "1x0000000000000000000000000000000AA") {
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteip) body.append("remoteip", remoteip);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ─── AES-256-GCM Encryption for API Keys ─────────────────────────────────────

const ENCRYPTION_KEY_HEX = process.env.API_ENCRYPTION_KEY ?? "";

function getEncryptionKey(): Buffer | null {
  if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length < 32) return null;
  if (ENCRYPTION_KEY_HEX.length === 64) {
    return Buffer.from(ENCRYPTION_KEY_HEX, "hex");
  }
  return Buffer.from(ENCRYPTION_KEY_HEX.slice(0, 32), "utf8");
}

export function encryptValue(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) {
    return Buffer.from(plaintext, "utf8").toString("base64");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptValue(ciphertext: string): string | null {
  const key = getEncryptionKey();
  if (!key) {
    try {
      return Buffer.from(ciphertext, "base64").toString("utf8");
    } catch {
      return null;
    }
  }
  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 3) return null;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

// ─── Account Lockout (in-memory, resets on restart) ──────────────────────────

interface LockoutEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LockoutEntry>();
const LOCKOUT_WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

export function recordFailedLogin(key: string): { locked: boolean; lockedUntil?: number; attempts: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key) ?? { count: 0, firstAttempt: now };
  if (now - entry.firstAttempt > LOCKOUT_WINDOW_MS) {
    entry.count = 0;
    entry.firstAttempt = now;
    entry.lockedUntil = undefined;
  }
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { locked: true, lockedUntil: entry.lockedUntil, attempts: entry.count };
  }
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, entry);
    return { locked: true, lockedUntil: entry.lockedUntil, attempts: entry.count };
  }
  loginAttempts.set(key, entry);
  return { locked: false, attempts: entry.count };
}

export function isLockedOut(key: string): { locked: boolean; lockedUntil?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) return { locked: false };
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { locked: true, lockedUntil: entry.lockedUntil };
  }
  return { locked: false };
}

export function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}

// ─── Deposit Velocity Check ───────────────────────────────────────────────────

interface DepositEntry {
  timestamps: number[];
}

const depositVelocity = new Map<string, DepositEntry>();
const DEPOSIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_DEPOSITS_IN_WINDOW = 3;

export function checkDepositVelocity(key: string): boolean {
  const now = Date.now();
  const entry = depositVelocity.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter(t => now - t < DEPOSIT_WINDOW_MS);
  entry.timestamps.push(now);
  depositVelocity.set(key, entry);
  return entry.timestamps.length > MAX_DEPOSITS_IN_WINDOW;
}

// ─── Security Log Helper ──────────────────────────────────────────────────────

export type SecurityAction =
  | "login_success"
  | "login_failed"
  | "login_locked"
  | "logout"
  | "register"
  | "password_reset_request"
  | "password_reset_complete"
  | "email_verified"
  | "2fa_enabled"
  | "2fa_disabled"
  | "2fa_login"
  | "role_changed"
  | "user_banned"
  | "user_unbanned"
  | "manual_credit"
  | "product_deleted"
  | "refund_approved"
  | "api_key_created"
  | "api_key_revoked"
  | "suspicious_deposit"
  | "admin_action";

export interface SecurityLogEntry {
  userId?: number;
  adminId?: number;
  action: SecurityAction;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logSecurityEvent(entry: SecurityLogEntry): Promise<void> {
  try {
    const { getDb } = await import("./db");
    const { securityLogs } = await import("../drizzle/schema");
    const db = await getDb();
    if (!db) return;
    await db.insert(securityLogs).values({
      userId: entry.userId ?? null,
      adminId: entry.adminId ?? null,
      action: entry.action,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      ipAddress: entry.ipAddress ?? null,
    });
  } catch {
    // Never throw — logging must not break the main flow
  }
}
