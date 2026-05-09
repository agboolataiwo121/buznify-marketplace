import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

interface Props {
  onDismiss: () => void;
}

/**
 * A subtle bottom-sheet prompt asking the user to enable push notifications.
 * Shown once after the first successful order.
 */
export default function PushNotificationPrompt({ onDismiss }: Props) {
  const { permission, isLoading, subscribe } = usePushNotifications();

  if (permission === "unsupported" || permission === "granted" || permission === "denied") {
    return null;
  }

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) {
      toast.success("Push notifications enabled! We'll notify you when your order is delivered.");
    } else {
      toast.error("Couldn't enable notifications. You can try again in your browser settings.");
    }
    onDismiss();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card rounded-2xl border border-white/10 shadow-2xl shadow-black/50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-0.5">
              Stay updated on your orders
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enable notifications to get instant alerts when your digital products are delivered.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            className="flex-1 h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
            ) : (
              <Bell className="w-3.5 h-3.5 mr-1.5" />
            )}
            Enable Notifications
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-white/10 bg-white/5 hover:bg-white/10"
            onClick={onDismiss}
          >
            <BellOff className="w-3.5 h-3.5 mr-1" />
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
