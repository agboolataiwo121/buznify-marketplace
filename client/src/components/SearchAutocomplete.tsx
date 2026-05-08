import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

const TRENDING = [
  "Instagram 10K Followers",
  "Netflix Premium Account",
  "TikTok Growth Package",
  "US Virtual Number",
  "Spotify Premium",
  "YouTube Subscribers",
];

interface Props {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

export default function SearchAutocomplete({ className = "", placeholder = "Search products, services...", onClose }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("bz_recent_searches") ?? "[]"); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Search query
  const { data: rawResults, isLoading } = trpc.products.list.useQuery(
    { search: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= 2 }
  );
  const results = rawResults ?? [];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const saveRecent = useCallback((term: string) => {
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("bz_recent_searches", JSON.stringify(updated));
  }, [recent]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecent(term);
    setOpen(false);
    setQuery("");
    navigate(`/marketplace?search=${encodeURIComponent(term)}`);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(query);
    if (e.key === "Escape") { setOpen(false); onClose?.(); }
  };

  const showDropdown = open && (query.length >= 2 ? true : true);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-9 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-scale-in">
          {/* Search results */}
          {debouncedQuery.length >= 2 && (
            <div>
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : results && results.length > 0 ? (
                <div className="p-2">
                  <p className="text-xs text-muted-foreground px-2 py-1.5">Results</p>
                  {results.map((product: { id: number; title: string; price: string }) => (
                    <button
                      key={product.id}
                      onClick={() => { navigate(`/marketplace/product/${product.id}`); setOpen(false); saveRecent(product.title); onClose?.(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Search className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  <button
                    onClick={() => handleSearch(debouncedQuery)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left mt-1 border-t border-white/5"
                  >
                    <Search className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm text-primary">Search for "{debouncedQuery}"</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No results for "{debouncedQuery}"</p>
                  <button onClick={() => handleSearch(debouncedQuery)} className="text-xs text-primary mt-1 hover:underline">
                    Browse all products
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent + Trending (when no query) */}
          {debouncedQuery.length < 2 && (
            <div className="p-2">
              {recent.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Recent</p>
                    <button onClick={() => { setRecent([]); localStorage.removeItem("bz_recent_searches"); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                  </div>
                  {recent.map((term) => (
                    <button key={term} onClick={() => handleSearch(term)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{term}</span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground px-2 py-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Trending</p>
                {TRENDING.map((term) => (
                  <button key={term} onClick={() => handleSearch(term)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left">
                    <TrendingUp className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-sm text-foreground">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
