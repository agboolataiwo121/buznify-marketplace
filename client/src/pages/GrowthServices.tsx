import { useState, useMemo, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Search,
  Zap,
  RefreshCw,
  XCircle,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  Loader2,
  Star,
  Package,
  Plus,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import ServiceIcon from "@/components/ServiceIcon";

// ─── Platform grid ─────────────────────────────────────────────────────────────
const PLATFORM_GRID = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "Twitter/X" },
  { key: "spotify", label: "Spotify" },
  { key: "tiktok", label: "TikTok" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "telegram", label: "Telegram" },
  { key: "website", label: "Website Traffic" },
  { key: "other", label: "Other" },
  { key: "all", label: "Everything" },
];

const PANEL_LABELS: Record<string, string> = {
  smmkings: "Server 1",
  smmkings2: "Server 3",
  peakerr: "Server 2",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  partial: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

interface LiveService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
  panel: "smmkings" | "smmkings2" | "peakerr";
  platform: string;
  serviceType: string;
  ratePerThousand: number;
  minQty: number;
  maxQty: number;
}

// ─── My Orders Tab ─────────────────────────────────────────────────────────────
function MyOrdersTab() {
  const { data: orders, isLoading, refetch, isFetching } = trpc.growth.myOrders.useQuery(undefined, { refetchInterval: 30_000 });
  const utils = trpc.useUtils();

  const refillMutation = trpc.growth.refillOrder.useMutation({
    onSuccess: () => { toast.success("Refill requested"); utils.growth.myOrders.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const cancelMutation = trpc.growth.cancelOrder.useMutation({
    onSuccess: () => { toast.success("Order cancelled"); utils.growth.myOrders.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-12 h-12 text-white/20 mb-3" />
        <p className="text-white/50 text-sm">No orders yet. Browse services and place your first order!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-white/50">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-white/10 text-white/60 h-7 text-xs">
          <RefreshCw className={`w-3 h-3 mr-1 ${isFetching ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>
      {orders.map((order) => {
        const statusClass = STATUS_COLORS[order.status.toLowerCase()] ?? "bg-white/10 text-white/60 border-white/20";
        const progress = order.quantity > 0 ? Math.min(100, Math.round((order.deliveredCount / order.quantity) * 100)) : 0;
        return (
          <Card key={order.id} className="bg-[#0d1117] border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-white/40">{PANEL_LABELS[order.panel ?? ""] ?? order.panel}</span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">{order.notes ?? `Service #${order.serviceId}`}</p>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{order.targetUrl}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 shrink-0 ${statusClass}`}>{order.status}</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-white/40 mb-1">
                  <span>Progress</span>
                  <span>
                    {order.deliveredCount.toLocaleString()} / {order.quantity.toLocaleString()}
                    {order.remains != null && <span className="text-white/30"> \u00b7 {order.remains.toLocaleString()} remaining</span>}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/40">
                  ${parseFloat(order.totalAmount).toFixed(4)} \u00b7 {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {order.refillRequested === false && order.apiOrderId && (
                    <Button size="sm" variant="outline" onClick={() => refillMutation.mutate({ growthOrderId: order.id })} disabled={refillMutation.isPending} className="h-6 px-2 text-[11px] border-green-500/30 text-green-400 hover:bg-green-500/10">
                      <RefreshCw className="w-2.5 h-2.5 mr-1" />Refill
                    </Button>
                  )}
                  {order.cancelRequested === false && order.status === "processing" && order.apiOrderId && (
                    <Button size="sm" variant="outline" onClick={() => cancelMutation.mutate({ growthOrderId: order.id })} disabled={cancelMutation.isPending} className="h-6 px-2 text-[11px] border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <XCircle className="w-2.5 h-2.5 mr-1" />Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Mass Order Tab ─────────────────────────────────────────────────────────────
function MassOrderTab({ services, userBalance, user }: { services: LiveService[]; userBalance: number; user: unknown }) {
  const utils = trpc.useUtils();
  type MassRow = { panel: "smmkings" | "smmkings2" | "peakerr"; serviceId: number; serviceName: string; targetUrl: string; quantity: number; totalPrice: number; speedLabel: "slow" | "medium" | "fast" | "instant"; dripFeed: boolean; dripInterval?: number };
  const [rows, setRows] = useState<MassRow[]>([{ panel: "smmkings", serviceId: 0, serviceName: "", targetUrl: "", quantity: 100, totalPrice: 0, speedLabel: "medium", dripFeed: false }]);
  const [results, setResults] = useState<{ serviceName: string; apiOrderId?: string; error?: string }[] | null>(null);

  const massOrderMutation = trpc.growth.massOrder.useMutation({
    onSuccess: (data) => {
      setResults(data.results);
      toast.success(`Mass order submitted. New balance: $${data.newBalance.toFixed(2)}`);
      utils.growth.myOrders.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const totalCost = rows.reduce((s, r) => s + r.totalPrice, 0);
  const canAfford = userBalance >= totalCost;

  const updateRow = (i: number, patch: Partial<MassRow>) => setRows(r => r.map((row, idx) => idx === i ? { ...row, ...patch } : row));
  const addRow = () => setRows(r => [...r, { panel: "smmkings", serviceId: 0, serviceName: "", targetUrl: "", quantity: 100, totalPrice: 0, speedLabel: "medium", dripFeed: false }]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Star className="w-12 h-12 text-white/20" />
        <p className="text-white/50 text-sm">Sign in to use Mass Order</p>
        <Button onClick={() => (window.location.href = getLoginUrl("/growth-services"))} className="bg-violet-600 hover:bg-violet-500 text-white">Sign In</Button>
      </div>
    );
  }

  if (results) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Mass Order Results</h3>
          <Button size="sm" variant="outline" onClick={() => { setResults(null); setRows([{ panel: "smmkings", serviceId: 0, serviceName: "", targetUrl: "", quantity: 100, totalPrice: 0, speedLabel: "medium", dripFeed: false }]); }} className="border-white/10 text-white/60">New Order</Button>
        </div>
        {results.map((r, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${r.error ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"}`}>
            {r.error ? <XCircle className="w-4 h-4 text-red-400 shrink-0" /> : <Zap className="w-4 h-4 text-green-400 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{r.serviceName}</p>
              {r.apiOrderId && <p className="text-xs text-green-400">Order #{r.apiOrderId}</p>}
              {r.error && <p className="text-xs text-red-400">{r.error}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Mass Order</h3>
          <p className="text-xs text-white/40">Submit up to 50 orders at once</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Balance: <span className={canAfford ? "text-violet-400" : "text-red-400"}>${userBalance.toFixed(2)}</span></span>
          <Button size="sm" onClick={addRow} disabled={rows.length >= 50} className="bg-violet-600 hover:bg-violet-500 h-7 text-xs gap-1">
            <Plus className="w-3 h-3" />Add Row
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => {
          const svc = services.find(s => s.service === row.serviceId && s.panel === row.panel);
          return (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-5">#{i+1}</span>
                <select value={row.panel} onChange={e => updateRow(i, { panel: e.target.value as "smmkings" | "smmkings2" | "peakerr", serviceId: 0, serviceName: "", totalPrice: 0 })}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
                  <option value="smmkings">Server 1</option>
                  <option value="peakerr">Server 2</option>
                  <option value="smmkings2">Server 3</option>
                </select>
                <select value={row.serviceId} onChange={e => {
                  const id = parseInt(e.target.value);
                  const s = services.find(sv => sv.service === id && sv.panel === row.panel);
                  const qty = row.quantity;
                  const price = s ? (qty / 1000) * s.ratePerThousand : 0;
                  updateRow(i, { serviceId: id, serviceName: s?.name ?? "", totalPrice: price });
                }} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white min-w-0">
                  <option value={0}>-- Select Service --</option>
                  {services.filter(s => s.panel === row.panel).slice(0, 200).map(s => (
                    <option key={s.service} value={s.service}>{s.name.slice(0, 60)}</option>
                  ))}
                </select>
                <button onClick={() => removeRow(i)} className="text-white/30 hover:text-red-400 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 pl-7">
                <Input value={row.targetUrl} onChange={e => updateRow(i, { targetUrl: e.target.value })}
                  placeholder="Target URL" className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-7 text-xs" />
                <Input type="number" value={row.quantity} onChange={e => {
                  const qty = parseInt(e.target.value) || 100;
                  const price = svc ? (qty / 1000) * svc.ratePerThousand : 0;
                  updateRow(i, { quantity: qty, totalPrice: price });
                }} min={svc?.minQty ?? 10} max={svc?.maxQty ?? 100000}
                  className="w-24 bg-white/5 border-white/10 text-white h-7 text-xs" />
                <span className={`text-xs font-mono ${row.totalPrice > 0 ? "text-violet-300" : "text-white/30"}`}>${row.totalPrice.toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-sm text-white">{rows.length} order{rows.length !== 1 ? "s" : ""} \u00b7 Total: <span className={canAfford ? "text-green-400" : "text-red-400"}>${totalCost.toFixed(4)}</span></p>
          {!canAfford && <p className="text-xs text-red-400">Insufficient balance</p>}
        </div>
        <Button
          onClick={() => {
            const valid = rows.filter(r => r.serviceId > 0 && r.targetUrl && r.quantity > 0 && r.totalPrice > 0);
            if (!valid.length) { toast.error("Add at least one valid order row"); return; }
            if (!canAfford) { toast.error("Insufficient balance"); return; }
            massOrderMutation.mutate({ orders: valid });
          }}
          disabled={massOrderMutation.isPending || !canAfford}
          className="bg-violet-600 hover:bg-violet-500 gap-2">
          {massOrderMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><Zap className="w-4 h-4" />Submit All Orders</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GrowthServices() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("order");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [dripFeed, setDripFeed] = useState(false);
  const [dripInterval, setDripInterval] = useState(60);

  const { data: services, isLoading, error, refetch, isFetching } = trpc.growth.listLive.useQuery(
    { panel: "all" },
    { staleTime: 5 * 60 * 1000 }
  );

  const utils = trpc.useUtils();
  const userBalance = parseFloat((user as { balance?: string } | null)?.balance ?? "0");

  // Filter services by selected platform (or search)
  const platformServices = useMemo(() => {
    if (!services) return [];
    if (search.trim()) {
      const q = search.toLowerCase();
      return services.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.platform.toLowerCase().includes(q));
    }
    if (selectedPlatform === "all") return services;
    return services.filter(s => s.platform === selectedPlatform);
  }, [services, selectedPlatform, search]);

  // Derive unique categories from filtered services
  const categories = useMemo(() => {
    const cats = Array.from(new Set(platformServices.map(s => s.category))).filter(Boolean).sort();
    return cats;
  }, [platformServices]);

  // Reset category + service when platform changes
  useEffect(() => {
    setSelectedCategory("");
    setSelectedServiceId(null);
    setLink("");
    setQuantity(100);
  }, [selectedPlatform, search]);

  // Reset service when category changes
  useEffect(() => {
    setSelectedServiceId(null);
  }, [selectedCategory]);

  // Services within selected category
  const categoryServices = useMemo(() => {
    if (!selectedCategory) return platformServices;
    return platformServices.filter(s => s.category === selectedCategory);
  }, [platformServices, selectedCategory]);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return categoryServices.find(s => s.service === selectedServiceId) ?? null;
  }, [categoryServices, selectedServiceId]);

  const qty = selectedService ? Math.min(Math.max(quantity, selectedService.minQty), selectedService.maxQty) : quantity;
  const totalPrice = selectedService ? (qty / 1000) * selectedService.ratePerThousand : 0;
  const canAfford = userBalance >= totalPrice;

  const placeOrder = trpc.growth.placeOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Order #${data.apiOrderId} placed! Balance: $${data.newBalance.toFixed(2)}`);
      utils.growth.myOrders.invalidate();
      utils.auth.me.invalidate();
      setLink("");
      setSelectedServiceId(null);
      setSelectedCategory("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleOrder = useCallback(() => {
    if (!user) { window.location.href = getLoginUrl("/growth-services"); return; }
    if (!selectedService || !link) return;
    placeOrder.mutate({
      panel: selectedService.panel,
      serviceId: selectedService.service,
      serviceName: selectedService.name,
      targetUrl: link,
      quantity: qty,
      totalPrice,
      speedLabel: "medium",
      dripFeed,
      dripInterval: dripFeed ? dripInterval : undefined,
    });
  }, [user, selectedService, link, qty, totalPrice, dripFeed, dripInterval, placeOrder]);

  return (
    <div className="min-h-screen bg-[#060910] text-white pb-mobile-nav md:pb-0">
      {/* Header */}
      <div className="border-b border-white/5 bg-gradient-to-r from-violet-950/30 to-[#060910]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-violet-400" />Social Growth Services
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Real services from 3 panels \u00b7 Instant delivery \u00b7 Refill guarantee
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                  Balance: <span className="text-violet-400 font-semibold">${userBalance.toFixed(2)}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-white/10 text-white/60">
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="order" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/60">
              New Order
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/60">
              My Orders
            </TabsTrigger>
            <TabsTrigger value="mass" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/60">
              Mass Order
            </TabsTrigger>
          </TabsList>

          {/* ── New Order Tab ── */}
          <TabsContent value="order" className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search for a service or platform..."
                value={search}
                onChange={e => { setSearch(e.target.value); if (e.target.value) setSelectedPlatform("all"); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 text-sm"
              />
            </div>

            {/* Platform Grid */}
            {!search && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {PLATFORM_GRID.map((p) => {
                  const isActive = selectedPlatform === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlatform(p.key)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
                        isActive
                          ? "bg-violet-600/20 border-violet-500 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      <ServiceIcon name={p.key === "all" ? "globe" : p.key === "website" ? "globe" : p.key} size={20} className="shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading / Error */}
            {isLoading && (
              <div className="flex items-center justify-center py-10 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                <p className="text-white/50 text-sm">Loading services...</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-white/60 text-sm">Failed to load services</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 text-white/60">Retry</Button>
              </div>
            )}

            {/* Order Form */}
            {!isLoading && !error && platformServices.length > 0 && (
              <div className="space-y-5">
                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Deployment Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 pr-10"
                    >
                      <option value="">-- Select a category --</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                </div>

                {/* Service Dropdown */}
                {selectedCategory && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">Select Service</label>
                    <div className="relative">
                      <select
                        value={selectedServiceId ?? ""}
                        onChange={e => {
                          const id = parseInt(e.target.value);
                          setSelectedServiceId(isNaN(id) ? null : id);
                          const svc = categoryServices.find(s => s.service === id);
                          if (svc) setQuantity(svc.minQty);
                        }}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 pr-10"
                      >
                        <option value="">-- Select a service --</option>
                        {categoryServices.map(s => (
                          <option key={`${s.panel}-${s.service}`} value={s.service}>
                            {s.service} - {s.name.slice(0, 80)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Service Info Card */}
                {selectedService && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <Badge variant="outline" className="border-violet-500/40 text-violet-300 bg-violet-500/10 text-[11px]">
                        {PANEL_LABELS[selectedService.panel]}
                      </Badge>
                      {selectedService.refill && (
                        <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10 text-[11px]">
                          <RefreshCw className="w-2.5 h-2.5 mr-1" />Refill
                        </Badge>
                      )}
                      {selectedService.cancel && (
                        <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10 text-[11px]">
                          Cancellable
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-white/40 mb-0.5">Rate</p>
                        <p className="text-violet-400 font-bold text-sm">${selectedService.ratePerThousand.toFixed(3)}</p>
                        <p className="text-[10px] text-white/30">per 1K</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-white/40 mb-0.5">Min</p>
                        <p className="text-white font-semibold text-sm">{selectedService.minQty.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-white/40 mb-0.5">Max</p>
                        <p className="text-white font-semibold text-sm">{selectedService.maxQty.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Link + Quantity */}
                {selectedService && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">Link</label>
                      <Input
                        placeholder={`https://${selectedService.platform}.com/...`}
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white">Quantity</label>
                        <span className="text-xs text-white/40">{selectedService.minQty.toLocaleString()} – {selectedService.maxQty.toLocaleString()}</span>
                      </div>
                      <Input
                        type="number"
                        value={qty}
                        onChange={e => setQuantity(parseInt(e.target.value) || selectedService.minQty)}
                        min={selectedService.minQty}
                        max={selectedService.maxQty}
                        className="bg-white/5 border-white/10 text-white focus:border-violet-500 rounded-xl h-11"
                      />
                    </div>
                  </div>
                )}

                {/* Drip Feed */}
                {selectedService && (
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div>
                      <p className="text-sm text-white font-medium">Drip-Feed Delivery</p>
                      <p className="text-xs text-white/40">Spread delivery over time for natural growth</p>
                    </div>
                    <button onClick={() => setDripFeed(d => !d)}
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${dripFeed ? "bg-violet-600" : "bg-white/10"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${dripFeed ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                )}
                {selectedService && dripFeed && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">Interval (minutes)</label>
                    <Input type="number" value={dripInterval} onChange={e => setDripInterval(parseInt(e.target.value) || 60)}
                      min={1} max={1440} className="bg-white/5 border-white/10 text-white rounded-xl h-11" />
                  </div>
                )}

                {/* Price + Order Button */}
                {selectedService && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Rate</span>
                      <span className="text-white/80">${selectedService.ratePerThousand.toFixed(4)} / 1,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Quantity</span>
                      <span className="text-white/80">{qty.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                      <span className="text-white/70">Total</span>
                      <span className={canAfford ? "text-green-400 text-lg" : "text-red-400 text-lg"}>${totalPrice.toFixed(4)}</span>
                    </div>
                    {user && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Your balance</span>
                        <span className={canAfford ? "text-white/60" : "text-red-400"}>${userBalance.toFixed(2)}</span>
                      </div>
                    )}
                    {!canAfford && user && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />Insufficient balance. Please top up your wallet.
                      </p>
                    )}
                    <Button
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white h-12 text-base font-semibold rounded-xl gap-2"
                      disabled={!link || (!!user && !canAfford) || placeOrder.isPending}
                      onClick={handleOrder}
                    >
                      {placeOrder.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Placing Order...</>
                      ) : !user ? (
                        <><Zap className="w-5 h-5" />Sign In to Order</>
                      ) : (
                        <><ShoppingCart className="w-5 h-5" />Place Order — ${totalPrice.toFixed(4)}</>
                      )}
                    </Button>
                  </div>
                )}

                {/* No services found */}
                {platformServices.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Search className="w-10 h-10 text-white/20 mb-3" />
                    <p className="text-white/50 text-sm">No services found for this platform.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── My Orders Tab ── */}
          <TabsContent value="orders">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Star className="w-12 h-12 text-white/20" />
                <p className="text-white/50 text-sm">Sign in to view your orders</p>
                <Button onClick={() => (window.location.href = getLoginUrl("/growth-services"))} className="bg-violet-600 hover:bg-violet-500 text-white">
                  Sign In
                </Button>
              </div>
            ) : (
              <MyOrdersTab />
            )}
          </TabsContent>

          {/* ── Mass Order Tab ── */}
          <TabsContent value="mass">
            <MassOrderTab services={services ?? []} userBalance={userBalance} user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
