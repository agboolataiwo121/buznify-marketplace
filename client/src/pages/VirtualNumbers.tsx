import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Phone, Globe, MessageSquare, RefreshCw, Zap, Shield,
  CheckCircle, Timer, Search, X,
  Copy, ChevronDown, ChevronUp, Ban,
  Loader2, DollarSign, CheckSquare, XCircle,
} from "lucide-react";
import ServiceIcon from "@/components/ServiceIcon";

function countryFlag(iso: string): string {
  if (!iso || iso.length < 2) return "\u{1F310}";
  const code = iso.toUpperCase().slice(0, 2);
  return code.replace(/./g, (c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

function useCountdown(expiresAt: Date | string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return timeLeft;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:    { cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", label: "Active" },
    finished:  { cls: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20", label: "Finished" },
    cancelled: { cls: "bg-red-400/10 text-red-400 border-red-400/20", label: "Cancelled" },
    expired:   { cls: "bg-orange-400/10 text-orange-400 border-orange-400/20", label: "Expired" },
    banned:    { cls: "bg-red-600/10 text-red-500 border-red-500/20", label: "Banned" },
  };
  const { cls, label } = map[status] ?? { cls: "bg-muted text-muted-foreground border-muted", label: status };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{label}</span>
  );
}

type NumberRow = {
  id: number;
  number: string;
  service: string | null;
  countryCode: string;
  countryName: string;
  operator: string | null;
  apiOrderId: number | null;
  price: string;
  status: string;
  expiresAt: Date | null;
};

function ActiveNumberCard({ number, onRefreshList }: { number: NumberRow; onRefreshList: () => void }) {
  const timeLeft = useCountdown(number.expiresAt);
  const [expanded, setExpanded] = useState(true);

  const { data: sms, refetch: refetchSms } = trpc.virtualNumbers.getSms.useQuery(
    { numberId: number.id },
    { refetchInterval: number.status === "active" ? 5000 : false }
  );

  const checkSmsMutation = trpc.virtualNumbers.checkSms.useMutation({
    onSuccess: (data) => {
      if (data.sms && data.sms.length > 0) {
        toast.success(`${data.sms.length} SMS received!`);
      } else {
        toast.info("No SMS yet. Keep waiting...");
      }
      refetchSms();
      onRefreshList();
    },
    onError: (e) => toast.error(e.message),
  });

  const finishMutation = trpc.virtualNumbers.finishOrder.useMutation({
    onSuccess: () => { toast.success("Order finished!"); onRefreshList(); },
    onError: (e) => toast.error(e.message),
  });

  const cancelMutation = trpc.virtualNumbers.cancelOrder.useMutation({
    onSuccess: (data) => {
      toast.success(data.refunded ? "Cancelled & refunded!" : "Cancelled.");
      onRefreshList();
    },
    onError: (e) => toast.error(e.message),
  });

  const banMutation = trpc.virtualNumbers.banNumber.useMutation({
    onSuccess: () => { toast.success("Number reported as banned. Refunded."); onRefreshList(); },
    onError: (e) => toast.error(e.message),
  });

  const copyNumber = () => {
    navigator.clipboard.writeText(number.number);
    toast.success("Number copied!");
  };

  const isActive = number.status === "active";
  const isBusy = checkSmsMutation.isPending || finishMutation.isPending || cancelMutation.isPending || banMutation.isPending;

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {number.service && <ServiceIcon name={number.service} size={18} />}
          <div>
          <div className="flex items-center gap-2 mb-1">
            {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            <StatusBadge status={number.status} />
            {number.operator && number.operator !== "any" && (
              <span className="text-xs text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded">{number.operator}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-foreground font-mono">{number.number}</p>
            <button onClick={copyNumber} className="text-muted-foreground hover:text-foreground transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {countryFlag(number.countryCode)} {number.countryName} &middot; {number.service ?? "Any Service"} &middot; ${number.price}
          </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {number.expiresAt && isActive && (
            <div className="flex items-center gap-1 text-sm text-yellow-400">
              <Timer className="w-3.5 h-3.5" />{timeLeft}
            </div>
          )}
          <div className="flex items-center gap-2">
            {isActive && (
              <button
                onClick={() => checkSmsMutation.mutate({ localId: number.id })}
                disabled={isBusy}
                title="Check for new SMS"
                className="text-muted-foreground hover:text-violet-400 transition-colors disabled:opacity-50"
              >
                {checkSmsMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 pt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />SMS Inbox
              </p>
              {isActive && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                </span>
              )}
            </div>
            {!sms || sms.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>{isActive ? "Waiting for SMS..." : "No SMS received."}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(sms as Array<{ id: number; sender: string; message: string; receivedAt: Date }>).map((msg) => {
                  const otpMatch = msg.message.match(/\b\d{4,8}\b/);
                  return (
                    <div key={msg.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-violet-400">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{new Date(msg.receivedAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-foreground">{msg.message}</p>
                      {otpMatch && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(otpMatch[0]); toast.success("OTP copied!"); }}
                          className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Copy className="w-3 h-3" />Copy OTP: <span className="font-mono font-bold">{otpMatch[0]}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isActive && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => finishMutation.mutate({ localId: number.id })}
                disabled={isBusy}
              >
                {finishMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
                Finish
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                onClick={() => cancelMutation.mutate({ localId: number.id })}
                disabled={isBusy}
              >
                {cancelMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Cancel & Refund
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => banMutation.mutate({ localId: number.id })}
                disabled={isBusy}
              >
                {banMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                Report Banned
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VirtualNumbers() {
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "my-numbers">("browse");
  const [selectedCountry, setSelectedCountry] = useState<{ iso: string; name: string; prefix: string } | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { data: countriesRaw, isLoading: loadingCountries } = trpc.virtualNumbers.getCountries.useQuery();
  const { data: productsRaw, isLoading: loadingProducts } = trpc.virtualNumbers.getProducts.useQuery(
    { country: selectedCountry?.iso ?? "russia", operator: "any" },
    { enabled: !!selectedCountry }
  );

  const { data: myNumbers, refetch: refetchNumbers } = trpc.virtualNumbers.myNumbers.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 10000 }
  );

  const countries = useMemo(() => {
    if (!countriesRaw) return [];
    return Object.entries(countriesRaw as Record<string, { name?: string; prefix?: string }>)
      .map(([iso, c]) => ({ iso, name: c.name ?? iso, prefix: c.prefix ?? "" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countriesRaw]);

  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const russia = countries.find((c) => c.iso === "russia") ?? countries[0];
      setSelectedCountry(russia);
    }
  }, [countries, selectedCountry]);

  const products = useMemo(() => {
    if (!productsRaw) return [];
    return Object.entries(productsRaw as Record<string, { Qty: number; Price: number; Category: string }>)
      .map(([name, info]) => ({ name, qty: info.Qty, price: info.Price, category: info.Category }))
      .filter((p) => p.qty > 0)
      .sort((a, b) => a.price - b.price);
  }, [productsRaw]);

  const filteredCountries = useMemo(() =>
    countries.filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.iso.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countries, countrySearch]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const purchaseMutation = trpc.virtualNumbers.purchase.useMutation({
    onSuccess: (data) => {
      toast.success(`Number ${data.number} activated! Check My Numbers tab.`);
      setPurchasing(null);
      setActiveTab("my-numbers");
      refetchNumbers();
    },
    onError: (err) => {
      toast.error(err.message);
      setPurchasing(null);
    },
  });

  const handleBuy = (product: { name: string; price: number }) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (!selectedCountry) { toast.error("Please select a country first."); return; }
    setPurchasing(product.name);
    purchaseMutation.mutate({
      country: selectedCountry.iso,
      countryCode: selectedCountry.iso.toUpperCase().slice(0, 2),
      countryName: selectedCountry.name,
      product: product.name,
      operator: "any",
    });
  };

  return (
    <div className="min-h-screen pb-mobile-nav md:pb-0">
      <Navbar />
      <div className="container pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            <Phone className="w-3 h-3" />
            Virtual Number Marketplace &mdash; Powered by 5sim
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Get a Virtual Number for{" "}
            <span className="gradient-text">Any Service</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real phone numbers from 5sim. Instant activation. Live SMS delivery. No personal info required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 1,400+ Services</span>
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-cyan-400" /> {countries.length > 0 ? `${countries.length}+ Countries` : "100+ Countries"}</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Instant Delivery</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-violet-400" /> 100% Private</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "browse" ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"}`}
          >
            Browse Services
          </button>
          <button
            onClick={() => setActiveTab("my-numbers")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "my-numbers" ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"}`}
          >
            My Numbers
            {myNumbers && myNumbers.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-violet-500/30 rounded-full text-xs">{myNumbers.length}</span>
            )}
          </button>
        </div>

        {activeTab === "browse" && (
          <div>
            <div className="flex flex-col gap-3 mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="glass border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium hover:border-violet-500/40 transition-all w-full sm:min-w-[200px] sm:w-auto"
                >
                  <span className="text-lg">{selectedCountry ? countryFlag(selectedCountry.iso.toUpperCase().slice(0, 2)) : "\u{1F310}"}</span>
                  <span className="text-foreground capitalize">{selectedCountry?.name ?? "Select Country"}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
                {showCountryPicker && (
                  <div className="absolute top-full left-0 mt-2 w-72 glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-white/10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country..."
                          className="pl-9 bg-white/5 border-white/10 text-sm"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loadingCountries ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                        </div>
                      ) : filteredCountries.map((c) => (
                        <button
                          key={c.iso}
                          onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); setCountrySearch(""); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${selectedCountry?.iso === c.iso ? "bg-violet-500/10 text-violet-400" : "text-foreground"}`}
                        >
                          <span className="text-base">{countryFlag(c.iso.toUpperCase().slice(0, 2))}</span>
                          <span className="capitalize flex-1">{c.name}</span>
                          {c.prefix && <span className="text-xs text-muted-foreground">+{c.prefix}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services (whatsapp, telegram, google...)"
                  className="pl-9 glass border-white/10"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {!selectedCountry ? (
              <div className="text-center py-16 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Select a country to see available services.</p>
              </div>
            ) : loadingProducts ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <span className="ml-3 text-muted-foreground">Loading live services from 5sim...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No services available for this country{search ? " matching your search" : ""}.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length.toLocaleString()}</span> services in{" "}
                  <span className="text-violet-400 capitalize font-medium">{selectedCountry.name}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredProducts.map((product) => {
                    const isBuying = purchasing === product.name;
                    return (
                      <div key={product.name} className="glass rounded-2xl p-4 border border-white/5 hover:border-violet-500/30 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <ServiceIcon name={product.name} size={20} />
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                              <DollarSign className="w-4 h-4" />
                              {product.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">{product.qty.toLocaleString()} available</div>
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground capitalize mb-1 truncate">{product.name.replace(/_/g, " ")}</h3>
                        <p className="text-xs text-muted-foreground mb-3 capitalize">{product.category}</p>
                        <Button
                          className="w-full h-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 text-xs font-semibold"
                          onClick={() => handleBuy(product)}
                          disabled={!!purchasing || isBuying}
                        >
                          {isBuying ? (
                            <><Loader2 className="w-3 h-3 animate-spin mr-1" />Purchasing...</>
                          ) : (
                            <><Zap className="w-3 h-3 mr-1" />Buy Number</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "my-numbers" && (
          <div>
            {!isAuthenticated ? (
              <div className="text-center py-16">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to view your numbers</h3>
                <Button onClick={() => window.location.href = getLoginUrl()} className="bg-violet-600 hover:bg-violet-500 text-white border-0">
                  Sign In
                </Button>
              </div>
            ) : !myNumbers ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              </div>
            ) : myNumbers.length === 0 ? (
              <div className="text-center py-16">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No active numbers</h3>
                <Button onClick={() => setActiveTab("browse")} className="bg-violet-600 hover:bg-violet-500 text-white border-0">
                  Browse Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(myNumbers as NumberRow[]).map((num) => (
                  <ActiveNumberCard key={num.id} number={num} onRefreshList={refetchNumbers} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
