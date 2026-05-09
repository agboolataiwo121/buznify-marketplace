import { Link } from "wouter";
import { Twitter, MessageCircle, Mail, Instagram, Youtube } from "lucide-react";

const footerLinks = {
  Marketplace: [
    { label: "Social Media Accounts", href: "/marketplace?category=social_media_accounts" },
    { label: "Streaming Accounts", href: "/marketplace?category=streaming_accounts" },
    { label: "Gaming Accounts", href: "/marketplace?category=gaming_accounts" },
    { label: "Virtual Numbers", href: "/virtual-numbers" },
    { label: "Growth Services", href: "/growth" },
  ],
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Wallet", href: "/dashboard/wallet" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Referrals", href: "/dashboard/referrals" },
    { label: "Support", href: "/support" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Security", href: "/security" },
    { label: "Support Center", href: "/support" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Changelog", href: "/changelog" },
    { label: "System Status", href: "/status" },
    { label: "Server Docs", href: "/server-docs" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img
                src="/manus-storage/buznify-icon_76f9e5ad.png"
                alt="Buznify"
                className="w-8 h-8 rounded-lg object-contain"
              />
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="gradient-text">Buz</span>
                <span className="text-foreground">nify</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              The premium digital marketplace for social media accounts, growth services, and virtual numbers. Trusted by thousands worldwide.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "https://twitter.com/buznify", label: "Twitter" },
                { icon: Instagram, href: "https://instagram.com/buznify", label: "Instagram" },
                { icon: MessageCircle, href: "https://t.me/buznify", label: "Telegram" },
                { icon: Youtube, href: "https://youtube.com/@buznify", label: "YouTube" },
                { icon: Mail, href: "mailto:support@buznify.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Buznify. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <a href="/status" className="text-xs text-muted-foreground hover:text-foreground transition-colors">All systems operational</a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Secured by</span>
              <span className="text-xs font-semibold text-emerald-400">SSL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
