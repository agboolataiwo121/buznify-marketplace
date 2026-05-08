import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { GitBranch, ChevronRight, Zap, Shield, Star, Bug, Package } from "lucide-react";

const RELEASES = [
  {
    version: "v2.5.0", date: "May 2025", type: "major",
    changes: [
      { type: "feature", text: "AI chatbot support widget with context-aware responses" },
      { type: "feature", text: "Vendor analytics dashboard with revenue charts and conversion tracking" },
      { type: "feature", text: "Referral leaderboard and loyalty rewards system" },
      { type: "feature", text: "Mobile bottom navigation bar for app-like experience" },
      { type: "feature", text: "Search autocomplete with real-time suggestions" },
      { type: "improvement", text: "Redesigned product detail page with escrow badges and anti-fraud notice" },
      { type: "improvement", text: "Enhanced virtual numbers with live expiry countdown timers" },
    ],
  },
  {
    version: "v2.4.0", date: "April 2025", type: "minor",
    changes: [
      { type: "feature", text: "Instant pricing calculator on Growth Services page" },
      { type: "feature", text: "Account condition tags (Fresh, Aged, Verified, PVA) on product cards" },
      { type: "feature", text: "Trending Services section on Marketplace" },
      { type: "feature", text: "Dark/light mode toggle in navigation" },
      { type: "improvement", text: "FAQ accordion section on landing page" },
      { type: "improvement", text: "Payment method icons (Visa, Mastercard, Crypto) in hero" },
    ],
  },
  {
    version: "v2.3.0", date: "March 2025", type: "minor",
    changes: [
      { type: "feature", text: "Legal pages: Terms of Service, Privacy Policy, Refund Policy, Security" },
      { type: "feature", text: "Wallet withdraw functionality" },
      { type: "feature", text: "Growth services purchase flow with automated delivery" },
      { type: "improvement", text: "Animated gradient hero background with floating orbs" },
      { type: "fix", text: "Fixed coupon validation edge cases for percentage discounts" },
    ],
  },
  {
    version: "v2.0.0", date: "February 2025", type: "major",
    changes: [
      { type: "feature", text: "Complete platform relaunch with cyber-tech dark UI" },
      { type: "feature", text: "Vendor dashboard with product management and order tracking" },
      { type: "feature", text: "Admin panel with analytics, user management, and product moderation" },
      { type: "feature", text: "Support ticket system with threaded conversations" },
      { type: "feature", text: "Referral and affiliate system" },
      { type: "feature", text: "Coupon and discount system" },
      { type: "feature", text: "Virtual numbers with SMS inbox and auto-refresh" },
    ],
  },
  {
    version: "v1.0.0", date: "January 2025", type: "major",
    changes: [
      { type: "feature", text: "Initial platform launch with marketplace, user auth, and wallet" },
      { type: "feature", text: "Social media accounts, streaming, and gaming categories" },
      { type: "feature", text: "Automated order delivery system" },
      { type: "feature", text: "User dashboard with order history" },
    ],
  },
];

const TYPE_CONFIG = {
  feature: { icon: Star, color: "text-emerald-400", label: "New" },
  improvement: { icon: Zap, color: "text-blue-400", label: "Improved" },
  fix: { icon: Bug, color: "text-yellow-400", label: "Fixed" },
  security: { icon: Shield, color: "text-violet-400", label: "Security" },
};

const RELEASE_BADGE = {
  major: "badge-purple",
  minor: "badge-info",
  patch: "badge-success",
};

export default function Changelog() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Changelog</span>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Changelog</h1>
            <p className="text-sm text-muted-foreground mt-1">All notable changes to Buznify are documented here.</p>
          </div>
        </div>

        <div className="space-y-8">
          {RELEASES.map(({ version, date, type, changes }) => (
            <div key={version} className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-foreground">{version}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${RELEASE_BADGE[type as keyof typeof RELEASE_BADGE]}`}>
                  {type}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">{date}</span>
              </div>
              <div className="space-y-2.5">
                {changes.map((change, i) => {
                  const cfg = TYPE_CONFIG[change.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.feature;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <cfg.icon className={`w-3.5 h-3.5 ${cfg.color} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-muted-foreground leading-relaxed">{change.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
