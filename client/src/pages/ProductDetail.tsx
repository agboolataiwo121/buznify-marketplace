import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import ServiceIcon from "@/components/ServiceIcon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CountdownTimer, PeopleViewing, StockUrgency, AbandonedCartBanner } from "@/components/ConversionWidgets";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Star,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  Package,
  Tag,
  Lock,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

const DEMO_PRODUCTS: Record<number, {
  id: number; title: string; category: string; price: string; originalPrice?: string;
  platform: string; totalSold: number; avgRating: string; reviewCount: number;
  featured: boolean; stock: number; description: string;
}> = {
  1: { id: 1, title: "Instagram Account — 10K Followers", category: "social_media_accounts", price: "49.99", originalPrice: "79.99", platform: "Instagram", totalSold: 234, avgRating: "4.8", reviewCount: 89, featured: true, stock: 5, description: "Aged Instagram account with 10,000 real followers. Niche: Lifestyle. Full access provided. Account comes with email access for password recovery. All followers are real and active." },
  2: { id: 2, title: "TikTok Account — 50K Followers", category: "social_media_accounts", price: "129.99", originalPrice: "199.99", platform: "TikTok", totalSold: 156, avgRating: "4.9", reviewCount: 67, featured: true, stock: 3, description: "Verified TikTok account with 50K followers. High engagement rate. Niche: Entertainment. Full credentials included." },
  3: { id: 3, title: "Twitter Account — 5K Followers", category: "social_media_accounts", price: "24.99", platform: "Twitter", totalSold: 312, avgRating: "4.7", reviewCount: 124, featured: false, stock: 8, description: "Aged Twitter/X account with 5,000 followers. Clean history. Full access provided." },
  4: { id: 4, title: "Netflix Premium — 1 Month", category: "streaming_accounts", price: "8.99", originalPrice: "15.99", platform: "Netflix", totalSold: 1240, avgRating: "4.9", reviewCount: 456, featured: true, stock: 50, description: "Netflix 4K UHD Premium plan. 4 screens simultaneously. Instant delivery. Valid for 30 days from activation." },
  5: { id: 5, title: "Spotify Premium — 3 Months", category: "streaming_accounts", price: "6.99", originalPrice: "12.99", platform: "Spotify", totalSold: 892, avgRating: "4.8", reviewCount: 334, featured: true, stock: 30, description: "Spotify Premium individual plan. No ads, offline listening. 3 months validity." },
  6: { id: 6, title: "Disney+ — 1 Month", category: "streaming_accounts", price: "5.99", platform: "Disney+", totalSold: 567, avgRating: "4.7", reviewCount: 201, featured: false, stock: 25, description: "Disney+ premium account. Access to all content including Marvel, Star Wars, and Disney originals." },
  7: { id: 7, title: "Valorant Account — Diamond Rank", category: "gaming_accounts", price: "89.99", originalPrice: "149.99", platform: "Valorant", totalSold: 78, avgRating: "4.9", reviewCount: 45, featured: true, stock: 4, description: "Valorant Diamond account. 200+ skins. Unranked available. Full email access included." },
  8: { id: 8, title: "CSGO Account — Level 10 Faceit", category: "gaming_accounts", price: "59.99", platform: "CSGO", totalSold: 134, avgRating: "4.8", reviewCount: 67, featured: false, stock: 6, description: "CS:GO account with Level 10 Faceit. 2000+ hours. Prime status included." },
  9: { id: 9, title: "Fortnite Account — 100+ Skins", category: "gaming_accounts", price: "149.99", originalPrice: "249.99", platform: "Fortnite", totalSold: 45, avgRating: "5.0", reviewCount: 23, featured: true, stock: 2, description: "Fortnite account with 100+ rare skins including OG skins. Renegade Raider included." },
  10: { id: 10, title: "Steam Account — 500+ Games", category: "gaming_accounts", price: "199.99", originalPrice: "349.99", platform: "Steam", totalSold: 67, avgRating: "4.9", reviewCount: 38, featured: true, stock: 3, description: "Steam account with 500+ games including AAA titles. Level 50+. Full email access included." },
  11: { id: 11, title: "Roblox Account — 10,000 Robux", category: "gaming_accounts", price: "34.99", originalPrice: "59.99", platform: "Roblox", totalSold: 289, avgRating: "4.8", reviewCount: 134, featured: false, stock: 10, description: "Roblox account loaded with 10,000 Robux. Rare limited items included. Full access provided." },
  12: { id: 12, title: "Minecraft Java Edition Account", category: "gaming_accounts", price: "14.99", originalPrice: "26.99", platform: "Minecraft", totalSold: 445, avgRating: "4.7", reviewCount: 210, featured: false, stock: 20, description: "Full Minecraft Java Edition account. Lifetime access. Hypixel ready." },
  13: { id: 13, title: "ChatGPT Plus — 1 Month", category: "ai_tools", price: "18.99", originalPrice: "29.99", platform: "ChatGPT", totalSold: 2340, avgRating: "4.9", reviewCount: 890, featured: true, stock: 100, description: "ChatGPT Plus subscription with GPT-4o access. Unlimited messages, priority access, and DALL-E image generation. Valid for 30 days." },
  14: { id: 14, title: "Claude Pro — 1 Month", category: "ai_tools", price: "16.99", originalPrice: "24.99", platform: "Claude", totalSold: 1120, avgRating: "4.8", reviewCount: 445, featured: true, stock: 80, description: "Claude Pro by Anthropic. Access to Claude 3.5 Sonnet & Opus. 5x more usage than free tier." },
  15: { id: 15, title: "Midjourney Pro — 1 Month", category: "ai_tools", price: "54.99", originalPrice: "79.99", platform: "Midjourney", totalSold: 678, avgRating: "4.9", reviewCount: 312, featured: true, stock: 40, description: "Midjourney Pro plan. Unlimited fast GPU hours. Stealth mode included." },
  16: { id: 16, title: "Runway Gen-3 — Creator Plan", category: "ai_tools", price: "29.99", originalPrice: "44.99", platform: "Runway", totalSold: 234, avgRating: "4.7", reviewCount: 98, featured: false, stock: 30, description: "Runway Gen-3 AI video generation. 625 credits/month. HD exports." },
  17: { id: 17, title: "ElevenLabs Creator — 1 Month", category: "ai_tools", price: "21.99", originalPrice: "33.99", platform: "ElevenLabs", totalSold: 456, avgRating: "4.8", reviewCount: 187, featured: false, stock: 50, description: "ElevenLabs Creator plan. 100K characters/month. Voice cloning included." },
  18: { id: 18, title: "Perplexity Pro — 1 Month", category: "ai_tools", price: "17.99", originalPrice: "24.99", platform: "Perplexity", totalSold: 567, avgRating: "4.7", reviewCount: 223, featured: false, stock: 60, description: "Perplexity Pro with unlimited AI search. Access to GPT-4 & Claude. No ads." },
  19: { id: 19, title: "Sora Access — OpenAI Video AI", category: "ai_tools", price: "39.99", originalPrice: "59.99", platform: "OpenAI", totalSold: 123, avgRating: "4.9", reviewCount: 56, featured: true, stock: 15, description: "OpenAI Sora video generation access. Create stunning AI videos up to 60 seconds." },
  20: { id: 20, title: "YouTube Premium — 1 Month", category: "digital_subscriptions", price: "7.99", originalPrice: "13.99", platform: "YouTube", totalSold: 3450, avgRating: "4.9", reviewCount: 1230, featured: true, stock: 200, description: "YouTube Premium. No ads, background play, YouTube Music included. 30-day validity." },
  21: { id: 21, title: "Canva Pro — 1 Month", category: "digital_subscriptions", price: "9.99", originalPrice: "16.99", platform: "Canva", totalSold: 2100, avgRating: "4.8", reviewCount: 876, featured: true, stock: 150, description: "Canva Pro with unlimited templates, brand kit, and background remover." },
  22: { id: 22, title: "Adobe Creative Cloud — 1 Month", category: "digital_subscriptions", price: "34.99", originalPrice: "59.99", platform: "Adobe", totalSold: 890, avgRating: "4.8", reviewCount: 345, featured: true, stock: 60, description: "Adobe CC All Apps. Photoshop, Illustrator, Premiere Pro, and 20+ more apps." },
  23: { id: 23, title: "Grammarly Premium — 1 Month", category: "digital_subscriptions", price: "8.99", originalPrice: "14.99", platform: "Grammarly", totalSold: 1560, avgRating: "4.7", reviewCount: 678, featured: false, stock: 120, description: "Grammarly Premium with advanced grammar, plagiarism checker, and tone detection." },
  24: { id: 24, title: "Notion AI — Plus Plan", category: "digital_subscriptions", price: "12.99", originalPrice: "19.99", platform: "Notion", totalSold: 780, avgRating: "4.8", reviewCount: 312, featured: false, stock: 80, description: "Notion Plus with AI features. Unlimited blocks, guests, and file uploads." },
  25: { id: 25, title: "Microsoft 365 Personal — 1 Year", category: "digital_subscriptions", price: "29.99", originalPrice: "69.99", platform: "Microsoft", totalSold: 1234, avgRating: "4.9", reviewCount: 567, featured: true, stock: 90, description: "Microsoft 365 Personal. Word, Excel, PowerPoint, 1TB OneDrive. 1 year license." },
  26: { id: 26, title: "CapCut Pro — 1 Month", category: "digital_subscriptions", price: "6.99", originalPrice: "12.99", platform: "CapCut", totalSold: 2340, avgRating: "4.8", reviewCount: 934, featured: false, stock: 100, description: "CapCut Pro with AI tools, 4K export, no watermark, and premium templates." },
  27: { id: 27, title: "NordVPN — 1 Year", category: "digital_subscriptions", price: "39.99", originalPrice: "99.99", platform: "NordVPN", totalSold: 1890, avgRating: "4.9", reviewCount: 789, featured: true, stock: 75, description: "NordVPN 1-year subscription. 6 devices, 5400+ servers in 60 countries." },
  28: { id: 28, title: "Roblox 4,500 Robux", category: "gaming_currency", price: "14.99", originalPrice: "19.99", platform: "Roblox", totalSold: 5670, avgRating: "4.9", reviewCount: 2340, featured: true, stock: 500, description: "4,500 Robux delivered instantly to your account. No account sharing required." },
  29: { id: 29, title: "Fortnite 2,800 V-Bucks", category: "gaming_currency", price: "19.99", originalPrice: "24.99", platform: "Fortnite", totalSold: 4230, avgRating: "4.8", reviewCount: 1890, featured: true, stock: 300, description: "2,800 V-Bucks for Fortnite. Buy skins, emotes, and Battle Pass." },
  30: { id: 30, title: "Steam Gift Card — $25", category: "gaming_currency", price: "22.99", originalPrice: "25.00", platform: "Steam", totalSold: 3450, avgRating: "5.0", reviewCount: 1560, featured: true, stock: 200, description: "$25 Steam Wallet Gift Card. Redeemable worldwide. Instant code delivery." },
  31: { id: 31, title: "PlayStation Store — $50 Gift Card", category: "gaming_currency", price: "44.99", originalPrice: "50.00", platform: "PlayStation", totalSold: 2100, avgRating: "4.9", reviewCount: 890, featured: false, stock: 150, description: "$50 PlayStation Network gift card. Works on PS4 & PS5." },
  32: { id: 32, title: "Xbox Game Pass Ultimate — 3 Months", category: "gaming_currency", price: "24.99", originalPrice: "44.99", platform: "Xbox", totalSold: 1230, avgRating: "4.8", reviewCount: 567, featured: false, stock: 80, description: "Xbox Game Pass Ultimate. 100+ games, EA Play, Xbox Live Gold. 3 months." },
  33: { id: 33, title: "League of Legends — 7,200 RP", category: "gaming_currency", price: "44.99", originalPrice: "54.99", platform: "League of Legends", totalSold: 1890, avgRating: "4.7", reviewCount: 734, featured: false, stock: 120, description: "7,200 Riot Points for League of Legends. Buy skins, champions, and more." },
  34: { id: 34, title: "PUBG Mobile — 1800 UC", category: "gaming_currency", price: "24.99", originalPrice: "29.99", platform: "PUBG Mobile", totalSold: 3120, avgRating: "4.8", reviewCount: 1230, featured: false, stock: 200, description: "1800 Unknown Cash for PUBG Mobile. Buy outfits, crates, and Royale Pass." },
  35: { id: 35, title: "Residential Proxies — 1GB", category: "proxy_networking", price: "12.99", originalPrice: "24.99", platform: "Residential Proxy", totalSold: 890, avgRating: "4.8", reviewCount: 345, featured: true, stock: 500, description: "Premium residential proxies. 195+ countries, rotating IPs, unlimited threads." },
  36: { id: 36, title: "Mobile Proxies — 5GB", category: "proxy_networking", price: "39.99", originalPrice: "69.99", platform: "Mobile Proxy", totalSold: 456, avgRating: "4.9", reviewCount: 189, featured: true, stock: 200, description: "4G/5G mobile proxies. Real mobile IPs. Sticky or rotating sessions." },
  37: { id: 37, title: "IPv6 Proxies — 1000 IPs", category: "proxy_networking", price: "9.99", originalPrice: "19.99", platform: "IPv6 Proxy", totalSold: 1230, avgRating: "4.7", reviewCount: 567, featured: false, stock: 1000, description: "1000 dedicated IPv6 proxies. High-speed, unlimited bandwidth. Instant setup." },
  38: { id: 38, title: "RDP Windows Server — 1 Month", category: "proxy_networking", price: "24.99", originalPrice: "39.99", platform: "RDP/VPS", totalSold: 678, avgRating: "4.8", reviewCount: 278, featured: false, stock: 50, description: "Windows RDP server. 8GB RAM, 4 vCPU, 100GB SSD. USA/EU locations." },
  39: { id: 39, title: "Antidetect Browser — GoLogin 1 Month", category: "proxy_networking", price: "19.99", originalPrice: "34.99", platform: "GoLogin", totalSold: 345, avgRating: "4.7", reviewCount: 134, featured: false, stock: 80, description: "GoLogin antidetect browser. Manage 100+ profiles. Fingerprint masking." },
  40: { id: 40, title: "Mullvad VPN — 3 Months", category: "proxy_networking", price: "14.99", originalPrice: "19.50", platform: "Mullvad VPN", totalSold: 567, avgRating: "4.9", reviewCount: 234, featured: false, stock: 100, description: "Mullvad VPN. No logs, anonymous account, WireGuard protocol. 5 devices." },
  41: { id: 41, title: "US Phone Number — WhatsApp Verify", category: "verification_services", price: "1.99", originalPrice: "3.99", platform: "WhatsApp", totalSold: 12400, avgRating: "4.8", reviewCount: 4560, featured: true, stock: 1000, description: "Real US phone number for WhatsApp verification. Instant SMS delivery. One-time use." },
  42: { id: 42, title: "UK Phone Number — Telegram Verify", category: "verification_services", price: "2.49", originalPrice: "4.99", platform: "Telegram", totalSold: 8900, avgRating: "4.9", reviewCount: 3450, featured: true, stock: 800, description: "Real UK number for Telegram account verification. OTP delivered in seconds." },
  43: { id: 43, title: "Gmail Account — Fresh PVA", category: "verification_services", price: "2.99", originalPrice: "5.99", platform: "Gmail", totalSold: 6780, avgRating: "4.7", reviewCount: 2340, featured: false, stock: 500, description: "Fresh Gmail PVA account. Phone verified. Ready to use immediately." },
  44: { id: 44, title: "Outlook/Hotmail Account — Aged", category: "verification_services", price: "4.99", originalPrice: "8.99", platform: "Outlook", totalSold: 3450, avgRating: "4.8", reviewCount: 1230, featured: false, stock: 300, description: "Aged Outlook account (2+ years). Phone verified. High trust score." },
  45: { id: 45, title: "Facebook PVA Account — Aged 2 Years", category: "verification_services", price: "9.99", originalPrice: "17.99", platform: "Facebook", totalSold: 2100, avgRating: "4.6", reviewCount: 890, featured: false, stock: 150, description: "2-year-old Facebook PVA account. Friends, posts, and activity included." },
  46: { id: 46, title: "PayPal Verified Account", category: "verification_services", price: "29.99", originalPrice: "49.99", platform: "PayPal", totalSold: 567, avgRating: "4.5", reviewCount: 234, featured: false, stock: 30, description: "Verified PayPal account. US/UK region. Ready for transactions. Full access." },
};

