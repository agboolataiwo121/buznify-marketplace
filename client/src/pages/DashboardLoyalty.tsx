import DashboardShell from "@/components/DashboardShell";
import { Gift, Star, Zap, Award, TrendingUp, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";

const TIERS = [
  { name: "Bronze", min: 0, max: 999, color: "text-orange-400", bg: "from-orange-500/10 to-amber-500/10", border: "border-orange-500/20", perks: ["1x points multiplier", "Access to basic deals"] },
  { name: "Silver", min: 1000, max: 4999, color: "text-slate-300", bg: "from-slate-400/10 to-gray-400/10", border: "border-slate-400/20", perks: ["1.5x points multiplier", "5% wallet bonus", "Priority support"] },
  { name: "Gold", min: 5000, max: 19999, color: "text-yellow-400", bg: "from-yellow-500/10 to-amber-500/10", border: "border-yellow-500/20", perks: ["2x points multiplier", "10% wallet bonus", "Exclusive deals", "Early access"] },
  { name: "Platinum", min: 20000, max: Infinity, color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/10", border: "border-violet-500/20", perks: ["3x points multiplier", "15% wallet bonus", "VIP support", "Free monthly credits", "Custom vendor deals"] },
];

const REWARDS = [
  { title: "$5 Wallet Credit", points: 500, icon: "💳", available: true },
  { title: "$10 Wallet Credit", points: 950, icon: "💰", available: true },
  { title: "Free Virtual Number (24h)", points: 200, icon: "📱", available: true },
  { title: "10% Discount Coupon", points: 300, icon: "🏷️", available: true },
  { title: "$25 Wallet Credit", points: 2200, icon: "💎", available: false },
  { title: "Vendor Upgrade (1 month)", points: 5000, icon: "🚀", available: false },
];

const HISTORY = [
  { action: "Purchase: Instagram 10K Account", points: "+150", time: "2 hours ago", positive: true },
  { action: "Referral bonus: Alex M. joined", points: "+500", time: "Yesterday", positive: true },
  { action: "Redeemed: $5 Wallet Credit", points: "-500", time: "3 days ago", positive: false },
  { action: "Purchase: Netflix Premium", points: "+80", time: "1 week ago", positive: true },
  { action: "Daily login streak (7 days)", points: "+70", time: "1 week ago", positive: true },
];

export default function DashboardLoyalty() {
  const currentPoints = 1840;
  const currentTier = TIERS.find(t => currentPoints >= t.min && currentPoints <= t.max) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier ? ((currentPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <DashboardShell title="Loyalty Rewards" subtitle="Earn points on every purchase and redeem for credits">
      <div className="space-y-6 max-w-4xl">
        {/* Points overview */}
        <div className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${currentTier.bg} border ${currentTier.border}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className={`w-5 h-5 ${currentTier.color}`} />
                <span className={`text-sm font-bold ${currentTier.color}`}>{currentTier.name} Member</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{currentPoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            {nextTier && (
              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground mb-1">{(nextTier.min - currentPoints).toLocaleString()} points to {nextTier.name}</p>
                <div className="w-full sm:w-48 bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500`}
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progressToNext)}% to {nextTier.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tier overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIERS.map((tier) => {
            const isActive = tier.name === currentTier.name;
            return (
              <div key={tier.name} className={`glass-card rounded-2xl p-4 border ${isActive ? tier.border : "border-white/5"} ${isActive ? `bg-gradient-to-br ${tier.bg}` : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${isActive ? tier.color : "text-muted-foreground"}`}>{tier.name}</span>
                  {isActive && <span className="text-xs badge-success px-1.5 py-0.5 rounded-full">Current</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{tier.min.toLocaleString()}+ pts</p>
                <div className="space-y-1.5">
                  {tier.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-1.5">
                      <CheckCircle className={`w-3 h-3 flex-shrink-0 ${isActive ? tier.color : "text-muted-foreground"}`} />
                      <span className="text-xs text-muted-foreground">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rewards catalog */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-violet-400" />
            Redeem Rewards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {REWARDS.map(({ title, points, icon, available }) => {
              const canAfford = currentPoints >= points;
              return (
                <div key={title} className={`p-4 rounded-xl border transition-all ${available && canAfford ? "border-violet-500/20 hover:border-violet-500/40 cursor-pointer" : "border-white/5 opacity-60"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{icon}</span>
                    {!available && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400">{points.toLocaleString()} pts</span>
                    </div>
                    <button
                      disabled={!available || !canAfford}
                      onClick={() => toast.success(`Redeemed: ${title}!`)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        available && canAfford
                          ? "bg-violet-600 hover:bg-violet-500 text-white"
                          : "bg-white/5 text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {!available ? "Locked" : !canAfford ? "Need more" : "Redeem"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Points history */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Points History
          </h2>
          <div className="space-y-3">
            {HISTORY.map(({ action, points, time, positive }) => (
              <div key={action} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${positive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {positive ? <Zap className="w-3.5 h-3.5 text-emerald-400" /> : <Gift className="w-3.5 h-3.5 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{action}</p>
                    <p className="text-xs text-muted-foreground">{time}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>{points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
