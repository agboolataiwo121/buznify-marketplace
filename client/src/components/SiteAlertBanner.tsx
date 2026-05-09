import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { X, AlertTriangle, Info, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type AlertType = "info" | "warning" | "error" | "success";
type AlertSeverity = "low" | "medium" | "high" | "critical";

interface SiteAlert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  affectedService?: string | null;
  autoTriggered?: boolean;
  createdAt?: Date | string | null;
}

const typeConfig: Record<AlertType, {
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
  dismissBg: string;
}> = {
  error: {
    icon: XCircle,
    bg: "bg-red-950/80",
    border: "border-red-700/60",
    text: "text-red-100",
    iconColor: "text-red-400",
    dismissBg: "hover:bg-red-800/50",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-950/80",
    border: "border-amber-700/60",
    text: "text-amber-100",
    iconColor: "text-amber-400",
    dismissBg: "hover:bg-amber-800/50",
  },
  info: {
    icon: Info,
    bg: "bg-blue-950/80",
    border: "border-blue-700/60",
    text: "text-blue-100",
    iconColor: "text-blue-400",
    dismissBg: "hover:bg-blue-800/50",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-950/80",
    border: "border-emerald-700/60",
    text: "text-emerald-100",
    iconColor: "text-emerald-400",
    dismissBg: "hover:bg-emerald-800/50",
  },
};

const severityLabel: Record<AlertSeverity, string> = {
  low: "",
  medium: "",
  high: "⚠ ",
  critical: "🔴 ",
};

function SingleAlert({ alert, onDismiss }: { alert: SiteAlert; onDismiss: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[alert.type] ?? typeConfig.warning;
  const Icon = cfg.icon;
  const isLong = alert.message.length > 120;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 ${cfg.bg} ${cfg.border} ${cfg.text} transition-all`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`mt-0.5 shrink-0 h-4 w-4 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug">
          {severityLabel[alert.severity]}{alert.title}
        </p>
        <p className={`text-xs mt-0.5 opacity-90 leading-relaxed ${!expanded && isLong ? "line-clamp-1" : ""}`}>
          {alert.message}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs opacity-70 hover:opacity-100 mt-0.5 flex items-center gap-0.5 transition-opacity"
          >
            {expanded ? (
              <><ChevronUp className="h-3 w-3" /> Show less</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> Show more</>
            )}
          </button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 shrink-0 rounded-full opacity-60 hover:opacity-100 ${cfg.dismissBg} transition-opacity`}
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function SiteAlertBanner() {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const { data: alerts } = trpc.alerts.getActive.useQuery(undefined, {
    refetchInterval: 60_000, // poll every 60 seconds
    staleTime: 30_000,
  });

  const visibleAlerts = (alerts ?? []).filter((a) => !dismissed.has(a.id)) as SiteAlert[];

  const handleDismiss = (id: number) => {
    setDismissed((prev) => { const next = new Set(prev); next.add(id); return next; });
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="w-full rounded-none border-b border-border overflow-hidden shadow-sm z-40">
      {visibleAlerts.map((alert) => (
        <SingleAlert key={alert.id} alert={alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

export default SiteAlertBanner;
