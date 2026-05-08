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
} from "lucide-react";

type Tab = "overview" | "users" | "products" | "orders" | "coupons" | "announcements" | "fraud";

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

  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: allUsers } = trpc.admin.getUsers.useQuery(undefined, { enabled: tab === "users" });
  const { data: allProducts } = trpc.admin.getProducts.useQuery(undefined, { enabled: tab === "products" });
  const { data: allOrders } = trpc.admin.getOrders.useQuery(undefined, { enabled: tab === "orders" });
  const { data: coupons } = trpc.coupons.list.useQuery(undefined, { enabled: tab === "coupons" });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); utils.admin.getUsers.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

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

  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", type: "info" as "info" | "warning" | "success" });
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Platform Maintenance", message: "Scheduled maintenance on Sunday 2AM UTC. Expect 30 min downtime.", type: "warning", time: "2 hours ago", active: true },
    { id: 2, title: "New Payment Methods Added", message: "We now accept USDT and BNB for wallet top-ups!", type: "success", time: "1 day ago", active: true },
  ]);
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
    { value: "announcements", label: "Announcements", icon: Megaphone },
    { value: "fraud", label: "Fraud Detection", icon: AlertTriangle },
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
                      u.role === "admin" ? "badge-purple" : u.role === "vendor" ? "badge-success" : "glass"
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
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Product Management</h2>
          {!allProducts || allProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No products yet. Click "Seed Demo Data" to add sample products.</p>
          ) : (
            <div className="space-y-2">
              {allProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">${p.price} · Stock: {p.stock} · {p.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "active" ? "badge-success" :
                      p.status === "pending" ? "badge-warning" : "badge-warning"
                    }`}>
                      {p.status}
                    </span>
                    {p.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 border-0"
                          onClick={() => approveProductMutation.mutate({ id: p.id })}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 w-7 p-0 bg-red-600 hover:bg-red-500 border-0"
                          onClick={() => rejectProductMutation.mutate({ id: p.id })}
                        >
                          <XCircle className="w-3.5 h-3.5" />
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
    </DashboardShell>
  );
}
