import { useState, useEffect } from "react";
import { ShoppingBag, X } from "lucide-react";

const DEMO_ORDERS = [
  { user: "Alex M.", product: "Instagram 10K Account", location: "New York, US", time: "2 min ago" },
  { user: "Sarah K.", product: "Netflix Premium Account", location: "London, UK", time: "5 min ago" },
  { user: "James T.", product: "1000 TikTok Followers", location: "Toronto, CA", time: "8 min ago" },
  { user: "Maria L.", product: "Spotify Premium Account", location: "Madrid, ES", time: "12 min ago" },
  { user: "Chen W.", product: "US Virtual Number", location: "Singapore, SG", time: "15 min ago" },
  { user: "Priya S.", product: "YouTube 500 Subscribers", location: "Mumbai, IN", time: "18 min ago" },
  { user: "Omar A.", product: "Gaming Account — Valorant", location: "Dubai, AE", time: "21 min ago" },
  { user: "Lisa R.", product: "Twitter 2K Followers", location: "Berlin, DE", time: "25 min ago" },
];

export default function LiveOrderPopup() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show first popup after 3s
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 3000);

    return () => clearTimeout(initialTimer);
  }, [dismissed]);

  useEffect(() => {
    if (!visible || dismissed) return;

    // Hide after 4s
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    // Show next after 8s
    const nextTimer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % DEMO_ORDERS.length);
      setVisible(true);
    }, 8000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [visible, current, dismissed]);

  if (dismissed || !visible) return null;

  const order = DEMO_ORDERS[current];

  return (
    <div
      className="fixed bottom-[5.5rem] md:bottom-6 left-3 sm:left-6 z-50 animate-slide-up"
      style={{ maxWidth: "300px" }}
    >
      <div className="glass-card rounded-xl p-4 flex items-start gap-3 shadow-2xl shadow-black/50">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary">{order?.user}</span> just purchased
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {order?.product}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              {order?.location} · {order?.time}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
