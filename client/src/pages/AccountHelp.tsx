import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import {
  ChevronRight,
  ChevronDown,
  HelpCircle,
  User,
  Lock,
  Wallet,
  ShoppingBag,
  Phone,
  TrendingUp,
  MessageSquare,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Key,
  Bell,
  CreditCard,
} from "lucide-react";

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = [
  {
    id: "account",
    label: "Account & Profile",
    icon: User,
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    iconColor: "text-violet-400",
    questions: [
      {
        q: "How do I create a Buznify account?",
        a: "You can sign up using your email and password, or log in instantly with your Manus account via the OAuth button on the login page. After registration, you'll receive a verification email — click the link to activate your account.",
      },
      {
        q: "How do I verify my email address?",
        a: "After registering, check your inbox for a verification email from Buznify. Click the 'Verify Email' link inside. If you didn't receive it, go to your Dashboard and click 'Resend Verification Email'. Check your spam folder if it doesn't arrive within a few minutes.",
      },
      {
        q: "How do I change my display name or password?",
        a: "Go to Dashboard → Profile Settings. You can update your display name there. To change your password, use the 'Change Password' section — you'll need to enter your current password first.",
      },
      {
        q: "Can I have multiple accounts?",
        a: "No. Creating multiple accounts to abuse promotions, referral rewards, or coupon systems is strictly prohibited and will result in all associated accounts being permanently suspended.",
      },
      {
        q: "How do I delete my account?",
        a: "Account deletion requests must be submitted via our support center. Open a ticket at /support with the subject 'Account Deletion Request'. Note that any remaining wallet balance must be withdrawn before deletion can be processed.",
      },
    ],
  },
  {
    id: "security",
    label: "Security & 2FA",
    icon: Shield,
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    questions: [
      {
        q: "How do I enable two-factor authentication (2FA)?",
        a: "Go to Dashboard → Security. Under 'Two-Factor Authentication', click 'Set Up 2FA'. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to confirm. Once enabled, you'll need the code every time you log in.",
      },
      {
        q: "I lost access to my 2FA authenticator app. What do I do?",
        a: "Contact our support team immediately via /support. You'll need to verify your identity by providing your registered email, account creation date, and recent transaction details. After verification, our team can disable 2FA on your account.",
      },
      {
        q: "I think my account has been compromised. What should I do?",
        a: "Immediately: (1) Change your password via Dashboard → Profile. (2) Enable 2FA if not already active. (3) Review your login history in Dashboard → Security. (4) Open a support ticket to report suspicious activity. Our security team will investigate and can lock your account if needed.",
      },
      {
        q: "How do I view my login history?",
        a: "Go to Dashboard → Security → Login History. You'll see a list of recent login sessions with timestamps, IP addresses, and device information. If you see any unrecognized sessions, change your password immediately and contact support.",
      },
      {
        q: "What are API keys and how do I manage them?",
        a: "API keys allow third-party tools or scripts to interact with your Buznify account programmatically. You can create, view, and revoke API keys from Dashboard → API Keys. Never share your API keys publicly — treat them like passwords.",
      },
    ],
  },
  {
    id: "wallet",
    label: "Wallet & Payments",
    icon: Wallet,
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    questions: [
      {
        q: "How do I add funds to my wallet?",
        a: "Go to Dashboard → Wallet → Deposit. You can deposit using Paystack (cards, bank transfer, USSD) or Stripe (international cards). Select your preferred amount or enter a custom amount, then follow the payment provider's checkout flow. Funds are credited instantly upon successful payment.",
      },
      {
        q: "How do I withdraw funds from my wallet?",
        a: "Go to Dashboard → Wallet → Withdraw. You'll need to add and verify a bank account first. Enter your bank details, verify your account name, then submit a withdrawal request. Withdrawals are processed via Paystack Transfer and typically arrive within 1–3 business days.",
      },
      {
        q: "My deposit was charged but my wallet wasn't credited. What do I do?",
        a: "First, wait up to 10 minutes as payment webhooks can occasionally be delayed. If your balance still hasn't updated, go to Dashboard → Wallet → Transaction History and check if the deposit appears. If it's missing, open a support ticket with your payment reference number and we'll investigate immediately.",
      },
      {
        q: "What currencies does Buznify support?",
        a: "All wallet balances and product prices are displayed in USD. Paystack deposits are made in NGN (Nigerian Naira) and converted to USD at the current exchange rate. Stripe accepts international cards in various currencies, which are converted to USD at checkout.",
      },
      {
        q: "Are there any deposit or withdrawal fees?",
        a: "Paystack charges a small processing fee on deposits (typically 1.5% + ₦100 for local cards). Stripe may charge international card fees. Withdrawals via Paystack Transfer are free for amounts above ₦5,000. Specific fee details are shown before you confirm any transaction.",
      },
    ],
  },
  {
    id: "orders",
    label: "Orders & Delivery",
    icon: ShoppingBag,
    color: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/30",
    iconColor: "text-orange-400",
    questions: [
      {
        q: "How does instant delivery work?",
        a: "For products marked 'Instant Delivery', your account credentials (email, password, etc.) are automatically delivered to your order as soon as payment is confirmed. You can view them in Dashboard → Orders by clicking on the order.",
      },
      {
        q: "My order shows 'Processing' — what does that mean?",
        a: "'Processing' means your order has been placed and payment confirmed, but delivery is being prepared. For manual delivery products, a vendor or admin is fulfilling your order. For growth services, the SMM panel is processing your request. Most orders complete within minutes to a few hours.",
      },
      {
        q: "I received an account but it's not working. What do I do?",
        a: "Open a support ticket at /support within 24 hours of delivery. Include your order ID and a description of the issue (e.g., 'password incorrect', 'account suspended'). Our team will verify and either replace the account or issue a refund per our Refund Policy.",
      },
      {
        q: "Can I cancel an order?",
        a: "Orders for instantly delivered digital products cannot be cancelled once delivery has been completed. For growth service orders that are still 'Pending' or 'Processing', you may be able to request cancellation from Dashboard → Growth Orders. Refunds for cancelled orders are credited to your wallet.",
      },
      {
        q: "How do I track a growth service order?",
        a: "Go to Dashboard → Growth Orders. Each order shows a live progress bar with start count, current count, and target. Status updates automatically every few minutes. You can also request a refill if followers/likes drop after delivery.",
      },
    ],
  },
  {
    id: "virtual-numbers",
    label: "Virtual Numbers",
    icon: Phone,
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
    questions: [
      {
        q: "How do virtual numbers work?",
        a: "Virtual numbers are temporary phone numbers used to receive SMS verification codes (OTPs) for app registrations. After purchasing a number, you'll see it in your active orders. Use it on the target service, then come back to Buznify to view the OTP. Numbers are valid for a limited time (usually 20 minutes).",
      },
      {
        q: "I didn't receive an OTP on my virtual number. What should I do?",
        a: "First, ensure you entered the number correctly on the target service. OTPs can take 1–3 minutes to arrive. The SMS inbox auto-refreshes every 5 seconds. If no OTP arrives within 5 minutes, you can cancel the order for a refund (if no SMS was received) or try a different number.",
      },
      {
        q: "Can I reuse a virtual number?",
        a: "No. Each virtual number purchase is for a single use. Once an OTP is received or the number expires, it cannot be reused. This is a limitation of the 5sim API that powers our virtual number service.",
      },
      {
        q: "Why is a particular country or service unavailable?",
        a: "Number availability depends on real-time stock from our provider (5sim). Some countries or services may temporarily show as unavailable due to high demand or provider stock issues. Try a different country or check back later.",
      },
      {
        q: "My number expired before I received an OTP. Will I get a refund?",
        a: "If no SMS was received before expiry, you can request a cancellation/refund from the active orders panel. If an OTP was received, the order is considered fulfilled and is non-refundable.",
      },
    ],
  },
  {
    id: "growth",
    label: "Growth Services",
    icon: TrendingUp,
    color: "from-cyan-500/20 to-sky-500/20",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    questions: [
      {
        q: "Are growth services (followers, likes, views) safe?",
        a: "We source services from reputable SMM panels (SMMKings, Peakerr) that use high-quality, non-bot methods. However, all social media platforms prohibit artificial engagement. Use services at your own discretion. We recommend starting with smaller quantities to test compatibility with your account.",
      },
      {
        q: "How long does delivery take for growth services?",
        a: "Delivery time varies by service and is shown on each service card (Instant / Fast / Medium / Slow). Most services start within minutes. Full completion depends on the quantity ordered and the service's delivery speed setting.",
      },
      {
        q: "My followers dropped after delivery. Can I get a refill?",
        a: "Many services include a Refill Guarantee (shown with a green badge). For eligible orders, go to Dashboard → Growth Orders and click 'Request Refill'. Refills are processed automatically. Services without the refill badge are not eligible.",
      },
      {
        q: "What is drip-feed delivery?",
        a: "Drip-feed spreads your order delivery over a set period (e.g., 100 followers per day over 10 days) to make growth look more organic. You can enable this option when placing an order if the service supports it.",
      },
      {
        q: "Can I place a bulk order for multiple services at once?",
        a: "Yes. Use the Mass Order tool on the Growth Services page. You can add multiple service orders in a single batch, review the total cost, and submit them all at once.",
      },
    ],
  },
  {
    id: "support",
    label: "Support & Refunds",
    icon: MessageSquare,
    color: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    questions: [
      {
        q: "How do I contact support?",
        a: "Open a support ticket at /support. Fill in the subject and describe your issue in detail. Include your order ID if relevant. Our team responds within 24 hours. For urgent issues, you can also use the Live Chat widget on any page.",
      },
      {
        q: "What is Buznify's refund policy?",
        a: "Wallet deposits are non-refundable. For product orders: if delivery fails or the delivered product is non-functional, you're eligible for a replacement or wallet credit within 24 hours of delivery. Growth service refunds are available for orders that fail to start. See our full Refund Policy at /refund-policy.",
      },
      {
        q: "How long does a refund take to process?",
        a: "Approved refunds are credited to your Buznify wallet instantly. Wallet-to-bank withdrawals then follow the standard withdrawal timeline (1–3 business days). We do not issue refunds directly to cards or bank accounts — all refunds go to your wallet first.",
      },
      {
        q: "My support ticket has been open for a while with no response. What should I do?",
        a: "Our target response time is 24 hours. If your ticket has been open longer, reply to it with an update to bump it in the queue. You can also use the Live Chat widget for faster assistance during business hours.",
      },
      {
        q: "How do I escalate a dispute?",
        a: "If you're unsatisfied with a support response, reply to your ticket requesting escalation to a senior agent. Include a clear summary of the issue and what resolution you're seeking. Escalations are reviewed within 48 hours.",
      },
    ],
  },
];

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: "Open a Support Ticket", href: "/support", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: Wallet, label: "Deposit Funds", href: "/dashboard/wallet", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: ShoppingBag, label: "View My Orders", href: "/dashboard/orders", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { icon: Key, label: "Security Settings", href: "/dashboard/security", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: RefreshCw, label: "Refund Policy", href: "/refund-policy", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountHelp() {
  const [activeCategory, setActiveCategory] = useState<string>("account");
  const [search, setSearch] = useState("");

  const activeCat = FAQ_CATEGORIES.find((c) => c.id === activeCategory)!;

  // Filter questions by search
  const filteredCategories = search.trim()
    ? FAQ_CATEGORIES.map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.questions.length > 0)
    : [activeCat];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container pt-24 pb-16 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Account Help</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account Help Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Answers to common questions about your Buznify account</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Actions */}
        {!search && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map(({ icon: Icon, label, href, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${bg} hover:scale-105 transition-all duration-200 text-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {search ? (
          /* Search Results */
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {filteredCategories.reduce((acc, c) => acc + c.questions.length, 0)} result(s) for "{search}"
            </p>
            {filteredCategories.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">No results found</p>
                <p className="text-sm text-muted-foreground mb-4">Try different keywords or browse by category below.</p>
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                        <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                      </div>
                      <div className="space-y-2">
                        {cat.questions.map((item) => (
                          <AccordionItem key={item.q} q={item.q} a={item.a} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Category Browse */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h2>
              <nav className="space-y-1">
                {FAQ_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = cat.id === activeCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : cat.iconColor}`} />
                      <span className="font-medium">{cat.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* FAQ Panel */}
            <div className="lg:col-span-3">
              <div className={`glass-card rounded-2xl p-6 border ${activeCat.border} mb-6`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCat.color} border ${activeCat.border} flex items-center justify-center`}>
                    {(() => { const Icon = activeCat.icon; return <Icon className={`w-5 h-5 ${activeCat.iconColor}`} />; })()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{activeCat.label}</h2>
                    <p className="text-xs text-muted-foreground">{activeCat.questions.length} frequently asked questions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {activeCat.questions.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Still Need Help Banner */}
        <div className="mt-12 glass-card rounded-2xl p-8 border border-violet-500/20 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-7 h-7 text-violet-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-semibold text-foreground mb-1">Still need help?</h3>
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Our support team is available 24/7 and typically responds within a few hours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Open a Ticket
            </Link>
            <a
              href="mailto:support@buznify.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle2, label: "Refund Policy", href: "/refund-policy", desc: "Learn what's eligible for a refund", color: "text-emerald-400" },
            { icon: Shield, label: "Privacy Policy", href: "/privacy", desc: "How we handle your data", color: "text-blue-400" },
            { icon: CreditCard, label: "Terms of Service", href: "/terms", desc: "Platform rules and agreements", color: "text-violet-400" },
          ].map(({ icon: Icon, label, href, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="glass-card rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all group flex items-center gap-3"
            >
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{desc}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
