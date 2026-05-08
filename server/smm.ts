/**
 * Universal SMM Panel API v2 Client
 * Supports SMMKings and Peakerr (both use the same API v2 spec)
 */

export type SmmPanel = "smmkings" | "peakerr";

const PANEL_URLS: Record<SmmPanel, string> = {
  smmkings: "https://smmkings.com/api/v2",
  peakerr: "https://peakerr.com/api/v2",
};

function getKey(panel: SmmPanel): string {
  if (panel === "smmkings") {
    return process.env.SMMKINGS_API_KEY ?? "";
  }
  return process.env.PEAKERR_API_KEY ?? "";
}

async function smmPost<T = unknown>(panel: SmmPanel, params: Record<string, string>): Promise<T> {
  const url = PANEL_URLS[panel];
  const key = getKey(panel);
  if (!key) throw new Error(`API key not configured for panel: ${panel}`);

  const body = new URLSearchParams({ key, ...params });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`SMM API HTTP error: ${res.status}`);
  const data = await res.json() as T;

  // Check for API-level errors
  if (data && typeof data === "object" && "error" in data) {
    throw new Error((data as { error: string }).error);
  }
  return data;
}

// ─── Service Types ────────────────────────────────────────────────────────────

export interface SmmService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;       // price per 1000 in USD
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
  panel: SmmPanel;
}

export interface SmmOrderResult {
  order: number;
}

export interface SmmOrderStatus {
  charge: string;
  start_count: string;
  status: string;       // Pending | In progress | Partial | Completed | Canceled | Processing
  remains: string;
  currency: string;
}

export interface SmmBalance {
  balance: string;
  currency: string;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/** Fetch all services from a panel */
export async function smmGetServices(panel: SmmPanel): Promise<SmmService[]> {
  const services = await smmPost<SmmService[]>(panel, { action: "services" });
  return services.map((s) => ({ ...s, panel }));
}

/** Fetch services from both panels and merge */
export async function smmGetAllServices(): Promise<SmmService[]> {
  const [kings, peakerr] = await Promise.allSettled([
    smmGetServices("smmkings"),
    smmGetServices("peakerr"),
  ]);

  const result: SmmService[] = [];
  if (kings.status === "fulfilled") result.push(...kings.value);
  if (peakerr.status === "fulfilled") result.push(...peakerr.value);
  return result;
}

/** Place an order on a panel */
export async function smmPlaceOrder(
  panel: SmmPanel,
  serviceId: number,
  link: string,
  quantity: number
): Promise<SmmOrderResult> {
  return smmPost<SmmOrderResult>(panel, {
    action: "add",
    service: String(serviceId),
    link,
    quantity: String(quantity),
  });
}

/** Get status of a single order */
export async function smmGetOrderStatus(
  panel: SmmPanel,
  orderId: string
): Promise<SmmOrderStatus> {
  return smmPost<SmmOrderStatus>(panel, {
    action: "status",
    order: orderId,
  });
}

/** Get account balance */
export async function smmGetBalance(panel: SmmPanel): Promise<SmmBalance> {
  return smmPost<SmmBalance>(panel, { action: "balance" });
}

/** Request a refill for an order */
export async function smmRefillOrder(panel: SmmPanel, orderId: string): Promise<{ refill: number }> {
  return smmPost(panel, { action: "refill", order: orderId });
}

/** Cancel an order */
export async function smmCancelOrder(panel: SmmPanel, orderId: string): Promise<{ cancel: number[] }> {
  return smmPost(panel, { action: "cancel", orders: orderId });
}

// ─── Platform detection helper ────────────────────────────────────────────────

const PLATFORM_KEYWORDS: Record<string, string[]> = {
  instagram:  ["instagram", "insta", "ig "],
  tiktok:     ["tiktok", "tik tok"],
  youtube:    ["youtube", "yt "],
  facebook:   ["facebook", "fb "],
  twitter:    ["twitter", "tweet", "x followers", "x likes"],
  telegram:   ["telegram"],
  spotify:    ["spotify"],
  snapchat:   ["snapchat"],
  linkedin:   ["linkedin"],
  pinterest:  ["pinterest"],
  twitch:     ["twitch"],
  discord:    ["discord"],
  threads:    ["threads"],
  reddit:     ["reddit"],
  soundcloud: ["soundcloud"],
  website:    ["website", "web traffic", "traffic"],
};

export function detectPlatform(name: string, category: string): string {
  const text = (name + " " + category).toLowerCase();
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return platform;
  }
  return "other";
}

/** Normalize panel status to our DB enum */
export function normalizeSmmStatus(
  panelStatus: string
): "pending" | "processing" | "completed" | "partial" | "cancelled" {
  const s = panelStatus.toLowerCase();
  if (s === "completed") return "completed";
  if (s === "partial") return "partial";
  if (s === "canceled" || s === "cancelled") return "cancelled";
  if (s === "in progress" || s === "processing") return "processing";
  return "pending";
}
