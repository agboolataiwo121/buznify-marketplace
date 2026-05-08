import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, Shield, Eye, Key, Server, ChevronRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const FEATURES = [
  {
    icon: Lock,
    title: "SSL/TLS Encryption",
    desc: "All data transmitted between your browser and our servers is encrypted using industry-standard TLS 1.3 protocol. Your personal information and payment data are always protected in transit.",
    color: "text-violet-400",
    bg: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  },
  {
    icon: Key,
    title: "Secure Authentication",
    desc: "We use JWT-based session management with secure, HTTP-only cookies. Sessions expire automatically and are invalidated on logout. Password hashing uses bcrypt with a high cost factor.",
    color: "text-blue-400",
    bg: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    desc: "Our platform runs on enterprise-grade cloud infrastructure with automatic DDoS protection, rate limiting, and intrusion detection systems. Regular security audits are performed.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  },
  {
    icon: Eye,
    title: "Fraud Detection",
    desc: "Advanced fraud detection algorithms monitor all transactions in real-time. Suspicious activity triggers automatic account holds and alerts our security team for immediate review.",
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  },
  {
    icon: Shield,
    title: "Payment Security",
    desc: "We never store full card numbers. All payment processing is handled by PCI-DSS compliant payment processors. Wallet transactions are logged with full audit trails.",
    color: "text-pink-400",
    bg: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    desc: "Your personal data is stored in encrypted databases with strict access controls. We follow the principle of least privilege — only authorized systems can access your data.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  },
];

const PRACTICES = [
  "Use a strong, unique password for your Buznify account",
  "Never share your account credentials with anyone",
  "Enable two-factor authentication when available",
  "Log out from shared or public devices after use",
  "Verify you are on buznify.com before entering credentials",
  "Report suspicious activity immediately to our support team",
  "Keep your email address up to date for security alerts",
];

export default function Security() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Security</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Security at <span className="gradient-text">Buznify</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We take the security of your account and data extremely seriously. Here's how we protect you.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${bg} border`}>
              <Icon className={`w-7 h-7 ${color} mb-4`} />
              <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Best Practices */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Best Practices for Your Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRACTICES.map((practice) => (
              <div key={practice} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{practice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report */}
        <div className="glass-card rounded-2xl p-6 border border-violet-500/20 text-center">
          <Shield className="w-8 h-8 text-violet-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-foreground mb-2">Found a Security Issue?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            If you discover a security vulnerability, please report it responsibly through our support system. We take all reports seriously and will respond within 24 hours.
          </p>
          <Link href="/support">
            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold transition-all">
              Report a Vulnerability
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
