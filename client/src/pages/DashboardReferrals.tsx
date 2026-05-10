import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Copy, Gift, DollarSign, Link as LinkIcon, CheckCircle, Trophy, Medal } from "lucide-react";

export default function DashboardReferrals() {
  const [copied, setCopied] = useState(false);
  const { data: referralData } = trpc.referrals.getMyReferrals.useQuery();
  const { data: leaderboard } = trpc.referrals.leaderboard.useQuery();

  const referralLink = referralData?.referralCode
    ? `${window.location.origin}/?ref=${referralData.referralCode}`
    : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = referralData?.referrals
    ?.filter((r) => r.status === "credited")
    .reduce((sum, r) => sum + parseFloat(r.rewardAmount ?? "0"), 0) ?? 0;

  return (
    <DashboardShell title="Referrals" subtitle="Earn commissions by referring new users.">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {[
          { icon: Users, label: "Total Referrals", value: referralData?.referrals?.length ?? 0, color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/10" },
          { icon: CheckCircle, label: "Completed", value: referralData?.referrals?.filter((r) => r.status === "credited").length ?? 0, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10" },
          { icon: DollarSign, label: "Total Earned", value: `$${totalEarnings.toFixed(2)}`, color: "text-yellow-400", bg: "from-yellow-500/10 to-orange-500/10" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br ${bg}`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color} mb-1.5 sm:mb-2`} />
            <p className="text-lg sm:text-xl font-bold text-foreground truncate">{value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          Your Referral Link
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Share this link and earn 10% commission on every purchase your referrals make.
        </p>

        <div className="flex gap-2">
          <Input
            value={referralLink || "Loading..."}
            readOnly
            className="bg-white/5 border-white/10 text-sm font-mono"
          />
          <Button
            onClick={handleCopy}
            className={`flex-shrink-0 ${copied ? "bg-emerald-600 hover:bg-emerald-600" : "bg-gradient-to-r from-violet-600 to-purple-600"} text-white border-0`}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-6 border-t border-white/5">
          {[
            { step: "1", text: "Share your unique link" },
            { step: "2", text: "Friend signs up & buys" },
            { step: "3", text: "You earn 10% commission" },
          ].map(({ step, text }) => (
            <div key={step} className="text-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs sm:text-sm font-bold text-primary mx-auto mb-1.5 sm:mb-2">
                {step}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral history */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Referral History</h2>

        {!referralData?.referrals || referralData.referrals.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No referrals yet. Start sharing your link!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralData.referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">Referral #{ref.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    +${ref.rewardAmount ?? "0.00"}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ref.status === "credited" ? "badge-success" : "badge-warning"
                  }`}>
                    {ref.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Leaderboard */}
      <div className="glass-card rounded-2xl p-6 mt-6">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Top Referrers Leaderboard
        </h2>
        {!leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No leaderboard data yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-3 rounded-xl border ${
                  entry.rank === 1 ? "bg-yellow-500/10 border-yellow-500/20" :
                  entry.rank === 2 ? "bg-slate-400/10 border-slate-400/20" :
                  entry.rank === 3 ? "bg-orange-500/10 border-orange-500/20" :
                  "bg-white/5 border-white/5"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  entry.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                  entry.rank === 2 ? "bg-slate-400/20 text-slate-400" :
                  entry.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                  "bg-white/10 text-muted-foreground"
                }`}>
                  {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.totalReferrals} referrals</p>
                </div>
                <p className="text-sm font-bold text-emerald-400">${entry.totalEarned.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
