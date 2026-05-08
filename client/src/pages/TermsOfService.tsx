import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Buznify ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. These terms apply to all visitors, users, vendors, and others who access or use the Platform.`,
  },
  {
    title: "2. Account Registration",
    content: `To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password. You agree not to disclose your password to any third party.`,
  },
  {
    title: "3. Digital Products & Services",
    content: `Buznify is a marketplace platform that facilitates the sale of digital products including social media accounts, streaming accounts, gaming accounts, virtual phone numbers, and social media growth services. All products listed on the Platform are provided by independent vendors. Buznify acts as an intermediary and is not responsible for the quality, accuracy, or legality of items listed. Buyers are responsible for verifying the suitability of products before purchase.`,
  },
  {
    title: "4. Payments & Wallet",
    content: `All transactions on the Platform are processed through our secure payment system. Funds added to your Buznify Wallet are non-refundable except where required by applicable law. Prices are listed in USD. We reserve the right to change pricing at any time without notice. Completed orders for digital products are generally non-refundable due to the nature of instant digital delivery.`,
  },
  {
    title: "5. Automated Delivery",
    content: `Upon successful payment, digital products are delivered automatically and instantly to your account. You acknowledge that once delivery has been completed, the transaction is considered final. In the event of a delivery failure, please contact our support team within 24 hours of purchase.`,
  },
  {
    title: "6. Prohibited Activities",
    content: `You agree not to use the Platform for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Platform. Prohibited activities include: attempting to gain unauthorized access to any portion of the Platform; using the Platform to distribute malware or harmful code; engaging in fraudulent transactions; creating multiple accounts to abuse promotions or referral systems; reselling purchased accounts in violation of the original platform's terms of service.`,
  },
  {
    title: "7. Vendor Responsibilities",
    content: `Vendors who list products on Buznify are solely responsible for the accuracy of their listings, the quality of their products, and compliance with all applicable laws. Vendors must not list stolen, hacked, or fraudulently obtained accounts. Buznify reserves the right to remove any listing and suspend any vendor account that violates these terms.`,
  },
  {
    title: "8. Intellectual Property",
    content: `The Platform and its original content, features, and functionality are and will remain the exclusive property of Buznify and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Buznify.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `In no event shall Buznify, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Platform.`,
  },
  {
    title: "10. Changes to Terms",
    content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Platform after those revisions become effective, you agree to be bound by the revised terms.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: January 1, 2025</p>
          </div>
        </div>

        {/* Intro */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-violet-500/20">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before using the Buznify platform. These terms govern your use of our digital marketplace and all associated services. By creating an account or making a purchase, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="glass-card rounded-2xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 glass-card rounded-2xl p-6 border border-emerald-500/20">
          <h2 className="text-base font-semibold text-foreground mb-2">Questions?</h2>
          <p className="text-sm text-muted-foreground">
            If you have any questions about these Terms of Service, please{" "}
            <Link href="/support" className="text-primary hover:underline">contact our support team</Link>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
