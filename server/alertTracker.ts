/**
 * In-memory error tracker for 5sim API failures.
 * Automatically creates a site_alert when consecutive errors exceed thresholds.
 */

import { createSiteAlert, getActiveSiteAlerts } from "./db";

interface ServiceErrorState {
  consecutiveAuthErrors: number;
  consecutiveAvailabilityErrors: number;
  lastErrorAt: Date | null;
  alertCreated: boolean;
}

const AUTH_ERROR_THRESHOLD = 3;       // 3 consecutive 401/403 errors
const AVAILABILITY_ERROR_THRESHOLD = 5; // 5 consecutive 503/no-numbers errors
const RESET_AFTER_MS = 10 * 60 * 1000; // reset counters after 10 min of no errors

const state: Record<string, ServiceErrorState> = {};

function getState(service: string): ServiceErrorState {
  if (!state[service]) {
    state[service] = {
      consecutiveAuthErrors: 0,
      consecutiveAvailabilityErrors: 0,
      lastErrorAt: null,
      alertCreated: false,
    };
  }
  return state[service];
}

function maybeResetCounters(s: ServiceErrorState) {
  if (s.lastErrorAt && Date.now() - s.lastErrorAt.getTime() > RESET_AFTER_MS) {
    s.consecutiveAuthErrors = 0;
    s.consecutiveAvailabilityErrors = 0;
    s.alertCreated = false;
  }
}

async function triggerAlert(service: string, type: "auth" | "availability") {
  const s = getState(service);
  if (s.alertCreated) return; // already raised

  // Check if an active alert for this service already exists in DB
  try {
    const existing = await getActiveSiteAlerts();
    const alreadyActive = existing.some(
      (a) => a.affectedService === service && a.autoTriggered
    );
    if (alreadyActive) {
      s.alertCreated = true;
      return;
    }

    const isAuth = type === "auth";
    await createSiteAlert({
      type: "error",
      severity: isAuth ? "critical" : "high",
      title: isAuth
        ? "Virtual Numbers Temporarily Unavailable"
        : "Virtual Number Stock Low",
      message: isAuth
        ? "Our virtual number provider is experiencing authentication issues. New number purchases are temporarily disabled. Our team has been notified and is working to resolve this."
        : "Virtual number availability is currently limited for some services. Please try a different country or service, or check back shortly.",
      affectedService: service,
      isActive: true,
      autoTriggered: true,
    });
    s.alertCreated = true;
    console.warn(`[AlertTracker] Auto-created ${type} alert for service: ${service}`);
  } catch (err) {
    console.error("[AlertTracker] Failed to create alert:", err);
  }
}

/**
 * Call this whenever a 5sim API call succeeds — resets the error counters.
 */
export function recordSuccess(service = "virtual_numbers") {
  const s = getState(service);
  s.consecutiveAuthErrors = 0;
  s.consecutiveAvailabilityErrors = 0;
  s.alertCreated = false;
  // Note: we do NOT auto-dismiss the DB alert on success — admin must dismiss manually.
}

/**
 * Call this whenever a 5sim API call returns a 401/403 authentication error.
 */
export async function recordAuthError(service = "virtual_numbers") {
  const s = getState(service);
  maybeResetCounters(s);
  s.consecutiveAuthErrors += 1;
  s.lastErrorAt = new Date();
  if (s.consecutiveAuthErrors >= AUTH_ERROR_THRESHOLD) {
    await triggerAlert(service, "auth");
  }
}

/**
 * Call this whenever a 5sim API call returns a 503 or "no numbers available" error.
 */
export async function recordAvailabilityError(service = "virtual_numbers") {
  const s = getState(service);
  maybeResetCounters(s);
  s.consecutiveAvailabilityErrors += 1;
  s.lastErrorAt = new Date();
  if (s.consecutiveAvailabilityErrors >= AVAILABILITY_ERROR_THRESHOLD) {
    await triggerAlert(service, "availability");
  }
}

/**
 * Returns the current in-memory error state for diagnostics.
 */
export function getErrorState(service = "virtual_numbers") {
  return getState(service);
}
