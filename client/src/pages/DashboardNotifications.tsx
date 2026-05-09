import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { toast } from "sonner";
import { useRef } from "react";
import {
  Bell,
  CheckCheck,
  Package,
  Wallet,
  AlertCircle,
  Info,
  ShoppingCart,
  Zap,
  RefreshCw,
  Gift,
  Shield,
} from "lucide-react";

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  order_completed: { label: "Order Delivered", icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  order_placed:    { label: "Order Placed",    icon: ShoppingCart, color: "text-blue-400",    bg: "bg-blue-500/15" },
  wallet_deposit:  { label: "Deposit",         icon: Wallet,       color: "text-violet-400",  bg: "bg-violet-500/15" },
  wallet_deduction:{ label: "Deduction",       icon: Wallet,       color: "text-orange-400",  bg: "bg-orange-500/15" },
  push_delivery:   { label: "Push Sent",       icon: Zap,          color: "text-cyan-400",    bg: "bg-cyan-500/15" },
  refund_approved: { label: "Refund Approved", icon: RefreshCw,    color: "text-emerald-400", bg: "bg-emerald-500/15" },
  refund_rejected: { label: "Refund Rejected", icon: RefreshCw,    color: "text-red-400",     bg: "bg-red-500/15" },
  bonus:           { label: "Bonus",           icon: Gift,         color: "text-yellow-400",  bg: "bg-yellow-500/15" },
  security:        { label: "Security",        icon: Shield,       color: "text-red-400",     bg: "bg-red-500/15" },
  system:          { label: "System",          icon: Info,         color: "text-muted-foreground", bg: "bg-white/5" },
  alert:           { label: "Alert",           icon: AlertCircle,  color: "text-yellow-400",  bg: "bg-yellow-500/15" },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? { label: type, icon: Bell, color: "text-primary", bg: "bg-primary/10" };
}

// ── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// ── Group notifications by date ───────────────────────────────────────────────
function groupByDate(notifications: { createdAt: Date | string | number }[]) {
  const groups: Record<string, typeof notifications> = {};
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const key = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }
  return groups;
}

export default function DashboardNotifications() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading, refetch } = trpc.notifications.getAll.useQuery();

  const { isRefreshing, pullDistance, containerRef } = usePullToRefresh({
    onRefresh: async () => { await refetch(); },
  });

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.getAll.invalidate(),
  });

  const markAllMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      utils.notifications.getAll.invalidate();
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const groups = notifications ? groupByDate(notifications) : {};

  return (
    <DashboardShell title="Notifications" subtitle="Stay updated with your account activity.">
      <div ref={containerRef} className="relative">
        <PullToRefreshIndicator isRefreshing={isRefreshing} pullDistance={pullDistance} />

        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unreadCount > 0 ? (
                <span className="text-primary font-medium">{unreadCount} unread</span>
              ) : (
                "All caught up!"
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 h-8 text-xs"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 h-16 animate-shimmer" />
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
              You'll see order deliveries, wallet activity, and system alerts here.
            </p>
          </div>
        ) : (
          /* Timeline grouped by date */
          <div className="space-y-6">
            {Object.entries(groups).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-xs text-muted-foreground font-medium px-2">{dateLabel}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Notification cards */}
                <div className="space-y-2">
                  {(items as any[]).map((notif) => {
                    const cfg = getConfig(notif.type);
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                          notif.isRead
                            ? "bg-white/[0.02] border-white/5 opacity-60"
                            : "bg-white/5 border-white/10 hover:border-primary/30 cursor-pointer"
                        }`}
                        onClick={() => !notif.isRead && markReadMutation.mutate({ id: notif.id })}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notif.isRead ? "bg-white/5" : cfg.bg
                        }`}>
                          <Icon className={`w-4 h-4 ${notif.isRead ? "text-muted-foreground" : cfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-medium leading-tight ${
                                  notif.isRead ? "text-muted-foreground" : "text-foreground"
                                }`}>
                                  {notif.title}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  notif.isRead ? "bg-white/5 text-muted-foreground" : `${cfg.bg} ${cfg.color}`
                                }`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {relativeTime(notif.createdAt)}
                              </span>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
