import { useEffect } from "react";

// Tawk.to live chat widget
// To use your own Tawk.to account:
// 1. Sign up at https://www.tawk.to
// 2. Create a property and copy your Property ID and Widget ID
// 3. Set VITE_TAWKTO_PROPERTY_ID and VITE_TAWKTO_WIDGET_ID in Settings -> Secrets
const PROPERTY_ID = import.meta.env.VITE_TAWKTO_PROPERTY_ID || "default";
const WIDGET_ID = import.meta.env.VITE_TAWKTO_WIDGET_ID || "default";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export default function LiveChatWidget() {
  useEffect(() => {
    if (PROPERTY_ID === "default" || WIDGET_ID === "default") return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    s0?.parentNode?.insertBefore(s1, s0);

    return () => {
      s1.remove();
    };
  }, []);

  if (PROPERTY_ID === "default" || WIDGET_ID === "default") {
    return (
      <a
        href="/support"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, oklch(0.55 0.22 290), oklch(0.55 0.22 220))" }}
        aria-label="Live Support"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="hidden sm:inline">Live Support</span>
      </a>
    );
  }

  return null;
}
