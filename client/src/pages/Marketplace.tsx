import { useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { ICON_MAP } from "@/components/IconPicker";

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

type AccountCondition = "Fresh" | "Aged" | "Verified" | "PVA";

const CONDITION_COLORS: Record<AccountCondition, string> = {
  Fresh: "badge-info",
  Aged: "badge-warning",
  Verified: "badge-success",
  PVA: "badge-purple",
};

const DEMO_PRODUCTS = [
  { id: 1, title: "Instagram Account — 10K Followers", category: "social_media_accounts", price: "49.99", originalPrice: "79.99", platform: "Instagram", totalSold: 234, avgRating: "4.8", reviewCount: 89, featured: true, stock: 5, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", description: "Aged Instagram account with 10,000 real followers. Niche: Lifestyle. Full access provided." },
  { id: 2, title: "TikTok Account — 50K Followers", category: "social_media_accounts", price: "129.99", originalPrice: "199.99", platform: "TikTok", totalSold: 156, avgRating: "4.9", reviewCount: 67, featured: true, stock: 3, condition: "Verified" as AccountCondition, deliveryTime: "< 30 sec", description: "Verified TikTok account with 50K followers. High engagement rate." },
  { id: 3, title: "Twitter Account — 5K Followers", category: "social_media_accounts", price: "24.99", platform: "Twitter", totalSold: 312, avgRating: "4.7", reviewCount: 124, featured: false, stock: 8, condition: "PVA" as AccountCondition, deliveryTime: "< 30 sec", description: "Aged Twitter/X account with 5,000 followers. Clean history." },
  { id: 4, title: "Netflix Premium — 1 Month", category: "streaming_accounts", price: "8.99", originalPrice: "15.99", platform: "Netflix", totalSold: 1240, avgRating: "4.9", reviewCount: 456, featured: true, stock: 50, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Netflix 4K UHD Premium plan. 4 screens simultaneously. Instant delivery." },
  { id: 5, title: "Spotify Premium — 3 Months", category: "streaming_accounts", price: "6.99", originalPrice: "12.99", platform: "Spotify", totalSold: 892, avgRating: "4.8", reviewCount: 334, featured: true, stock: 30, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Spotify Premium individual plan. No ads, offline listening." },
  { id: 6, title: "Disney+ — 1 Month", category: "streaming_accounts", price: "5.99", platform: "Disney+", totalSold: 567, avgRating: "4.7", reviewCount: 201, featured: false, stock: 25, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Disney+ premium account. Access to all content." },
  { id: 7, title: "Valorant Account — Diamond Rank", category: "gaming_accounts", price: "89.99", originalPrice: "149.99", platform: "Valorant", totalSold: 78, avgRating: "4.9", reviewCount: 45, featured: true, stock: 4, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", description: "Valorant Diamond account. 200+ skins. Unranked available." },
  { id: 8, title: "CSGO Account — Level 10 Faceit", category: "gaming_accounts", price: "59.99", platform: "CSGO", totalSold: 134, avgRating: "4.8", reviewCount: 67, featured: false, stock: 6, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", description: "CS:GO account with Level 10 Faceit. 2000+ hours." },
  { id: 9, title: "Fortnite Account — 100+ Skins", category: "gaming_accounts", price: "149.99", originalPrice: "249.99", platform: "Fortnite", totalSold: 45, avgRating: "5.0", reviewCount: 23, featured: true, stock: 2, condition: "Verified" as AccountCondition, deliveryTime: "< 30 sec", description: "Fortnite account with 100+ rare skins including OG skins." },
  { id: 10, title: "Steam Account — 500+ Games", category: "gaming_accounts", price: "199.99", originalPrice: "349.99", platform: "Steam", totalSold: 67, avgRating: "4.9", reviewCount: 38, featured: true, stock: 3, condition: "Aged" as AccountCondition, deliveryTime: "< 30 sec", description: "Steam account with 500+ games including AAA titles. Level 50+." },
  { id: 11, title: "Roblox Account — 10,000 Robux", category: "gaming_accounts", price: "34.99", originalPrice: "59.99", platform: "Roblox", totalSold: 289, avgRating: "4.8", reviewCount: 134, featured: false, stock: 10, condition: "PVA" as AccountCondition, deliveryTime: "< 30 sec", description: "Roblox account loaded with 10,000 Robux. Rare limited items included." },
  { id: 12, title: "Minecraft Java Edition Account", category: "gaming_accounts", price: "14.99", originalPrice: "26.99", platform: "Minecraft", totalSold: 445, avgRating: "4.7", reviewCount: 210, featured: false, stock: 20, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Full Minecraft Java Edition account. Lifetime access. Hypixel ready." },
  { id: 13, title: "ChatGPT Plus — 1 Month", category: "ai_tools", price: "18.99", originalPrice: "29.99", platform: "ChatGPT", totalSold: 2340, avgRating: "4.9", reviewCount: 890, featured: true, stock: 100, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "ChatGPT Plus subscription with GPT-4o access. Unlimited messages. Priority access." },
  { id: 14, title: "Claude Pro — 1 Month", category: "ai_tools", price: "16.99", originalPrice: "24.99", platform: "Claude", totalSold: 1120, avgRating: "4.8", reviewCount: 445, featured: true, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Claude Pro by Anthropic. Access to Claude 3.5 Sonnet & Opus. 5x more usage." },
  { id: 15, title: "Midjourney Pro — 1 Month", category: "ai_tools", price: "54.99", originalPrice: "79.99", platform: "Midjourney", totalSold: 678, avgRating: "4.9", reviewCount: 312, featured: true, stock: 40, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Midjourney Pro plan. Unlimited fast GPU hours. Stealth mode included." },
  { id: 16, title: "Runway Gen-3 — Creator Plan", category: "ai_tools", price: "29.99", originalPrice: "44.99", platform: "Runway", totalSold: 234, avgRating: "4.7", reviewCount: 98, featured: false, stock: 30, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Runway Gen-3 AI video generation. 625 credits/month. HD exports." },
  { id: 17, title: "ElevenLabs Creator — 1 Month", category: "ai_tools", price: "21.99", originalPrice: "33.99", platform: "ElevenLabs", totalSold: 456, avgRating: "4.8", reviewCount: 187, featured: false, stock: 50, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "ElevenLabs Creator plan. 100K characters/month. Voice cloning included." },
  { id: 18, title: "Perplexity Pro — 1 Month", category: "ai_tools", price: "17.99", originalPrice: "24.99", platform: "Perplexity", totalSold: 567, avgRating: "4.7", reviewCount: 223, featured: false, stock: 60, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Perplexity Pro with unlimited AI search. Access to GPT-4 & Claude. No ads." },
  { id: 19, title: "Sora Access — OpenAI Video AI", category: "ai_tools", price: "39.99", originalPrice: "59.99", platform: "OpenAI", totalSold: 123, avgRating: "4.9", reviewCount: 56, featured: true, stock: 15, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "OpenAI Sora video generation access. Create stunning AI videos up to 60 seconds." },
  { id: 20, title: "YouTube Premium — 1 Month", category: "digital_subscriptions", price: "7.99", originalPrice: "13.99", platform: "YouTube", totalSold: 3450, avgRating: "4.9", reviewCount: 1230, featured: true, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "YouTube Premium. No ads, background play, YouTube Music included." },
  { id: 21, title: "Canva Pro — 1 Month", category: "digital_subscriptions", price: "9.99", originalPrice: "16.99", platform: "Canva", totalSold: 2100, avgRating: "4.8", reviewCount: 876, featured: true, stock: 150, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Canva Pro with unlimited templates, brand kit, and background remover." },
  { id: 22, title: "Adobe Creative Cloud — 1 Month", category: "digital_subscriptions", price: "34.99", originalPrice: "59.99", platform: "Adobe", totalSold: 890, avgRating: "4.8", reviewCount: 345, featured: true, stock: 60, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Adobe CC All Apps plan. Photoshop, Illustrator, Premiere Pro, and 20+ more." },
  { id: 23, title: "Grammarly Premium — 1 Month", category: "digital_subscriptions", price: "8.99", originalPrice: "14.99", platform: "Grammarly", totalSold: 1560, avgRating: "4.7", reviewCount: 678, featured: false, stock: 120, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Grammarly Premium with advanced grammar, plagiarism checker, and tone detection." },
  { id: 24, title: "Notion AI — Plus Plan", category: "digital_subscriptions", price: "12.99", originalPrice: "19.99", platform: "Notion", totalSold: 780, avgRating: "4.8", reviewCount: 312, featured: false, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Notion Plus with AI features. Unlimited blocks, guests, and file uploads." },
  { id: 25, title: "Microsoft 365 Personal — 1 Year", category: "digital_subscriptions", price: "29.99", originalPrice: "69.99", platform: "Microsoft", totalSold: 1234, avgRating: "4.9", reviewCount: 567, featured: true, stock: 90, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Microsoft 365 Personal. Word, Excel, PowerPoint, 1TB OneDrive. 1 year license." },
  { id: 26, title: "CapCut Pro — 1 Month", category: "digital_subscriptions", price: "6.99", originalPrice: "12.99", platform: "CapCut", totalSold: 2340, avgRating: "4.8", reviewCount: 934, featured: false, stock: 100, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "CapCut Pro with AI tools, 4K export, no watermark, and premium templates." },
  { id: 27, title: "NordVPN — 1 Year", category: "digital_subscriptions", price: "39.99", originalPrice: "99.99", platform: "NordVPN", totalSold: 1890, avgRating: "4.9", reviewCount: 789, featured: true, stock: 75, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "NordVPN 1-year subscription. 6 devices, 5400+ servers in 60 countries." },
  { id: 28, title: "Roblox 4,500 Robux", category: "gaming_currency", price: "14.99", originalPrice: "19.99", platform: "Roblox", totalSold: 5670, avgRating: "4.9", reviewCount: 2340, featured: true, stock: 500, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "4,500 Robux delivered instantly to your account. No account sharing required." },
  { id: 29, title: "Fortnite 2,800 V-Bucks", category: "gaming_currency", price: "19.99", originalPrice: "24.99", platform: "Fortnite", totalSold: 4230, avgRating: "4.8", reviewCount: 1890, featured: true, stock: 300, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "2,800 V-Bucks for Fortnite. Buy skins, emotes, and Battle Pass." },
  { id: 30, title: "Steam Gift Card — $25", category: "gaming_currency", price: "22.99", originalPrice: "25.00", platform: "Steam", totalSold: 3450, avgRating: "5.0", reviewCount: 1560, featured: true, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "$25 Steam Wallet Gift Card. Redeemable worldwide. Instant code delivery." },
  { id: 31, title: "PlayStation Store — $50 Gift Card", category: "gaming_currency", price: "44.99", originalPrice: "50.00", platform: "PlayStation", totalSold: 2100, avgRating: "4.9", reviewCount: 890, featured: false, stock: 150, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "$50 PlayStation Network gift card. Works on PS4 & PS5. Instant delivery." },
  { id: 32, title: "Xbox Game Pass Ultimate — 3 Months", category: "gaming_currency", price: "24.99", originalPrice: "44.99", platform: "Xbox", totalSold: 1230, avgRating: "4.8", reviewCount: 567, featured: false, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Xbox Game Pass Ultimate. 100+ games, EA Play, Xbox Live Gold included." },
  { id: 33, title: "League of Legends — 7,200 RP", category: "gaming_currency", price: "44.99", originalPrice: "54.99", platform: "League of Legends", totalSold: 1890, avgRating: "4.7", reviewCount: 734, featured: false, stock: 120, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "7,200 Riot Points for League of Legends. Buy skins, champions, and more." },
  { id: 34, title: "PUBG Mobile — 1800 UC", category: "gaming_currency", price: "24.99", originalPrice: "29.99", platform: "PUBG Mobile", totalSold: 3120, avgRating: "4.8", reviewCount: 1230, featured: false, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "1800 Unknown Cash for PUBG Mobile. Buy outfits, crates, and Royale Pass." },
  { id: 35, title: "Residential Proxies — 1GB", category: "proxy_networking", price: "12.99", originalPrice: "24.99", platform: "Residential Proxy", totalSold: 890, avgRating: "4.8", reviewCount: 345, featured: true, stock: 500, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Premium residential proxies. 195+ countries, rotating IPs, unlimited threads." },
  { id: 36, title: "Mobile Proxies — 5GB", category: "proxy_networking", price: "39.99", originalPrice: "69.99", platform: "Mobile Proxy", totalSold: 456, avgRating: "4.9", reviewCount: 189, featured: true, stock: 200, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "4G/5G mobile proxies. Real mobile IPs. Sticky or rotating sessions." },
  { id: 37, title: "IPv6 Proxies — 1000 IPs", category: "proxy_networking", price: "9.99", originalPrice: "19.99", platform: "IPv6 Proxy", totalSold: 1230, avgRating: "4.7", reviewCount: 567, featured: false, stock: 1000, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "1000 dedicated IPv6 proxies. High-speed, unlimited bandwidth. Instant setup." },
  { id: 38, title: "RDP Windows Server — 1 Month", category: "proxy_networking", price: "24.99", originalPrice: "39.99", platform: "RDP/VPS", totalSold: 678, avgRating: "4.8", reviewCount: 278, featured: false, stock: 50, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Windows RDP server. 8GB RAM, 4 vCPU, 100GB SSD. USA/EU locations." },
  { id: 39, title: "Antidetect Browser — GoLogin 1 Month", category: "proxy_networking", price: "19.99", originalPrice: "34.99", platform: "GoLogin", totalSold: 345, avgRating: "4.7", reviewCount: 134, featured: false, stock: 80, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "GoLogin antidetect browser. Manage 100+ profiles. Fingerprint masking." },
  { id: 40, title: "Mullvad VPN — 3 Months", category: "proxy_networking", price: "14.99", originalPrice: "19.50", platform: "Mullvad VPN", totalSold: 567, avgRating: "4.9", reviewCount: 234, featured: false, stock: 100, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Mullvad VPN. No logs, anonymous account, WireGuard protocol. 5 devices." },
  { id: 41, title: "US Phone Number — WhatsApp Verify", category: "verification_services", price: "1.99", originalPrice: "3.99", platform: "WhatsApp", totalSold: 12400, avgRating: "4.8", reviewCount: 4560, featured: true, stock: 1000, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Real US phone number for WhatsApp verification. Instant SMS delivery." },
  { id: 42, title: "UK Phone Number — Telegram Verify", category: "verification_services", price: "2.49", originalPrice: "4.99", platform: "Telegram", totalSold: 8900, avgRating: "4.9", reviewCount: 3450, featured: true, stock: 800, condition: "Fresh" as AccountCondition, deliveryTime: "Instant", description: "Real UK number for Telegram account verification. OTP delivered in seconds." },
  { id: 43, title: "Gmail Account — Fresh PVA", category: "verification_services", price: "2.99", originalPrice: "5.99", platform: "Gmail", totalSold: 6780, avgRating: "4.7", reviewCount: 2340, featured: false, stock: 500, condition: "PVA" as AccountCondition, deliveryTime: "Instant", description: "Fresh Gmail PVA account. Phone verified. Ready to use immediately." },
  { id: 44, title: "Outlook/Hotmail Account — Aged", category: "verification_services", price: "4.99", originalPrice: "8.99", platform: "Outlook", totalSold: 3450, avgRating: "4.8", reviewCount: 1230, featured: false, stock: 300, condition: "Aged" as AccountCondition, deliveryTime: "Instant", description: "Aged Outlook account (2+ years). Phone verified. High trust score." },
  { id: 45, title: "Facebook PVA Account — Aged 2 Years", category: "verification_services", price: "9.99", originalPrice: "17.99", platform: "Facebook", totalSold: 2100, avgRating: "4.6", reviewCount: 890, featured: false, stock: 150, condition: "Aged" as AccountCondition, deliveryTime: "Instant", description: "2-year-old Facebook PVA account. Friends, posts, and activity included." },
  { id: 46, title: "PayPal Verified Account", category: "verification_services", price: "29.99", originalPrice: "49.99", platform: "PayPal", totalSold: 567, avgRating: "4.5", reviewCount: 234, featured: false, stock: 30, condition: "Verified" as AccountCondition, deliveryTime: "Instant", description: "Verified PayPal account. US/UK region. Ready for transactions. Full access." },
];

const TRENDING_IDS = [13, 28, 41, 20, 4, 1, 7, 2];

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
          <div className="text-4xl font-bold text-white/10 select-none">
            {product.platform?.charAt(0)}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Instant Delivery</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{product.platform}</span>
            {(product as any).condition && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${CONDITION_COLORS[(product as any).condition as AccountCondition] ?? 'badge-info'}`}>
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
              className="h-8 px-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 text-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              Buy
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

export default function Marketplace() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<any[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [condition, setCondition] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [sortBy, setSortBy] = useState("best_selling");
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

  // Load dynamic categories from DB, fall back to static CATEGORIES
  const { data: dbCats } = trpc.products.listCategories.useQuery();
  const dynamicCategories = dbCats && dbCats.length > 0
    ? [
        { value: "", label: "All Products", icon: Package, id: null as number | null, children: [] as any[] },
        ...dbCats.map((c: any) => ({ value: c.slug, label: c.label, icon: ICON_MAP[c.icon] ?? Package, id: c.id, children: c.children ?? [] })),
      ]
    : CATEGORIES.map((c: any) => ({ ...c, id: null, children: [] }));
  // Active parent category object (to get its children)
  const activeCatObj = dynamicCategories.find((c: any) => c.value === category);
  const subcategories: any[] = (activeCatObj as any)?.children ?? [];

  const aiSearchMutation = trpc.products.aiSearch.useMutation({
    onSuccess: (data) => setAiResults(data.results),
    onError: () => setAiResults([]),
  });

  const { data: products, isLoading } = trpc.products.list.useQuery({
    category: category || undefined,
    search: search || undefined,
    limit: 20,
    subcategoryId: subcategoryId ?? undefined,
  });

  // Use demo products as fallback, then apply advanced filters + sort
  const baseProducts = (products && products.length > 0)
    ? products
    : DEMO_PRODUCTS.filter((p) => {
        if (category && p.category !== category) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });

  const displayProducts = baseProducts
    .filter((p: any) => {
      if (priceMin && parseFloat(p.price) < parseFloat(priceMin)) return false;
      if (priceMax && parseFloat(p.price) > parseFloat(priceMax)) return false;
      if (minRating > 0 && parseFloat(p.avgRating ?? "0") < minRating) return false;
      if (condition && p.condition !== condition) return false;
      if (deliveryTime === "instant" && p.deliveryTime !== "Instant") return false;
      if (deliveryTime === "fast" && !(["Instant", "< 1 hour", "< 5 min"].includes(p.deliveryTime ?? ""))) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price_asc") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "rating") return parseFloat(b.avgRating ?? "0") - parseFloat(a.avgRating ?? "0");
      if (sortBy === "newest") return (b.id ?? 0) - (a.id ?? 0);
      return (b.totalSold ?? 0) - (a.totalSold ?? 0); // best_selling
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Digital <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-muted-foreground">
            Browse thousands of verified digital products with instant delivery.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-4 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 h-10"
            />
          </div>
          <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-10">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* AI Search Assistant */}
        <div className="mb-8 max-w-xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-xs font-bold">AI</span>
              <Input
                placeholder="Ask AI: e.g. &quot;cheap Netflix account&quot; or &quot;Instagram with 10k followers&quot;"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && aiQuery.trim().length >= 2) { e.preventDefault(); setAiResults(null); aiSearchMutation.mutate({ query: aiQuery.trim() }); } }}
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
                ✕
              </Button>
            )}
          </div>
          {aiResults !== null && (
            <div className="mt-3">
              {aiResults.length === 0 ? (
                <p className="text-xs text-muted-foreground">No AI results found. Try a different query.</p>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">AI found {aiResults.length} product{aiResults.length !== 1 ? 's' : ''} for &quot;{aiQuery}&quot;</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiResults.map((p: any) => (
                      <Link key={p.id} href={`/product/${p.id}`}>
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

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {dynamicCategories.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => { setCategory(value); setSubcategoryId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                category === value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "glass text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Subcategory pills — shown when a parent category with children is selected */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 pl-1">
            <span className="text-xs text-muted-foreground self-center mr-1">Subcategory:</span>
            <button
              onClick={() => setSubcategoryId(null)}
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
                  onClick={() => setSubcategoryId(sub.id)}
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
        {/* Results count + sort + filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{displayProducts.length}</span> products
            {category && (
              <> in <span className="text-primary">{dynamicCategories.find((c) => c.value === category)?.label}</span></>
            )}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="best_selling">Best Selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showFilters ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters {(priceMin || priceMax || minRating > 0) ? `(${[priceMin && 'price', minRating > 0 && 'rating'].filter(Boolean).length})` : ""}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="glass-card rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number" placeholder="Min" value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-8 text-xs bg-white/5 border-white/10"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number" placeholder="Max" value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-8 text-xs bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Rating</label>
              <div className="flex gap-1">
                {[0, 3, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      minRating === r ? "bg-amber-500 text-white" : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === 0 ? "All" : `${r}+★`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Condition</label>
              <div className="flex flex-wrap gap-1">
                {["", "Fresh", "Aged", "Verified", "PVA"].map((c) => (
                  <button key={c} onClick={() => setCondition(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      condition === c ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
                    }`}>
                    {c || "Any"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Delivery Time</label>
              <div className="flex gap-1">
                {["", "instant", "fast"].map((d) => (
                  <button key={d} onClick={() => setDeliveryTime(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      deliveryTime === d ? "bg-emerald-600 text-white" : "glass text-muted-foreground hover:text-foreground"
                    }`}>
                    {d === "" ? "Any" : d === "instant" ? "⚡ Instant" : "💨 Fast"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setPriceMin(""); setPriceMax(""); setMinRating(0); setCondition(""); setDeliveryTime(""); setSortBy("best_selling"); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Trending Section */}
        {!category && !search && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h2 className="text-base font-semibold text-foreground">Trending Right Now</h2>
              <span className="text-xs badge-purple px-2 py-0.5 rounded-full">Hot</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
