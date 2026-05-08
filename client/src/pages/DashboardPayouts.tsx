import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, Plus, Clock, CheckCircle2, XCircle, RefreshCw, Bitcoin, CreditCard, Banknote } from "lucide-react";

const METHOD_ICONS: Record<string, React.ReactNode> = {
  bank:    <Banknote className="w-4 h-4 text-green-400" />,
  crypto:  <Bitcoin className="w-4 h-4 text-orange-400" />,
  paypal:  <CreditCard className="w-4 h-4 text-blue-400" />,
};

export default function DashboardPayouts() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", method: "bank" as "bank" | "crypto" | "paypal", destination: "" });
  const { data: payouts = [], isLoading, refetch } = trpc.payouts.list.useQuery();
  const request = trpc.payouts.request.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ amount: "", method: "bank", destination: "" });
      toast.success("Payout request submitted successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending:    { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
    processing: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30",       icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    paid:       { color: "bg-green-500/20 text-green-300 border-green-500/30",    icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected:   { color: "bg-red-500/20 text-red-300 border-red-500/30",          icon: <XCircle className="w-3 h-3" /> },
  };

  const totalPaid = payouts.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + parseFloat(p.amount), 0);
  const totalPending = payouts.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + parseFloat(p.amount), 0);

  return (
    <DashboardShell title="Payout Requests">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Total Paid Out</div>
            <div className="text-green-400 font-bold text-xl">${totalPaid.toFixed(2)}</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Pending</div>
            <div className="text-yellow-400 font-bold text-xl">${totalPending.toFixed(2)}</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Total Requests</div>
            <div className="text-white font-bold text-xl">{payouts.length}</div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-xl p-5 border border-violet-500/30">
            <h3 className="text-white font-semibold mb-4">New Payout Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Amount ($)</label>
                <input
                  type="number" step="0.01" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 50.00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Payment Method</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value as "bank" | "crypto" | "paypal" })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="crypto">Crypto (USDT/BTC)</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-1 block">
                {form.method === "bank" ? "Bank Account / IBAN" : form.method === "crypto" ? "Wallet Address" : "PayPal Email"}
              </label>
              <input
                type="text" value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder={form.method === "bank" ? "IBAN or account number" : form.method === "crypto" ? "0x... or bc1..." : "email@paypal.com"}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => request.mutate(form)}
                disabled={request.isPending || !form.amount || !form.destination}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              >
                {request.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-gray-400">Cancel</Button>
            </div>
          </div>
        )}

        {/* Payouts List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No payout requests yet</h3>
            <p className="text-gray-400">Request a payout when you have earnings to withdraw</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((p: any) => {
              const cfg = statusConfig[p.status] ?? statusConfig.pending;
              return (
                <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {METHOD_ICONS[p.method]}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">#{p.id} — {p.method.charAt(0).toUpperCase() + p.method.slice(1)}</span>
                        <Badge className={`${cfg.color} text-xs flex items-center gap-1`}>{cfg.icon} {p.status}</Badge>
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">{p.destination} • {new Date(p.createdAt).toLocaleDateString()}</div>
                      {p.notes && <div className="text-gray-300 text-xs mt-1 italic">{p.notes}</div>}
                    </div>
                  </div>
                  <div className="text-white font-bold">${p.amount}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
