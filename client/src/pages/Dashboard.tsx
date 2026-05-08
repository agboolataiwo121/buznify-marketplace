import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import {
  Wallet,
  ShoppingCart,
  TrendingUp,
  Bell,
  ArrowUpRight,
  Package,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: balance } = trpc.wallet.getBalance.useQuery();
  const { data: orders } = trpc.orders.myOrders.useQuery();
  const { data: notifications } = trpc.notifications.getAll.useQuery();

  const unreadNotifications = notifications?.filter((n) => !n.isRead).length ?? 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "processing").length ?? 0;

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <DashboardShell title="Dashboard" subtitle="Welcome back! Here's your account overview.">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Wallet,
            label: "Balance",
            value: `$${(balance?.balance ?? 0).toFixed(2)}`,
            sub: "Available funds",
            color: "text-violet-400",
            bg: "from-violet-500/10 to-purple-500/10",
            href: "/dashboard/wallet",
          },
          {
            icon: ShoppingCart,
            label: "Total Orders",
            value: orders?.length ?? 0,
            sub: `${completedOrders} completed`,
            color: "text-cyan-400",
            bg: "from-cyan-500/10 to-blue-500/10",
            href: "/dashboard/orders",
          },
          {
            icon: Clock,
            label: "Pending",
            value: pendingOrders,
            sub: "Processing orders",
            color: "text-yellow-400",
            bg: "from-yellow-500/10 to-orange-500/10",
            href: "/dashboard/orders",
          },
          {
            icon: Bell,
            label: "Notifications",
            value: unreadNotifications,
            sub: "Unread messages",
            color: "text-pink-400",
            bg: "from-pink-500/10 to-rose-500/10",
            href: "/dashboard/notifications",
          },
        ].map(({ icon: Icon, label, value, sub, color, bg, href }) => (
          <Link key={label} href={href}>
            <div className={`glass-card-hover rounded-2xl p-4 bg-gradient-to-br ${bg} cursor-pointer`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/marketplace">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Browse Marketplace
            </Button>
          </Link>
          <Link href="/growth">
            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 h-9">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Growth Services
            </Button>
          </Link>
          <Link href="/virtual-numbers">
            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 h-9">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Virtual Numbers
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 h-9">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              Add Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
              View all <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <Link href="/marketplace">
              <Button size="sm" className="mt-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    order.status === "completed" ? "bg-emerald-500/20" : "bg-yellow-500/20"
                  }`}>
                    {order.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${order.totalAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "completed" ? "badge-success" : "badge-warning"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
