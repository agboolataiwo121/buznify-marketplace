import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  CreditCard,
  Bitcoin,
  DollarSign,
  Lock,
  Gift,
  Download,
  TrendingUp,
  Shield,
  Zap,
  RefreshCw,
} from "lucide-react";

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 200];

const CRYPTO_OPTIONS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "text-orange-400", min: "$20" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "text-blue-400", min: "$10" },
  { symbol: "USDT", name: "Tether", icon: "₮", color: "text-emerald-400", min: "$5" },
  { symbol: "LTC", name: "Litecoin", icon: "Ł", color: "text-gray-400", min: "$10" },
  { symbol: "BNB", name: "BNB", icon: "B", color: "text-yellow-400", min: "$10" },
  { symbol: "SOL", name: "Solana", icon: "◎", color: "text-purple-400", min: "$10" },
];

export default function DashboardWallet() {
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "crypto">("deposit");

  const { data: balanceData, refetch: refetchBalance } = trpc.wallet.getBalance.useQuery();
  const { data: transactions, refetch: refetchTx } = trpc.wallet.getTransactions.useQuery();

  const depositMutation = trpc.wallet.deposit.useMutation({
    onSuccess: () => {
      toast.success(`$${parseFloat(amount).toFixed(2)} added to your wallet!`);
      setAmount("");
      setDepositing(false);
      refetchBalance();
      refetchTx();
    },
    onError: (err) => {
      toast.error(err.message);
      setDepositing(false);
    },
  });

  const withdrawMutation = trpc.wallet.withdraw.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal request submitted!");
      setWithdrawAmount("");
      refetchBalance();
      refetchTx();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val < 1) { toast.error("Minimum deposit is $1"); return; }
    setDepositing(true);
    depositMutation.mutate({ amount: val });
  };

  const handleWithdraw = () => {
    const val = parseFloat(withdrawAmount);
    if (!val || val < 5) { toast.error("Minimum withdrawal is $5"); return; }
    withdrawMutation.mutate({ amount: val });
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) { toast.error("No transactions to export"); return; }
    const header = "ID,Type,Amount,Description,Balance After,Date\n";
    const rows = transactions.map((tx) =>
      `${tx.id},${tx.type},$${tx.amount},"${tx.description}",$${tx.balanceAfter},${new Date(tx.createdAt).toLocaleString()}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buznify-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported!");
  };

  const txTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string; sign: string }> = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Deposit", sign: "+" },
    purchase: { icon: ArrowUpRight, color: "text-red-400", label: "Purchase", sign: "-" },
    refund: { icon: ArrowDownLeft, color: "text-blue-400", label: "Refund", sign: "+" },
    admin_credit: { icon: DollarSign, color: "text-violet-400", label: "Admin Credit", sign: "+" },
    withdrawal: { icon: ArrowUpRight, color: "text-orange-400", label: "Withdrawal", sign: "-" },
  };

  const balance = balanceData?.balance ?? 0;
  const escrowBalance = 0;
  const bonusBalance = balance > 50 ? parseFloat((balance * 0.05).toFixed(2)) : 0;

  const totalDeposited = (transactions ?? []).filter(t => t.type === "deposit").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalSpent = (transactions ?? []).filter(t => t.type === "purchase").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalRefunded = (transactions ?? []).filter(t => t.type === "refund").reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <DashboardShell title="Wallet" subtitle="Manage your balance, deposits, withdrawals, and transactions.">
      {/* Balance overview row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
          </div>
          <p className="text-3xl font-bold text-foreground">${balance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Ready to spend</p>
        </div>
        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm text-muted-foreground">Escrow Balance</p>
          </div>
          <p className="text-3xl font-bold text-foreground">${escrowBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Held in active orders</p>
        </div>
        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">Bonus Balance</p>
          </div>
          <p className="text-3xl font-bold text-foreground">${bonusBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Earned from referrals &amp; loyalty</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deposit / Withdraw / Crypto tabs */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-5">
            {(["deposit", "withdraw", "crypto"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                  activeTab === tab
                    ? "bg-violet-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "deposit" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Add funds to your wallet instantly</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                      amount === String(a)
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "glass border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="relative mb-4">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                  min="1"
                  max="10000"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                onClick={handleDeposit}
                disabled={depositing || !amount}
              >
                {depositing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {depositing ? "Processing..." : `Add ${amount ? `$${parseFloat(amount).toFixed(2)}` : "Funds"}`}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">Demo mode: funds are added instantly for testing</p>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Withdraw funds to your bank or payment method</p>
              <div className="glass rounded-xl p-3 mb-4 flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">Available: <span className="text-foreground font-semibold">${balance.toFixed(2)}</span></p>
              </div>
              <div className="relative mb-4">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Withdrawal amount (min $5)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                  min="5"
                />
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Bank Transfer", sub: "1-3 business days", icon: CreditCard },
                  { label: "PayPal", sub: "Instant", icon: DollarSign },
                ].map(({ label, sub, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10 transition-all">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border-0"
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending || !withdrawAmount}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
              </Button>
            </div>
          )}

          {activeTab === "crypto" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Deposit using cryptocurrency — instant confirmation</p>
              <div className="grid grid-cols-2 gap-3">
                {CRYPTO_OPTIONS.map(({ symbol, name, icon, color, min }) => (
                  <button
                    key={symbol}
                    onClick={() => toast.info(`${name} deposit`, { description: `Minimum: ${min}. Crypto gateway coming soon.` })}
                    className="glass rounded-xl p-4 text-left hover:border-white/20 border border-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xl font-bold ${color}`}>{icon}</span>
                      <span className="text-sm font-semibold text-foreground">{symbol}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Min: {min}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 glass rounded-xl p-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">All crypto transactions are secured and confirmed on-chain before crediting your wallet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment methods + stats */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Payment Methods</h2>
            <div className="space-y-3">
              {[
                { icon: CreditCard, label: "Credit / Debit Card", sub: "Visa, Mastercard, Amex", badge: "Popular" },
                { icon: Bitcoin, label: "Cryptocurrency", sub: "BTC, ETH, USDT, LTC, BNB, SOL", badge: "Fast" },
                { icon: DollarSign, label: "PayPal", sub: "Instant transfer", badge: null },
              ].map(({ icon: Icon, label, sub, badge }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                  onClick={() => toast.info("Payment gateway integration coming soon")}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  {badge && <span className="text-xs badge-purple px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Wallet Stats</h2>
            <div className="space-y-3">
              {[
                { label: "Total Deposited", value: `$${totalDeposited.toFixed(2)}`, icon: ArrowDownLeft, color: "text-emerald-400" },
                { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: ArrowUpRight, color: "text-red-400" },
                { label: "Total Refunded", value: `$${totalRefunded.toFixed(2)}`, icon: Zap, color: "text-blue-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Transaction History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs border-white/10 hover:bg-white/5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const config = txTypeConfig[tx.type] ?? txTypeConfig.deposit;
              const Icon = config.icon;
              const isCredit = config.sign === "+";
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()} · Balance: ${tx.balanceAfter}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                      {config.sign}${tx.amount}
                    </span>
                    <p className="text-xs text-muted-foreground capitalize">{config.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
