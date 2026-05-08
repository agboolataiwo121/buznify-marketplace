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
} from "lucide-react";

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 200];

export default function DashboardWallet() {
  const [amount, setAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  const { data: balanceData, refetch: refetchBalance } = trpc.wallet.getBalance.useQuery();
  const { data: transactions, refetch: refetchTx } = trpc.wallet.getTransactions.useQuery();

  const depositMutation = trpc.wallet.deposit.useMutation({
    onSuccess: (data) => {
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

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val < 1) {
      toast.error("Minimum deposit is $1");
      return;
    }
    setDepositing(true);
    depositMutation.mutate({ amount: val });
  };

  const txTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string; sign: string }> = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Deposit", sign: "+" },
    purchase: { icon: ArrowUpRight, color: "text-red-400", label: "Purchase", sign: "-" },
    refund: { icon: ArrowDownLeft, color: "text-blue-400", label: "Refund", sign: "+" },
    admin_credit: { icon: DollarSign, color: "text-violet-400", label: "Admin Credit", sign: "+" },
    withdrawal: { icon: ArrowUpRight, color: "text-orange-400", label: "Withdrawal", sign: "-" },
  };

  return (
    <DashboardShell title="Wallet" subtitle="Manage your balance and transactions.">
      {/* Balance card */}
      <div className="glass-card rounded-2xl p-6 mb-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-3xl font-bold text-foreground">
              ${(balanceData?.balance ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Use your balance to purchase products and services instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Deposit */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add Funds
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  amount === String(a)
                    ? "bg-primary/10 border border-primary/30 text-primary"
                    : "glass text-muted-foreground hover:text-foreground"
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
            {depositing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {depositing ? "Processing..." : `Add ${amount ? `$${parseFloat(amount).toFixed(2)}` : "Funds"}`}
          </Button>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Demo mode: funds are added instantly for testing
          </p>
        </div>

        {/* Payment methods */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {[
              { icon: CreditCard, label: "Credit / Debit Card", sub: "Visa, Mastercard, Amex", badge: "Popular" },
              { icon: Bitcoin, label: "Cryptocurrency", sub: "BTC, ETH, USDT, LTC", badge: "Fast" },
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
                {badge && (
                  <span className="text-xs badge-purple px-2 py-0.5 rounded-full">{badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Transaction History</h2>

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
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                >
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
                  <span className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                    {config.sign}${tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
