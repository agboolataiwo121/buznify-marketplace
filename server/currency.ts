/**
 * Currency conversion helpers.
 * Fetches live NGN/USD rate from exchangerate-api.com with a 1-hour in-memory cache.
 * Falls back to a hardcoded rate if the API is unavailable.
 */

const FALLBACK_NGN_TO_USD = 0.000735; // ~₦1360/$1 as of May 2026

let cachedRate: number | null = null;
let cacheExpiry = 0;

/**
 * Get the current NGN → USD conversion rate.
 * Cached for 1 hour; falls back to hardcoded rate on error.
 */
export async function getNgnToUsdRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate !== null && now < cacheExpiry) {
    return cachedRate;
  }
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number> };
    const usdToNgn = data.rates?.NGN;
    if (!usdToNgn || usdToNgn <= 0) throw new Error("Invalid rate");
    cachedRate = 1 / usdToNgn;
    cacheExpiry = now + 60 * 60 * 1000; // 1 hour
    console.log(`[Currency] NGN/USD rate updated: 1 NGN = $${cachedRate.toFixed(8)} (1 USD = ₦${usdToNgn.toFixed(2)})`);
    return cachedRate;
  } catch (err) {
    console.warn("[Currency] Failed to fetch live rate, using fallback:", err);
    return FALLBACK_NGN_TO_USD;
  }
}

/**
 * Convert Nigerian Naira to USD using the live rate.
 */
export async function ngnToUsd(naira: number): Promise<number> {
  const rate = await getNgnToUsdRate();
  return naira * rate;
}

/**
 * Convert USD to NGN using the live rate.
 */
export async function usdToNgn(amountUsd: number): Promise<number> {
  // getNgnToUsdRate() returns 1/usdToNgn (i.e. how many USD per 1 NGN)
  // To get NGN from USD: amountUsd / rate = amountUsd * usdToNgn
  const rate = await getNgnToUsdRate();
  return Math.round((amountUsd / rate) * 100) / 100;
}
