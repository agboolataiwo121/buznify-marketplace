import { useState, useCallback, useMemo } from "react";
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
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CreditCard as PaystackIcon,
  Landmark,
  Smartphone,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Paystack Popup JS
import PaystackPop from "@paystack/inline-js";

// NGN preset amounts
const QUICK_AMOUNTS_NGN = [500, 1000, 2000, 5000, 10000, 20000];

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
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "crypto" | "payments">("deposit");

  const { data: balanceData, refetch: refetchBalance } = trpc.wallet.getBalance.useQuery();
  const { data: transactions, refetch: refetchTx } = trpc.wallet.getTransactions.useQuery();
  const { data: paymentHistory } = trpc.payment.history.useQuery(undefined, { enabled: activeTab === "payments" });
  const utils = trpc.useUtils();

  // Paystack initiate mutation
  const initiateMutation = trpc.payment.initiate.useMutation({
    onError: (err) => {
      toast.error(err.message);
      setDepositing(false);
    },
  });

  // Paystack verify mutation
  const verifyMutation = trpc.payment.verify.useMutation({
    onSuccess: (data) => {
      if (data.alreadyCredited) {
        toast.info("Payment already credited to your wallet.");
      } else {
        toast.success(
          `₦${data.amountNaira.toFixed(0)} deposited! ~$${(data.amountUsd ?? 0).toFixed(4)} added to wallet.`
        );
      }
      setAmount("");
      refetchBalance();
      refetchTx();
      utils.payment.history.invalidate();
      setDepositing(false);
    },
    onError: (err) => {
      toast.error(`Verification failed: ${err.message}`);
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

  // Launch Paystack Popup
  const handleDeposit = useCallback(async () => {
    const naira = parseFloat(amount);
    if (!naira || naira < 100) {
      toast.error("Minimum deposit is ₦100");
      return;
    }
    setDepositing(true);
    try {
      const { reference, accessCode } = await initiateMutation.mutateAsync({ amountNaira: naira });
      const popup = new PaystackPop();
      popup.resumeTransaction(accessCode, {
        onSuccess: (_transaction: { reference: string }) => {
          toast.info("Payment received — verifying...");
          verifyMutation.mutate({ reference });
        },
        onCancel: () => {
          toast.info("Payment cancelled.");
          setDepositing(false);
        },
      });
    } catch {
      // error already handled by initiateMutation.onError
      setDepositing(false);
    }
  }, [amount, initiateMutation, verifyMutation]);

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

  const [txFilter, setTxFilter] = useState<"all" | "deposit" | "withdrawal" | "purchase" | "refund" | "referral_reward" | "admin_credit">("all");
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 10;
  const { data: txHistory, isLoading: txLoading } = trpc.wallet.getHistory.useQuery(
    { type: txFilter, page: txPage, pageSize: TX_PAGE_SIZE },
{}
  );
  const txTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string; sign: string }> = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Deposit", sign: "+" },
    purchase: { icon: ArrowUpRight, color: "text-red-400", label: "Purchase", sign: "-" },
    refund: { icon: ArrowDownLeft, color: "text-blue-400", label: "Refund", sign: "+" },
    admin_credit: { icon: DollarSign, color: "text-violet-400", label: "Admin Credit", sign: "+" },
    withdrawal: { icon: ArrowUpRight, color: "text-orange-400", label: "Withdrawal", sign: "-" },
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (txFilter === "all") return transactions;
    return transactions.filter(t => t.type === txFilter);
  }, [transactions, txFilter]);
  const balance = balanceData?.balance ?? 0;
  const escrowBalance = 0;
  const bonusBalance = balance > 50 ? parseFloat((balance * 0.05).toFixed(2)) : 0;

  const totalDeposited = (transactions ?? []).filter(t => t.type === "deposit").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalSpent = (transactions ?? []).filter(t => t.type === "purchase").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalRefunded = (transactions ?? []).filter(t => t.type === "refund").reduce((s, t) => s + parseFloat(t.amount), 0);

  const nairaPreview = parseFloat(amount);
  const usdPreview = nairaPreview >= 100 ? nairaPreview * 0.00065 : 0;

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
            {(["deposit", "withdraw", "crypto", "payments"] as const).map((tab) => (
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
              <p className="text-sm text-muted-foreground mb-4">
                Deposit via card, bank transfer, or USSD — powered by Paystack
              </p>
              {/* Quick NGN amounts */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {QUICK_AMOUNTS_NGN.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                      amount === String(a)
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "glass border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ₦{a.toLocaleString()}
                  </button>
                ))}
              </div>
              {/* Custom amount */}
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">₦</span>
                <Input
                  type="number"
                  placeholder="Custom amount (min ₦100)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 bg-white/5 border-white/10 focus:border-primary/50"
                  min="100"
                  max="1000000"
                />
              </div>
              {/* USD preview */}
              {nairaPreview >= 100 && (
                <div className="glass rounded-xl p-3 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    ₦{nairaPreview.toLocaleString()} ≈{" "}
                    <span className="text-foreground font-semibold">${usdPreview.toFixed(4)} USD</span>{" "}
                    will be added to your wallet
                  </p>
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0"
                onClick={handleDeposit}
                disabled={depositing || !amount || nairaPreview < 100}
              >
                {depositing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                {depositing
                  ? "Opening Paystack..."
                  : `Pay ₦${nairaPreview >= 100 ? nairaPreview.toLocaleString() : ""} via Paystack`}
              </Button>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Secured by Paystack · Card, Bank Transfer, USSD
                </p>
              </div>
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

          {activeTab === "payments" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">Your Paystack deposit history — all card, bank transfer, and USSD payments.</p>
              {!paymentHistory || paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {paymentHistory.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-xs font-medium text-foreground">₦{parseFloat(p.amountNaira).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{p.channel ?? "—"} · {new Date(p.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">{p.reference}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === "success" ? "bg-emerald-500/20 text-emerald-400" :
                          p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>{p.status}</span>
                        {p.amountUsd && <p className="text-xs text-muted-foreground mt-1">${parseFloat(p.amountUsd).toFixed(4)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {
                  icon: CreditCard,
                  label: "Paystack",
                  sub: "Card, Bank Transfer, USSD",
                  badge: "Active",
                  badgeColor: "bg-emerald-500/20 text-emerald-400",
                  onClick: () => setActiveTab("deposit"),
                },
                {
                  icon: Bitcoin,
                  label: "Cryptocurrency",
                  sub: "BTC, ETH, USDT, LTC, BNB, SOL",
                  badge: "Soon",
                  badgeColor: "bg-amber-500/20 text-amber-400",
                  onClick: () => setActiveTab("crypto"),
                },
                {
                  icon: ExternalLink,
                  label: "PayPal",
                  sub: "Instant transfer",
                  badge: "Soon",
                  badgeColor: "bg-amber-500/20 text-amber-400",
                  onClick: () => toast.info("PayPal integration coming soon"),
                },
              ].map(({ icon: Icon, label, sub, badge, badgeColor, onClick }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                  onClick={onClick}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  {badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
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

      {/* ─── Transaction History Table ─────────────────────────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-white/5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Transaction History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {txHistory ? `${txHistory.total} transaction${txHistory.total !== 1 ? "s" : ""}` : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "deposit", "purchase", "refund", "withdrawal", "admin_credit"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setTxFilter(f); setTxPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  txFilter === f
                    ? "bg-violet-500/30 text-violet-300 border border-violet-500/40"
                    : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                }`}
              >
                {(f as string) === "all" ? "All" : (f as string) === "admin_credit" ? "Admin Credit" : (f as string) === "referral_reward" ? "Referral" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-7 gap-1.5 text-xs border-white/10 hover:bg-white/5">
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        {txLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading transactions…</div>
        ) : !txHistory || txHistory.rows.length === 0 ? (
          <div className="p-10 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No {txFilter === "all" ? "" : txFilter + " "}transactions found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-muted-foreground">
                    <th className="text-left px-5 py-3 font-medium">Date & Time</th>
                    <th className="text-left px-5 py-3 font-medium">Description</th>
                    <th className="text-left px-5 py-3 font-medium">Type</th>
                    <th className="text-left px-5 py-3 font-medium">Reference</th>
                    <th className="text-left px-5 py-3 font-medium">Method</th>
                    <th className="text-right px-5 py-3 font-medium">Amount</th>
                    <th className="text-right px-5 py-3 font-medium">Balance After</th>
                    <th className="text-center px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {txHistory.rows.map((tx) => {
                    const cfg = txTypeConfig[tx.type] ?? txTypeConfig.deposit;
                    const Icon = cfg.icon;
                    const isCredit = cfg.sign === "+";
                    const isPaystack = !!tx.paymentReference;
                    const channelIcon = tx.paymentChannel === "card" ? <CreditCard className="w-3 h-3" /> : tx.paymentChannel === "bank" ? <Landmark className="w-3 h-3" /> : tx.paymentChannel === "mobile_money" ? <Smartphone className="w-3 h-3" /> : null;
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()}<br />
                          <span className="opacity-70">{new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </div>
                            <span className="text-foreground font-medium truncate max-w-[180px]">{tx.description ?? cfg.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge className={`text-[10px] font-semibold capitalize ${isCredit ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {tx.referenceId ? (
                            <div className="flex items-center gap-1.5">
                              <code className="text-[10px] text-violet-300 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded truncate max-w-[120px]">{tx.referenceId}</code>
                              <button onClick={() => { navigator.clipboard.writeText(tx.referenceId!); toast.success("Copied!"); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white transition-all">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {isPaystack ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00C3F7]/10 text-[#00C3F7] border border-[#00C3F7]/20 font-medium">
                                <Zap className="w-2.5 h-2.5" /> Paystack
                              </span>
                              {channelIcon && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5 capitalize">{channelIcon}{tx.paymentChannel}</span>
                              )}
                            </div>
                          ) : tx.type === "purchase" ? (
                            <span className="text-xs text-muted-foreground">Wallet</span>
                          ) : tx.type === "referral_reward" ? (
                            <span className="text-xs text-muted-foreground">Referral</span>
                          ) : tx.type === "admin_credit" ? (
                            <span className="text-xs text-muted-foreground">Admin</span>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`font-bold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                            {cfg.sign}${parseFloat(tx.amount).toFixed(2)}
                          </span>
                          {isPaystack && tx.paymentAmountNaira && (
                            <p className="text-[10px] text-muted-foreground">₦{parseFloat(tx.paymentAmountNaira).toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-muted-foreground font-mono">
                          ${parseFloat(tx.balanceAfter).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {tx.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                              <CheckCircle className="w-2.5 h-2.5" /> Done
                            </span>
                          ) : tx.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-medium">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-white/[0.04]">
              {txHistory.rows.map((tx) => {
                const cfg = txTypeConfig[tx.type] ?? txTypeConfig.deposit;
                const Icon = cfg.icon;
                const isCredit = cfg.sign === "+";
                const isPaystack = !!tx.paymentReference;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description ?? cfg.label}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                          {isPaystack && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#00C3F7]/10 text-[#00C3F7] border border-[#00C3F7]/20 font-medium">
                              <Zap className="w-2 h-2" /> Paystack
                            </span>
                          )}
                          {tx.status === "completed" ? (
                            <span className="text-[10px] text-emerald-400">✓ Done</span>
                          ) : tx.status === "pending" ? (
                            <span className="text-[10px] text-yellow-400">⏳ Pending</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                        {cfg.sign}${parseFloat(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">${parseFloat(tx.balanceAfter).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {txHistory.total > TX_PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5">
                <p className="text-xs text-muted-foreground">
                  Showing {((txPage - 1) * TX_PAGE_SIZE) + 1}–{Math.min(txPage * TX_PAGE_SIZE, txHistory.total)} of {txHistory.total}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  {Array.from({ length: Math.min(5, Math.ceil(txHistory.total / TX_PAGE_SIZE)) }, (_, i) => {
                    const totalPages = Math.ceil(txHistory.total / TX_PAGE_SIZE);
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (txPage <= 3) p = i + 1;
                      else if (txPage >= totalPages - 2) p = totalPages - 4 + i;
                      else p = txPage - 2 + i;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setTxPage(p)}
                        className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                          txPage === p
                            ? "bg-violet-500/30 text-violet-300 border border-violet-500/40"
                            : "text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTxPage(p => Math.min(Math.ceil(txHistory.total / TX_PAGE_SIZE), p + 1))}
                    disabled={txPage >= Math.ceil(txHistory.total / TX_PAGE_SIZE)}
                    className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
