import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp,
  Star,
  Zap,
  CheckCircle,
  ChevronRight,
  Users,
  Eye,
  Heart,
  MessageCircle,
  ThumbsUp,
  Calculator,
  LayoutList,
  Timer,
  Plus,
  Trash2,
} from "lucide-react";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", emoji: "📸", color: "from-pink-500 to-purple-500" },
  { value: "tiktok", label: "TikTok", emoji: "🎵", color: "from-pink-400 to-rose-500" },
  { value: "youtube", label: "YouTube", emoji: "▶️", color: "from-red-500 to-red-600" },
  { value: "telegram", label: "Telegram", emoji: "✈️", color: "from-blue-400 to-cyan-500" },
  { value: "twitter", label: "Twitter/X", emoji: "𝕏", color: "from-sky-400 to-blue-500" },
  { value: "facebook", label: "Facebook", emoji: "👤", color: "from-blue-600 to-blue-700" },
];

const SERVICE_ICONS: Record<string, React.ElementType> = {
  followers: Users,
  subscribers: Users,
  views: Eye,
  likes: Heart,
  comments: MessageCircle,
  members: Users,
  page_likes: ThumbsUp,
};

const DEMO_SERVICES = [
  { id: 1, platform: "instagram", serviceType: "followers", title: "500 Instagram Followers", description: "Real-looking followers, gradual delivery", quantity: 500, price: "2.99", deliveryTime: "24-48 hours", featured: false },
  { id: 2, platform: "instagram", serviceType: "followers", title: "1000 Instagram Followers", description: "High quality followers, safe delivery", quantity: 1000, price: "4.99", deliveryTime: "24-48 hours", featured: true },
  { id: 3, platform: "instagram", serviceType: "followers", title: "5000 Instagram Followers", description: "Bulk followers package", quantity: 5000, price: "19.99", deliveryTime: "3-5 days", featured: false },
  { id: 4, platform: "instagram", serviceType: "likes", title: "500 Instagram Likes", description: "Post likes, instant start", quantity: 500, price: "1.99", deliveryTime: "1-6 hours", featured: false },
  { id: 5, platform: "instagram", serviceType: "views", title: "10K Instagram Views", description: "Reel/video views", quantity: 10000, price: "3.99", deliveryTime: "1-6 hours", featured: false },
  { id: 6, platform: "tiktok", serviceType: "followers", title: "1000 TikTok Followers", description: "Real TikTok followers", quantity: 1000, price: "5.99", deliveryTime: "24-48 hours", featured: true },
  { id: 7, platform: "tiktok", serviceType: "views", title: "50K TikTok Views", description: "Video views, fast delivery", quantity: 50000, price: "4.99", deliveryTime: "1-6 hours", featured: false },
  { id: 8, platform: "tiktok", serviceType: "likes", title: "1000 TikTok Likes", description: "Post likes", quantity: 1000, price: "2.99", deliveryTime: "1-6 hours", featured: false },
  { id: 9, platform: "youtube", serviceType: "subscribers", title: "500 YouTube Subscribers", description: "Real subscribers", quantity: 500, price: "9.99", deliveryTime: "3-7 days", featured: false },
  { id: 10, platform: "youtube", serviceType: "subscribers", title: "1000 YouTube Subscribers", description: "High retention subscribers", quantity: 1000, price: "17.99", deliveryTime: "5-10 days", featured: true },
  { id: 11, platform: "youtube", serviceType: "views", title: "10K YouTube Views", description: "High retention views", quantity: 10000, price: "7.99", deliveryTime: "3-5 days", featured: false },
  { id: 12, platform: "telegram", serviceType: "members", title: "500 Telegram Members", description: "Real group/channel members", quantity: 500, price: "3.99", deliveryTime: "24-48 hours", featured: false },
  { id: 13, platform: "telegram", serviceType: "members", title: "2000 Telegram Members", description: "Bulk members package", quantity: 2000, price: "12.99", deliveryTime: "3-5 days", featured: true },
  { id: 14, platform: "twitter", serviceType: "followers", title: "500 Twitter Followers", description: "Real Twitter followers", quantity: 500, price: "3.99", deliveryTime: "24-48 hours", featured: false },
  { id: 15, platform: "twitter", serviceType: "followers", title: "2000 Twitter Followers", description: "High quality followers", quantity: 2000, price: "12.99", deliveryTime: "3-5 days", featured: true },
  { id: 16, platform: "facebook", serviceType: "page_likes", title: "500 Facebook Page Likes", description: "Real page likes", quantity: 500, price: "4.99", deliveryTime: "24-48 hours", featured: false },
  { id: 17, platform: "facebook", serviceType: "page_likes", title: "2000 Facebook Page Likes", description: "Bulk page likes", quantity: 2000, price: "14.99", deliveryTime: "3-5 days", featured: true },
];

