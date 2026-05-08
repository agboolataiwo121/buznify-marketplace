import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Phone,
  Globe,
  MessageSquare,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

const COUNTRIES = [
  { code: "1", name: "United States", flag: "🇺🇸" },
  { code: "44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "49", name: "Germany", flag: "🇩🇪" },
  { code: "33", name: "France", flag: "🇫🇷" },
  { code: "7", name: "Russia", flag: "🇷🇺" },
  { code: "86", name: "China", flag: "🇨🇳" },
  { code: "81", name: "Japan", flag: "🇯🇵" },
  { code: "91", name: "India", flag: "🇮🇳" },
  { code: "55", name: "Brazil", flag: "🇧🇷" },
  { code: "52", name: "Mexico", flag: "🇲🇽" },
  { code: "34", name: "Spain", flag: "🇪🇸" },
  { code: "39", name: "Italy", flag: "🇮🇹" },
  { code: "31", name: "Netherlands", flag: "🇳🇱" },
  { code: "46", name: "Sweden", flag: "🇸🇪" },
  { code: "47", name: "Norway", flag: "🇳🇴" },
  { code: "48", name: "Poland", flag: "🇵🇱" },
  { code: "380", name: "Ukraine", flag: "🇺🇦" },
  { code: "90", name: "Turkey", flag: "🇹🇷" },
  { code: "966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "971", name: "UAE", flag: "🇦🇪" },
];

const SERVICES = ["WhatsApp", "Telegram", "Instagram", "TikTok", "Twitter", "Facebook", "Google", "Any Service"];

export default function VirtualNumbers() {
  const { isAuthenticated } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedService, setSelectedService] = useState("Any Service");
  const [purchasing, setPurchasing] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: myNumbers, refetch: refetchNumbers } = trpc.virtualNumbers.myNumbers.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 10000 }
  );

  const { data: smsMessages, refetch: refetchSms } = trpc.virtualNumbers.getSms.useQuery(
    { numberId: selectedNumberId! },
    { enabled: !!selectedNumberId, refetchInterval: 5000 }
  );

  const purchaseMutation = trpc.virtualNumbers.purchase.useMutation({
    onSuccess: (data) => {
      toast.success(`Number purchased: ${data.number}`);
      refetchNumbers();
      setPurchasing(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setPurchasing(false);
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setPurchasing(true);
    purchaseMutation.mutate({
      countryCode: selectedCountry.code,
      countryName: selectedCountry.name,
      service: selectedService !== "Any Service" ? selectedService : undefined,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchSms();
    setRefreshing(false);
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
            <span className="text-foreground">Virtual Numbers</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Virtual <span className="gradient-text">Phone Numbers</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Get temporary virtual phone numbers for SMS verification. Choose from 20+ countries. Receive codes instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Purchase panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Get a Number
              </h2>

              {/* Country selection */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Select Country</label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => setSelectedCountry(country)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                        selectedCountry.code === country.code
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "glass text-muted-foreground hover:text-foreground hover:border-white/20"
                      }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service selection */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">For Service</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((service) => (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedService === service
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-white/5">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-lg font-bold text-foreground">$1.99</span>
              </div>

              <Button
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 font-semibold"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Phone className="w-4 h-4 mr-2" />
                )}
                {purchasing ? "Getting Number..." : `Get ${selectedCountry.flag} Number`}
              </Button>

              <div className="mt-4 space-y-2">
                {[
                  { icon: Zap, text: "Instant number activation" },
                  { icon: Shield, text: "Anonymous & private" },
                  { icon: Clock, text: "Valid for 24 hours" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Numbers & SMS inbox */}
          <div className="lg:col-span-2 space-y-4">
            {/* My Numbers */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                My Numbers
              </h2>

              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <Phone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">Sign in to view your numbers</p>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
                    onClick={() => (window.location.href = getLoginUrl())}
                  >
                    Sign In
                  </Button>
                </div>
              ) : !myNumbers || myNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No numbers yet. Purchase one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNumbers.map((num) => {
                    const country = COUNTRIES.find((c) => c.code === num.countryCode);
                    const isExpired = num.expiresAt && new Date(num.expiresAt) < new Date();
                    return (
                      <div
                        key={num.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          selectedNumberId === num.id
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-white/5 hover:bg-white/8 border border-white/5"
                        }`}
                        onClick={() => setSelectedNumberId(num.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country?.flag ?? "🌍"}</span>
                          <div>
                            <p className="text-sm font-mono font-semibold text-foreground">{num.number}</p>
                            <p className="text-xs text-muted-foreground">
                              {num.countryName} {num.service && `• ${num.service}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isExpired ? "badge-warning" : "badge-success"}`}>
                            {isExpired ? "Expired" : "Active"}
                          </span>
                          {num.expiresAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {isExpired ? "Expired" : "Expires"} {new Date(num.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SMS Inbox */}
            {selectedNumberId && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    SMS Inbox
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-white/5 h-8"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Auto-refreshing every 5 seconds</span>
                </div>

                {!smsMessages || smsMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No messages yet. Waiting for SMS...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {smsMessages.map((msg) => (
                      <div key={msg.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.receivedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground font-mono">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: "20+ Countries", desc: "Numbers from US, UK, Germany, France, Russia, and more", color: "text-blue-400" },
            { icon: CheckCircle, title: "Works Everywhere", desc: "Compatible with WhatsApp, Telegram, Instagram, and all major apps", color: "text-emerald-400" },
            { icon: Shield, title: "100% Anonymous", desc: "No personal information required. Complete privacy guaranteed", color: "text-violet-400" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-card rounded-2xl p-6">
              <Icon className={`w-8 h-8 ${color} mb-4`} />
              <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
