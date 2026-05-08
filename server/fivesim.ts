/**
 * 5sim.net API helper
 * Docs: https://5sim.net/docs
 * All authenticated endpoints require: Authorization: Bearer <token>
 */

const BASE_URL = "https://5sim.net/v1";

function getApiKey(): string {
  const key = process.env.FIVESIM_API_KEY ?? "";
  return key;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    Accept: "application/json",
  };
}

function guestHeaders() {
  return {
    Accept: "application/json",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FivesimSms {
  id: number;
  created_at: string;
  date: string;
  sender: string;
  text: string;
  code: string;
}

export interface FivesimOrder {
  id: number;
  phone: string;
  operator: string;
  product: string;
  price: number;
  status: "PENDING" | "RECEIVED" | "CANCELED" | "TIMEOUT" | "FINISHED" | "BANNED";
  expires: string;
  sms: FivesimSms[] | null;
  created_at: string;
  forwarding: boolean;
  forwarding_number: string;
  country: string;
}

export interface FivesimProduct {
  Category: string;
  Qty: number;
  Price: number;
}

export interface FivesimCountry {
  name: string;
  iso: string;
  prefix: string;
}

export interface FivesimProfile {
  id: number;
  email: string;
  balance: number;
  rating: number;
  frozen_balance: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** Get authenticated user profile and balance */
export async function getProfile(): Promise<FivesimProfile> {
  const res = await fetch(`${BASE_URL}/user/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`5sim profile error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Get all products and prices for a country + operator (guest, no auth) */
export async function getProducts(
  country: string,
  operator = "any"
): Promise<Record<string, FivesimProduct>> {
  const res = await fetch(`${BASE_URL}/guest/products/${encodeURIComponent(country)}/${encodeURIComponent(operator)}`, {
    headers: guestHeaders(),
  });
  if (!res.ok) throw new Error(`5sim products error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Get prices for a specific product across all countries (guest, no auth) */
export async function getPricesByProduct(
  product: string
): Promise<Record<string, Record<string, Record<string, { cost: number; count: number; rate: number }>>>> {
  const res = await fetch(`${BASE_URL}/guest/prices?product=${encodeURIComponent(product)}`, {
    headers: guestHeaders(),
  });
  if (!res.ok) throw new Error(`5sim prices error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Get prices for a country + product (guest, no auth) */
export async function getPricesByCountryAndProduct(
  country: string,
  product: string
): Promise<Record<string, Record<string, Record<string, { cost: number; count: number; rate: number }>>>> {
  const res = await fetch(
    `${BASE_URL}/guest/prices?country=${encodeURIComponent(country)}&product=${encodeURIComponent(product)}`,
    { headers: guestHeaders() }
  );
  if (!res.ok) throw new Error(`5sim prices error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Get list of all countries (guest, no auth) */
export async function getCountries(): Promise<Record<string, FivesimCountry>> {
  const res = await fetch(`${BASE_URL}/guest/countries`, { headers: guestHeaders() });
  if (!res.ok) throw new Error(`5sim countries error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Buy an activation number */
export async function buyActivationNumber(
  country: string,
  operator: string,
  product: string,
  maxPrice?: number
): Promise<FivesimOrder> {
  let url = `${BASE_URL}/user/buy/activation/${encodeURIComponent(country)}/${encodeURIComponent(operator)}/${encodeURIComponent(product)}`;
  if (maxPrice !== undefined) url += `?maxPrice=${maxPrice}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`5sim buy error: ${res.status} ${body}`);
  }
  return res.json();
}

/** Check order status and get SMS */
export async function checkOrder(orderId: number): Promise<FivesimOrder> {
  const res = await fetch(`${BASE_URL}/user/check/${orderId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`5sim check error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Finish an order (mark as done) */
export async function finishOrder(orderId: number): Promise<FivesimOrder> {
  const res = await fetch(`${BASE_URL}/user/finish/${orderId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`5sim finish error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Cancel an order (refund if no SMS received) */
export async function cancelOrder(orderId: number): Promise<FivesimOrder> {
  const res = await fetch(`${BASE_URL}/user/cancel/${orderId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`5sim cancel error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Ban a number (report as banned, get refund) */
export async function banOrder(orderId: number): Promise<FivesimOrder> {
  const res = await fetch(`${BASE_URL}/user/ban/${orderId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`5sim ban error: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Get user's order history */
export async function getOrderHistory(
  category: "activation" | "hosting" = "activation",
  limit = 20,
  offset = 0
): Promise<{ Data: FivesimOrder[]; Total: number }> {
  const res = await fetch(
    `${BASE_URL}/user/orders?category=${category}&limit=${limit}&offset=${offset}&order=id&reverse=true`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`5sim orders error: ${res.status} ${await res.text()}`);
  return res.json();
}
