import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ChevronDown,
  ChevronUp,
  Star,
  Package,
  Plus,
} from "lucide-react";
import { getLoginUrl } from "@/const";

const PLATFORMS = [
  { key: "all", label: "All Platforms", emoji: "🌐" },
  { key: "instagram", label: "Instagram", emoji: "📸" },
  { key: "tiktok", label: "TikTok", emoji: "🎵" },
  { key: "youtube", label: "YouTube", emoji: "▶️" },
  { key: "facebook", label: "Facebook", emoji: "👥" },
  { key: "twitter", label: "Twitter / X", emoji: "🐦" },
  { key: "telegram", label: "Telegram", emoji: "✈️" },
  { key: "spotify", label: "Spotify", emoji: "🎧" },
  { key: "snapchat", label: "Snapchat", emoji: "👻" },
  { key: "linkedin", label: "LinkedIn", emoji: "💼" },
  { key: "twitch", label: "Twitch", emoji: "🎮" },
  { key: "discord", label: "Discord", emoji: "💬" },
  { key: "threads", label: "Threads", emoji: "🧵" },
  { key: "reddit", label: "Reddit", emoji: "🤖" },
  { key: "soundcloud", label: "SoundCloud", emoji: "🎶" },
  { key: "website", label: "Website Traffic", emoji: "🌍" },
  { key: "other", label: "Other", emoji: "📦" },
];

const SERVICE_TYPES = [
  { key: "all", label: "All Types" },
  { key: "followers", label: "Followers" },
  { key: "subscribers", label: "Subscribers" },
  { key: "likes", label: "Likes" },
  { key: "views", label: "Views" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "members", label: "Members" },
  { key: "plays", label: "Plays" },
  { key: "traffic", label: "Traffic" },
];

const PANEL_LABELS: Record<string, string> = {
  smmkings: "SMMKings",
  peakerr: "Peakerr",
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
  panel: "smmkings" | "peakerr";
  platform: string;
  serviceType: string;
  ratePerThousand: number;
  minQty: number;
  maxQty: number;
}

