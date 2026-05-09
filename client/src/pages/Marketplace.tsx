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
} from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Products", icon: Package },
  { value: "social_media_accounts", label: "Social Media", icon: Instagram },
  { value: "streaming_accounts", label: "Streaming", icon: Tv },
  { value: "gaming_accounts", label: "Gaming", icon: Gamepad2 },
  { value: "virtual_numbers", label: "Virtual Numbers", icon: Phone },
  { value: "growth_services", label: "Growth Services", icon: TrendingUp },
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
];

const TRENDING_IDS = [4, 1, 7, 2];

function ProductCard({ product }: { product: typeof DEMO_PRODUCTS[0] }) {
  const discount = product.originalPrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : null;

  const categoryColors: Record<string, string> = {
    social_media_accounts: "from-pink-500/20 to-purple-500/20 border-pink-500/20",
    streaming_accounts: "from-red-500/20 to-orange-500/20 border-red-500/20",
    gaming_accounts: "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
    virtual_numbers: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
    growth_services: "from-violet-500/20 to-purple-500/20 border-violet-500/20",
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

  const aiSearchMutation = trpc.products.aiSearch.useMutation({
    onSuccess: (data) => setAiResults(data.results),
    onError: () => setAiResults([]),
  });

  const { data: products, isLoading } = trpc.products.list.useQuery({
    category: category || undefined,
    search: search || undefined,
    limit: 20,
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
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
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

        {/* Results count + sort + filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{displayProducts.length}</span> products
            {category && (
              <> in <span className="text-primary">{CATEGORIES.find((c) => c.value === category)?.label}</span></>
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
