import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveOrderPopup from "@/components/LiveOrderPopup";
import {
  Zap,
  ArrowRight,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Phone,
  ShoppingBag,
  Users,
  CheckCircle,
  Gamepad2,
  Tv,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Globe,
  Award,
  Lock,
  Headphones,
  ChevronRight,
  Sparkles,
  Activity,
  CreditCard,
  Bitcoin,
  Wallet,
  RefreshCw,
  Layers,
  BarChart3,
  BadgeCheck,
  Repeat,
  Gift,
  HelpCircle,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: "127,483", label: "Orders Completed" },
  { value: "52K+", label: "Active Users" },
  { value: "4,800+", label: "Available Services" },
  { value: "99.97%", label: "Delivery Rate" },
];

const categories = [
  {
    icon: Instagram,
    label: "Social Media Accounts",
    desc: "Instagram, TikTok, Twitter & more",
    count: "2,400+ products",
    href: "/marketplace?category=social_media",
    color: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-500/20 hover:border-pink-500/40",
    iconColor: "text-pink-400",
  },
  {
    icon: Tv,
    label: "Streaming Accounts",
    desc: "Netflix, Spotify, Disney+ & more",
    count: "850+ products",
    href: "/marketplace?category=streaming",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/20 hover:border-red-500/40",
    iconColor: "text-red-400",
  },
  {
    icon: Gamepad2,
    label: "Gaming Accounts",
    desc: "Valorant, CSGO, FIFA & more",
    count: "1,200+ products",
    href: "/marketplace?category=gaming",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-400",
  },
  {
    icon: Phone,
    label: "Virtual Numbers",
    desc: "SMS verification for any service",
    count: "30+ countries",
    href: "/virtual-numbers",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
  {
    icon: TrendingUp,
    label: "Growth Services",
    desc: "Followers, views, likes & more",
    count: "500+ packages",
    href: "/growth",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20 hover:border-violet-500/40",
    iconColor: "text-violet-400",
  },
];

const whyChoose = [
  {
    icon: Zap,
    title: "Instant Automated Delivery",
    desc: "Orders are fulfilled within seconds of payment. No waiting, no manual processing — pure automation.",
    color: "text-yellow-400",
    bg: "from-yellow-500/10 to-orange-500/10",
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    desc: "Every account and service is manually verified before listing. Bank-grade encryption on all transactions.",
    color: "text-emerald-400",
    bg: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: BadgeCheck,
    title: "Quality Guaranteed",
    desc: "All products come with a satisfaction guarantee. Not happy? We'll replace or refund — no questions asked.",
    color: "text-blue-400",
    bg: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Wallet,
    title: "Wallet & Instant Checkout",
    desc: "Top up your Buznify wallet once and checkout in one click on any product. No re-entering card details.",
    color: "text-violet-400",
    bg: "from-violet-500/10 to-purple-500/10",
  },
  {
    icon: Gift,
    title: "Referral & Rewards",
    desc: "Earn real cash rewards for every friend you refer. Share your link, they buy, you earn — automatically.",
    color: "text-pink-400",
    bg: "from-pink-500/10 to-rose-500/10",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    desc: "Our support team is online around the clock. Submit a ticket and get a response within minutes.",
    color: "text-cyan-400",
    bg: "from-cyan-500/10 to-sky-500/10",
  },
  {
    icon: Repeat,
    title: "Refill Guarantee",
    desc: "Growth service orders come with a refill guarantee. If numbers drop, we top them back up for free.",
    color: "text-orange-400",
    bg: "from-orange-500/10 to-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Vendor Ecosystem",
    desc: "Sell your own digital products on Buznify. Set your price, upload stock, and earn passively 24/7.",
    color: "text-indigo-400",
    bg: "from-indigo-500/10 to-blue-500/10",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    desc: "Virtual numbers from 30+ countries, products from verified vendors worldwide, and multi-currency support.",
    color: "text-teal-400",
    bg: "from-teal-500/10 to-emerald-500/10",
  },
];

const growthPlatforms = [
  { icon: Instagram, name: "Instagram", color: "from-pink-500 to-purple-500" },
  { icon: Youtube, name: "YouTube", color: "from-red-500 to-red-600" },
  { icon: Twitter, name: "Twitter/X", color: "from-sky-400 to-blue-500" },
  { icon: MessageCircle, name: "Telegram", color: "from-blue-400 to-cyan-500" },
  { icon: Activity, name: "TikTok", color: "from-pink-400 to-rose-500" },
  { icon: Users, name: "Facebook", color: "from-blue-600 to-blue-700" },
];

const reviews = [
  {
    name: "Alex Morrison",
    role: "Digital Marketer",
    avatar: "AM",
    rating: 5,
    text: "Buznify is the best marketplace I've used. Instant delivery, verified accounts, and the support team is incredibly responsive. Highly recommended!",
  },
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "SC",
    rating: 5,
    text: "I've been using Buznify for 6 months now. The growth services are real and effective. My Instagram went from 2K to 50K followers in just 3 months.",
  },
  {
    name: "James Okafor",
    role: "E-commerce Entrepreneur",
    avatar: "JO",
    rating: 5,
    text: "The virtual numbers feature is a game changer. I can verify multiple accounts without needing separate SIM cards. Saves me hours every week.",
  },
  {
    name: "Priya Sharma",
    role: "Social Media Manager",
    avatar: "PS",
    rating: 5,
    text: "The platform feels premium and trustworthy. Every account I've purchased has been exactly as described. The wallet system makes repeat purchases super easy.",
  },
];

