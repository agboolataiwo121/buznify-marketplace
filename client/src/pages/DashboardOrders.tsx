import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Copy,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Eye,
  KeyRound,
  Mail,
  Lock,
  User,
  Phone,
  Link,
  FileText,
  Shield,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20", label: "Pending" },
  processing: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20", label: "Processing" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", label: "Cancelled" },
  refunded: { icon: XCircle, color: "text-orange-400", bg: "bg-orange-500/20", label: "Refunded" },
};

function getFieldIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("email") || l.includes("mail")) return <Mail className="w-3.5 h-3.5" />;
  if (l.includes("password") || l.includes("pass")) return <Lock className="w-3.5 h-3.5" />;
  if (l.includes("username") || l.includes("user")) return <User className="w-3.5 h-3.5" />;
  if (l.includes("phone") || l.includes("number")) return <Phone className="w-3.5 h-3.5" />;
  if (l.includes("key") || l.includes("license") || l.includes("code") || l.includes("2fa") || l.includes("backup") || l.includes("redeem")) return <KeyRound className="w-3.5 h-3.5" />;
  if (l.includes("link") || l.includes("url") || l.includes("download")) return <Link className="w-3.5 h-3.5" />;
  if (l.includes("recovery")) return <Shield className="w-3.5 h-3.5" />;
  return <FileText className="w-3.5 h-3.5" />;
}

function isSensitiveField(label: string) {
  return ["password", "pass", "2fa", "backup", "secret", "key", "license", "token", "code", "redeem"].some(k =>
    label.toLowerCase().includes(k)
  );
}

function CredentialRow({ label, value, icon, sensitive }: { label: string; value: string; icon: React.ReactNode; sensitive: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const display = sensitive && !revealed ? "•".repeat(Math.min(value.length, 16)) : value;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 group hover:bg-emerald-500/5 transition-colors">
      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className={`text-sm font-mono text-emerald-300 truncate ${sensitive && !revealed ? "tracking-widest" : ""}`}>
          {display}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {sensitive && (
          <button
            onClick={() => setRevealed(r => !r)}
            className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title={revealed ? "Hide" : "Reveal"}
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardOrders() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery();

  const handleCopyAll = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("All credentials copied to clipboard");
  };

  return (
    <DashboardShell title="My Orders" subtitle="Track and manage your purchases.">
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-20 animate-shimmer" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start shopping to see your orders here
          </p>
          <a href="/marketplace">
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
              Browse Marketplace
            </Button>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const Icon = config.icon;
            const isExpanded = expandedId === order.id;
            const deliveryData = order.deliveryData as Record<string, string> | null;
            const isStructured = deliveryData && typeof deliveryData === "object" && !Array.isArray(deliveryData);

            return (
              <div key={order.id} className="glass-card rounded-2xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${order.totalAmount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === "completed" ? "badge-success" :
                        order.status === "processing" ? "badge-purple" :
                        "badge-warning"
                      }`}>
                        {config.label}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Quantity", value: order.quantity },
                        { label: "Unit Price", value: `$${order.unitPrice}` },
                        { label: "Discount", value: `$${order.discountAmount ?? "0.00"}` },
                        { label: "Total", value: `$${order.totalAmount}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-2 rounded-lg bg-white/5">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>

                    {deliveryData != null && (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-emerald-500/10">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Account Credentials</span>
                            {isStructured && (
                              <span className="text-[10px] text-emerald-400/50 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                {Object.keys(deliveryData).length} fields
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                            onClick={() => handleCopyAll(deliveryData)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy All
                          </Button>
                        </div>
                        {/* Credential rows */}
                        {isStructured ? (
                          <div className="divide-y divide-emerald-500/10">
                            {Object.entries(deliveryData).map(([label, value]) => (
                              <CredentialRow
                                key={label}
                                label={label}
                                value={String(value)}
                                icon={getFieldIcon(label)}
                                sensitive={isSensitiveField(label)}
                              />
                            ))}
                          </div>
                        ) : (
                          <pre className="text-xs text-emerald-300 font-mono overflow-auto p-4">
                            {JSON.stringify(deliveryData, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}

                    {order.deliveredAt && (
                      <p className="text-xs text-muted-foreground">
                        Delivered: {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
