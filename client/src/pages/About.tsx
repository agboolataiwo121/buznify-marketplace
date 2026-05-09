import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Zap, Shield, Users, Globe, TrendingUp, Award, ChevronRight, Star } from "lucide-react";

const TEAM = [
  { name: "Alex Rivera", role: "CEO & Co-Founder", avatar: "AR", bio: "10+ years in digital commerce and marketplace platforms." },
  { name: "Mia Chen", role: "CTO & Co-Founder", avatar: "MC", bio: "Ex-Google engineer. Architect of Buznify's automation engine." },
  { name: "James Okafor", role: "Head of Security", avatar: "JO", bio: "Cybersecurity expert with a background in fintech fraud prevention." },
  { name: "Sofia Patel", role: "Head of Growth", avatar: "SP", bio: "Scaled multiple SaaS platforms from 0 to 100K+ users." },
];

const MILESTONES = [
  { year: "2022", event: "Buznify founded with a vision to unify digital account trading, SMM panels, and SMS verification." },
  { year: "2023", event: "Launched beta with 500 products across 3 categories. Reached 10,000 users in 60 days." },
  { year: "2024", event: "Introduced automated delivery engine, growth services, and virtual numbers. Crossed $1M GMV." },
  { year: "2025", event: "Expanded to 50+ countries, 4,800+ services, and 127,000+ completed orders." },
];

const VALUES = [
  { icon: Zap, title: "Speed First", desc: "Every second counts. Our automation delivers products in under 3 seconds on average.", color: "text-yellow-400", bg: "from-yellow-500/10 to-orange-500/10" },
  { icon: Shield, title: "Trust by Design", desc: "Escrow protection, verified products, and anti-fraud systems built into every transaction.", color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10" },
  { icon: Globe, title: "Global Access", desc: "Serving buyers and sellers across 50+ countries with 24/7 automated infrastructure.", color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/10" },
  { icon: Users, title: "Community Driven", desc: "Built with feedback from thousands of real users and power buyers.", color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/10" },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "oklch(0.45 0.18 290)" }} />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-sm text-violet-300 mb-6">
            <Award className="w-4 h-4" />
            <span>About Buznify</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Building the Future of{" "}
            <span className="gradient-text">Digital Commerce</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Buznify is the world's most advanced digital marketplace — combining account trading, social media growth, and SMS verification into one seamless, automated platform.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "127K+", label: "Orders Completed" },
              { value: "52K+", label: "Active Users" },
              { value: "4,800+", label: "Services Listed" },
              { value: "50+", label: "Countries Served" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 border border-violet-500/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We started Buznify because the digital products market was fragmented, untrustworthy, and slow. Buyers were getting scammed. Sellers had no professional platform. Verification services were scattered across dozens of shady websites.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We built Buznify to change that — a single, premium platform where every transaction is automated, every product is verified, and every buyer is protected. Think of it as the Stripe + Shopify + Twilio of digital accounts.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${bg}`}>
                <Icon className={`w-7 h-7 ${color} mb-4`} />
                <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Our Journey</h2>
          <div className="space-y-6">
            {MILESTONES.map(({ year, event }, i) => (
              <div key={year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                    {year.slice(2)}
                  </div>
                  {i < MILESTONES.length - 1 && <div className="w-px flex-1 bg-white/5 mt-2" />}
                </div>
                <div className="glass-card rounded-2xl p-5 flex-1 mb-2">
                  <p className="text-xs text-violet-400 font-semibold mb-1">{year}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">The Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {TEAM.map(({ name, role, avatar, bio }) => (
              <div key={name} className="glass-card rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white mx-auto mb-4">
                  {avatar}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{name}</h3>
                <p className="text-xs text-primary mb-3">{role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-10 border border-violet-500/20">
            <TrendingUp className="w-10 h-10 text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Join Buznify?</h2>
            <p className="text-muted-foreground mb-6">Browse thousands of digital products with instant automated delivery.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/marketplace">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm transition-all">
                  Browse Marketplace
                </button>
              </Link>
              <Link href="/vendor-program">
                <button className="px-6 py-3 rounded-xl glass border border-white/10 hover:border-white/20 text-foreground font-semibold text-sm transition-all">
                  Become a Vendor
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
