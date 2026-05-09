import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, ShoppingCart, Wallet, LayoutDashboard, TrendingUp, Sun, Moon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

const PUBLIC_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/marketplace", icon: ShoppingBag, label: "Market" },
  { href: "/growth", icon: TrendingUp, label: "Growth" },
];

const AUTH_ITEMS = [
  { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Account" },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Hide on auth/admin pages where bottom nav would conflict
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/admin"];
  if (hiddenPaths.some(p => location.startsWith(p))) return null;

  const items = isAuthenticated
    ? [...PUBLIC_ITEMS.slice(0, 2), ...AUTH_ITEMS]
    : PUBLIC_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur backdrop — theme-aware */}
      <div className="absolute inset-0 dark:bg-[#0a0a14]/90 bg-white/90 backdrop-blur-xl border-t border-border" />
      <div className="relative flex items-center justify-around px-1 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/"
              ? location === "/"
              : location === href || location.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <button
                className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-primary/10" />
                )}
                <Icon className={`relative w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className="relative text-[10px] font-medium leading-none">{label}</span>
              </button>
            </Link>
          );
        })}

        {/* Theme toggle */}
        {toggleTheme && (
          <button
            onClick={toggleTheme}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[52px] text-muted-foreground hover:text-foreground"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark"
              ? <Sun className="w-5 h-5" />
              : <Moon className="w-5 h-5" />
            }
            <span className="text-[10px] font-medium leading-none">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
