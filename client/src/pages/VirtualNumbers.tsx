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
  CheckCircle, Timer, Search, Star, Filter, X,
  Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  ALL_SERVICES, SERVICE_CATEGORIES, CATEGORY_ICONS,
  type VNService, type ServiceCategory,
} from "@/data/virtualNumberServices";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}", price: 0.10 },
  { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", price: 0.12 },
  { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}", price: 0.05 },
  { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}", price: 0.04 },
  { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}", price: 0.14 },
  { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}", price: 0.13 },
  { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", price: 0.06 },
  { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", price: 0.03 },
  { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}", price: 0.04 },
  { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", price: 0.04 },
  { code: "PK", name: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}", price: 0.03 },
  { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}", price: 0.11 },
  { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}", price: 0.13 },
  { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", price: 0.05 },
  { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", price: 0.05 },
  { code: "UA", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}", price: 0.04 },
  { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}", price: 0.07 },
  { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", price: 0.04 },
  { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", price: 0.05 },
  { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", price: 0.05 },
  { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", price: 0.10 },
  { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", price: 0.06 },
  { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}", price: 0.04 },
  { code: "GH", name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}", price: 0.04 },
  { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}", price: 0.04 },
  { code: "AR", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", price: 0.05 },
  { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}", price: 0.12 },
  { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}", price: 0.12 },
  { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", price: 0.13 },
  { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", price: 0.13 },
  { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}", price: 0.15 },
  { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", price: 0.12 },
  { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}", price: 0.06 },
  { code: "SA", name: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}", price: 0.08 },
  { code: "AE", name: "UAE", flag: "\u{1F1E6}\u{1F1EA}", price: 0.10 },
  { code: "IL", name: "Israel", flag: "\u{1F1EE}\u{1F1F1}", price: 0.12 },
  { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}", price: 0.05 },
  { code: "ET", name: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}", price: 0.03 },
  { code: "TZ", name: "Tanzania", flag: "\u{1F1F9}\u{1F1FF}", price: 0.04 },
  { code: "UG", name: "Uganda", flag: "\u{1F1FA}\u{1F1EC}", price: 0.04 },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest OTP" },
  { value: "success", label: "Highest Success Rate" },
  { value: "az", label: "A to Z" },
];

const SPEED_ORDER: Record<string, number> = { Instant: 0, Fast: 1, Medium: 2, Slow: 3 };

function useCountdown(expiresAt: Date | null | undefined) {
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

function speedBg(speed: string) {
  if (speed === "Instant") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  if (speed === "Fast") return "bg-cyan-400/10 text-cyan-400 border-cyan-400/20";
  if (speed === "Medium") return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
  return "bg-orange-400/10 text-orange-400 border-orange-400/20";
}

export default function VirtualNumbers() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "All">("All");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [sortBy, setSortBy] = useState("popular");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "my-numbers">("browse");

  const { data: myNumbers, refetch: refetchNumbers } = trpc.virtualNumbers.myNumbers.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );

  const purchaseMutation = trpc.virtualNumbers.purchase.useMutation({
    onSuccess: () => {
      toast.success("Number activated! Check My Numbers tab.");
      setPurchasing(null);
      refetchNumbers();
    },
    onError: (err) => {
      toast.error(err.message);
      setPurchasing(null);
    },
  });

  const filteredServices = useMemo(() => {
    let list = [...ALL_SERVICES];
    if (selectedCategory !== "All") list = list.filter(s => s.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    if (maxPrice !== null) list = list.filter(s => (s.price + selectedCountry.price) <= maxPrice);
    switch (sortBy) {
      case "cheapest": list.sort((a, b) => a.price - b.price); break;
      case "fastest": list.sort((a, b) => SPEED_ORDER[a.speed] - SPEED_ORDER[b.speed]); break;
      case "success": list.sort((a, b) => b.successRate - a.successRate); break;
      case "az": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => b.stock - a.stock); break;
    }
    return list;
  }, [search, selectedCategory, sortBy, maxPrice, selectedCountry]);

  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    ), [countrySearch]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_SERVICES.length };
    for (const cat of SERVICE_CATEGORIES) {
      counts[cat] = ALL_SERVICES.filter(s => s.category === cat).length;
    }
    return counts;
  }, []);

  const handleBuy = (service: VNService) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    setPurchasing(service.name);
    purchaseMutation.mutate({ countryCode: selectedCountry.code, countryName: selectedCountry.name, service: service.name });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            <Phone className="w-3 h-3" />
            Virtual Number Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Get a Virtual Number for{" "}
            <span className="gradient-text">Any Service</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            1,400+ services supported. Instant activation. Real SMS delivery. No personal info required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 1,400+ Services</span>
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-cyan-400" /> 40+ Countries</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Instant Delivery</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-violet-400" /> 100% Private</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("browse")} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "browse" ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"}`}>
            Browse Services
          </button>
          <button onClick={() => setActiveTab("my-numbers")} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "my-numbers" ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"}`}>
            My Numbers
            {myNumbers && myNumbers.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-violet-500/30 rounded-full text-xs">{myNumbers.length}</span>
            )}
          </button>
        </div>

        {activeTab === "browse" ? (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <button onClick={() => setShowCountryPicker(!showCountryPicker)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-foreground font-medium">{selectedCountry.code}</span>
                    <span className="text-muted-foreground text-xs">+${selectedCountry.price.toFixed(2)}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {showCountryPicker && (
                    <div className="absolute top-full left-0 mt-2 w-72 glass rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-white/10">
                        <Input placeholder="Search country..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)} className="h-8 bg-white/5 border-white/10 text-sm" autoFocus />
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filteredCountries.map(c => (
                          <button key={c.code} onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); setCountrySearch(""); }} className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors text-sm ${selectedCountry.code === c.code ? "bg-violet-500/20" : ""}`}>
                            <span className="text-lg">{c.flag}</span>
                            <span className="text-foreground flex-1 text-left">{c.name}</span>
                            <span className="text-muted-foreground text-xs">+${c.price.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search 1,400+ services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-violet-500">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-background">{o.label}</option>)}
                </select>
                <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${showFilters ? "bg-violet-500/20 border-violet-500/40 text-violet-400" : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"}`}>
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>
              {showFilters && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Max price:</span>
                    <select value={maxPrice ?? ""} onChange={e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none">
                      <option value="" className="bg-background">Any price</option>
                      <option value="0.25" className="bg-background">Under $0.25</option>
                      <option value="0.50" className="bg-background">Under $0.50</option>
                      <option value="1.00" className="bg-background">Under $1.00</option>
                      <option value="2.00" className="bg-background">Under $2.00</option>
                    </select>
                  </div>
                  <div className="text-sm text-muted-foreground">Showing <span className="text-foreground font-medium">{filteredServices.length.toLocaleString()}</span> services</div>
                  {(search || selectedCategory !== "All" || maxPrice !== null) && (
                    <button onClick={() => { setSearch(""); setSelectedCategory("All"); setMaxPrice(null); }} className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setSelectedCategory("All")} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === "All" ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"}`}>
                All <span className="text-xs opacity-70">({categoryCounts.All.toLocaleString()})</span>
              </button>
              {SERVICE_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"}`}>
                  {CATEGORY_ICONS[cat]} {cat} <span className="text-xs opacity-70">({categoryCounts[cat]})</span>
                </button>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredServices.length.toLocaleString()} services available
              {selectedCategory !== "All" && <span> in <span className="text-foreground">{selectedCategory}</span></span>}
              {search && <span> matching <span className="text-foreground">"{search}"</span></span>}
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No services found</p>
                <button onClick={() => { setSearch(""); setSelectedCategory("All"); setMaxPrice(null); }} className="mt-3 text-violet-400 hover:underline text-sm">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices.map((service) => {
                  const totalPrice = (service.price + selectedCountry.price).toFixed(2);
                  const isBuying = purchasing === service.name;
                  return (
                    <div key={service.name} className="glass rounded-xl p-4 hover:border-violet-500/30 border border-white/5 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                            {CATEGORY_ICONS[service.category]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-tight truncate">{service.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{service.category}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${service.stock > 100 ? "bg-emerald-400" : service.stock > 20 ? "bg-yellow-400" : "bg-red-400"} animate-pulse`} />
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${speedBg(service.speed)}`}>{service.speed}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{service.successRate}%
                        </span>
                        <span className="text-xs text-muted-foreground">{service.stock > 500 ? "500+" : service.stock} left</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span className="truncate max-w-20">{selectedCountry.name}</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">${totalPrice}</span>
                      </div>
                      <Button className="w-full h-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 text-xs font-semibold" onClick={() => handleBuy(service)} disabled={isBuying}>
                        {isBuying ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" /> : <Phone className="w-3.5 h-3.5 mr-1" />}
                        {isBuying ? "Activating..." : "Get Number"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!isAuthenticated ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to view your numbers</h3>
                <Button onClick={() => window.location.href = getLoginUrl()} className="bg-violet-600 hover:bg-violet-500 text-white border-0">Sign In</Button>
              </div>
            ) : !myNumbers || myNumbers.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No active numbers</h3>
                <Button onClick={() => setActiveTab("browse")} className="bg-violet-600 hover:bg-violet-500 text-white border-0">Browse Services</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myNumbers.map((num) => <ActiveNumberCard key={num.id} number={num} />)}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

type NumberType = {
  id: number; number: string; service: string | null; countryCode: string; status: string; expiresAt: Date | null;
};

function ActiveNumberCard({ number }: { number: NumberType }) {
  const timeLeft = useCountdown(number.expiresAt);
  const [expanded, setExpanded] = useState(true);
  const { data: sms, refetch } = trpc.virtualNumbers.getSms.useQuery(
    { numberId: number.id },
    { refetchInterval: 5000 }
  );
  const copyNumber = () => { navigator.clipboard.writeText(number.number); toast.success("Number copied!"); };

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${number.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`} />
            <span className={`text-xs font-medium uppercase ${number.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`}>{number.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-foreground font-mono">{number.number}</p>
            <button onClick={copyNumber} className="text-muted-foreground hover:text-foreground transition-colors"><Copy className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{number.service ?? "Any Service"} - {number.countryCode}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {number.expiresAt && <div className="flex items-center gap-1 text-sm text-yellow-400"><Timer className="w-3.5 h-3.5" />{timeLeft}</div>}
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-2"><MessageSquare className="w-4 h-4 text-violet-400" />SMS Inbox</p>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span>
          </div>
          {!sms || sms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Waiting for SMS...</p>
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
                      <button onClick={() => { navigator.clipboard.writeText(otpMatch[0]); toast.success("OTP copied!"); }} className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Copy className="w-3 h-3" />Copy OTP: <span className="font-mono font-bold">{otpMatch[0]}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
