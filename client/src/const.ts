export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Safely handles missing env vars (e.g. on Vercel without Manus OAuth configured).
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // Guard: if OAuth vars are missing, return home to avoid TypeError: Invalid URL
  if (!oauthPortalUrl || !appId) {
    if (typeof window !== "undefined") {
      console.warn("[Auth] VITE_OAUTH_PORTAL_URL or VITE_APP_ID not set — login disabled.");
    }
    return "/";
  }

  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(
      JSON.stringify({ origin: window.location.origin, returnPath: returnPath ?? "/" })
    );
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch {
    console.warn("[Auth] Failed to construct login URL.");
    return "/";
  }
};
