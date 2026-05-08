import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  TrendingUp, RefreshCw, XCircle, Clock, CheckCircle2,
  AlertCircle, Zap, Gauge, BarChart3, ExternalLink
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending:    { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: <Clock className="w-3 h-3" />, label: "Pending" },
  processing: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30",   icon: <RefreshCw className="w-3 h-3 animate-spin" />, label: "Processing" },
  completed:  { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" />, label: "Completed" },
  partial:    { color: "bg-orange-500/20 text-orange-300 border-orange-500/30", icon: <AlertCircle className="w-3 h-3" />, label: "Partial" },
  cancelled:  { color: "bg-red-500/20 text-red-300 border-red-500/30",      icon: <XCircle className="w-3 h-3" />, label: "Cancelled" },
  refunded:   { color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <RefreshCw className="w-3 h-3" />, label: "Refunded" },
};

const SPEED_ICONS: Record<string, React.ReactNode> = {
  slow:    <Gauge className="w-3 h-3 text-gray-400" />,
  medium:  <Gauge className="w-3 h-3 text-yellow-400" />,
  fast:    <Zap className="w-3 h-3 text-orange-400" />,
  instant: <Zap className="w-3 h-3 text-green-400" />,
};

export default function DashboardGrowthOrders() {
  const [filter, setFilter] = useState<string>("all");
  const { data: orders = [], isLoading, refetch } = trpc.growthOrders.list.useQuery();
  const refill = trpc.growthOrders.requestRefill.useMutation({
    onSuccess: () => { refetch(); toast.success("Refill requested successfully"); },
    onError: (e) => toast.error(e.message),
  });
  const cancel = trpc.growthOrders.requestCancel.useMutation({
    onSuccess: () => { refetch(); toast.success("Cancellation requested"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  const stats = {
    total: orders.length,
    processing: orders.filter((o: any) => o.status === "processing").length,
    completed: orders.filter((o: any) => o.status === "completed").length,
    totalSpent: orders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount ?? "0"), 0),
  };

  return (
    <DashboardShell title="Growth Orders">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: stats.total, icon: <BarChart3 className="w-4 h-4 text-violet-400" />, color: "text-violet-400" },
            { label: "Processing", value: stats.processing, icon: <RefreshCw className="w-4 h-4 text-blue-400" />, color: "text-blue-400" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, color: "text-green-400" },
            { label: "Total Spent", value: `$${stats.totalSpent.toFixed(2)}`, icon: <TrendingUp className="w-4 h-4 text-yellow-400" />, color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="text-gray-400 text-xs">{s.label}</span>
              </div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "processing", "completed", "partial", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "glass-card text-gray-400 hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className="ml-1 opacity-60">
                  ({orders.filter((o: any) => o.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-16" />
                </div>
                <div className="h-2 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No growth orders yet</h3>
            <p className="text-gray-400 mb-6">Start growing your social media presence today</p>
            <Button
              onClick={() => window.location.href = "/growth"}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            >
              Browse Growth Services
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order: any) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const progress = order.quantity > 0
                ? Math.round((order.deliveredCount / order.quantity) * 100)
                : 0;
              return (
                <div key={order.id} className="glass-card rounded-xl p-4 hover:border-violet-500/30 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">Order #{order.id}</span>
                        <Badge className={`${cfg.color} text-xs flex items-center gap-1`}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                        {order.dripFeed && (
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                            Drip-Feed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {SPEED_ICONS[order.speedLabel ?? "medium"]}
                        <span className="capitalize">{order.speedLabel ?? "medium"} speed</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${order.totalAmount}</div>
                      <div className="text-gray-400 text-xs">{order.quantity.toLocaleString()} units</div>
                    </div>
                  </div>

                  {/* Target URL */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
                    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 text-xs truncate">{order.targetUrl}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Delivered: {order.deliveredCount.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/10" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === "partial" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                        onClick={() => refill.mutate({ orderId: order.id })}
                        disabled={refill.isPending}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Request Refill
                      </Button>
                    )}
                    {(order.status === "pending" || order.status === "processing") && !order.cancelRequested && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/10"
                        onClick={() => cancel.mutate({ orderId: order.id })}
                        disabled={cancel.isPending}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                    {order.cancelRequested && (
                      <span className="text-xs text-orange-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Cancel requested
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
