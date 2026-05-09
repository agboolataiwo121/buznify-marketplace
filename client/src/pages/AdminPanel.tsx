import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  XCircle,
  Shield,
  TrendingUp,
  RefreshCw,
  Tag,
  Plus,
  Megaphone,
  AlertTriangle,
  Trash2,
  CreditCard,
  RotateCcw,
  Activity,
  Edit2,
  X,
  ImageIcon,
  Star,
  Search,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart,
} from "recharts";

type Tab = "overview" | "users" | "products" | "orders" | "coupons" | "vendors" | "announcements" | "fraud" | "refunds" | "payouts";

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    usageLimit: "100",
    expiresAt: "",
  });

  const [chartDays, setChartDays] = useState<7 | 14 | 30>(30);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", type: "info" as "info" | "warning" | "success" });
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Platform Maintenance", message: "Scheduled maintenance on Sunday 2AM UTC. Expect 30 min downtime.", type: "warning", time: "2 hours ago", active: true },
    { id: 2, title: "New Payment Methods Added", message: "We now accept USDT and BNB for wallet top-ups!", type: "success", time: "1 day ago", active: true },
  ]);
  // ── Bulk selection state ─────────────────────────────────────────────────
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [bulkEditModal, setBulkEditModal] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    status: "" as "" | "active" | "inactive" | "pending" | "rejected",
    category: "" as "" | "social_media_accounts" | "streaming_accounts" | "gaming_accounts" | "virtual_numbers" | "growth_services",
    priceAdjType: "" as "" | "set" | "increase_pct" | "decrease_pct" | "increase_fixed" | "decrease_fixed",
    priceAdjValue: "",
    stock: "",
    featured: "" as "" | "true" | "false",
  });

  // ── Product filter/sort state ─────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<"all" | "social_media_accounts" | "streaming_accounts" | "gaming_accounts" | "virtual_numbers" | "growth_services">("all");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "inactive" | "pending" | "rejected">("all");
  const [productSort, setProductSort] = useState<"newest" | "oldest" | "price_high" | "price_low" | "stock_high" | "stock_low">("newest");

  // ── Product modal state ──────────────────────────────────────────────────
  const [productModal, setProductModal] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<NonNullable<typeof allProducts>[number] | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "social_media_accounts" as "social_media_accounts" | "streaming_accounts" | "gaming_accounts" | "virtual_numbers" | "growth_services",
    platform: "",
    price: "",
    originalPrice: "",
    stock: "1",
    imageUrl: "",
    deliveryType: "instant" as "instant" | "manual",
    deliveryData: "",
    featured: false,
    status: "active" as "active" | "inactive" | "pending" | "rejected",
  });

  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: revenueChart } = trpc.admin.getRevenueChart.useQuery({ days: chartDays }, { enabled: tab === "overview" });
  const { data: userGrowthChart } = trpc.admin.getUserGrowthChart.useQuery({ days: chartDays }, { enabled: tab === "overview" });
  const { data: allUsers } = trpc.admin.getUsers.useQuery(undefined, { enabled: tab === "users" });
  const { data: allProducts } = trpc.admin.getProducts.useQuery(undefined, { enabled: tab === "products" });
  const { data: allOrders } = trpc.admin.getOrders.useQuery(undefined, { enabled: tab === "orders" });
  const { data: coupons } = trpc.coupons.list.useQuery(undefined, { enabled: tab === "coupons" });
  const { data: allRefunds } = trpc.refunds.adminList.useQuery(undefined, { enabled: tab === "refunds" });
  const { data: allPayouts } = trpc.payouts.adminList.useQuery(undefined, { enabled: tab === "payouts" });

  const updateRefundMutation = trpc.refunds.adminProcess.useMutation({
    onSuccess: () => { toast.success("Refund status updated"); utils.refunds.adminList.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });
  const updatePayoutMutation = trpc.payouts.adminProcess.useMutation({
    onSuccess: () => { toast.success("Payout status updated"); utils.payouts.adminList.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); utils.admin.getUsers.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      utils.admin.getProducts.invalidate();
      setProductModal(null);
      resetProductForm();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.admin.getProducts.invalidate();
      setProductModal(null);
      setEditingProduct(null);
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      utils.admin.getProducts.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const bulkUpdateMutation = trpc.products.bulkUpdate.useMutation({
    onSuccess: (data) => {
      toast.success(`Updated ${data.updated} product${data.updated !== 1 ? 's' : ''}`);
      utils.admin.getProducts.invalidate();
      setBulkEditModal(false);
      setSelectedProductIds(new Set());
      setBulkForm({ status: "", category: "", priceAdjType: "", priceAdjValue: "", stock: "", featured: "" });
    },
    onError: (err) => toast.error(err.message),
  });
  const bulkDeleteMutation = trpc.products.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} product${data.deleted !== 1 ? 's' : ''}`);
      utils.admin.getProducts.invalidate();
      setBulkDeleteConfirm(false);
      setSelectedProductIds(new Set());
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBulkUpdate = () => {
    const ids = Array.from(selectedProductIds);
    const updates: Parameters<typeof bulkUpdateMutation.mutate>[0]['updates'] = {};
    if (bulkForm.status) updates.status = bulkForm.status;
    if (bulkForm.category) updates.category = bulkForm.category;
    if (bulkForm.featured !== "") updates.featured = bulkForm.featured === "true";
    if (bulkForm.stock !== "") updates.stock = parseInt(bulkForm.stock) || 0;
    if (bulkForm.priceAdjType && bulkForm.priceAdjValue) {
      updates.priceAdjustment = { type: bulkForm.priceAdjType as any, value: parseFloat(bulkForm.priceAdjValue) || 0 };
    }
    if (Object.keys(updates).length === 0) { toast.error("Select at least one field to update"); return; }
    bulkUpdateMutation.mutate({ ids, updates });
  };

  const resetProductForm = () => setProductForm({
    title: "", description: "", category: "social_media_accounts", platform: "",
    price: "", originalPrice: "", stock: "1", imageUrl: "", deliveryType: "instant",
    deliveryData: "", featured: false, status: "active",
  });

  const openEditProduct = (p: NonNullable<typeof allProducts>[number]) => {
    setEditingProduct(p as any);
    setProductForm({
      title: p.title,
      description: p.description ?? "",
      category: p.category as any,
      platform: p.platform ?? "",
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      stock: String(p.stock),
      imageUrl: p.imageUrl ?? "",
      deliveryType: p.deliveryType as "instant" | "manual",
      deliveryData: p.deliveryData ? JSON.stringify(p.deliveryData, null, 2) : "",
      featured: p.featured,
      status: p.status as any,
    });
    setProductModal("edit");
  };

  const handleProductSubmit = () => {
    let parsedDeliveryData: unknown = undefined;
    if (productForm.deliveryData.trim()) {
      try { parsedDeliveryData = JSON.parse(productForm.deliveryData); }
      catch { toast.error("Delivery Data must be valid JSON"); return; }
    }
    const payload = {
      title: productForm.title,
      description: productForm.description || undefined,
      category: productForm.category,
      platform: productForm.platform || undefined,
      price: productForm.price,
      originalPrice: productForm.originalPrice || undefined,
      stock: parseInt(productForm.stock) || 0,
      imageUrl: productForm.imageUrl || undefined,
      deliveryType: productForm.deliveryType,
      deliveryData: parsedDeliveryData,
      featured: productForm.featured,
      status: productForm.status,
    };
    if (productModal === "add") {
      createProductMutation.mutate(payload);
    } else if (productModal === "edit" && editingProduct) {
      updateProductMutation.mutate({ id: (editingProduct as any).id, ...payload });
    }
  };

  const approveProductMutation = trpc.admin.approveProduct.useMutation({
    onSuccess: () => { toast.success("Product approved"); utils.admin.getProducts.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const rejectProductMutation = trpc.admin.rejectProduct.useMutation({
    onSuccess: () => { toast.success("Product rejected"); utils.admin.getProducts.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const seedMutation = trpc.admin.seedDemo.useMutation({
    onSuccess: () => toast.success("Demo data seeded!"),
    onError: (err) => toast.error(err.message),
  });


  const createCouponMutation = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Coupon created!");
      setCouponForm({ code: "", discountType: "percentage", discountValue: "", usageLimit: "100", expiresAt: "" });
      utils.coupons.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return null;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }
  if (user?.role !== "admin") {
    return (
      <DashboardShell title="Admin Panel">
        <div className="glass-card rounded-2xl p-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Admin Access Required</h3>
          <p className="text-sm text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardShell>
    );
  }

  const FRAUD_FLAGS = [
    { user: "user_4821", email: "test@tempmail.com", reason: "Multiple failed payment attempts", risk: "high", time: "5 min ago" },
    { user: "user_2934", email: "buyer@guerrillamail.com", reason: "Disposable email domain", risk: "medium", time: "1 hour ago" },
    { user: "user_7103", email: "bulk@protonmail.com", reason: "Bulk order pattern detected", risk: "medium", time: "3 hours ago" },
    { user: "user_5512", email: "reseller@mailinator.com", reason: "Account created < 1 min before purchase", risk: "high", time: "Yesterday" },
  ];
  const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: "overview", label: "Overview", icon: TrendingUp },
    { value: "users", label: "Users", icon: Users },
    { value: "products", label: "Products", icon: Package },
    { value: "orders", label: "Orders", icon: ShoppingCart },
    { value: "coupons", label: "Coupons", icon: Tag },
    { value: "vendors", label: "Vendor Approvals", icon: Shield },
    { value: "announcements", label: "Announcements", icon: Megaphone },
    { value: "fraud", label: "Fraud Detection", icon: AlertTriangle },
    { value: "refunds", label: "Refunds", icon: RotateCcw },
    { value: "payouts", label: "Payouts", icon: CreditCard },
  ];

  return (
    <DashboardShell title="Admin Panel" subtitle="Platform management and analytics.">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 h-9 ml-auto"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          Seed Demo Data
        </Button>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Total Users", value: stats?.users ?? 0, color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/10" },
              { icon: ShoppingCart, label: "Total Orders", value: stats?.orders ?? 0, color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-500/10" },
              { icon: Package, label: "Products", value: stats?.products ?? 0, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10" },
              { icon: DollarSign, label: "Revenue", value: `$${stats?.revenue ?? "0.00"}`, color: "text-yellow-400", bg: "from-yellow-500/10 to-orange-500/10" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`glass-card rounded-2xl p-4 bg-gradient-to-br ${bg}`}>
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Recent Orders</h2>
            {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {(stats.recentOrders as any[]).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        User #{order.userId} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${order.totalAmount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "completed" ? "badge-success" : "badge-warning"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">User Management</h2>
          {!allUsers || allUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No users yet</p>
          ) : (
            <div className="space-y-2">
              {allUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                      {u.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === "admin" ? "badge-purple" : false ? "badge-success" : "glass"
                    }`}>
                      {u.role}
                    </span>
                    <select
                      value={u.role}
                      onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                      className="h-7 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground px-2 focus:outline-none"
                    >
                      <option value="user" className="bg-background">User</option>
                      <option value="vendor" className="bg-background">Vendor</option>
                      <option value="admin" className="bg-background">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products */}
      {tab === "products" && (
        <div className="space-y-4">
          {/* Header + Add button */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Product Management</h2>
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 border-0 gap-1.5"
              onClick={() => { resetProductForm(); setProductModal("add"); }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </Button>
          </div>

          {/* Filter + Sort bar */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            {/* Row 1: Search + Sort + Clear */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search by title or platform…"
                  className="pl-8 h-8 text-xs bg-white/5 border-white/10"
                />
              </div>
              <select
                value={productSort}
                onChange={e => setProductSort(e.target.value as typeof productSort)}
                className="h-8 text-xs bg-[#0f0f1a] border border-white/10 rounded-md px-2 text-foreground cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_high">Price: High → Low</option>
                <option value="price_low">Price: Low → High</option>
                <option value="stock_high">Stock: High → Low</option>
                <option value="stock_low">Stock: Low → High</option>
              </select>
              {(productSearch || productCategoryFilter !== "all" || productStatusFilter !== "all" || productSort !== "newest") && (
                <button
                  onClick={() => { setProductSearch(""); setProductCategoryFilter("all"); setProductStatusFilter("all"); setProductSort("newest"); }}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-white/10 rounded-md flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
            {/* Row 2: Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "social_media_accounts", "streaming_accounts", "gaming_accounts", "virtual_numbers", "growth_services"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    productCategoryFilter === cat
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </button>
              ))}
            </div>
            {/* Row 3: Status pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-muted-foreground">Status:</span>
              {(["all", "active", "inactive", "pending", "rejected"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setProductStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    productStatusFilter === st
                      ? st === "active" ? "bg-emerald-600 border-emerald-500 text-white"
                        : st === "pending" ? "bg-amber-600 border-amber-500 text-white"
                        : st === "rejected" ? "bg-red-600 border-red-500 text-white"
                        : st === "inactive" ? "bg-white/20 border-white/20 text-white"
                        : "bg-violet-600 border-violet-500 text-white"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered + sorted product list */}
          {(() => {
            const filtered = (allProducts ?? []).filter(p => {
              const matchSearch = !productSearch ||
                p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.platform ?? "").toLowerCase().includes(productSearch.toLowerCase());
              const matchCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
              const matchStatus = productStatusFilter === "all" || p.status === productStatusFilter;
              return matchSearch && matchCat && matchStatus;
            }).sort((a, b) => {
              if (productSort === "newest") return b.id - a.id;
              if (productSort === "oldest") return a.id - b.id;
              if (productSort === "price_high") return Number(b.price) - Number(a.price);
              if (productSort === "price_low") return Number(a.price) - Number(b.price);
              if (productSort === "stock_high") return (b.stock ?? 0) - (a.stock ?? 0);
              if (productSort === "stock_low") return (a.stock ?? 0) - (b.stock ?? 0);
              return 0;
            });
            return (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Select-all checkbox */}
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-violet-500 cursor-pointer"
                  checked={filtered.length > 0 && filtered.every(p => selectedProductIds.has(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(new Set(filtered.map(p => p.id)));
                    } else {
                      setSelectedProductIds(new Set());
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filtered.length}</span> of{" "}
                  <span className="text-foreground font-medium">{allProducts?.length ?? 0}</span> products
                  {selectedProductIds.size > 0 && (
                    <span className="ml-2 text-violet-400 font-medium">· {selectedProductIds.size} selected</span>
                  )}
                </p>
              </div>
              {/* Bulk action toolbar */}
              {selectedProductIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-500 border-0 gap-1"
                    onClick={() => setBulkEditModal(true)}>
                    <Edit2 className="w-3 h-3" /> Edit Selected
                  </Button>
                  <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-500 border-0 gap-1"
                    onClick={() => setBulkDeleteConfirm(true)}>
                    <Trash2 className="w-3 h-3" /> Delete Selected
                  </Button>
                  <button className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground border border-white/10 rounded-md transition-colors"
                    onClick={() => setSelectedProductIds(new Set())}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  {!allProducts || allProducts.length === 0 ? "No products yet." : "No products match your filters."}
                </p>
                {(!allProducts || allProducts.length === 0) && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { resetProductForm(); setProductModal("add"); }}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add your first product
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((p) => (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    selectedProductIds.has(p.id)
                      ? "bg-violet-600/10 border-violet-500/30"
                      : "bg-white/5 border-white/5 hover:bg-white/8"
                  }`}>
                    {/* Row checkbox */}
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-violet-500 cursor-pointer flex-shrink-0"
                      checked={selectedProductIds.has(p.id)}
                      onChange={(e) => {
                        setSelectedProductIds(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(p.id); else next.delete(p.id);
                          return next;
                        });
                      }}
                    />
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                        : <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                        {p.featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${p.price}{p.originalPrice ? <span className="line-through ml-1 opacity-50">${p.originalPrice}</span> : null}
                        {" · "}Stock: {p.stock}
                        {" · "}{p.category.replace(/_/g, " ")}
                        {p.platform ? ` · ${p.platform}` : ""}
                      </p>
                    </div>
                    {/* Status + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === "active" ? "badge-success" :
                        p.status === "pending" ? "badge-warning" :
                        p.status === "inactive" ? "bg-white/10 text-muted-foreground" : "badge-error"
                      }`}>
                        {p.status}
                      </span>
                      {p.status === "pending" && (
                        <>
                          <Button size="sm" className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 border-0"
                            onClick={() => approveProductMutation.mutate({ id: p.id })}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" className="h-7 w-7 p-0 bg-red-600 hover:bg-red-500 border-0"
                            onClick={() => rejectProductMutation.mutate({ id: p.id })}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-violet-400"
                        onClick={() => openEditProduct(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-red-400"
                        onClick={() => setDeleteConfirmId(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            );
          })()}

          {/* Add / Edit Product Modal */}
          {productModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-foreground">
                    {productModal === "add" ? "Add New Product" : "Edit Product"}
                  </h3>
                  <button onClick={() => { setProductModal(null); setEditingProduct(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Title *</label>
                    <Input value={productForm.title} onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Instagram 10K Followers Account" className="bg-white/5 border-white/10 text-sm" />
                  </div>
                  {/* Category + Platform */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Category *</label>
                      <select value={productForm.category}
                        onChange={e => setProductForm(f => ({ ...f, category: e.target.value as typeof f.category }))}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                        <option value="social_media_accounts">Social Media Accounts</option>
                        <option value="streaming_accounts">Streaming Accounts</option>
                        <option value="gaming_accounts">Gaming Accounts</option>
                        <option value="virtual_numbers">Virtual Numbers</option>
                        <option value="growth_services">Growth Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Platform</label>
                      <Input value={productForm.platform} onChange={e => setProductForm(f => ({ ...f, platform: e.target.value }))}
                        placeholder="e.g. Instagram, Netflix" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                  </div>
                  {/* Price + Original Price + Stock */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Price (USD) *</label>
                      <Input type="number" step="0.01" min="0" value={productForm.price}
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="9.99" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Original Price</label>
                      <Input type="number" step="0.01" min="0" value={productForm.originalPrice}
                        onChange={e => setProductForm(f => ({ ...f, originalPrice: e.target.value }))}
                        placeholder="14.99" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Stock *</label>
                      <Input type="number" min="0" value={productForm.stock}
                        onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                        placeholder="100" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                    <textarea value={productForm.description}
                      onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the product, what's included, warranty, etc."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  {/* Image URL */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Image URL</label>
                    <Input value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..." className="bg-white/5 border-white/10 text-sm" />
                  </div>
                  {/* Delivery Type + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Delivery Type</label>
                      <select value={productForm.deliveryType}
                        onChange={e => setProductForm(f => ({ ...f, deliveryType: e.target.value as "instant" | "manual" }))}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                        <option value="instant">Instant</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                      <select value={productForm.status}
                        onChange={e => setProductForm(f => ({ ...f, status: e.target.value as typeof f.status }))}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  {/* Delivery Data (JSON) */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      Delivery Data <span className="opacity-60">(JSON — account credentials, download links, etc.)</span>
                    </label>
                    <textarea value={productForm.deliveryData}
                      onChange={e => setProductForm(f => ({ ...f, deliveryData: e.target.value }))}
                      placeholder={'{ "email": "user@example.com", "password": "pass123" }'}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-foreground font-mono resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  {/* Featured toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={productForm.featured}
                      onChange={e => setProductForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-violet-500" />
                    <span className="text-sm text-foreground">Featured product <span className="text-xs text-muted-foreground">(shown prominently on marketplace)</span></span>
                  </label>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
                  <Button variant="ghost" size="sm" onClick={() => { setProductModal(null); setEditingProduct(null); }}>
                    Cancel
                  </Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 border-0"
                    disabled={!productForm.title || !productForm.price || createProductMutation.isPending || updateProductMutation.isPending}
                    onClick={handleProductSubmit}>
                    {(createProductMutation.isPending || updateProductMutation.isPending)
                      ? "Saving…"
                      : productModal === "add" ? "Create Product" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Delete Product?</h3>
                <p className="text-xs text-muted-foreground mb-5">This action cannot be undone. The product will be permanently removed.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500 border-0"
                    disabled={deleteProductMutation.isPending}
                    onClick={() => deleteProductMutation.mutate({ id: deleteConfirmId })}>
                    {deleteProductMutation.isPending ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Edit Modal */}
          {bulkEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Bulk Edit Products</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected — only filled fields will be updated</p>
                  </div>
                  <button onClick={() => setBulkEditModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {/* Status */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Status <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <select value={bulkForm.status}
                      onChange={e => setBulkForm(f => ({ ...f, status: e.target.value as typeof f.status }))}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                      <option value="">-- No change --</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {/* Category */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Category <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <select value={bulkForm.category}
                      onChange={e => setBulkForm(f => ({ ...f, category: e.target.value as typeof f.category }))}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                      <option value="">-- No change --</option>
                      <option value="social_media_accounts">Social Media Accounts</option>
                      <option value="streaming_accounts">Streaming Accounts</option>
                      <option value="gaming_accounts">Gaming Accounts</option>
                      <option value="virtual_numbers">Virtual Numbers</option>
                      <option value="growth_services">Growth Services</option>
                    </select>
                  </div>
                  {/* Price Adjustment */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Price Adjustment <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <div className="flex gap-2">
                      <select value={bulkForm.priceAdjType}
                        onChange={e => setBulkForm(f => ({ ...f, priceAdjType: e.target.value as typeof f.priceAdjType }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                        <option value="">-- No change --</option>
                        <option value="set">Set to exact value</option>
                        <option value="increase_pct">Increase by %</option>
                        <option value="decrease_pct">Decrease by %</option>
                        <option value="increase_fixed">Increase by $</option>
                        <option value="decrease_fixed">Decrease by $</option>
                      </select>
                      {bulkForm.priceAdjType && (
                        <Input
                          type="number" step="0.01" min="0"
                          value={bulkForm.priceAdjValue}
                          onChange={e => setBulkForm(f => ({ ...f, priceAdjValue: e.target.value }))}
                          placeholder={bulkForm.priceAdjType.includes('pct') ? '10' : '2.00'}
                          className="w-28 bg-white/5 border-white/10 text-sm"
                        />
                      )}
                    </div>
                  </div>
                  {/* Stock */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Set Stock <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <Input
                      type="number" min="0"
                      value={bulkForm.stock}
                      onChange={e => setBulkForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="e.g. 100"
                      className="bg-white/5 border-white/10 text-sm"
                    />
                  </div>
                  {/* Featured */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Featured <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <select value={bulkForm.featured}
                      onChange={e => setBulkForm(f => ({ ...f, featured: e.target.value as typeof f.featured }))}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                      <option value="">-- No change --</option>
                      <option value="true">Featured (Yes)</option>
                      <option value="false">Not Featured (No)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
                  <Button variant="ghost" size="sm" onClick={() => setBulkEditModal(false)}>Cancel</Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 border-0"
                    disabled={bulkUpdateMutation.isPending}
                    onClick={handleBulkUpdate}>
                    {bulkUpdateMutation.isPending ? "Updating…" : `Update ${selectedProductIds.size} Product${selectedProductIds.size !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Delete Confirmation Modal */}
          {bulkDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Delete {selectedProductIds.size} Product{selectedProductIds.size !== 1 ? 's' : ''}?</h3>
                <p className="text-xs text-muted-foreground mb-5">This action cannot be undone. All selected products will be permanently removed.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500 border-0"
                    disabled={bulkDeleteMutation.isPending}
                    onClick={() => bulkDeleteMutation.mutate({ ids: Array.from(selectedProductIds) })}>
                    {bulkDeleteMutation.isPending ? "Deleting…" : `Delete ${selectedProductIds.size} Product${selectedProductIds.size !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">All Orders</h2>
          {!allOrders || allOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {allOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      User #{order.userId} · Product #{order.productId} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${order.totalAmount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "completed" ? "badge-success" : "badge-warning"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coupons */}
      {tab === "coupons" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Create Coupon
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Code *</label>
                <Input
                  placeholder="SAVE20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm((f) => ({ ...f, discountType: e.target.value as any }))}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none"
                >
                  <option value="percentage" className="bg-background">Percentage (%)</option>
                  <option value="fixed" className="bg-background">Fixed ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Discount Value *</label>
                <Input
                  type="number"
                  placeholder={couponForm.discountType === "percentage" ? "20" : "5.00"}
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm((f) => ({ ...f, discountValue: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Usage Limit</label>
                <Input
                  type="number"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Expires At</label>
                <Input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9"
                  onClick={() => createCouponMutation.mutate({
                    code: couponForm.code,
                    discountType: couponForm.discountType,
                    discountValue: couponForm.discountValue,
                    usageLimit: parseInt(couponForm.usageLimit),
                    expiresAt: couponForm.expiresAt || undefined,
                  })}
                  disabled={createCouponMutation.isPending || !couponForm.code || !couponForm.discountValue}
                >
                  Create Coupon
                </Button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Active Coupons</h2>
            {!coupons || coupons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No coupons yet</p>
            ) : (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-mono font-bold text-primary">{c.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                        {" · "}{c.usedCount}/{c.usageLimit} used
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "badge-success" : "badge-warning"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Announcements */}
      {tab === "announcements" && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-violet-400" />Create Announcement</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input value={announcementForm.title} onChange={(e) => setAnnouncementForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" className="h-9 bg-white/5 border-white/10 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm(f => ({ ...f, message: e.target.value }))} placeholder="Announcement message..." rows={3} className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <select value={announcementForm.type} onChange={(e) => setAnnouncementForm(f => ({ ...f, type: e.target.value as any }))} className="h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none">
                  <option value="info" className="bg-background">Info</option>
                  <option value="warning" className="bg-background">Warning</option>
                  <option value="success" className="bg-background">Success</option>
                </select>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9" onClick={() => {
                  if (!announcementForm.title || !announcementForm.message) return toast.error("Fill in all fields");
                  setAnnouncements(prev => [{ id: Date.now(), ...announcementForm, time: "Just now", active: true }, ...prev]);
                  setAnnouncementForm({ title: "", message: "", type: "info" });
                  toast.success("Announcement published!");
                }}><Plus className="w-3.5 h-3.5 mr-1.5" />Publish</Button>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Active Announcements</h2>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className={`flex items-start justify-between p-4 rounded-xl border ${ a.type === "warning" ? "bg-yellow-500/5 border-yellow-500/20" : a.type === "success" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20" }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                  </div>
                  <button onClick={() => { setAnnouncements(prev => prev.filter(x => x.id !== a.id)); toast.success("Removed"); }} className="ml-3 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fraud Detection */}
      {tab === "fraud" && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" />Fraud Flags</h2>
            <span className="text-xs badge-warning px-2 py-0.5 rounded-full">{FRAUD_FLAGS.length} flagged</span>
          </div>
          <div className="space-y-3">
            {FRAUD_FLAGS.map(({ user: u, email, reason, risk, time }) => (
              <div key={u} className={`flex items-start justify-between p-4 rounded-xl border ${ risk === "high" ? "bg-red-500/5 border-red-500/20" : "bg-yellow-500/5 border-yellow-500/20" }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ risk === "high" ? "bg-red-500/20" : "bg-yellow-500/20" }`}>
                    <AlertTriangle className={`w-4 h-4 ${ risk === "high" ? "text-red-400" : "text-yellow-400" }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{u}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${ risk === "high" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400" }`}>{risk}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <p className="text-xs text-muted-foreground">{time}</p>
                  <button onClick={() => toast.success(`${u} flagged for review`)} className="text-xs px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors">Block</button>
                  <button onClick={() => toast.success(`${u} cleared`)} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-foreground font-medium transition-colors">Clear</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Vendor Approvals */}
      {tab === "vendors" && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            Vendor Applications
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Promote users to vendor status so they can list products on the marketplace.</p>
        </div>
      )}
      {/* Refunds */}
      {tab === "refunds" && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-400" /> Refund Requests
          </h2>
          {!allRefunds || allRefunds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No refund requests</p>
          ) : (
            <div className="space-y-3">
              {(allRefunds as any[]).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Refund #{r.id} — ${r.amount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.reason?.slice(0, 80)}</p>
                    <p className="text-xs text-muted-foreground">User #{r.userId} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "approved" ? "badge-success" : r.status === "rejected" ? "badge-danger" : "badge-warning"
                    }`}>{r.status}</span>
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                          onClick={() => updateRefundMutation.mutate({ id: r.id, status: "approved" })}
                          disabled={updateRefundMutation.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => updateRefundMutation.mutate({ id: r.id, status: "rejected" })}
                          disabled={updateRefundMutation.isPending}>
                          <XCircle className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payouts */}
      {tab === "payouts" && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" /> Vendor Payout Requests
          </h2>
          {!allPayouts || allPayouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payout requests</p>
          ) : (
            <div className="space-y-3">
              {(allPayouts as any[]).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payout #{p.id} — ${p.amount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Method: {p.method} · To: {p.destination}</p>
                    <p className="text-xs text-muted-foreground">Vendor #{p.vendorId} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "paid" ? "badge-success" : p.status === "rejected" ? "badge-danger" : p.status === "processing" ? "badge-purple" : "badge-warning"
                    }`}>{p.status}</span>
                    {p.status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white border-0"
                          onClick={() => updatePayoutMutation.mutate({ id: p.id, status: "processing" })}
                          disabled={updatePayoutMutation.isPending}>
                          <Activity className="w-3 h-3 mr-1" />Process
                        </Button>
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                          onClick={() => updatePayoutMutation.mutate({ id: p.id, status: "paid" })}
                          disabled={updatePayoutMutation.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" />Mark Paid
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => updatePayoutMutation.mutate({ id: p.id, status: "rejected" })}
                          disabled={updatePayoutMutation.isPending}>
                          <XCircle className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revenue & Analytics Charts in Overview */}
      {tab === "overview" && (
        <div className="space-y-4 mt-6">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-foreground">Analytics</span>
            <div className="ml-auto flex gap-1">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    chartDays === d ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Revenue + Growth Orders combined chart */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Revenue (Marketplace + Growth Services)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenueChart ?? []}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="adminGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor((revenueChart?.length ?? 7) / 7)} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }}
                  formatter={(v: any, name: string) => [`$${Number(v).toFixed(2)}`, name === "revenue" ? "Marketplace" : "Growth"]}
                />
                <Legend formatter={(v) => v === "revenue" ? "Marketplace" : "Growth Services"} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#adminRevGrad)" />
                <Area type="monotone" dataKey="growth" stroke="#06b6d4" strokeWidth={2} fill="url(#adminGrowthGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Orders + User growth side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Daily Orders</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenueChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor((revenueChart?.length ?? 7) / 7)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">New Users</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={userGrowthChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor((userGrowthChart?.length ?? 7) / 7)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
