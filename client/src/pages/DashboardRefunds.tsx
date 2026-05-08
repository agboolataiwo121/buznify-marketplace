import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Plus, CheckCircle2, XCircle, Clock, DollarSign, AlertTriangle } from "lucide-react";

export default function DashboardRefunds() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", growthOrderId: "", reason: "", amount: "" });
  const { data: refunds = [], isLoading, refetch } = trpc.refunds.list.useQuery();
  const create = trpc.refunds.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ orderId: "", growthOrderId: "", reason: "", amount: "" });
      toast.success("Refund request submitted. We'll review it within 24 hours.");
    },
    onError: (e) => toast.error(e.message),
  });

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending:  { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
    approved: { color: "bg-green-500/20 text-green-300 border-green-500/30",   icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { color: "bg-red-500/20 text-red-300 border-red-500/30",         icon: <XCircle className="w-3 h-3" /> },
  };

  return (
    <DashboardShell title="Refund Requests">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{refunds.length} total requests</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Refund Request
          </Button>
        </div>

        {/* New Refund Form */}
        {showForm && (
          <div className="glass-card rounded-xl p-5 border border-violet-500/30">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Submit Refund Request
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Order ID (optional)</label>
                <input
                  type="number"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  placeholder="e.g. 42"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Growth Order ID (optional)</label>
                <input
                  type="number"
                  value={form.growthOrderId}
                  onChange={(e) => setForm({ ...form, growthOrderId: e.target.value })}
                  placeholder="e.g. 7"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-1 block">Refund Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 9.99"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-1 block">Reason (min 10 characters)</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                placeholder="Please describe the issue in detail..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => create.mutate({
                  orderId: form.orderId ? parseInt(form.orderId) : undefined,
                  growthOrderId: form.growthOrderId ? parseInt(form.growthOrderId) : undefined,
                  reason: form.reason,
                  amount: form.amount,
                })}
                disabled={create.isPending || !form.reason || form.reason.length < 10 || !form.amount}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              >
                {create.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-gray-400">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Refunds List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : refunds.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No refund requests</h3>
            <p className="text-gray-400">All your orders are in good standing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {refunds.map((r: any) => {
              const cfg = statusConfig[r.status] ?? statusConfig.pending;
              return (
                <div key={r.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">Request #{r.id}</span>
                        <Badge className={`${cfg.color} text-xs flex items-center gap-1`}>
                          {cfg.icon} {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {r.orderId && <span>Order #{r.orderId} • </span>}
                        {r.growthOrderId && <span>Growth #{r.growthOrderId} • </span>}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${r.amount}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm bg-white/5 rounded-lg p-2">{r.reason}</p>
                  {r.adminNote && (
                    <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <span className="text-blue-300 text-xs font-medium">Admin Note: </span>
                      <span className="text-gray-300 text-xs">{r.adminNote}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
