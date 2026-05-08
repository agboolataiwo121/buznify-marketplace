import DashboardShell from "@/components/DashboardShell";
import { Shield, Monitor, Smartphone, Globe, Clock, AlertTriangle, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LOGIN_HISTORY = [
  { device: "Chrome on Windows", location: "New York, US", ip: "192.168.1.1", time: "2 minutes ago", current: true, icon: Monitor },
  { device: "Safari on iPhone", location: "New York, US", ip: "192.168.1.2", time: "3 hours ago", current: false, icon: Smartphone },
  { device: "Chrome on MacOS", location: "London, UK", ip: "10.0.0.1", time: "Yesterday, 14:32", current: false, icon: Monitor },
  { device: "Firefox on Windows", location: "Berlin, DE", ip: "172.16.0.1", time: "2 days ago", current: false, icon: Globe },
  { device: "Chrome on Android", location: "New York, US", ip: "192.168.1.5", time: "3 days ago", current: false, icon: Smartphone },
];

const SECURITY_ALERTS = [
  { type: "info", title: "New login from London, UK", desc: "A login was detected from a new location. If this wasn't you, secure your account.", time: "Yesterday" },
  { type: "success", title: "Password changed successfully", desc: "Your account password was updated.", time: "3 days ago" },
  { type: "warning", title: "Unusual login attempt blocked", desc: "A login attempt from an unrecognized device was blocked by our fraud detection.", time: "1 week ago" },
];

export default function DashboardSecurity() {
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const toggle2FA = () => {
    setTwoFAEnabled(!twoFAEnabled);
    toast.success(twoFAEnabled ? "2FA disabled" : "2FA enabled — your account is more secure");
  };

  return (
    <DashboardShell title="Security" subtitle="Manage your account security and login history">
      <div className="space-y-6 max-w-4xl">
        {/* Security score */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Security Score</h2>
                <p className="text-xs text-muted-foreground">Your account protection level</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-400">72<span className="text-sm text-muted-foreground">/100</span></p>
              <p className="text-xs text-muted-foreground">Good</p>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: "72%" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Email verified", done: true },
              { label: "Two-factor auth", done: twoFAEnabled },
              { label: "Strong password", done: true },
            ].map(({ label, done }) => (
              <div key={label} className={`flex items-center gap-2 p-3 rounded-xl ${done ? "bg-emerald-500/10" : "bg-white/5"}`}>
                {done ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                <span className="text-xs text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two-factor authentication */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={toggle2FA}
              className={`relative w-11 h-6 rounded-full transition-colors ${twoFAEnabled ? "bg-violet-600" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${twoFAEnabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {!twoFAEnabled && (
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Enable 2FA to significantly improve your account security and increase your security score.
              </p>
            </div>
          )}
        </div>

        {/* Security alerts */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Security Alerts
          </h2>
          <div className="space-y-3">
            {SECURITY_ALERTS.map(({ type, title, desc, time }) => (
              <div key={title} className={`flex items-start gap-3 p-4 rounded-xl border ${
                type === "warning" ? "bg-yellow-500/5 border-yellow-500/20" :
                type === "success" ? "bg-emerald-500/5 border-emerald-500/20" :
                "bg-blue-500/5 border-blue-500/20"
              }`}>
                {type === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                ) : type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login history */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Login History
          </h2>
          <div className="space-y-3">
            {LOGIN_HISTORY.map(({ device, location, ip, time, current, icon: Icon }) => (
              <div key={`${device}-${time}`} className={`flex items-center gap-4 p-4 rounded-xl ${current ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/3 border border-white/5"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${current ? "bg-violet-500/20" : "bg-white/5"}`}>
                  <Icon className={`w-4 h-4 ${current ? "text-violet-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{device}</p>
                    {current && <span className="text-xs badge-success px-1.5 py-0.5 rounded-full flex-shrink-0">Current</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{location} · {ip}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{time}</p>
                  {!current && (
                    <button
                      onClick={() => toast.success("Session revoked")}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors mt-0.5"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => toast.success("All other sessions have been signed out")}
            className="mt-4 w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            Sign Out All Other Sessions
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
