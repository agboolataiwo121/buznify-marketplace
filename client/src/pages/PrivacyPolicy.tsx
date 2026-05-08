import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes: name and email address; payment information (processed securely, we do not store full card numbers); order history and transaction data; support tickets and communications; referral and affiliate activity.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to: process transactions and send related information including purchase confirmations and receipts; provide, maintain, and improve our services; send promotional communications (you may opt out at any time); respond to comments, questions, and requests; monitor and analyze usage patterns and trends; detect, investigate, and prevent fraudulent transactions and other illegal activities.`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with: vendors who fulfill your orders (limited to what is necessary for delivery); payment processors who handle transactions on our behalf; analytics providers who help us understand how the Platform is used; law enforcement or other parties when required by law.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your personal information, including SSL/TLS encryption for all data in transit, bcrypt hashing for passwords, and secure session management. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "5. Cookies",
    content: `We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to: access the personal information we hold about you; request correction of inaccurate data; request deletion of your account and associated data; opt out of marketing communications; data portability where technically feasible. To exercise any of these rights, please contact our support team.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account at any time.`,
  },
  {
    title: "8. Children's Privacy",
    content: `Our Platform is not directed to children under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date. You are advised to review this Privacy Policy periodically for any changes.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Privacy Policy</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: January 1, 2025</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8 border border-emerald-500/20">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how Buznify collects, uses, and protects your personal information when you use our platform. We are committed to ensuring that your privacy is protected and that we handle your data responsibly.
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="glass-card rounded-2xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 glass-card rounded-2xl p-6 border border-violet-500/20">
          <h2 className="text-base font-semibold text-foreground mb-2">Contact Us</h2>
          <p className="text-sm text-muted-foreground">
            If you have any questions about this Privacy Policy, please{" "}
            <Link href="/support" className="text-primary hover:underline">contact our support team</Link>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
