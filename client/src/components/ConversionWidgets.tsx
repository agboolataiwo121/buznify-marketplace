import { useState, useEffect, useCallback } from "react";
import { Clock, Users, Zap, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Countdown Timer ──────────────────────────────────────────────────────────
interface CountdownTimerProps {
  label?: string;
  durationSeconds?: number;
}

export function CountdownTimer({ label = "Limited Time Offer", durationSeconds = 900 }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(durationSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const urgency = seconds < 300 ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-orange-400 border-orange-500/30 bg-orange-500/10";

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${urgency} text-sm font-medium`}>
      <Clock className="w-4 h-4 animate-pulse" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-mono font-bold tracking-wider">
        {h > 0 && `${pad(h)}:`}{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}

// ── People Viewing Indicator ─────────────────────────────────────────────────
interface PeopleViewingProps {
  productId?: number;
}

export function PeopleViewing({ productId }: PeopleViewingProps) {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 18) + 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(50, c + delta));
      });
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <Users className="w-3.5 h-3.5" />
      <span><strong>{count}</strong> people viewing this right now</span>
    </div>
  );
}

// ── Stock Urgency Badge ───────────────────────────────────────────────────────
interface StockUrgencyProps {
  stock?: number;
}

export function StockUrgency({ stock = 7 }: StockUrgencyProps) {
  if (stock > 20) return null;
  const color = stock <= 3 ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-orange-400 bg-orange-500/10 border-orange-500/30";
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${color}`}>
      <Zap className="w-3.5 h-3.5" />
      Only <strong>{stock}</strong> left in stock — order soon!
    </div>
  );
}

// ── Exit-Intent Offer Modal ───────────────────────────────────────────────────
interface ExitIntentOfferProps {
  couponCode?: string;
  discount?: string;
}

export function ExitIntentOffer({ couponCode = "STAY10", discount = "10%" }: ExitIntentOfferProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !dismissed) {
      setVisible(true);
    }
  }, [dismissed]);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative glass-card rounded-3xl p-8 max-w-md w-full mx-4 border border-violet-500/30 shadow-2xl shadow-violet-500/20 text-center">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glow orb */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 blur-xl opacity-60" />

        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7 text-violet-400" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Wait! Don't leave yet 🎁</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Get <span className="text-violet-400 font-bold">{discount} OFF</span> your first order with this exclusive coupon code:
          </p>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-violet-500/30 mb-6">
            <code className="flex-1 text-lg font-bold text-violet-300 tracking-widest text-center">{couponCode}</code>
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-8"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">Valid for the next 15 minutes only. One use per account.</p>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 text-white border-0 h-11 font-semibold"
            onClick={handleDismiss}
          >
            Claim My Discount & Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Abandoned Cart Reminder Banner ────────────────────────────────────────────
interface AbandonedCartBannerProps {
  productName?: string;
  onResume?: () => void;
  onDismiss?: () => void;
}

export function AbandonedCartBanner({ productName, onResume, onDismiss }: AbandonedCartBannerProps) {
  if (!productName) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-slide-up">
      <div className="glass-card rounded-2xl p-4 border border-orange-500/30 shadow-xl shadow-orange-500/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Still interested?</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              You left <span className="text-orange-400 font-medium">{productName}</span> in your cart
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white border-0 flex-1" onClick={onResume}>
                Complete Order
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 flex-shrink-0" onClick={onDismiss}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
