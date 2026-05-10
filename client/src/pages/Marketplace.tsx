import { useState, useCallback, useMemo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Star,
  Zap,
  ShoppingCart,
  Instagram,
  Tv,
  Gamepad2,
  Phone,
  TrendingUp,
  Package,
  ChevronRight,
  Bot,
  CreditCard,
  Coins,
  Globe,
  ShieldCheck,
  BadgeCheck,
  X,
  SlidersHorizontal,
  Tag,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import { ICON_MAP } from "@/components/IconPicker";
import ServiceIcon from "@/components/ServiceIcon";

const CATEGORIES = [
  { value: "", label: "All Products", icon: Package },
  { value: "social_media_accounts", label: "Social Media", icon: Instagram },
  { value: "streaming_accounts", label: "Streaming", icon: Tv },
  { value: "gaming_accounts", label: "Gaming Accounts", icon: Gamepad2 },
  { value: "gaming_currency", label: "Gaming Currency", icon: Coins },
  { value: "virtual_numbers", label: "Virtual Numbers", icon: Phone },
  { value: "growth_services", label: "Growth Services", icon: TrendingUp },
  { value: "ai_tools", label: "AI Tools", icon: Bot },
  { value: "digital_subscriptions", label: "Subscriptions", icon: CreditCard },
  { value: "proxy_networking", label: "Proxy & VPN", icon: Globe },
  { value: "verification_services", label: "Verification", icon: ShieldCheck },
];

const SORT_OPTIONS = [
  { value: "best_selling", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "featured", label: "Featured First" },
];

type AccountCondition = "Fresh" | "Aged" | "Verified" | "PVA";

const CONDITION_COLORS: Record<AccountCondition, string> = {
  Fresh: "badge-info",
  Aged: "badge-warning",
  Verified: "badge-success",
  PVA: "badge-purple",
};

const DEMO_PRODUCTS = [
  { id: 1, title: "Instagram Account — 10K Followers", category: "social_media_accounts", price: "49.99", originalPrice: "79.99", platform: "Instagram", totalSold: 234, avgRating: "4.8", reviewCount: 89, featured: true, stock: 5, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Aged Instagram account with 10,000 real followers. Niche: Lifestyle. Full access provided." },
  { id: 2, title: "TikTok Account — 50K Followers", category: "social_media_accounts", price: "129.99", originalPrice: "199.99", platform: "TikTok", totalSold: 156, avgRating: "4.9", reviewCount: 67, featured: true, stock: 3, condition: "Verified" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Verified TikTok account with 50K followers. High engagement rate." },
  { id: 3, title: "Twitter Account — 5K Followers", category: "social_media_accounts", price: "24.99", platform: "Twitter", totalSold: 312, avgRating: "4.7", reviewCount: 124, featured: false, stock: 8, condition: "PVA" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Aged Twitter/X account with 5,000 followers. Clean history." },
  { id: 4, title: "Netflix Premium — 1 Month", category: "streaming_accounts", price: "8.99", originalPrice: "15.99", platform: "Netflix", totalSold: 1240, avgRating: "4.9", reviewCount: 456, featured: true, stock: 50, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Netflix 4K UHD Premium plan. 4 screens simultaneously. Instant delivery." },
  { id: 5, title: "Spotify Premium — 3 Months", category: "streaming_accounts", price: "6.99", originalPrice: "12.99", platform: "Spotify", totalSold: 892, avgRating: "4.8", reviewCount: 334, featured: true, stock: 30, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Spotify Premium individual plan. No ads, offline listening." },
  { id: 6, title: "Disney+ — 1 Month", category: "streaming_accounts", price: "5.99", platform: "Disney+", totalSold: 567, avgRating: "4.7", reviewCount: 201, featured: false, stock: 25, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Disney+ premium account. Access to all content." },
  { id: 7, title: "Valorant Account — Diamond Rank", category: "gaming_accounts", price: "89.99", originalPrice: "149.99", platform: "Valorant", totalSold: 78, avgRating: "4.9", reviewCount: 45, featured: true, stock: 4, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Valorant Diamond account. 200+ skins. Unranked available." },
  { id: 8, title: "CSGO Account — Level 10 Faceit", category: "gaming_accounts", price: "59.99", platform: "CSGO", totalSold: 134, avgRating: "4.8", reviewCount: 67, featured: false, stock: 6, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "CS:GO account with Level 10 Faceit. 2000+ hours." },
  { id: 9, title: "Fortnite Account — 100+ Skins", category: "gaming_accounts", price: "149.99", originalPrice: "249.99", platform: "Fortnite", totalSold: 45, avgRating: "5.0", reviewCount: 23, featured: true, stock: 2, condition: "Verified" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Fortnite account with 100+ rare skins including OG skins." },
  { id: 10, title: "Steam Account — 500+ Games", category: "gaming_accounts", price: "199.99", originalPrice: "349.99", platform: "Steam", totalSold: 67, avgRating: "4.9", reviewCount: 38, featured: true, stock: 3, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Steam account with 500+ games including AAA titles. Level 50+." },
  { id: 11, title: "Roblox Account — 10,000 Robux", category: "gaming_accounts", price: "34.99", originalPrice: "59.99", platform: "Roblox", totalSold: 289, avgRating: "4.8", reviewCount: 134, featured: false, stock: 10, condition: "PVA" as AccountCondition, deliveryTime: "< 30 sec", deliveryType: "instant", description: "Roblox account loaded with 10,000 Robux. Rare limited items included." },
  { id: 12, title: "Minecraft Java Edition Account", category: "gaming_accounts", price: "14.99", originalPrice: "26.99", platform: "Minecraft", totalSold: 445, avgRating: "4.7", reviewCount: 210, featured: false, stock: 20, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Full Minecraft Java Edition account. Lifetime access. Hypixel ready." },
  { id: 13, title: "ChatGPT Plus — 1 Month", category: "ai_tools", price: "18.99", originalPrice: "29.99", platform: "ChatGPT", totalSold: 2340, avgRating: "4.9", reviewCount: 890, featured: true, stock: 100, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "ChatGPT Plus subscription with GPT-4o access. Unlimited messages. Priority access." },
  { id: 14, title: "Claude Pro — 1 Month", category: "ai_tools", price: "16.99", originalPrice: "24.99", platform: "Claude", totalSold: 1120, avgRating: "4.8", reviewCount: 445, featured: true, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Claude Pro by Anthropic. Access to Claude 3.5 Sonnet & Opus. 5x more usage." },
  { id: 15, title: "Midjourney Pro — 1 Month", category: "ai_tools", price: "54.99", originalPrice: "79.99", platform: "Midjourney", totalSold: 678, avgRating: "4.9", reviewCount: 312, featured: true, stock: 40, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Midjourney Pro plan. Unlimited fast GPU hours. Stealth mode included." },
  { id: 16, title: "Runway Gen-3 — Creator Plan", category: "ai_tools", price: "29.99", originalPrice: "44.99", platform: "Runway", totalSold: 234, avgRating: "4.7", reviewCount: 98, featured: false, stock: 30, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Runway Gen-3 AI video generation. 625 credits/month. HD exports." },
  { id: 17, title: "ElevenLabs Creator — 1 Month", category: "ai_tools", price: "21.99", originalPrice: "33.99", platform: "ElevenLabs", totalSold: 456, avgRating: "4.8", reviewCount: 187, featured: false, stock: 50, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "ElevenLabs Creator plan. 100K characters/month. Voice cloning included." },
  { id: 18, title: "Perplexity Pro — 1 Month", category: "ai_tools", price: "17.99", originalPrice: "24.99", platform: "Perplexity", totalSold: 567, avgRating: "4.7", reviewCount: 223, featured: false, stock: 60, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Perplexity Pro with unlimited AI search. Access to GPT-4 & Claude. No ads." },
  { id: 19, title: "Sora Access — OpenAI Video AI", category: "ai_tools", price: "39.99", originalPrice: "59.99", platform: "OpenAI", totalSold: 123, avgRating: "4.9", reviewCount: 56, featured: true, stock: 15, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "OpenAI Sora video generation access. Create stunning AI videos up to 60 seconds." },
  { id: 20, title: "YouTube Premium — 1 Month", category: "digital_subscriptions", price: "7.99", originalPrice: "13.99", platform: "YouTube", totalSold: 3450, avgRating: "4.9", reviewCount: 1230, featured: true, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "YouTube Premium. No ads, background play, YouTube Music included." },
  { id: 21, title: "Canva Pro — 1 Month", category: "digital_subscriptions", price: "9.99", originalPrice: "16.99", platform: "Canva", totalSold: 2100, avgRating: "4.8", reviewCount: 876, featured: true, stock: 150, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Canva Pro with unlimited templates, brand kit, and background remover." },
  { id: 22, title: "Adobe Creative Cloud — 1 Month", category: "digital_subscriptions", price: "34.99", originalPrice: "59.99", platform: "Adobe", totalSold: 890, avgRating: "4.8", reviewCount: 345, featured: true, stock: 60, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Adobe CC All Apps plan. Photoshop, Illustrator, Premiere Pro, and 20+ more." },
  { id: 23, title: "Grammarly Premium — 1 Month", category: "digital_subscriptions", price: "8.99", originalPrice: "14.99", platform: "Grammarly", totalSold: 1560, avgRating: "4.7", reviewCount: 678, featured: false, stock: 120, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Grammarly Premium with advanced grammar, plagiarism checker, and tone detection." },
  { id: 24, title: "Notion AI — Plus Plan", category: "digital_subscriptions", price: "12.99", originalPrice: "19.99", platform: "Notion", totalSold: 780, avgRating: "4.8", reviewCount: 312, featured: false, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Notion Plus with AI features. Unlimited blocks, guests, and file uploads." },
  { id: 25, title: "Microsoft 365 Personal — 1 Year", category: "digital_subscriptions", price: "29.99", originalPrice: "69.99", platform: "Microsoft", totalSold: 1234, avgRating: "4.9", reviewCount: 567, featured: true, stock: 90, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Microsoft 365 Personal. Word, Excel, PowerPoint, 1TB OneDrive. 1 year license." },
  { id: 26, title: "CapCut Pro — 1 Month", category: "digital_subscriptions", price: "6.99", originalPrice: "12.99", platform: "CapCut", totalSold: 2340, avgRating: "4.8", reviewCount: 934, featured: false, stock: 100, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "CapCut Pro with AI tools, 4K export, no watermark, and premium templates." },
  { id: 27, title: "NordVPN — 1 Year", category: "digital_subscriptions", price: "39.99", originalPrice: "99.99", platform: "NordVPN", totalSold: 1890, avgRating: "4.9", reviewCount: 789, featured: true, stock: 75, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "NordVPN 1-year subscription. 6 devices, 5400+ servers in 60 countries." },
  { id: 28, title: "Roblox 4,500 Robux", category: "gaming_currency", price: "34.99", originalPrice: "49.99", platform: "Roblox", totalSold: 2890, avgRating: "4.9", reviewCount: 1120, featured: true, stock: 300, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "4,500 Robux for Roblox. Instant delivery to your account." },
  { id: 29, title: "V-Bucks — 2,800 Fortnite", category: "gaming_currency", price: "19.99", originalPrice: "27.99", platform: "Fortnite", totalSold: 4560, avgRating: "4.8", reviewCount: 1780, featured: false, stock: 500, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "2,800 V-Bucks for Fortnite. Buy skins, emotes, and Battle Pass." },
  { id: 30, title: "Steam Gift Card — $25", category: "gaming_currency", price: "22.99", originalPrice: "25.00", platform: "Steam", totalSold: 3450, avgRating: "5.0", reviewCount: 1560, featured: true, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "$25 Steam Wallet Gift Card. Redeemable worldwide. Instant code delivery." },
  { id: 31, title: "PlayStation Store — $50 Gift Card", category: "gaming_currency", price: "44.99", originalPrice: "50.00", platform: "PlayStation", totalSold: 2100, avgRating: "4.9", reviewCount: 890, featured: false, stock: 150, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "$50 PlayStation Network gift card. Works on PS4 & PS5. Instant delivery." },
  { id: 32, title: "Xbox Game Pass Ultimate — 3 Months", category: "gaming_currency", price: "24.99", originalPrice: "44.99", platform: "Xbox", totalSold: 1230, avgRating: "4.8", reviewCount: 567, featured: false, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Xbox Game Pass Ultimate. 100+ games, EA Play, Xbox Live Gold included." },
  { id: 33, title: "League of Legends — 7,200 RP", category: "gaming_currency", price: "44.99", originalPrice: "54.99", platform: "League of Legends", totalSold: 1890, avgRating: "4.7", reviewCount: 734, featured: false, stock: 120, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "7,200 Riot Points for League of Legends. Buy skins, champions, and more." },
  { id: 34, title: "PUBG Mobile — 1800 UC", category: "gaming_currency", price: "24.99", originalPrice: "29.99", platform: "PUBG Mobile", totalSold: 3120, avgRating: "4.8", reviewCount: 1230, featured: false, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "1800 Unknown Cash for PUBG Mobile. Buy outfits, crates, and Royale Pass." },
  { id: 35, title: "Residential Proxies — 1GB", category: "proxy_networking", price: "12.99", originalPrice: "24.99", platform: "Residential Proxy", totalSold: 890, avgRating: "4.8", reviewCount: 345, featured: true, stock: 500, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Premium residential proxies. 195+ countries, rotating IPs, unlimited threads." },
  { id: 36, title: "Mobile Proxies — 5GB", category: "proxy_networking", price: "39.99", originalPrice: "69.99", platform: "Mobile Proxy", totalSold: 456, avgRating: "4.9", reviewCount: 189, featured: true, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "4G/5G mobile proxies. Real mobile IPs. Sticky or rotating sessions." },
  { id: 37, title: "IPv6 Proxies — 1000 IPs", category: "proxy_networking", price: "9.99", originalPrice: "19.99", platform: "IPv6 Proxy", totalSold: 1230, avgRating: "4.7", reviewCount: 567, featured: false, stock: 1000, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "1000 dedicated IPv6 proxies. High-speed, unlimited bandwidth. Instant setup." },
  { id: 38, title: "RDP Windows Server — 1 Month", category: "proxy_networking", price: "24.99", originalPrice: "39.99", platform: "RDP/VPS", totalSold: 678, avgRating: "4.8", reviewCount: 278, featured: false, stock: 50, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Windows RDP server. 8GB RAM, 4 vCPU, 100GB SSD. USA/EU locations." },
  { id: 39, title: "Antidetect Browser — GoLogin 1 Month", category: "proxy_networking", price: "19.99", originalPrice: "34.99", platform: "GoLogin", totalSold: 345, avgRating: "4.7", reviewCount: 134, featured: false, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "GoLogin antidetect browser. Manage 100+ profiles. Fingerprint masking." },
  { id: 40, title: "Mullvad VPN — 3 Months", category: "proxy_networking", price: "14.99", originalPrice: "19.50", platform: "Mullvad VPN", totalSold: 567, avgRating: "4.9", reviewCount: 234, featured: false, stock: 100, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Mullvad VPN. No logs, anonymous account, WireGuard protocol. 5 devices." },
  { id: 41, title: "US Phone Number — WhatsApp Verify", category: "verification_services", price: "1.99", originalPrice: "3.99", platform: "WhatsApp", totalSold: 12400, avgRating: "4.8", reviewCount: 4560, featured: true, stock: 1000, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Real US phone number for WhatsApp verification. Instant SMS delivery." },
  { id: 42, title: "UK Phone Number — Telegram Verify", category: "verification_services", price: "2.49", originalPrice: "4.99", platform: "Telegram", totalSold: 8900, avgRating: "4.9", reviewCount: 3450, featured: true, stock: 800, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Real UK number for Telegram account verification. OTP delivered in seconds." },
  { id: 43, title: "Gmail Account — Fresh PVA", category: "verification_services", price: "2.99", originalPrice: "5.99", platform: "Gmail", totalSold: 6780, avgRating: "4.7", reviewCount: 2340, featured: false, stock: 500, condition: "PVA" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Fresh Gmail PVA account. Phone verified. Ready to use immediately." },
  { id: 44, title: "Outlook/Hotmail Account — Aged", category: "verification_services", price: "4.99", originalPrice: "8.99", platform: "Outlook", totalSold: 3450, avgRating: "4.8", reviewCount: 1230, featured: false, stock: 300, condition: "Aged" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Aged Outlook account (2+ years). Phone verified. High trust score." },
  { id: 45, title: "Facebook PVA Account — Aged 2 Years", category: "verification_services", price: "9.99", originalPrice: "17.99", platform: "Facebook", totalSold: 2100, avgRating: "4.6", reviewCount: 890, featured: false, stock: 150, condition: "Aged" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "2-year-old Facebook PVA account. Friends, posts, and activity included." },
  { id: 46, title: "PayPal Verified Account", category: "verification_services", price: "29.99", originalPrice: "49.99", platform: "PayPal", totalSold: 567, avgRating: "4.5", reviewCount: 234, featured: false, stock: 30, condition: "Verified" as AccountCondition, deliveryTime: "Instant", deliveryType: "instant", description: "Verified PayPal account. US/UK region. Ready for transactions. Full access." },
];

const TRENDING_IDS = [13, 28, 41, 20, 4, 1, 7, 2];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseIntParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}
function parseFloatParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: typeof DEMO_PRODUCTS[0] }) {
  const discount = product.originalPrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : null;

  const categoryColors: Record<string, string> = {
    social_media_accounts: "from-pink-500/20 to-purple-500/20 border-pink-500/20",
    streaming_accounts: "from-red-500/20 to-orange-500/20 border-red-500/20",
    gaming_accounts: "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
    gaming_currency: "from-yellow-500/20 to-amber-500/20 border-yellow-500/20",
    virtual_numbers: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
    growth_services: "from-violet-500/20 to-purple-500/20 border-violet-500/20",
    ai_tools: "from-sky-500/20 to-blue-500/20 border-sky-500/20",
    digital_subscriptions: "from-indigo-500/20 to-violet-500/20 border-indigo-500/20",
    proxy_networking: "from-slate-500/20 to-gray-500/20 border-slate-500/20",
    verification_services: "from-green-500/20 to-emerald-500/20 border-green-500/20",
  };

  return (
    <Link href={`/marketplace/product/${product.id}`}>
      <div className="glass-card-hover rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Header gradient */}
        <div
          className={`h-32 bg-gradient-to-br ${categoryColors[product.category] ?? "from-violet-500/20 to-purple-500/20"} flex items-center justify-center relative`}
        >
          {product.featured && (
            <span className="absolute top-3 left-3 text-xs badge-purple px-2 py-0.5 rounded-full font-medium">
              Featured
            </span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 text-xs badge-success px-2 py-0.5 rounded-full font-medium">
              -{discount}%
            </span>
          )}
          <div className="flex items-center justify-center">
            <ServiceIcon name={product.platform ?? ""} size={52} />
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Instant Delivery</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ServiceIcon name={product.platform ?? ""} size={12} />
              {product.platform}
            </span>
            {(product as any).condition && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${CONDITION_COLORS[(product as any).condition as AccountCondition] ?? "badge-info"}`}>
                {(product as any).condition === "Verified" && <BadgeCheck className="w-3 h-3" />}
                {(product as any).condition}
              </span>
            )}
            {product.stock === 0 ? (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                Sold Out
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-xs badge-warning px-1.5 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            ) : null}
          </div>

          <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 flex-1">
            {product.title}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-foreground">{product.avgRating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            <span className="text-xs text-muted-foreground ml-auto">{product.totalSold} sold</span>
          </div>
          {(product as any).deliveryTime && (
            <div className="flex items-center gap-1 mb-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Delivery: {(product as any).deliveryTime}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <Button
              size="sm"
              className="h-8 px-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-32 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 rounded animate-shimmer" />
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-3/4 rounded animate-shimmer" />
        <div className="h-8 w-full rounded animate-shimmer" />
      </div>
    </div>
  );
}

// ─── Active Filter Chip ───────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30">
      {label}
      <button onClick={onRemove} className="hover:text-foreground transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Marketplace() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();

  // Parse URL params for persistence
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);

  // All filter/sort state — initialized from URL
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<any[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(parseIntParam(params.get("sub")) ?? null);

  // Advanced filters
  const [priceMin, setPriceMin] = useState(params.get("pmin") ?? "");
  const [priceMax, setPriceMax] = useState(params.get("pmax") ?? "");
  const [minRating, setMinRating] = useState(parseFloatParam(params.get("rating")) ?? 0);
  const [deliveryType, setDeliveryType] = useState(params.get("delivery") ?? "");
  const [inStockOnly, setInStockOnly] = useState(params.get("instock") === "1");
  const [onSaleOnly, setOnSaleOnly] = useState(params.get("onsale") === "1");
  const [sortBy, setSortBy] = useState(params.get("sort") ?? "best_selling");

  // Sync URL whenever filters change
  const syncUrl = useCallback((overrides: Record<string, string | null>) => {
    const next = new URLSearchParams(searchString);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "" || v === "0") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    setLocation(`/marketplace${qs ? `?${qs}` : ""}`, { replace: true });
  }, [searchString, setLocation]);

  // Load dynamic categories from DB, fall back to static CATEGORIES
  const { data: dbCats } = trpc.products.listCategories.useQuery();
  const dynamicCategories = dbCats && dbCats.length > 0
    ? [
        { value: "", label: "All Products", icon: Package, id: null as number | null, children: [] as any[] },
        ...dbCats.map((c: any) => ({ value: c.slug, label: c.label, icon: ICON_MAP[c.icon] ?? Package, id: c.id, children: c.children ?? [] })),
      ]
    : CATEGORIES.map((c: any) => ({ ...c, id: null, children: [] }));

  const activeCatObj = dynamicCategories.find((c: any) => c.value === category);
  const subcategories: any[] = (activeCatObj as any)?.children ?? [];

  const aiSearchMutation = trpc.products.aiSearch.useMutation({
    onSuccess: (data) => setAiResults(data.results),
    onError: () => setAiResults([]),
  });

  // Build query params — pass all filters to server
  const queryInput = useMemo(() => ({
    category: category || undefined,
    search: search || undefined,
    limit: 60,
    subcategoryId: subcategoryId ?? undefined,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    deliveryType: (deliveryType as "instant" | "manual") || undefined,
    inStockOnly: inStockOnly || undefined,
    onSaleOnly: onSaleOnly || undefined,
    sortBy: sortBy as any,
  }), [category, search, subcategoryId, priceMin, priceMax, minRating, deliveryType, inStockOnly, onSaleOnly, sortBy]);

  const { data: serverProducts, isLoading } = trpc.products.list.useQuery(queryInput);

  // Fallback to demo products with client-side filtering when DB is empty
  const displayProducts = useMemo(() => {
    if (serverProducts && serverProducts.length > 0) return serverProducts;
    return DEMO_PRODUCTS
      .filter((p) => {
        if (category && p.category !== category) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (priceMin && parseFloat(p.price) < parseFloat(priceMin)) return false;
        if (priceMax && parseFloat(p.price) > parseFloat(priceMax)) return false;
        if (minRating > 0 && parseFloat(p.avgRating ?? "0") < minRating) return false;
        if (deliveryType && p.deliveryType !== deliveryType) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (onSaleOnly && !p.originalPrice) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
        if (sortBy === "rating") return parseFloat(b.avgRating ?? "0") - parseFloat(a.avgRating ?? "0");
        if (sortBy === "newest") return (b.id ?? 0) - (a.id ?? 0);
        if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return (b.totalSold ?? 0) - (a.totalSold ?? 0);
      });
  }, [serverProducts, category, search, priceMin, priceMax, minRating, deliveryType, inStockOnly, onSaleOnly, sortBy]);

  // Count active filters (excluding category/search/sort which are primary controls)
  const activeFilterCount = [
    priceMin, priceMax, minRating > 0 ? "r" : "", deliveryType,
    inStockOnly ? "s" : "", onSaleOnly ? "o" : "",
  ].filter(Boolean).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    syncUrl({ search: searchInput || null });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubcategoryId(null);
    syncUrl({ category: val || null, sub: null });
  };

  const handleSubcategoryChange = (id: number | null) => {
    setSubcategoryId(id);
    syncUrl({ sub: id !== null ? String(id) : null });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    syncUrl({ sort: val === "best_selling" ? null : val });
  };

  const clearAllFilters = () => {
    setPriceMin(""); setPriceMax(""); setMinRating(0);
    setDeliveryType(""); setInStockOnly(false); setOnSaleOnly(false);
    setSortBy("best_selling");
    syncUrl({ pmin: null, pmax: null, rating: null, delivery: null, instock: null, onsale: null, sort: null });
  };

  return (
    <div className="min-h-screen pb-mobile-nav md:pb-0">
      <Navbar />
      <div className="container pt-24 pb-16">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Digital <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse thousands of verified digital products with instant delivery.
          </p>
        </div>

        {/* ── Search Row ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 max-w-3xl">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products, platforms, or categories..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 h-10"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); setSearch(""); syncUrl({ search: null }); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-10 px-4">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* ── AI Search ── */}
        <div className="mb-8 max-w-3xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-xs font-bold">AI</span>
              <Input
                placeholder='Ask AI: e.g. "cheap Netflix account" or "Instagram with 10k followers"'
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aiQuery.trim().length >= 2) {
                    e.preventDefault();
                    setAiResults(null);
                    aiSearchMutation.mutate({ query: aiQuery.trim() });
                  }
                }}
                className="pl-10 bg-violet-500/5 border-violet-500/20 focus:border-violet-500/50 h-10 text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={() => { if (aiQuery.trim().length >= 2) { setAiResults(null); aiSearchMutation.mutate({ query: aiQuery.trim() }); } }}
              disabled={aiSearchMutation.isPending || aiQuery.trim().length < 2}
              className="bg-violet-600 hover:bg-violet-500 text-white border-0 h-10 gap-1.5"
            >
              {aiSearchMutation.isPending ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Searching</>
              ) : (
                <><Zap className="w-3.5 h-3.5" />AI Search</>
              )}
            </Button>
            {aiResults !== null && (
              <Button type="button" variant="ghost" onClick={() => { setAiResults(null); setAiQuery(""); }} className="h-10 px-3 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {aiResults !== null && (
            <div className="mt-3">
              {aiResults.length === 0 ? (
                <p className="text-xs text-muted-foreground">No AI results found. Try a different query.</p>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">AI found {aiResults.length} product{aiResults.length !== 1 ? "s" : ""} for &quot;{aiQuery}&quot;</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiResults.map((p: any) => (
                      <Link key={p.id} href={`/marketplace/product/${p.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground line-clamp-1">{p.title}</p>
                            <p className="text-xs text-violet-400 font-bold">${p.price}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 mb-5 pb-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {dynamicCategories.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryChange(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                category === value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "glass text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Subcategory Pills ── */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 pl-1">
            <span className="text-xs text-muted-foreground self-center mr-1">Subcategory:</span>
            <button
              onClick={() => handleSubcategoryChange(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subcategoryId === null
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass text-muted-foreground hover:text-foreground border border-white/10"
              }`}
            >
              All
            </button>
            {subcategories.map((sub: any) => {
              const SubIcon = ICON_MAP[sub.icon] ?? Package;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategoryChange(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    subcategoryId === sub.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "glass text-muted-foreground hover:text-foreground border border-white/10"
                  }`}
                >
                  <SubIcon className="w-3 h-3" />
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Toolbar: Results count + Sort + Filter toggle ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{displayProducts.length}</span> products
              {category && (
                <> in <span className="text-primary">{dynamicCategories.find((c) => c.value === category)?.label}</span></>
              )}
              {search && (
                <> for &quot;<span className="text-foreground">{search}</span>&quot;</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger size="sm" className="w-44 bg-white/5 border-white/10 text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all h-8 ${
                showFilters || activeFilterCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 bg-white/25 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Active Filter Chips ── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {priceMin && (
              <FilterChip label={`Min $${priceMin}`} onRemove={() => { setPriceMin(""); syncUrl({ pmin: null }); }} />
            )}
            {priceMax && (
              <FilterChip label={`Max $${priceMax}`} onRemove={() => { setPriceMax(""); syncUrl({ pmax: null }); }} />
            )}
            {minRating > 0 && (
              <FilterChip label={`${minRating}+ ★`} onRemove={() => { setMinRating(0); syncUrl({ rating: null }); }} />
            )}
            {deliveryType && (
              <FilterChip
                label={deliveryType === "instant" ? "⚡ Instant Delivery" : "Manual Delivery"}
                onRemove={() => { setDeliveryType(""); syncUrl({ delivery: null }); }}
              />
            )}
            {inStockOnly && (
              <FilterChip label="In Stock Only" onRemove={() => { setInStockOnly(false); syncUrl({ instock: null }); }} />
            )}
            {onSaleOnly && (
              <FilterChip label="On Sale" onRemove={() => { setOnSaleOnly(false); syncUrl({ onsale: null }); }} />
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Advanced Filters Panel ── */}
        {showFilters && (
          <div className="glass-card rounded-2xl p-5 mb-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Filter Products</span>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline">
                  Clear all filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">

              {/* Price Range */}
              <div className="sm:col-span-1 xl:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Price Range (USD)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    min={0}
                    onChange={(e) => { setPriceMin(e.target.value); syncUrl({ pmin: e.target.value || null }); }}
                    className="h-8 text-xs bg-white/5 border-white/10 focus:border-primary/50"
                  />
                  <span className="text-muted-foreground text-xs flex-shrink-0">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    min={0}
                    onChange={(e) => { setPriceMax(e.target.value); syncUrl({ pmax: e.target.value || null }); }}
                    className="h-8 text-xs bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </div>
                {/* Quick price presets */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {[["Under $5", "", "5"], ["$5–$20", "5", "20"], ["$20–$50", "20", "50"], ["$50+", "50", ""]].map(([label, min, max]) => (
                    <button
                      key={label}
                      onClick={() => {
                        setPriceMin(min); setPriceMax(max);
                        syncUrl({ pmin: min || null, pmax: max || null });
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                        priceMin === min && priceMax === max
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "glass text-muted-foreground hover:text-foreground border border-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Star className="w-3.5 h-3.5" />
                  Minimum Rating
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(r); syncUrl({ rating: r > 0 ? String(r) : null }); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        minRating === r ? "bg-amber-500 text-white" : "glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r === 0 ? "Any" : `${r}+★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Type */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  Delivery Type
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { value: "", label: "Any" },
                    { value: "instant", label: "⚡ Instant" },
                    { value: "manual", label: "Manual" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => { setDeliveryType(d.value); syncUrl({ delivery: d.value || null }); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        deliveryType === d.value
                          ? "bg-emerald-600 text-white"
                          : "glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Only */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Boxes className="w-3.5 h-3.5" />
                  Availability
                </label>
                <button
                  onClick={() => { setInStockOnly(v => { const next = !v; syncUrl({ instock: next ? "1" : null }); return next; }); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full ${
                    inStockOnly ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${inStockOnly ? "text-emerald-400" : ""}`} />
                  In Stock Only
                </button>
              </div>

              {/* On Sale Only */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Deals
                </label>
                <button
                  onClick={() => { setOnSaleOnly(v => { const next = !v; syncUrl({ onsale: next ? "1" : null }); return next; }); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full ${
                    onSaleOnly ? "bg-rose-600/20 text-rose-400 border border-rose-600/30" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Tag className={`w-3.5 h-3.5 ${onSaleOnly ? "text-rose-400" : ""}`} />
                  On Sale Only
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── Trending Section (shown only on default view) ── */}
        {!category && !search && activeFilterCount === 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h2 className="text-base font-semibold text-foreground">Trending Right Now</h2>
              <span className="text-xs badge-purple px-2 py-0.5 rounded-full">Hot</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-5 gap-4">
              {DEMO_PRODUCTS.filter((p) => TRENDING_IDS.includes(p.id)).map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
            <div className="border-t border-white/5 mt-10 mb-8" />
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">All Products</h2>
            </div>
          </div>
        )}

        {/* ── Product Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {activeFilterCount > 0
                ? "Try removing some filters to see more results."
                : "Try a different search term or category."}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-2">
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
