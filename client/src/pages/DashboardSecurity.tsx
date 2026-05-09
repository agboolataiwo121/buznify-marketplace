import DashboardShell from "@/components/DashboardShell";
import { Shield, Monitor, Smartphone, Globe, Clock, AlertTriangle, CheckCircle, Lock, Eye, EyeOff, QrCode, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

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

// ─── 2FA Setup Dialog ────────────────────────────────────────────────────────
function TwoFASetupDialog({ open, onClose, onEnabled }: { open: boolean; onClose: () => void; onEnabled: () => void }) {
  const [step, setStep] = useState<"qr" | "verify">("qr");
  const [qrData, setQrData] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const setup2FAMutation = trpc.auth.setup2FA.useMutation({
    onSuccess: (data) => { setQrData(data); setStep("qr"); },
    onError: (err) => toast.error(err.message),
  });
  const verify2FAMutation = trpc.auth.verify2FA.useMutation({
    onSuccess: () => { toast.success("2FA enabled! Your account is now protected."); onEnabled(); onClose(); },
    onError: (err) => toast.error(err.message),
  });

  const handleOpen = () => { setStep("qr"); setToken(""); setQrData(null); setup2FAMutation.mutate(); };
  const handleCopy = () => { if (qrData?.secret) { navigator.clipboard.writeText(qrData.secret); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else handleOpen(); }}>
      <DialogContent className="bg-[#12121a] border-[#2d2d3d] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5 text-violet-400" /> Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-slate-400">Use Google Authenticator, Authy, or any TOTP app.</DialogDescription>
        </DialogHeader>
        {setup2FAMutation.isPending && <div className="py-8 text-center text-slate-400">Generating QR code...</div>}
        {qrData && step === "qr" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 text-center">Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center"><div className="bg-white p-3 rounded-xl"><img src={qrData.qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48" /></div></div>
            <div className="bg-[#1e1e2e] rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-2">Or enter this secret manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-violet-300 font-mono break-all">{qrData.secret}</code>
                <button onClick={handleCopy} className="text-slate-400 hover:text-white shrink-0">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
              </div>
            </div>
            <Button onClick={() => setStep("verify")} className="w-full bg-violet-600 hover:bg-violet-700 text-white">I've scanned the QR code →</Button>
          </div>
        )}
        {qrData && step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Enter the 6-digit code from your authenticator app:</p>
            <Input value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="bg-[#1e1e2e] border-[#2d2d3d] text-white text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} autoFocus />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("qr")} className="flex-1 border-[#2d2d3d] text-slate-300 hover:bg-[#1e1e2e]">Back</Button>
              <Button onClick={() => verify2FAMutation.mutate({ token })} disabled={token.length !== 6 || verify2FAMutation.isPending} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">{verify2FAMutation.isPending ? "Verifying..." : "Enable 2FA"}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── 2FA Disable Dialog ───────────────────────────────────────────────────────
function TwoFADisableDialog({ open, onClose, onDisabled }: { open: boolean; onClose: () => void; onDisabled: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const disable2FAMutation = trpc.auth.disable2FA.useMutation({
    onSuccess: () => { toast.success("2FA has been disabled."); onDisabled(); onClose(); setPassword(""); },
    onError: (err) => toast.error(err.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setPassword(""); } }}>
      <DialogContent className="bg-[#12121a] border-[#2d2d3d] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-5 h-5" /> Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-slate-400">Enter your password to confirm disabling 2FA.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-sm text-red-400">Warning: This will reduce your account security.</p></div>
          <div className="relative">
            <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="bg-[#1e1e2e] border-[#2d2d3d] text-white pr-10" autoFocus />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { onClose(); setPassword(""); }} className="flex-1 border-[#2d2d3d] text-slate-300 hover:bg-[#1e1e2e]">Cancel</Button>
            <Button onClick={() => disable2FAMutation.mutate({ password })} disabled={!password || disable2FAMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white">{disable2FAMutation.isPending ? "Disabling..." : "Disable 2FA"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardSecurity() {
  const [show2FA, setShow2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  const { data: twoFAStatus, refetch: refetch2FA } = trpc.auth.get2FAStatus.useQuery();
  const twoFAEnabled = twoFAStatus?.enabled ?? false;

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
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Two-Factor Authentication</h2>
                <p className="text-xs text-muted-foreground">TOTP-based 2FA via authenticator app</p>
              </div>
            </div>
            <Badge className={twoFAEnabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600/30"}>
              {twoFAEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          {twoFAEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-400">2FA is active. You'll be prompted for a code on each login.</p>
              </div>
              <button onClick={() => setShowDisable2FA(true)} className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
                Disable Two-Factor Authentication
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Enable 2FA to significantly improve your account security.
                </p>
              </div>
              <button onClick={() => setShow2FA(true)} className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4" /> Enable Two-Factor Authentication
              </button>
              <div className="flex flex-wrap gap-2">
                {["Google Authenticator", "Authy", "Microsoft Authenticator", "1Password"].map((app) => (
                  <span key={app} className="text-xs px-2 py-1 bg-white/5 rounded text-muted-foreground">{app}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <TwoFASetupDialog open={show2FA} onClose={() => setShow2FA(false)} onEnabled={() => refetch2FA()} />
        <TwoFADisableDialog open={showDisable2FA} onClose={() => setShowDisable2FA(false)} onDisabled={() => refetch2FA()} />

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