const trustBadges = [
  { icon: Shield, label: "SSL Secured" },
  { icon: Lock, label: "Encrypted Payments" },
  { icon: CheckCircle, label: "Verified Vendors" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: Award, label: "Money-Back Guarantee" },
  { icon: Zap, label: "Instant Delivery" },
];

const paymentMethods = [
  { label: "Visa", color: "text-blue-400" },
  { label: "Mastercard", color: "text-red-400" },
  { label: "PayPal", color: "text-sky-400" },
  { label: "Bitcoin", color: "text-orange-400" },
  { label: "USDT", color: "text-emerald-400" },
  { label: "Ethereum", color: "text-violet-400" },
];

const faqs = [
  {
    q: "How fast is delivery after payment?",
    a: "Delivery is fully automated and happens within seconds of your payment being confirmed. You'll see your account credentials or service details immediately in your order history and via email notification.",
  },
  {
    q: "Are the accounts and services genuine?",
    a: "Yes. Every product listed on Buznify goes through a manual verification process before it's approved. We only work with trusted vendors who meet our quality standards. All accounts are tagged with condition labels (Fresh, Aged, Verified, PVA) so you know exactly what you're getting.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, PayPal, Bitcoin, USDT (TRC-20 & ERC-20), and Ethereum. You can also top up your Buznify wallet and use it for instant one-click checkout on any product.",
  },
  {
    q: "What happens if my order fails or I receive a wrong product?",
    a: "We offer a full refund or replacement guarantee on all orders. If your delivery fails or the product doesn't match the description, open a support ticket and our team will resolve it within 24 hours — usually much faster.",
  },
  {
    q: "How do virtual numbers work?",
    a: "When you purchase a virtual number, you get a real phone number from your chosen country. Any SMS sent to that number appears in your Buznify SMS inbox in real time (auto-refreshes every 5 seconds). Numbers are active for 24 hours by default.",
  },
  {
    q: "Are growth services safe for my accounts?",
    a: "Our growth services use gradual, natural-looking delivery patterns to minimize any risk to your accounts. We never use bots or fake engagement. All packages come with a refill guarantee if numbers drop.",
  },
  {
    q: "Can I sell my own digital products on Buznify?",
    a: "Yes! Apply to become a vendor from your dashboard. Once approved, you can list digital accounts, services, or any digital product, set your own prices, and earn passively. Buznify handles payments, delivery, and customer support.",
  },
  {
    q: "Is there a referral program?",
    a: "Yes — every user gets a unique referral link. When someone signs up through your link and makes their first purchase, you earn a cash reward credited directly to your Buznify wallet. There's no limit to how much you can earn.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [_openFaq, setOpenFaq] = useState<string | undefined>(undefined);

  const handleCTA = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <LiveOrderPopup />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 cyber-grid opacity-40" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.3 0.12 290 / 0.5), transparent 70%)",
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: "oklch(0.45 0.18 290 / 0.12)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: "oklch(0.45 0.18 200 / 0.10)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        {/* Animated orbs */}
        <div
          className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-violet-400 opacity-60"
          style={{ animation: "float 4s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-50"
          style={{ animation: "float 5s ease-in-out infinite reverse" }}
        />

        <div className="container relative z-10 text-center py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-sm text-violet-300 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>The #1 Digital Products Marketplace</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">Buy Digital Accounts,</span>
            <br />
            <span className="gradient-text">Growth Services &</span>
            <br />
            <span className="text-foreground">Verification Numbers</span>
            <br />
            <span className="gradient-text-purple">Instantly</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Fully automated delivery in seconds. Bank-grade security. Verified sellers only.
            The premium marketplace combining Sellix, SMM Panel, and SMS Activate — in one place.
          </p>

          {/* Trust micro-badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 mb-10 animate-slide-up"
            style={{ animationDelay: "0.25s" }}
          >
            {[
              { icon: Zap, label: "Instant Delivery" },
              { icon: Shield, label: "Escrow Protected" },
              { icon: RefreshCw, label: "Refill Guarantee" },
              { icon: Lock, label: "Encrypted" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground"
              >
                <Icon className="w-3 h-3 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            {isAuthenticated ? (
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30 text-base font-semibold"
                >
                  Browse Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30 text-base font-semibold"
                onClick={handleCTA}
              >
                Start Shopping Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            <Link href="/marketplace">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-foreground text-base"
              >
                Explore Products
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div
            className="flex items-center justify-center gap-6 mt-12 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex -space-x-2">
              {["AM", "SC", "JO", "PS", "KL"].map((initials) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">52,000+</span> customers trust Buznify
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="py-16 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5" />
        <div className="container relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              Product Categories
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need,{" "}
              <span className="gradient-text">In One Place</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse thousands of verified digital products across five major categories, all with instant automated delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(({ icon: Icon, label, desc, count, href, color, border, iconColor }) => (
              <Link key={label} href={href}>
                <div
                  className={`glass-card-hover rounded-2xl p-6 cursor-pointer border ${border} transition-all duration-300`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Buznify ── */}
      <section className="py-24 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-4">
              <Zap className="w-3.5 h-3.5" />
              Why Buznify
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built for <span className="gradient-text">Speed, Trust & Scale</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buznify combines the best of Sellix, PlayerUp, SMS Activate, and an SMM Panel into one premium ecosystem — with a Coinbase-level UI and Stripe-grade security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyChoose.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="glass-card rounded-2xl p-6 group hover:border-white/10 transition-all duration-300">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Growth Services ── */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-violet-500/30 text-xs text-violet-300 mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                Social Media Growth
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5">
                Grow Your Audience{" "}
                <span className="gradient-text">Instantly</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Boost your social media presence with real followers, views, likes, and engagement packages. Choose from hundreds of packages across all major platforms with an instant pricing calculator.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real, high-quality followers and engagement",
                  "Gradual delivery for natural growth",
                  "Packages starting from $0.99",
                  "Refill guarantee on all orders",
                  "Instant pricing calculator — see cost before you buy",
                  "Delivery speed estimate on every package",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/growth">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0">
                  Explore Growth Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {growthPlatforms.map(({ icon: Icon, name, color }) => (
                <Link key={name} href="/growth">
                  <div className="glass-card-hover rounded-2xl p-5 text-center cursor-pointer">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 opacity-90`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Virtual Numbers ── */}
      <section className="py-24 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="order-2 lg:order-1">
              <div className="glass-card rounded-2xl p-6 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">SMS Inbox</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { from: "WhatsApp", msg: "Your verification code is 847291", time: "just now", isNew: true },
                    { from: "Telegram", msg: "Login code: 394821. Do not share.", time: "2m ago", isNew: false },
                    { from: "Google", msg: "G-482910 is your verification code", time: "5m ago", isNew: false },
                  ].map((sms, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 ${sms.isNew ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/3 border border-white/5"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">{sms.from}</span>
                        <span className="text-xs text-muted-foreground">{sms.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{sms.msg}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">+1 (555) 847-2910</span>
                    <div className="text-xs text-orange-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires in 23h 41m
                    </div>
                  </div>
                  <span className="text-xs badge-success px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-emerald-500/30 text-xs text-emerald-300 mb-6">
                <Phone className="w-3.5 h-3.5" />
                Virtual Numbers
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5">
                Verify Anything with{" "}
                <span className="gradient-text">Temporary Numbers</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Get instant virtual phone numbers from 30+ countries. Receive SMS verification codes directly in your dashboard with real-time auto-refresh and OTP detection.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Numbers from 30+ countries available instantly",
                  "Real-time SMS inbox with 5-second auto-refresh",
                  "OTP codes highlighted and auto-detected",
                  "Expiry countdown timer on every number",
                  "Works with WhatsApp, Telegram, Google & more",
                  "Numbers starting from $0.50",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/virtual-numbers">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0">
                  Get a Virtual Number
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-4">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              Customer Reviews
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by <span className="gradient-text">52,000+ Customers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map(({ name, role, avatar, rating, text }) => (
              <div key={name} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Badges + Payment Methods ── */}
      <section className="py-16 border-y border-white/5">
        <div className="container">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 mb-10" />

          {/* Payment methods */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-5 uppercase tracking-widest font-medium">
              Accepted Payment Methods
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {paymentMethods.map(({ label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/8 text-sm font-semibold"
                >
                  {label === "Bitcoin" ? (
                    <Bitcoin className={`w-4 h-4 ${color}`} />
                  ) : label === "Visa" || label === "Mastercard" ? (
                    <CreditCard className={`w-4 h-4 ${color}`} />
                  ) : (
                    <Wallet className={`w-4 h-4 ${color}`} />
                  )}
                  <span className={color}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24">
        <div className="container max-w-3xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about Buznify. Can't find your answer?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact support
              </Link>
              .
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="space-y-3"
            onValueChange={setOpenFaq}
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card rounded-2xl border border-white/5 px-6 data-[state=open]:border-violet-500/30 transition-all duration-300"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary hover:no-underline py-5 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-cyan-600/20" />
            <div className="absolute inset-0 cyber-grid opacity-20" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 blur-3xl"
              style={{ background: "oklch(0.55 0.22 290 / 0.25)" }}
            />
            <div className="relative z-10 text-center py-20 px-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-6">
                <Layers className="w-3.5 h-3.5" />
                Multiple Revenue Streams in One Ecosystem
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-5">
                Ready to Get Started?
                <br />
                <span className="gradient-text">Join 52,000+ Buyers</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
                Create your free account today and access thousands of verified digital products with instant delivery, a wallet system, and a referral program.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Link href="/marketplace">
                    <Button
                      size="lg"
                      className="h-12 px-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30 text-base font-semibold"
                    >
                      Browse Marketplace
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    className="h-12 px-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30 text-base font-semibold"
                    onClick={handleCTA}
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                <Link href="/marketplace">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-foreground text-base"
                  >
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
