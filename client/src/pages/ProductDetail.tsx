import { useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CountdownTimer, PeopleViewing, StockUrgency } from "@/components/ConversionWidgets";
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
                <div>
                  {product.featured && (
                    <span className="text-xs badge-purple px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                      Featured
                    </span>
                  )}
                  <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
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
                <span className="text-sm text-muted-foreground">Platform: <span className="text-foreground">{product.platform}</span></span>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                {[
                  { icon: Zap, label: "Instant Delivery", color: "text-yellow-400" },
                  { icon: Shield, label: "Verified Product", color: "text-emerald-400" },
                  { icon: Clock, label: "24/7 Support", color: "text-blue-400" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-xs text-muted-foreground">{label}</span>
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
      <Footer />
    </div>
  );
}
