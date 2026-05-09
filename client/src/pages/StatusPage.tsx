import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Clock, Activity, Zap, ShoppingBag, Smartphone, CreditCard, Server } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SERVICE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  marketplace: { label: "Marketplace", icon: ShoppingBag, description: "Product listings, orders, and delivery" },
  growth_services: { label: "Growth Services", icon: Activity, description: "SMM panel and social media growth" },
  virtual_numbers: { label: "Virtual Numbers", icon: Smartphone, description: "5sim virtual number purchases and SMS" },
  payments: { label: "Payments", icon: CreditCard, description: "Paystack deposits and wallet credits" },
  api: { label: "Server API", icon: Server, description: "tRPC API and authentication services" },
};

function StatusBadge({ status }: { status: string }) {
  if (status === "operational")
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1.5"><CheckCircle2 className="w-3 h-3" />Operational</Badge>;
  if (status === "degraded")
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1.5"><AlertTriangle className="w-3 h-3" />Degraded</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1.5"><XCircle className="w-3 h-3" />Incident</Badge>;
}

function UptimeBar({ pct }: { pct: number }) {
  const color = pct >= 99.9 ? "bg-emerald-500" : pct >= 99 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-14 text-right">{pct.toFixed(2)}%</span>
    </div>
  );
}

function AlertSeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return <Badge className={map[severity] ?? map.low}>{severity}</Badge>;
}

export default function StatusPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: services, isLoading: loadingServices } = trpc.status.getServiceHealth.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const { data: activeAlerts, isLoading: loadingAlerts } = trpc.status.getActiveAlerts.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const { data: uptimeHistory } = trpc.status.getUptimeHistory.useQuery({ days: 30 }, {
    refetchInterval: 300_000,
  });

  const allOperational = services?.every(s => s.status === "operational") ?? true;
  const hasIncident = services?.some(s => s.status === "incident") ?? false;
  const hasDegradation = services?.some(s => s.status === "degraded") ?? false;

  const overallStatus = hasIncident ? "incident" : hasDegradation ? "degraded" : "operational";
  const overallLabel = hasIncident
    ? "Some services are experiencing issues"
    : hasDegradation
    ? "Some services are partially degraded"
    : "All systems operational";
  const overallColor = hasIncident ? "from-red-500/20 to-red-500/5 border-red-500/30" : hasDegradation ? "from-amber-500/20 to-amber-500/5 border-amber-500/30" : "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
  const overallIcon = hasIncident ? <XCircle className="w-8 h-8 text-red-400" /> : hasDegradation ? <AlertTriangle className="w-8 h-8 text-amber-400" /> : <CheckCircle2 className="w-8 h-8 text-emerald-400" />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground">Real-time health and uptime for all Buznify services</p>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
          >
            <RefreshCw className="w-3 h-3" />
            Auto-refreshes every 60 seconds
          </button>
        </div>

        {/* Overall status banner */}
        <div className={`rounded-xl border bg-gradient-to-r ${overallColor} p-6 flex items-center gap-4`}>
          {overallIcon}
          <div>
            <p className="font-semibold text-lg">{overallLabel}</p>
            <p className="text-sm text-muted-foreground">Last checked: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Active alerts */}
        {activeAlerts && activeAlerts.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Alerts ({activeAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlerts.map((alert: { id: number; title: string; message: string; severity: string; affectedService: string | null; createdAt: Date | string }) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <AlertSeverityBadge severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    {alert.affectedService && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Affected: <span className="text-foreground">{SERVICE_META[alert.affectedService]?.label ?? alert.affectedService}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Service health grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Service Health</h2>
          {loadingServices ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {services?.map(svc => {
                const meta = SERVICE_META[svc.service];
                const Icon = meta?.icon ?? Server;
                return (
                  <Card key={svc.service} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <p className="font-medium text-sm">{meta?.label ?? svc.service}</p>
                              <p className="text-xs text-muted-foreground">{meta?.description}</p>
                            </div>
                            <StatusBadge status={svc.status} />
                          </div>
                          <UptimeBar pct={svc.uptimePct} />
                          <div className="flex items-center gap-4 mt-1.5">
                            {svc.responseTimeMs > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Zap className="w-3 h-3" />{svc.responseTimeMs}ms avg
                              </span>
                            )}
                            {svc.incidentCount > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />{svc.incidentCount} incident{svc.incidentCount !== 1 ? "s" : ""} today
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 30-day uptime summary */}
        {uptimeHistory && uptimeHistory.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">30-Day Uptime Summary</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                {Object.entries(SERVICE_META).map(([key, meta]) => {
                  const records = uptimeHistory.filter((r: { service: string; uptimePct: string | number }) => r.service === key);
                  if (records.length === 0) return null;
                  const avg = records.reduce((acc: number, r: { uptimePct: string | number }) => acc + Number(r.uptimePct), 0) / records.length;
                  const Icon = meta.icon;
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{meta.label}</span>
                      </div>
                      <UptimeBar pct={avg} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* No incidents notice */}
        {allOperational && (!activeAlerts || activeAlerts.length === 0) && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-emerald-400">No incidents reported</p>
              <p className="text-sm text-muted-foreground mt-1">All services have been running normally. We will post updates here if any issues arise.</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          Having issues? <a href="/support" className="text-primary hover:underline">Contact Support</a> or check our <a href="/dashboard/notifications" className="text-primary hover:underline">notifications</a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}
