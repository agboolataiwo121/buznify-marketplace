import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardShell from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet, ShoppingBag, TrendingUp, MessageSquare, Bell, Users,
  ArrowUpRight, Package, CheckCircle2, Clock, Zap, Gift,
  ChevronRight, Activity, Heart, Shield, Key, DollarSign, BarChart3,
  ShoppingCart
} from "lucide-react";

function StatCard({ label, value, sub, icon, colorClass, href }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; colorClass: string; href?: string;
}) {
  const inner = (
    <div className="glass-card rounded-xl p-4 hover:bg-white/8 transition-all group cursor-pointer h-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        {href && <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-gray-400 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-gray-500 text-xs mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: walletData } = trpc.wallet.getBalance.useQuery();
  const { data: orders = [] } = trpc.orders.myOrders.useQuery();
  const { data: growthOrders = [] } = trpc.growthOrders.list.useQuery();
  const { data: notifications = [] } = trpc.notifications.getAll.useQuery();
  const { data: referralData } = trpc.referrals.getMyReferrals.useQuery();
  const { data: smsMessages = [] } = trpc.virtualNumbers.getSms.useQuery({ numberId: 0 });
  const { data: wishlistItems = [] } = trpc.wishlist.get.useQuery();
  const { data: recentlyViewed = [] } = trpc.recentlyViewed.get.useQuery();
  // AI recommendations: use wishlist/recently-viewed categories as signals
  const recentCategories = (recentlyViewed as any[]).slice(0, 5).map((i: any) => i.product?.category).filter(Boolean);
  const { data: recommendations = [] } = trpc.products.getRecommendations.useQuery(
    { categories: recentCategories, limit: 4 },
    { enabled: true }
  );

  const referrals = referralData?.referrals ?? [];
  const balance = parseFloat(String((walletData as any)?.balance ?? "0"));
  const unreadNotifs = (notifications as any[]).filter((n) => !n.isRead).length;
  const processingOrders = (orders as any[]).filter((o) => o.status === "processing").length;
  const processingGrowth = (growthOrders as any[]).filter((o) => o.status === "processing").length;
  const totalEarnings = (referrals as any[]).reduce((s: number, r: any) => s + parseFloat(r.commission ?? "0"), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardShell title="Dashboard" subtitle="Your complete ecosystem overview">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-violet-900/60 via-purple-900/60 to-indigo-900/60 border border-violet-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{greeting}, {user?.name?.split(" ")[0] ?? "User"} 👋</h2>
              <p className="text-gray-300 text-sm mt-1">Here's your ecosystem overview for today</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadNotifs > 0 && (
                <Link href="/dashboard/notifications">
                  <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-yellow-500/30 transition-colors">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">{unreadNotifs} new alerts</span>
                  </div>
                </Link>
              )}
              <div className="text-right">
                <div className="text-gray-400 text-xs">Wallet Balance</div>
                <div className="text-white font-bold text-lg">${balance.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Wallet Balance" value={`$${balance.toFixed(2)}`}
            icon={<Wallet className="w-4 h-4 text-green-400" />} colorClass="bg-green-500/20"
            href="/dashboard/wallet" />
          <StatCard label="Active Orders" value={processingOrders + processingGrowth}
            sub={`${(orders as any[]).length} total orders`}
            icon={<Package className="w-4 h-4 text-blue-400" />} colorClass="bg-blue-500/20"
            href="/dashboard/orders" />
          <StatCard label="Growth Orders" value={(growthOrders as any[]).length}
            sub={`${processingGrowth} processing`}
            icon={<TrendingUp className="w-4 h-4 text-violet-400" />} colorClass="bg-violet-500/20"
            href="/dashboard/growth-orders" />
          <StatCard label="Referral Earnings" value={`$${totalEarnings.toFixed(2)}`}
            sub={`${(referrals as any[]).length} referrals`}
            icon={<Gift className="w-4 h-4 text-pink-400" />} colorClass="bg-pink-500/20"
            href="/dashboard/referrals" />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Wishlist" value={(wishlistItems as any[]).length}
            icon={<Heart className="w-4 h-4 text-red-400" />} colorClass="bg-red-500/20"
            href="/dashboard/wishlist" />
          <StatCard label="SMS Messages" value={(smsMessages as any[]).length}
            icon={<MessageSquare className="w-4 h-4 text-cyan-400" />} colorClass="bg-cyan-500/20"
            href="/dashboard/sms-inbox" />
          <StatCard label="Notifications" value={unreadNotifs} sub="unread"
            icon={<Bell className="w-4 h-4 text-yellow-400" />} colorClass="bg-yellow-500/20"
            href="/dashboard/notifications" />
          <StatCard label="Referrals" value={(referrals as any[]).length}
            icon={<Users className="w-4 h-4 text-orange-400" />} colorClass="bg-orange-500/20"
            href="/dashboard/referrals" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2 glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                Recent Orders
              </h3>
              <Link href="/dashboard/orders">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs">
                  View all <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            {(orders as any[]).length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No orders yet</p>
                <Link href="/marketplace">
                  <Button size="sm" className="mt-3 bg-gradient-to-r from-violet-600 to-purple-600 text-xs">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(orders as any[]).slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        order.status === "completed" ? "bg-green-400" :
                        order.status === "processing" ? "bg-blue-400 animate-pulse" :
                        order.status === "pending" ? "bg-yellow-400" : "bg-red-400"
                      }`} />
                      <div>
                        <div className="text-white text-sm font-medium">Order #{order.id}</div>
                        <div className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-semibold">${order.totalAmount}</div>
                      <Badge className={`text-xs ${
                        order.status === "completed" ? "bg-green-500/20 text-green-300 border-green-500/30" :
                        order.status === "processing" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">

            {/* Recent SMS */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Recent SMS
                </h3>
                <Link href="/dashboard/sms-inbox">
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs p-1">
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              {(smsMessages as any[]).length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-3">No messages yet</p>
              ) : (
                <div className="space-y-2">
                  {(smsMessages as any[]).slice(0, 3).map((msg) => (
                    <div key={msg.id} className="p-2 bg-white/5 rounded-lg">
                      <div className="text-cyan-300 text-xs font-medium">{msg.sender}</div>
                      <div className="text-gray-300 text-xs truncate">{msg.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Growth Summary */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  Growth Orders
                </h3>
                <Link href="/dashboard/growth-orders">
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs p-1">
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              {(growthOrders as any[]).length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-3">No growth orders yet</p>
              ) : (
                <div className="space-y-2">
                  {(growthOrders as any[]).slice(0, 3).map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white text-xs font-medium">#{o.id}</div>
                        <div className="text-gray-400 text-xs">{o.quantity?.toLocaleString()} units</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        o.status === "completed" ? "bg-green-400" :
                        o.status === "processing" ? "bg-blue-400 animate-pulse" : "bg-yellow-400"
                      }`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Top Up", href: "/dashboard/wallet", icon: <DollarSign className="w-3 h-3" />, col: "text-green-400" },
                  { label: "Buy Growth", href: "/growth", icon: <TrendingUp className="w-3 h-3" />, col: "text-violet-400" },
                  { label: "Get Number", href: "/virtual-numbers", icon: <MessageSquare className="w-3 h-3" />, col: "text-cyan-400" },
                  { label: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="w-3 h-3" />, col: "text-blue-400" },
                  { label: "Support", href: "/support", icon: <Shield className="w-3 h-3" />, col: "text-orange-400" },
                  { label: "Server Keys", href: "/dashboard/server-keys", icon: <Key className="w-3 h-3" />, col: "text-pink-400" },
                ].map((a) => (
                  <Link key={a.label} href={a.href}>
                    <button className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5">
                      <span className={a.col}>{a.icon}</span>
                      {a.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        {(recentlyViewed as any[]).length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                Recently Viewed
              </h3>
              <Link href="/marketplace">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs">
                  Browse more <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(recentlyViewed as any[]).slice(0, 4).map((item) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <Link key={item.id} href={`/product/${p.id}`}>
                    <div className="p-3 bg-white/5 hover:bg-white/8 rounded-lg cursor-pointer transition-colors">
                      <div className="text-white text-xs font-medium line-clamp-2 mb-1">{p.title}</div>
                      <div className="text-violet-400 text-xs font-bold">${p.price}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      {/* AI Recommendations */}
      {(recommendations as any[]).length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <span className="text-violet-400 text-xs">✨</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Recommended For You</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(recommendations as any[]).map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className="p-3 bg-white/5 hover:bg-white/8 rounded-xl cursor-pointer transition-colors border border-white/5 hover:border-violet-500/30">
                  <div className="text-white text-xs font-medium line-clamp-2 mb-1">{p.title}</div>
                  <div className="text-xs text-muted-foreground mb-1.5">{p.platform}</div>
                  <div className="text-violet-400 text-xs font-bold">${p.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </DashboardShell>
  );
}
