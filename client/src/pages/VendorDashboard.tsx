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
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  ShoppingCart,
  Star,
  Wand2,
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

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.vendorProducts.useQuery();

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

  return (
    <DashboardShell title="Vendor Dashboard" subtitle="Manage your products and track sales.">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Package, label: "Total Products", value: products?.length ?? 0, color: "text-violet-400" },
          { icon: CheckCircle, label: "Active", value: products?.filter((p) => p.status === "active").length ?? 0, color: "text-emerald-400" },
          { icon: ShoppingCart, label: "Total Sold", value: products?.reduce((sum, p) => sum + (p.totalSold ?? 0), 0) ?? 0, color: "text-cyan-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card rounded-2xl p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Add product button */}
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
    </DashboardShell>
  );
}