function PricingCalculator() {
  const [quantity, setQuantity] = useState(1000);
  const [selectedService, setSelectedService] = useState(DEMO_SERVICES[1]);
  const pricePerUnit = parseFloat(selectedService.price) / selectedService.quantity;
  const totalPrice = (pricePerUnit * quantity).toFixed(2);

  return (
    <div className="glass-card rounded-2xl p-6 mb-10 border border-violet-500/20">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-5 h-5 text-violet-400" />
        <h2 className="text-base font-semibold text-foreground">Instant Pricing Calculator</h2>
        <span className="text-xs badge-purple px-2 py-0.5 rounded-full">Live</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Select Service</label>
          <select
            value={selectedService.id}
            onChange={(e) => {
              const s = DEMO_SERVICES.find((d) => d.id === parseInt(e.target.value));
              if (s) setSelectedService(s);
            }}
            className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none focus:border-primary/50"
          >
            {DEMO_SERVICES.filter((s) => s.platform === "instagram").map((s) => (
              <option key={s.id} value={s.id} className="bg-background">{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Quantity</label>
          <Input
            type="number"
            min={100}
            max={100000}
            step={100}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
            className="bg-white/5 border-white/10 focus:border-primary/50 h-10"
          />
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Estimated Price</p>
          <p className="text-3xl font-bold gradient-text">${totalPrice}</p>
          <p className="text-xs text-muted-foreground mt-1">≈ ${pricePerUnit.toFixed(4)} per unit</p>
        </div>
      </div>
    </div>
  );
}

export default function GrowthServices() {
  const [platform, setPlatform] = useState("instagram");
  const [massMode, setMassMode] = useState(false);
  const [massOrders, setMassOrders] = useState<Array<{ serviceId: number; link: string; qty: number }>>([]);
  const [selectedService, setSelectedService] = useState<(typeof DEMO_SERVICES)[0] | null>(null);
  const [orderLink, setOrderLink] = useState("");
  const [orderQty, setOrderQty] = useState(1000);
  const [dripFeed, setDripFeed] = useState(false);
  const [dripQty, setDripQty] = useState(100);
  const [dripInterval, setDripInterval] = useState(60);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const purchaseMutation = trpc.growthOrders.create.useMutation({
    onSuccess: () => {
      toast.success("Order placed!", { description: "Your growth order is being processed." });
      setShowOrderModal(false);
      setSelectedService(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: services } = trpc.growth.list.useQuery({ platform });
  const displayServices = (services && services.length > 0)
    ? services
    : DEMO_SERVICES.filter((s) => s.platform === platform);
  const currentPlatform = PLATFORMS.find((p) => p.value === platform);

  const handleBuy = (service: (typeof DEMO_SERVICES)[0]) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    setSelectedService(service as any);
    setOrderQty(service.quantity);
    setOrderLink("");
    setDripFeed(false);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = () => {
    if (!selectedService) return;
    if (!orderLink.trim()) { toast.error("Please enter your profile/post link"); return; }
    purchaseMutation.mutate({
      serviceId: selectedService.id,
      targetUrl: orderLink,
      quantity: orderQty,
      dripFeed,
      dripInterval: dripFeed ? dripInterval : undefined,
    });
  };

  const addMassOrder = () => {
    if (massOrders.length >= 10) { toast.error("Max 10 orders in mass mode"); return; }
    setMassOrders(prev => [...prev, { serviceId: displayServices[0]?.id ?? 1, link: "", qty: 1000 }]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Growth Services</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Social Media <span className="gradient-text">Growth Services</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Boost your social media presence with real followers, views, likes, and engagement packages. Fast delivery, guaranteed results.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { icon: CheckCircle, text: "Real & High Quality" },
            { icon: Zap, text: "Fast Delivery" },
            { icon: Star, text: "Refill Guarantee" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              {text}
            </div>
          ))}
        </div>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PLATFORMS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setPlatform(value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                platform === value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "glass text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Pricing Calculator */}
        <PricingCalculator />

        {/* Mass Order Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {currentPlatform?.label} Packages
            </h2>
            <p className="text-sm text-muted-foreground">{displayServices.length} packages available</p>
          </div>
          <button
            onClick={() => setMassMode(!massMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              massMode ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "glass border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            {massMode ? "Exit Mass Mode" : "Mass Order"}
          </button>
        </div>

        {/* Mass Order Panel */}
        {massMode && (
          <div className="glass-card rounded-2xl p-6 mb-8 border border-violet-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Mass Order Tool</h3>
              <Button size="sm" onClick={addMassOrder} className="h-8 gap-1 bg-violet-600 hover:bg-violet-500 text-white border-0">
                <Plus className="w-3.5 h-3.5" /> Add Row
              </Button>
            </div>
            {massOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Click "Add Row" to add orders. Max 10 orders per batch.</p>
            )}
            <div className="space-y-3">
              {massOrders.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_32px] gap-3 items-center">
                  <select
                    value={row.serviceId}
                    onChange={(e) => setMassOrders(prev => prev.map((r, idx) => idx === i ? { ...r, serviceId: parseInt(e.target.value) } : r))}
                    className="h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-2 focus:outline-none"
                  >
                    {displayServices.map((s: any) => <option key={s.id} value={s.id} className="bg-background">{s.title}</option>)}
                  </select>
                  <Input
                    placeholder="Profile/post link"
                    value={row.link}
                    onChange={(e) => setMassOrders(prev => prev.map((r, idx) => idx === i ? { ...r, link: e.target.value } : r))}
                    className="h-9 bg-white/5 border-white/10 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={row.qty}
                    onChange={(e) => setMassOrders(prev => prev.map((r, idx) => idx === i ? { ...r, qty: parseInt(e.target.value) || 1000 } : r))}
                    className="h-9 bg-white/5 border-white/10 text-sm"
                  />
                  <button onClick={() => setMassOrders(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {massOrders.length > 0 && (
              <Button className="mt-4 w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0" onClick={() => toast.info("Mass order submitted!", { description: `${massOrders.length} orders queued for processing` })}>
                Submit {massOrders.length} Orders
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayServices.map((service) => {
            const Icon = SERVICE_ICONS[service.serviceType] ?? Users;
            return (
              <div
                key={service.id}
                className={`glass-card-hover rounded-2xl p-5 flex flex-col ${service.featured ? "border-primary/30" : ""}`}
              >
                {service.featured && (
                  <span className="text-xs badge-purple px-2 py-0.5 rounded-full font-medium mb-3 self-start">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentPlatform?.color} opacity-80 flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">{service.serviceType}</p>
                    <p className="text-sm font-semibold text-foreground">{service.quantity.toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-foreground mb-1">{service.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 flex-1">{service.description}</p>

                <div className="flex items-center gap-1.5 mb-3">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{service.deliveryTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-foreground">${service.price}</span>
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 text-xs"
                    onClick={() => handleBuy(service as any)}
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info section */}
        <div className="mt-16 glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Why Choose Our Growth Services?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: "Real Engagement", desc: "All followers and engagement come from real, active accounts", color: "text-emerald-400" },
              { icon: Zap, title: "Fast Delivery", desc: "Most orders start within minutes of purchase", color: "text-yellow-400" },
              { icon: Star, title: "Refill Guarantee", desc: "Free refill if followers drop within 30 days", color: "text-violet-400" },
              { icon: TrendingUp, title: "Safe & Organic", desc: "Gradual delivery to keep your account safe", color: "text-cyan-400" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title}>
                <Icon className={`w-6 h-6 ${color} mb-3`} />
                <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Order Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="bg-[#0d0d1a] border border-white/10 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Place Order</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">{selectedService.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedService.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="text-lg font-bold gradient-text">${selectedService.price}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Profile / Post URL *</label>
                <Input
                  placeholder="https://instagram.com/yourprofile"
                  value={orderLink}
                  onChange={(e) => setOrderLink(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Quantity</label>
                <Input
                  type="number"
                  min={100}
                  value={orderQty}
                  onChange={(e) => setOrderQty(parseInt(e.target.value) || 100)}
                  className="bg-white/5 border-white/10 focus:border-primary/50"
                />
              </div>
              {/* Drip Feed Toggle */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-foreground">Drip Feed</span>
                    <span className="text-xs badge-purple px-1.5 py-0.5 rounded-full">Pro</span>
                  </div>
                  <button
                    onClick={() => setDripFeed(!dripFeed)}
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      dripFeed ? "bg-violet-600" : "bg-white/10"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      dripFeed ? "left-5" : "left-0.5"
                    }`} />
                  </button>
                </div>
                {dripFeed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Per Interval</label>
                      <Input type="number" value={dripQty} onChange={(e) => setDripQty(parseInt(e.target.value) || 100)}
                        className="h-8 bg-white/5 border-white/10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Interval (min)</label>
                      <Input type="number" value={dripInterval} onChange={(e) => setDripInterval(parseInt(e.target.value) || 60)}
                        className="h-8 bg-white/5 border-white/10 text-sm" />
                    </div>
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                onClick={handleConfirmOrder}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending ? "Processing..." : `Confirm Order — $${selectedService.price}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