function ServiceCard({ service, onBuy }: { service: LiveService; onBuy: (s: LiveService) => void }) {
  const [expanded, setExpanded] = useState(false);
  const platformInfo = PLATFORMS.find((p) => p.key === service.platform);
  return (
    <Card className="bg-[#0d1117] border border-white/10 hover:border-violet-500/40 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-base">{platformInfo?.emoji ?? "📦"}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/40 text-violet-300 bg-violet-500/10">
                {PANEL_LABELS[service.panel] ?? service.panel}
              </Badge>
              {service.refill && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/40 text-green-400 bg-green-500/10">
                  <RefreshCw className="w-2.5 h-2.5 mr-1" />Refill
                </Badge>
              )}
              {service.cancel && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-500/40 text-orange-400 bg-orange-500/10">
                  Cancel
                </Badge>
              )}
            </div>
            <p className={`text-sm text-white/90 font-medium leading-snug ${!expanded ? "line-clamp-2" : ""}`}>{service.name}</p>
            {service.name.length > 80 && (
              <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-violet-400 hover:text-violet-300 mt-0.5 flex items-center gap-0.5">
                {expanded ? (<>Less <ChevronUp className="w-3 h-3" /></>) : (<>More <ChevronDown className="w-3 h-3" /></>)}
              </button>
            )}
            <p className="text-[11px] text-white/40 mt-1">{service.category}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-violet-400">${service.ratePerThousand.toFixed(3)}</p>
            <p className="text-[10px] text-white/40">per 1,000</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="text-[11px] text-white/40">
            Min: <span className="text-white/60">{service.minQty.toLocaleString()}</span>
            {" · "}
            Max: <span className="text-white/60">{service.maxQty.toLocaleString()}</span>
          </div>
          <Button size="sm" onClick={() => onBuy(service)} className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-500 text-white">
            <ShoppingCart className="w-3 h-3 mr-1" />Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderModal({
  service,
  onClose,
  userBalance,
}: {
  service: LiveService | null;
  onClose: () => void;
  userBalance: number;
}) {
  const utils = trpc.useUtils();
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(service?.minQty ?? 100);
  const [speedLabel, setSpeedLabel] = useState<"slow" | "medium" | "fast" | "instant">("medium");
  const [dripFeed, setDripFeed] = useState(false);
  const [dripInterval, setDripInterval] = useState(60);

  const placeOrder = trpc.growth.placeOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Order #${data.apiOrderId} is processing. Balance: $${data.newBalance.toFixed(2)}`);
      utils.growth.myOrders.invalidate();
      utils.auth.me.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!service) return null;
  const qty = Math.min(Math.max(quantity, service.minQty), service.maxQty);
  const totalPrice = (qty / 1000) * service.ratePerThousand;
  const canAfford = userBalance >= totalPrice;

  return (
    <Dialog open={!!service} onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#0d1117] border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-violet-400" />Place Order
          </DialogTitle>
          <DialogDescription className="text-white/50 text-sm leading-snug">{service.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-violet-500/40 text-violet-300 bg-violet-500/10">{PANEL_LABELS[service.panel]}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/50">Service #{service.service}</Badge>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Target URL / Username</label>
            <Input
              placeholder="https://instagram.com/username"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Quantity</label>
              <span className="text-sm font-mono text-violet-300">{qty.toLocaleString()}</span>
            </div>
            <Slider
              min={service.minQty}
              max={Math.min(service.maxQty, 100000)}
              step={Math.max(1, Math.floor(service.minQty / 10))}
              value={[qty]}
              onValueChange={([v]) => setQuantity(v)}
              className="[&_[role=slider]]:bg-violet-500"
            />
            <div className="flex justify-between text-[11px] text-white/30">
              <span>Min: {service.minQty.toLocaleString()}</span>
              <span>Max: {service.maxQty.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Rate</span>
              <span className="text-white/80">${service.ratePerThousand.toFixed(4)} / 1,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Quantity</span>
              <span className="text-white/80">{qty.toLocaleString()}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
              <span className="text-white/70">Total</span>
              <span className={canAfford ? "text-green-400" : "text-red-400"}>${totalPrice.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Your balance</span>
              <span className={canAfford ? "text-white/60" : "text-red-400"}>${userBalance.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm text-white/70">Delivery Speed</label>
              <div className="flex gap-2">
                {(["slow", "medium", "fast", "instant"] as const).map((s) => (
                  <button key={s} onClick={() => setSpeedLabel(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${speedLabel === s ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-white/30"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Drip-Feed Delivery</p>
                <p className="text-xs text-white/40">Spread delivery over time</p>
              </div>
              <button onClick={() => setDripFeed(d => !d)}
                className={`w-10 h-5 rounded-full transition-colors relative ${dripFeed ? "bg-violet-600" : "bg-white/10"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${dripFeed ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            {dripFeed && (
              <div className="space-y-1.5">
                <label className="text-sm text-white/70">Interval (minutes)</label>
                <Input type="number" value={dripInterval} onChange={e => setDripInterval(parseInt(e.target.value) || 60)}
                  min={1} max={1440} className="bg-white/5 border-white/10 text-white h-8 text-sm" />
              </div>
            )}
          </div>
          {!canAfford && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />Insufficient balance. Please top up your wallet.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white/70">Cancel</Button>
          <Button
            onClick={() => placeOrder.mutate({ panel: service.panel, serviceId: service.service, serviceName: service.name, targetUrl: link, quantity: qty, totalPrice, speedLabel, dripFeed, dripInterval: dripFeed ? dripInterval : undefined })}
            disabled={!link || !canAfford || placeOrder.isPending}
            className="bg-violet-600 hover:bg-violet-500 text-white"
          >
            {placeOrder.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" />Place Order — ${totalPrice.toFixed(4)}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-white/40">#{order.id}</span>
                    {order.apiOrderId && (
                      <span className="text-xs font-mono text-violet-400/70">API#{order.apiOrderId}</span>
                    )}
                    {order.panel && order.panel !== "manual" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-300/70">
                        {PANEL_LABELS[order.panel] ?? order.panel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/80 line-clamp-1">{order.notes ?? "Growth Order"}</p>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{order.targetUrl}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 shrink-0 ${statusClass}`}>{order.status}</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-white/40 mb-1">
                  <span>Progress</span>
                  <span>
                    {order.deliveredCount.toLocaleString()} / {order.quantity.toLocaleString()}
                    {order.remains != null && <span className="text-white/30"> · {order.remains.toLocaleString()} remaining</span>}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/40">
                  ${parseFloat(order.totalAmount).toFixed(4)} · {new Date(order.createdAt).toLocaleDateString()}
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

function MassOrderTab({ services, userBalance, user }: { services: LiveService[]; userBalance: number; user: unknown }) {
  const utils = trpc.useUtils();
  type MassRow = { panel: "smmkings" | "peakerr"; serviceId: number; serviceName: string; targetUrl: string; quantity: number; totalPrice: number; speedLabel: "slow" | "medium" | "fast" | "instant"; dripFeed: boolean; dripInterval?: number };
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
                <select value={row.panel} onChange={e => updateRow(i, { panel: e.target.value as "smmkings" | "peakerr", serviceId: 0, serviceName: "", totalPrice: 0 })}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
                  <option value="smmkings">SMMKings</option>
                  <option value="peakerr">Peakerr</option>
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
                <select value={row.speedLabel} onChange={e => updateRow(i, { speedLabel: e.target.value as "slow" | "medium" | "fast" | "instant" })}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                  <option value="instant">Instant</option>
                </select>
                <span className={`text-xs font-mono ${row.totalPrice > 0 ? "text-violet-300" : "text-white/30"}`}>${row.totalPrice.toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-sm text-white">{rows.length} order{rows.length !== 1 ? "s" : ""} · Total: <span className={canAfford ? "text-green-400" : "text-red-400"}>${totalCost.toFixed(4)}</span></p>
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

export default function GrowthServices() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPanel, setSelectedPanel] = useState<"all" | "smmkings" | "peakerr">("all");
  const [search, setSearch] = useState("");
  const [orderService, setOrderService] = useState<LiveService | null>(null);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const { data: services, isLoading, error, refetch, isFetching } = trpc.growth.listLive.useQuery(
    { panel: selectedPanel },
    { staleTime: 5 * 60 * 1000 }
  );

  const userBalance = parseFloat((user as { balance?: string } | null)?.balance ?? "0");

  const filtered = useMemo(() => {
    if (!services) return [];
    return services.filter((s) => {
      if (selectedPlatform !== "all" && s.platform !== selectedPlatform) return false;
      if (selectedType !== "all" && !s.serviceType.toLowerCase().includes(selectedType.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [services, selectedPlatform, selectedType, search]);

  const handleBuy = useCallback(
    (service: LiveService) => {
      if (!user) { window.location.href = getLoginUrl("/growth-services"); return; }
      setOrderService(service);
    },
    [user]
  );

  const visiblePlatforms = showAllPlatforms ? PLATFORMS : PLATFORMS.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      <div className="border-b border-white/5 bg-gradient-to-r from-violet-950/30 to-[#060910]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-violet-400" />Social Growth Services
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Real services from SMMKings &amp; Peakerr · Instant delivery · Refill guarantee
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="browse" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/60">
              Browse Services
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/60">
              My Orders
            </TabsTrigger>
            <TabsTrigger value="mass" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-white/60">
              Mass Order
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-5">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                />
              </div>
              <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                {(["all", "smmkings", "peakerr"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPanel(p)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedPanel === p ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/80"}`}
                  >
                    {p === "all" ? "All Panels" : PANEL_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {visiblePlatforms.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPlatform(p.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedPlatform === p.key ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white/80"}`}
                  >
                    <span>{p.emoji}</span>{p.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-dashed border-white/20 text-white/40 hover:text-white/60"
                >
                  {showAllPlatforms ? "Less" : `+${PLATFORMS.length - 8} more`}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setSelectedType(t.key)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all ${selectedType === t.key ? "bg-violet-600/30 border-violet-500/50 text-violet-300" : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {!isLoading && !error && (
              <p className="text-xs text-white/40">
                {filtered.length.toLocaleString()} service{filtered.length !== 1 ? "s" : ""} found
                {services && ` · ${services.length.toLocaleString()} total from both panels`}
              </p>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <p className="text-white/50 text-sm">Loading live services from SMMKings &amp; Peakerr...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-white/60 text-sm">Failed to load services: {error.message}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 text-white/60">Retry</Button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Search className="w-10 h-10 text-white/20 mb-3" />
                    <p className="text-white/50 text-sm">No services match your filters.</p>
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSelectedPlatform("all"); setSelectedType("all"); }} className="mt-2 text-violet-400 hover:text-violet-300">
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.slice(0, 200).map((s) => (
                      <ServiceCard key={`${s.panel}-${s.service}`} service={s as LiveService} onBuy={handleBuy} />
                    ))}
                  </div>
                )}
                {filtered.length > 200 && (
                  <p className="text-center text-xs text-white/30 pt-2">
                    Showing 200 of {filtered.length.toLocaleString()} — use filters to narrow down
                  </p>
                )}
              </>
            )}
          </TabsContent>

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
          <TabsContent value="mass">
            <MassOrderTab services={services ?? []} userBalance={userBalance} user={user} />
          </TabsContent>
        </Tabs>
      </div>

      <OrderModal service={orderService} onClose={() => setOrderService(null)} userBalance={userBalance} />
    </div>
  );
}
