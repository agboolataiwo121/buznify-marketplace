import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  ShoppingCart,
  Star,
  Wand2,
  TrendingUp,
  Award,
  Key,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";

const CATEGORIES = [
  { value: "social_media_accounts", label: "Social Media Accounts" },
  { value: "streaming_accounts", label: "Streaming Accounts" },
  { value: "gaming_accounts", label: "Gaming Accounts" },
  { value: "virtual_numbers", label: "Virtual Numbers" },
  { value: "growth_services", label: "Growth Services" },
] as const;

export default function VendorDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "social_media_accounts" as typeof CATEGORIES[number]["value"],
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "1",
    platform: "",
    deliveryType: "instant" as "instant" | "manual",
    deliveryData: "",
  });

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "payouts" | "api">("overview");
  const [showApiKey, setShowApiKey] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.vendorProducts.useQuery();
  const { data: apiKeys, refetch: refetchKeys } = trpc.apiKeys.list.useQuery();
  const { data: payouts, refetch: refetchPayouts } = trpc.payouts.list.useQuery();

  const createApiKeyMutation = trpc.apiKeys.create.useMutation({
    onSuccess: () => { toast.success("API key created!"); refetchKeys(); },
    onError: (err) => toast.error(err.message),
  });
  const revokeApiKeyMutation = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => { toast.success("API key revoked"); refetchKeys(); },
    onError: (err) => toast.error(err.message),
  });
  const requestPayoutMutation = trpc.payouts.request.useMutation({
    onSuccess: () => { toast.success("Payout request submitted!"); setPayoutAmount(""); refetchPayouts(); },
    onError: (err) => toast.error(err.message),
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      setShowForm(false);
      setForm({ category: "social_media_accounts", title: "", description: "", price: "", originalPrice: "", stock: "1", platform: "", deliveryType: "instant", deliveryData: "" });
      utils.products.vendorProducts.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const aiDescMutation = trpc.ai.generateDescription.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, description: data.description }));
      toast.success("AI description generated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product removed");
      utils.products.vendorProducts.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return null;
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  if (user?.role !== "vendor" && user?.role !== "admin") {
    return (
      <DashboardShell title="Vendor Dashboard">
        <div className="glass-card rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Vendor Access Required</h3>
          <p className="text-sm text-muted-foreground">
            Contact support to upgrade your account to vendor status.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let deliveryData: unknown = undefined;
    if (form.deliveryData) {
      try {
        deliveryData = JSON.parse(form.deliveryData);
      } catch {
        deliveryData = { data: form.deliveryData };
      }
    }
    createMutation.mutate({
      category: form.category,
      title: form.title,
      description: form.description || undefined,
      price: form.price,
      originalPrice: form.originalPrice || undefined,
      stock: parseInt(form.stock),
      platform: form.platform || undefined,
      deliveryType: form.deliveryType,
      deliveryData,
    });
  };

  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    active: { icon: CheckCircle, color: "text-emerald-400", label: "Active" },
    pending: { icon: Clock, color: "text-yellow-400", label: "Pending Review" },
    inactive: { icon: XCircle, color: "text-red-400", label: "Inactive" },
    rejected: { icon: XCircle, color: "text-red-400", label: "Rejected" },
  };

  const totalRevenue = products?.reduce((sum, p) => sum + (p.totalSold ?? 0) * parseFloat(p.price), 0) ?? 0;
  const totalSold = products?.reduce((sum, p) => sum + (p.totalSold ?? 0), 0) ?? 0;
  const avgRating = products?.filter(p => p.avgRating).reduce((sum, p, _, arr) => sum + Number(p.avgRating ?? 0) / arr.length, 0) ?? 0;

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "payouts", label: "Payouts", icon: CreditCard },
    { id: "api", label: "API Keys", icon: Key },
  ] as const;

  return (
    <DashboardShell title="Vendor Dashboard" subtitle="Manage your products, payouts, and API access.">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: "Total Products", value: products?.length ?? 0, color: "text-violet-400" },
              { icon: CheckCircle, label: "Active", value: products?.filter((p) => p.status === "active").length ?? 0, color: "text-emerald-400" },
              { icon: ShoppingCart, label: "Total Sold", value: totalSold, color: "text-cyan-400" },
              { icon: DollarSign, label: "Est. Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-yellow-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-card rounded-2xl p-4">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          {/* Reputation */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" />Vendor Reputation</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-foreground">Verified Vendor</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-foreground">Instant Delivery</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">Enabled</span>
                </div>
              </div>
            </div>
          </div>
          {/* Recent products summary */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-400" />Top Performing Products</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {(products ?? []).sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0)).slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground truncate max-w-[200px]">{p.title}</span>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-emerald-400 font-medium">${parseFloat(p.price).toFixed(2)}</span>
                      <span>{p.totalSold ?? 0} sold</span>
                    </div>
                  </div>
                ))}
                {(!products || products.length === 0) && <p className="text-sm text-muted-foreground">No products yet.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
      <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-foreground">My Products</h2>
        <Button
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Add product form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4">New Product</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none focus:border-primary/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-background">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Platform</label>
                <Input
                  placeholder="e.g. Instagram, Netflix"
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input
                placeholder="Product title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">Description</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!form.title) return toast.error("Enter a product title first");
                    aiDescMutation.mutate({ title: form.title, category: form.category, platform: form.platform });
                  }}
                  disabled={aiDescMutation.isPending}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/20 transition-colors disabled:opacity-50"
                >
                  <Wand2 className={`w-3 h-3 ${aiDescMutation.isPending ? "animate-spin" : ""}`} />
                  {aiDescMutation.isPending ? "Generating..." : "AI Generate"}
                </button>
              </div>
              <textarea
                placeholder="Product description..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="9.99"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Original Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="19.99"
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stock *</label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  required
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Delivery Data (JSON — will be shown to buyer after purchase)
              </label>
              <textarea
                placeholder='{"username": "...", "password": "...", "email": "..."}'
                value={form.deliveryData}
                onChange={(e) => setForm((f) => ({ ...f, deliveryData: e.target.value }))}
                rows={3}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 py-2 font-mono focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-20 animate-shimmer" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
          <p className="text-sm text-muted-foreground">Add your first product to start selling</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const config = statusConfig[product.status] ?? statusConfig.pending;
            const Icon = config.icon;
            return (
              <div key={product.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{product.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      product.status === "active" ? "badge-success" :
                      product.status === "pending" ? "badge-warning" : "badge-warning"
                    }`}>
                      <Icon className={`w-3 h-3 ${config.color}`} />
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />${product.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />Stock: {product.stock}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />Sold: {product.totalSold ?? 0}
                    </span>
                    {product.avgRating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />{product.avgRating}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                  onClick={() => deleteMutation.mutate({ id: product.id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-violet-400" />Request Payout</h3>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Amount ($)"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="bg-white/5 border-white/10 max-w-[200px]"
              />
              <Button
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
                disabled={requestPayoutMutation.isPending || !payoutAmount}
                onClick={() => requestPayoutMutation.mutate({ amount: payoutAmount, method: "bank", destination: "bank_account" })}
              >
                {requestPayoutMutation.isPending ? "Requesting..." : "Request Payout"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minimum payout: $10. Processed within 3-5 business days.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Payout History</h3>
            {!payouts || payouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payout requests yet.</p>
            ) : (
              <div className="space-y-3">
                {payouts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="text-sm font-medium text-foreground">${p.amount}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                      p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Key className="w-4 h-4 text-violet-400" />API Keys</h3>
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-8"
                onClick={() => createApiKeyMutation.mutate({ label: `Key ${(apiKeys?.length ?? 0) + 1}` })}
                disabled={createApiKeyMutation.isPending}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {createApiKeyMutation.isPending ? "Creating..." : "New Key"}
              </Button>
            </div>
            {!apiKeys || apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No API keys yet. Create one to integrate with external systems.</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((k: any) => (
                  <div key={k.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <Key className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{k.name}</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {showApiKey ? k.key : `${k.key?.substring(0, 8)}${'•'.repeat(24)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowApiKey(!showApiKey)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied!"); }} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => revokeApiKeyMutation.mutate({ id: k.id })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">API Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">Use your API key to integrate Buznify services into your own applications.</p>
            <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-emerald-400">
              <p className="text-muted-foreground mb-1"># Example: Place an order via API</p>
              <p>POST https://api.buznify.com/v1/orders</p>
              <p>Authorization: Bearer YOUR_API_KEY</p>
              <p>{'{"service_id": 1, "quantity": 1000, "link": "..."}'}</p>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
