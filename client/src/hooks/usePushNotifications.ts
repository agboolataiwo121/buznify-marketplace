import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

// VAPID public key — generated via web-push, stored as env var
// For now we use a placeholder; the server will provide the real key via tRPC
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const subscribeMutation = trpc.notifications.subscribePush.useMutation();
  const { data: vapidKeyData } = trpc.notifications.getVapidPublicKey.useQuery();

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      const publicKey = vapidKeyData?.key ?? VAPID_PUBLIC_KEY;
      if (!publicKey) return false;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const p256dhKey = subscription.getKey("p256dh") as ArrayBuffer;
      const authKey = subscription.getKey("auth") as ArrayBuffer;
      const p256dhArr = new Uint8Array(p256dhKey);
      const authArr = new Uint8Array(authKey);
      let p256dhStr = "";
      let authStr = "";
      for (let i = 0; i < p256dhArr.length; i++) p256dhStr += String.fromCharCode(p256dhArr[i]);
      for (let i = 0; i < authArr.length; i++) authStr += String.fromCharCode(authArr[i]);

      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        p256dh: btoa(p256dhStr),
        auth: btoa(authStr),
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [vapidKeyData, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setPermission("default");
      }
    } catch (err) {
      console.warn("[push] Failed to unsubscribe:", err);
    }
  }, []);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
