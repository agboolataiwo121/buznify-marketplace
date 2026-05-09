import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Users,
  Bell,
  Phone,
  MessageSquare,
  Settings,
  ChevronRight,
  Shield,
  Star,
  Heart,
  TrendingUp,
  RefreshCw,
  DollarSign,
  Key,
  User,
  Menu,
} from "lucide-react";

const userNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/growth-orders", label: "Growth Orders", icon: TrendingUp },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/sms-inbox", label: "SMS Inbox", icon: Phone },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/refunds", label: "Refunds", icon: RefreshCw },
  { href: "/dashboard/payouts", label: "Payouts", icon: DollarSign },
  { href: "/dashboard/server-keys", label: "Server Keys", icon: Key },
  { href: "/dashboard/security", label: "Security", icon: Shield },
  { href: "/dashboard/loyalty", label: "Loyalty Rewards", icon: Star },
  { href: "/support", label: "Support", icon: MessageSquare },
];

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

function SidebarContent({
  user,
  location,
  onNavigate,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null } | null;
  location: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* User card */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Role</span>
            <span className="text-xs badge-purple px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="glass-card rounded-2xl p-2">
        {userNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <>
            <div className="border-t border-white/5 my-2" />
            <Link
              href="/admin"
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                location === "/admin"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>
    </>
  );
}

export default function DashboardShell({ children, title, subtitle }: Props) {
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen pb-mobile-nav md:pb-0">
      <Navbar />
      <div className="container pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <SidebarContent user={user} location={location} />
          </aside>

          {/* Main content */}
          <main>
            {/* Mobile header with drawer trigger */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-white/10 bg-white/5 shrink-0"
                    aria-label="Open navigation"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4 bg-background border-white/10 overflow-y-auto">
                  <div className="pt-2">
                    <SidebarContent
                      user={user}
                      location={location}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
            </div>

            {/* Desktop page header */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>

            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
