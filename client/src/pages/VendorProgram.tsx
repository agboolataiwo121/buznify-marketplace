import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Store, Shield, TrendingUp, Zap, CheckCircle, Star, Users, DollarSign,
  ChevronRight, Award, BarChart3, Package, Globe
} from "lucide-react";

const BENEFITS = [
  { icon: Zap, title: "Instant Automated Delivery", desc: "Our platform handles all delivery automatically. You upload credentials once — we deliver instantly on every sale.", color: "text-yellow-400", bg: "from-yellow-500/10 to-orange-500/10" },
  { icon: DollarSign, title: "Competitive Commission", desc: "Keep up to 90% of every sale. Our tiered commission structure rewards high-volume sellers.", color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10" },
  { icon: BarChart3, title: "Seller Analytics", desc: "Real-time dashboard showing sales, revenue, conversion rates, and customer satisfaction scores.", color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/10" },
  { icon: Globe, title: "Global Reach", desc: "Access 52,000+ active buyers across 50+ countries. No marketing needed — we bring the traffic.", color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/10" },
  { icon: Shield, title: "Fraud Protection", desc: "Our escrow system and fraud detection protect you from chargebacks and bad actors.", color: "text-pink-400", bg: "from-pink-500/10 to-rose-500/10" },
  { icon: Award, title: "Vendor Badges", desc: "Earn Verified, Top Seller, and Elite badges that boost your visibility and buyer trust.", color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-500/10" },
];

const TIERS = [
  { name: "Starter", color: "border-white/10", badge: "text-muted-foreground", commission: "85%", minSales: "0", perks: ["Basic analytics", "Standard support", "Up to 20 listings", "Manual payouts"] },
  { name: "Pro", color: "border-violet-500/40", badge: "text-violet-400", commission: "88%", minSales: "$500/mo", perks: ["Advanced analytics", "Priority support", "Up to 100 listings", "Weekly payouts", "Verified badge"], featured: true },
  { name: "Elite", color: "border-yellow-500/30", badge: "text-yellow-400", commission: "90%", minSales: "$5,000/mo", perks: ["Full analytics suite", "Dedicated account manager", "Unlimited listings", "Daily payouts", "Elite badge", "Featured placement"] },
];

const STEPS = [
  { step: "1", title: "Create an Account", desc: "Sign up or log in to Buznify. All registered users can apply to become vendors." },
  { step: "2", title: "Submit Vendor Application", desc: "Fill out the vendor application form with your business details and product categories." },
  { step: "3", title: "Verification Review", desc: "Our team reviews your application within 24 hours. We may request additional verification." },
  { step: "4", title: "List Your Products", desc: "Upload your digital products, set prices, and add delivery credentials. We handle the rest." },
  { step: "5", title: "Start Earning", desc: "Your products go live immediately. Earn on every sale with automated payouts." },
];

export default function VendorProgram() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "oklch(0.45 0.18 290)" }} />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-sm text-violet-300 mb-6">
            <Store className="w-4 h-4" />
            <span>Vendor Program</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Sell on <span className="gradient-text">Buznify</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Join thousands of vendors earning passive income by selling digital accounts, growth services, and virtual numbers on the world's most trusted digital marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated ? (
              <Link href="/vendor">
                <button className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all">
                  Go to Vendor Dashboard
                </button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <button className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all">
                  Apply Now — It's Free
                </button>
              </a>
            )}
            <Link href="/contact">
              <button className="px-8 py-3.5 rounded-xl glass border border-white/10 hover:border-white/20 text-foreground font-semibold transition-all">
                Talk to Sales
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            {["No monthly fees", "Instant approval", "Keep up to 90%"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Sell on Buznify?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${bg}`}>
                <Icon className={`w-7 h-7 ${color} mb-4`} />
                <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">Vendor Tiers</h2>
          <p className="text-muted-foreground text-center mb-10">Higher sales unlock better commissions and perks.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {TIERS.map(({ name, color, badge, commission, minSales, perks, featured }) => (
              <div key={name} className={`glass-card rounded-2xl p-6 border ${color} ${featured ? "ring-1 ring-violet-500/30" : ""} relative`}>
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-1 ${badge}`}>{name}</h3>
                <p className="text-3xl font-bold text-foreground mb-1">{commission}</p>
                <p className="text-xs text-muted-foreground mb-4">commission · min {minSales} sales</p>
                <div className="space-y-2">
                  {perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">How to Get Started</h2>
          <div className="space-y-5">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                    {step}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-white/5 mt-2" />}
                </div>
                <div className="glass-card rounded-2xl p-5 flex-1 mb-2">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-y border-white/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "3,200+", label: "Active Vendors" },
              { value: "$2.4M+", label: "Paid to Vendors" },
              { value: "4.8★", label: "Avg Vendor Rating" },
              { value: "< 24h", label: "Approval Time" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold gradient-text mb-1">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
