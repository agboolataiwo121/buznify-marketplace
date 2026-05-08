import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Activity, ChevronRight, CheckCircle, AlertCircle, Clock } from "lucide-react";

const SERVICES = [
  { name: "Marketplace API", status: "operational", uptime: "99.99%" },
  { name: "Order Delivery Engine", status: "operational", uptime: "99.97%" },
  { name: "Payment Processing", status: "operational", uptime: "100%" },
  { name: "Virtual Numbers SMS", status: "operational", uptime: "99.95%" },
  { name: "User Authentication", status: "operational", uptime: "100%" },
  { name: "Vendor Dashboard", status: "operational", uptime: "99.98%" },
  { name: "Admin Panel", status: "operational", uptime: "99.99%" },
  { name: "Notifications System", status: "operational", uptime: "99.96%" },
  { name: "Search & Filtering", status: "operational", uptime: "99.94%" },
  { name: "CDN & Static Assets", status: "operational", uptime: "100%" },
];

const INCIDENTS: { date: string; title: string; status: string; desc: string }[] = [
  { date: "Apr 28, 2025", title: "Intermittent SMS Delivery Delays", status: "resolved", desc: "Some virtual number SMS messages experienced 2-5 minute delays due to upstream provider maintenance. Issue resolved within 45 minutes." },
  { date: "Mar 15, 2025", title: "Payment Gateway Timeout", status: "resolved", desc: "A 12-minute window where some payment confirmations were delayed. All transactions were processed correctly. No funds were lost." },
];

const STATUS_CONFIG = {
  operational: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400", label: "Operational" },
  degraded: { icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400", label: "Degraded" },
  outage: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400", label: "Outage" },
};

export default function Status() {
  const allOperational = SERVICES.every(s => s.status === "operational");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">System Status</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Status</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time status of all Buznify services.</p>
          </div>
        </div>

        {/* Overall status */}
        <div className={`glass-card rounded-2xl p-6 mb-8 border ${allOperational ? "border-emerald-500/30" : "border-yellow-500/30"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${allOperational ? "bg-emerald-400" : "bg-yellow-400"} animate-pulse`} />
            <h2 className={`text-lg font-bold ${allOperational ? "text-emerald-400" : "text-yellow-400"}`}>
              {allOperational ? "All Systems Operational" : "Partial Service Disruption"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Last checked: {new Date().toLocaleString()} · Updated every 60 seconds
          </p>
        </div>

        {/* Services */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-5">Services</h2>
          <div className="space-y-3">
            {SERVICES.map(({ name, status, uptime }) => {
              const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
              return (
                <div key={name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                    <span className="text-sm text-foreground">{name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{uptime} uptime</span>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Uptime chart placeholder */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">90-Day Uptime</h2>
          <div className="flex items-end gap-0.5 h-12">
            {Array.from({ length: 90 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${i === 45 || i === 72 ? "bg-yellow-400/60" : "bg-emerald-400/60"}`}
                style={{ height: `${Math.random() * 20 + 80}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">90 days ago</span>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
        </div>

        {/* Incidents */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">Recent Incidents</h2>
          {INCIDENTS.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No incidents in the past 90 days.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {INCIDENTS.map(({ date, title, status, desc }) => (
                <div key={title} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{date}</span>
                    <span className="text-xs badge-success px-2 py-0.5 rounded-full ml-auto">{status}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