const DEMO_REVIEWS = [
  { id: 1, name: "Alex M.", avatar: "AM", rating: 5, comment: "Excellent product, exactly as described. Instant delivery!", createdAt: new Date(Date.now() - 86400000 * 2) },
  { id: 2, name: "Sarah K.", avatar: "SK", rating: 5, comment: "Very happy with my purchase. The account was delivered in seconds.", createdAt: new Date(Date.now() - 86400000 * 5) },
  { id: 3, name: "James T.", avatar: "JT", rating: 4, comment: "Good product, works as expected. Would buy again.", createdAt: new Date(Date.now() - 86400000 * 8) },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "1");
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ discount: number; message: string } | null>(null);
  const [ordering, setOrdering] = useState(false);

  const product = DEMO_PRODUCTS[productId];

  // Related products
  const { data: relatedProducts } = trpc.products.getRelated.useQuery(
    { productId, category: product?.category, limit: 4 },
    { enabled: !!product }
  );

  // Abandoned cart: save to localStorage when viewing, trigger reminder after 5 min
  const [showAbandonedCart, setShowAbandonedCart] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const abandonedCartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!product) return;
    const key = `bz_cart_${productId}`;
    const existing = localStorage.getItem(key);
    if (!existing) {
      localStorage.setItem(key, JSON.stringify({ productId, title: product.title, price: product.price, ts: Date.now() }));
      abandonedCartRef.current = setTimeout(() => setShowAbandonedCart(true), 30 * 60 * 1000);
    } else {
      const saved = JSON.parse(existing);
      if (Date.now() - saved.ts > 30 * 60 * 1000) setShowAbandonedCart(true);
    }
    return () => { if (abandonedCartRef.current) clearTimeout(abandonedCartRef.current); };
  }, [productId, product]);

  const { data: couponData } = trpc.coupons.validate.useQuery(
    { code: couponCode, orderAmount: parseFloat(product?.price ?? "0") },
    { enabled: couponCode.length >= 3 }
  );

  const orderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      if (data.deliveryData) {
        toast.success("Order completed! Check your delivery details below.");
      } else {
        toast.success("Order placed! It will be processed shortly.");
      }
      setOrdering(false);
      // Show push notification opt-in after first successful order
      const alreadyAsked = localStorage.getItem("bz_push_asked");
      if (!alreadyAsked && Notification.permission === "default") {
        setTimeout(() => setShowPushPrompt(true), 1500);
        localStorage.setItem("bz_push_asked", "1");
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setOrdering(false);
    },
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold">Product not found</h2>
          <Link href="/marketplace">
            <Button className="mt-4">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : null;

  const finalPrice = couponApplied
    ? (parseFloat(product.price) - couponApplied.discount).toFixed(2)
    : product.price;

  const handleBuy = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setOrdering(true);
    orderMutation.mutate({
      productId: product.id,
      quantity: 1,
      couponCode: couponApplied ? couponCode : undefined,
    });
  };

  const handleApplyCoupon = () => {
    if (couponData?.valid) {
      setCouponApplied({ discount: couponData.discount!, message: couponData.message });
      toast.success(couponData.message);
    } else {
      toast.error(couponData?.message ?? "Invalid coupon");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-48">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product header */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <ServiceIcon name={product.platform ?? ""} size={44} />
                  <div>
                  {product.featured && (
                    <span className="text-xs badge-purple px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                      Featured
                    </span>
                  )}
                  <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
                  </div>
                </div>
                {discount && (
                  <span className="text-sm badge-success px-2 py-1 rounded-full font-medium flex-shrink-0">
                    -{discount}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(parseFloat(product.avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">{product.avgRating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
                <span className="text-sm text-muted-foreground">{product.totalSold} sold</span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">Platform: <ServiceIcon name={product.platform ?? ""} size={14} /><span className="text-foreground">{product.platform}</span></span>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-6 border-t border-white/5">
                {[
                  { icon: Zap, label: "Instant Delivery", color: "text-yellow-400" },
                  { icon: Shield, label: "Verified Product", color: "text-emerald-400" },
                  { icon: Clock, label: "24/7 Support", color: "text-blue-400" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 sm:gap-2 text-center">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                    <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {DEMO_REVIEWS.map((review) => (
                  <div key={review.id} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{review.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {review.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase sidebar */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              {/* Conversion widgets */}
              <div className="space-y-2 mb-4">
                <PeopleViewing productId={product.id} />
                <StockUrgency stock={product.stock} />
                <CountdownTimer label="Price locks in" durationSeconds={600} />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground">${finalPrice}</span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">${product.originalPrice}</span>
                )}
              </div>
              {couponApplied && (
                <p className="text-sm text-emerald-400 mb-3">{couponApplied.message}</p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">{product.stock} in stock</span>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="pl-8 h-9 bg-white/5 border-white/10 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </div>

              <Button
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 font-semibold text-base"
                onClick={handleBuy}
                disabled={ordering}
              >
                {ordering ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {ordering ? "Processing..." : "Buy Now"}
              </Button>

              <div className="mt-4 space-y-2">
                {[
                  { icon: Zap, text: "Instant automated delivery" },
                  { icon: Shield, text: "Secure payment processing" },
                  { icon: CheckCircle, text: "Satisfaction guarantee" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              {/* Escrow / Protection badges */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Buyer Protection</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Lock, label: "SSL Secured", color: "text-emerald-400" },
                    { icon: BadgeCheck, label: "Verified Seller", color: "text-blue-400" },
                    { icon: Shield, label: "Escrow Protected", color: "text-violet-400" },
                    { icon: CheckCircle, label: "Refund Eligible", color: "text-yellow-400" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5">
                      <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-fraud notice */}
              <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All transactions are monitored for fraud. Never share your account credentials with third parties. Report suspicious activity to support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className="glass-card rounded-2xl p-4 hover:border-primary/40 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{p.platform}</p>
                  <p className="text-sm font-bold text-primary">${p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Abandoned Cart Banner */}
      {showAbandonedCart && (
        <AbandonedCartBanner
          productName={product.title}
          onResume={() => { setShowAbandonedCart(false); document.getElementById('buy-section')?.scrollIntoView({ behavior: 'smooth' }); }}
          onDismiss={() => { setShowAbandonedCart(false); localStorage.removeItem(`bz_cart_${productId}`); }}
        />
      )}

      {/* Push notification opt-in prompt — shown once after first successful order */}
      {showPushPrompt && (
        <PushNotificationPrompt onDismiss={() => setShowPushPrompt(false)} />
      )}

      {/* Sticky mobile Buy Now bar — only visible on small screens */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
        <div className="glass-card rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{product.title}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">${parseFloat(product.price).toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">${parseFloat(product.originalPrice).toFixed(2)}</span>
              )}
            </div>
          </div>
          <Button
            className="shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 font-semibold px-5 h-10"
            onClick={handleBuy}
            disabled={ordering}
          >
            {ordering ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-1.5" />
            )}
            {ordering ? "..." : "Buy Now"}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
