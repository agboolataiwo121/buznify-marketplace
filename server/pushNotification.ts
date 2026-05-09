import webpush from "web-push";
import { getPushSubscriptionsForUser } from "./db";

// Configure VAPID details once at module load
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@buznify.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Send a push notification to all subscriptions for a given user.
 * Silently skips if VAPID keys are not configured or no subscriptions exist.
 */
export async function sendPushToUser(userId: number, payload: PushPayload): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[push] VAPID keys not configured — skipping push notification");
    return;
  }

  let subscriptions: Awaited<ReturnType<typeof getPushSubscriptionsForUser>>;
  try {
    subscriptions = await getPushSubscriptionsForUser(userId);
  } catch (err) {
    console.warn("[push] Failed to fetch subscriptions:", err);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) return;

  const message = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message
        )
        .catch((err) => {
          // 410 Gone = subscription expired/unsubscribed — safe to ignore
          if (err?.statusCode !== 410) {
            console.warn("[push] Failed to send notification:", err?.message ?? err);
          }
        })
    )
  );
}
