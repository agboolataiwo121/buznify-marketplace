import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RefreshCw, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const ELIGIBLE = [
  "Product was not delivered within 24 hours of purchase",
  "Delivered account credentials do not work and cannot be resolved by support",
  "Product description was materially different from what was delivered",
  "Duplicate charge was made for the same order",
  "Technical error prevented access to the purchased product",
];

const NOT_ELIGIBLE = [
  "Change of mind after successful delivery",
  "Account was suspended or banned after delivery due to buyer's actions",
  "Virtual numbers where SMS was already received",
  "Social media growth services where delivery has started",
  "Accounts that have been used, modified, or accessed by the buyer",
  "Purchases made with promotional credits or bonuses",
];

export default function RefundPolicy() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Refund Policy</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Refund Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: January 1, 2025</p>
          </div>
        </div>

        {/* Overview */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-blue-500/20">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Due to the nature of digital products and instant automated delivery, our refund policy is limited. We evaluate refund requests on a case-by-case basis and aim to resolve all disputes fairly. Please read this policy carefully before making a purchase.
          </p>
        </div>

        {/* Eligible */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-foreground">Eligible for Refund</h2>
          </div>
          <div className="space-y-3">
            {ELIGIBLE.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Not Eligible */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-semibold text-foreground">Not Eligible for Refund</h2>
          </div>
          <div className="space-y-3">
            {NOT_ELIGIBLE.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Refund Process</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Submit a Support Ticket", desc: "Go to the Support Center and create a ticket with your order ID and a detailed description of the issue." },
              { step: "2", title: "Review Period", desc: "Our team will review your request within 24-48 hours. We may ask for additional information or screenshots." },
              { step: "3", title: "Resolution", desc: "If approved, refunds are credited to your Buznify Wallet within 1 business day. Wallet credits can be used for future purchases." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                  {step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="glass-card rounded-2xl p-6 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-foreground mb-2">Important Note</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Refunds are issued as Buznify Wallet credits, not to the original payment method, unless required by applicable law. Abuse of the refund policy, including fraudulent claims, will result in account suspension. For questions, please{" "}
                <Link href="/support" className="text-primary hover:underline">contact support</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
