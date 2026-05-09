import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Zap,
  ShoppingBag,
  TrendingUp,
  Phone,
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Users,
  Sun,
  Moon,
  Search,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import MobileBottomNav from "@/components/MobileBottomNav";
import SiteAlertBanner from "@/components/SiteAlertBanner";

const navLinks = [
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/growth", label: "Growth Services", icon: TrendingUp },
  { href: "/virtual-numbers", label: "Virtual Numbers", icon: Phone },
  { href: "/support", label: "Support", icon: Shield },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowSearch(false);
  }, [location]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass border-b border-white/8 shadow-xl shadow-black/30 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                <Zap className="relative w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="gradient-text">Buz</span>
                <span className="text-foreground">nify</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location === href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-xs">
              <SearchAutocomplete className="w-full" />
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {/* Theme toggle */}
              {toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 hover:bg-white/5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.name?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                      <span className="text-sm font-medium max-w-24 truncate">{user.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 glass-card border-white/10">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" />Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/wallet" className="flex items-center gap-2 cursor-pointer">
                        <Wallet className="w-4 h-4" />Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="flex items-center gap-2 cursor-pointer">
                        <ShoppingCart className="w-4 h-4" />Orders
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Settings className="w-4 h-4" />Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-white/5"
                    onClick={handleLogin}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25"
                    onClick={handleLogin}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile: search + menu buttons */}
            <div className="md:hidden flex items-center gap-1">
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                onClick={() => { setShowSearch(!showSearch); setIsOpen(false); }}
              >
                {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                onClick={() => { setIsOpen(!isOpen); setShowSearch(false); }}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {showSearch && (
            <div className="md:hidden pb-3 px-1 animate-slide-up">
              <SearchAutocomplete className="w-full" onClose={() => setShowSearch(false)} />
            </div>
          )}

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden glass-card rounded-xl mb-4 p-4 animate-slide-up">
              <div className="flex flex-col gap-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location === href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
                <div className="border-t border-white/5 mt-2 pt-2 flex flex-col gap-2">
                  {/* Theme toggle in mobile */}
                  {toggleTheme && (
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                  )}
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5"
                      >
                        <LayoutDashboard className="w-4 h-4" />Dashboard
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />Sign Out
                      </button>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
                      onClick={handleLogin}
                    >
                      Get Started
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <MobileBottomNav />
      {/* Site-wide alert banner — shown just below the fixed navbar */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <SiteAlertBanner />
      </div>
    </>
  );
}
