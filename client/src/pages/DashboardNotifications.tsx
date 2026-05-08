import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, CheckCheck, Package, Wallet, AlertCircle, Info } from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  order_completed: Package,
  order_placed: Package,
  wallet_deposit: Wallet,
  wallet_deduction: Wallet,
  system: Info,
  alert: AlertCircle,
};

export default function DashboardNotifications() {
  const utils = trpc.useUtils();
  const { data: notifications, isLoading } = trpc.notifications.getAll.useQuery();

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

  return (
    <DashboardShell title="Notifications" subtitle="Stay updated with your account activity.">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? (
            <span className="text-primary font-medium">{unreadCount} unread</span>
          ) : (
            "All caught up!"
          )}
        </p>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 h-8 text-xs"
            onClick={() => markAllMutation.mutate()}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-16 animate-shimmer" />
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] ?? Bell;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? "bg-white/3 border-white/5 opacity-60"
                    : "bg-white/5 border-white/10 hover:border-primary/30"
                }`}
                onClick={() => !notif.isRead && markReadMutation.mutate({ id: notif.id })}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  notif.isRead ? "bg-white/5" : "bg-primary/10"
                }`}>
                  <Icon className={`w-4 h-4 ${notif.isRead ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
