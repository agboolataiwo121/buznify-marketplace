/**
 * Paystack API helper
 * Docs: https://paystack.com/docs/api/transaction/
 */

import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

async function paystackRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as { status: boolean; message: string; data: T };

  if (!json.status) {
    throw new Error(json.message ?? "Paystack API error");
  }

  return json.data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaystackInitData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyData {
  id: number;
  status: "success" | "failed" | "abandoned" | "pending";
  reference: string;
  amount: number; // in kobo/pesewas (smallest currency unit)
  currency: string;
  channel: string;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  customer: {
    id: number;
    email: string;
    customer_code: string;
  };
  authorization?: {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    bank: string;
    brand: string;
    channel: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PaystackBalanceData {
  currency: string;
  balance: number; // in smallest currency unit
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Initialize a Paystack transaction.
 * @param email  Customer email
 * @param amountNaira  Amount in Naira (will be converted to kobo)
 * @param reference  Unique reference for this transaction
 * @param metadata  Optional extra data stored with the transaction
 * @param callbackUrl  URL to redirect after payment (optional)
 */
export async function initializeTransaction(params: {
  email: string;
  amountNaira: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}): Promise<PaystackInitData> {
  return paystackRequest<PaystackInitData>("POST", "/transaction/initialize", {
    email: params.email,
    amount: Math.round(params.amountNaira * 100), // convert to kobo
    reference: params.reference,
    metadata: params.metadata,
    callback_url: params.callbackUrl,
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
  });
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyTransaction(reference: string): Promise<PaystackVerifyData> {
  return paystackRequest<PaystackVerifyData>(
    "GET",
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

/**
 * Validate a Paystack webhook signature.
 * Paystack signs the request body with HMAC-SHA512 using your secret key.
 */
export function validateWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return false;
  const hash = crypto.createHmac("sha512", key).update(rawBody).digest("hex");
  return hash === signature;
}

/**
 * Generate a unique transaction reference.
 */
export function generateReference(userId: number): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BUZ-${userId}-${ts}-${rand}`;
}

/**
 * Check Paystack account balance (for admin).
 */
export async function getPaystackBalance(): Promise<PaystackBalanceData[]> {
  return paystackRequest<PaystackBalanceData[]>("GET", "/balance");
}
