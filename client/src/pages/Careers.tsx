import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Briefcase, ChevronRight, Globe, Zap, Heart, Users, MapPin, Clock, DollarSign } from "lucide-react";

const OPENINGS = [
  { title: "Senior Full-Stack Engineer", dept: "Engineering", location: "Remote", type: "Full-time", salary: "$120K–$160K", desc: "Build and scale Buznify's core marketplace infrastructure. React, Node.js, PostgreSQL, and distributed systems experience required." },
  { title: "Product Designer (UI/UX)", dept: "Design", location: "Remote", type: "Full-time", salary: "$90K–$120K", desc: "Shape the visual language and user experience of Buznify. Deep expertise in Figma, design systems, and conversion-focused design." },
  { title: "Growth Marketing Manager", dept: "Marketing", location: "Remote", type: "Full-time", salary: "$80K–$110K", desc: "Drive user acquisition and vendor growth through paid, organic, and partnership channels. Data-driven mindset required." },
  { title: "Fraud & Trust Analyst", dept: "Operations", location: "Remote", type: "Full-time", salary: "$70K–$95K", desc: "Protect our marketplace from fraud, chargebacks, and bad actors. Experience in digital commerce fraud detection preferred." },
  { title: "Customer Success Lead", dept: "Support", location: "Remote", type: "Full-time", salary: "$60K–$80K", desc: "Own the customer experience from onboarding to retention. Build support systems that scale with our growth." },
  { title: "Backend Engineer (Automation)", dept: "Engineering", location: "Remote", type: "Full-time", salary: "$100K–$140K", desc: "Build the automated delivery engine that powers instant product fulfillment. Node.js, queues, and reliability engineering focus." },
];

const PERKS = [
  { icon: Globe, title: "100% Remote", desc: "Work from anywhere in the world." },
  { icon: Zap, title: "Fast-Moving Team", desc: "Ship features weekly, not quarterly." },
  { icon: DollarSign, title: "Competitive Pay", desc: "Top-of-market salaries + equity." },
  { icon: Heart, title: "Health Benefits", desc: "Full medical, dental, and vision." },
  { icon: Clock, title: "Flexible Hours", desc: "Async-first culture. Own your schedule." },
  { icon: Users, title: "Small Team, Big Impact", desc: "Every person shapes the product." },
];

export default function Careers() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="container relative z-10 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Careers</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Join the <span className="gradient-text">Buznify</span> Team
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We're building the future of digital commerce. Join a small, high-impact team that ships fast and thinks big.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-4 text-center">
                <Icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="py-12">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">Open Positions</h2>
          <div className="space-y-4">
            {OPENINGS.map(({ title, dept, location, type, salary, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-6 hover:border-violet-500/30 transition-all cursor-pointer group">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" />{dept}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-400">{salary}</span>
                    <p className="text-xs text-muted-foreground">per year</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                <button
                  onClick={() => { window.location.href = "/contact"; }}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                >
                  Apply Now <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card rounded-2xl p-6 border border-violet-500/20 text-center">
            <h3 className="text-base font-semibold text-foreground mb-2">Don't see your role?</h3>
            <p className="text-sm text-muted-foreground mb-4">We're always looking for exceptional people. Send us your CV and tell us how you'd contribute.</p>
            <Link href="/contact">
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm transition-all">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
