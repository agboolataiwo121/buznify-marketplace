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

// ─── Transfer / Payout API ────────────────────────────────────────────────────

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  country: string;
  currency: string;
  type: string;
  active: boolean;
}

export interface PaystackAccountResolution {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface PaystackRecipient {
  recipient_code: string;
  id: number;
  name: string;
  details: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

export interface PaystackTransfer {
  reference: string;
  transfer_code: string;
  id: number;
  status: "success" | "failed" | "pending" | "otp" | "reversed";
  amount: number;
  currency: string;
  recipient: string;
  reason: string;
  createdAt: string;
}

/** List all Nigerian banks supported by Paystack. */
export async function listBanks(): Promise<PaystackBank[]> {
  return paystackRequest<PaystackBank[]>("GET", "/bank?country=nigeria&perPage=100");
}

/** Resolve a bank account number to get the account name. */
export async function resolveBankAccount(params: {
  accountNumber: string;
  bankCode: string;
}): Promise<PaystackAccountResolution> {
  return paystackRequest<PaystackAccountResolution>(
    "GET",
    `/bank/resolve?account_number=${params.accountNumber}&bank_code=${params.bankCode}`
  );
}

/** Create a transfer recipient (required before initiating a transfer). */
export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<PaystackRecipient> {
  return paystackRequest<PaystackRecipient>("POST", "/transferrecipient", {
    type: "nuban",
    name: params.name,
    account_number: params.accountNumber,
    bank_code: params.bankCode,
    currency: "NGN",
  });
}

/**
 * Initiate a transfer to a recipient.
 * @param amountNaira  Amount in Naira (converted to kobo internally)
 */
export async function initiateTransfer(params: {
  amountNaira: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}): Promise<PaystackTransfer> {
  return paystackRequest<PaystackTransfer>("POST", "/transfer", {
    source: "balance",
    amount: Math.round(params.amountNaira * 100),
    recipient: params.recipientCode,
    reference: params.reference,
    reason: params.reason ?? "Buznify wallet withdrawal",
  });
}

/** Generate a unique transfer reference. */
export function generateTransferReference(userId: number): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BUZW-${userId}-${ts}-${rand}`;
}
