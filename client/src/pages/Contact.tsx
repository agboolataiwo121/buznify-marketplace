import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Twitter, ChevronRight, Send, Clock, Headphones, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "wouter";

const CHANNELS = [
  { icon: MessageCircle, title: "Live Chat", desc: "Chat with our AI assistant or a human agent", badge: "Fastest", color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20" },
  { icon: Mail, title: "Email Support", desc: "support@buznify.com — replies within 2 hours", badge: "24/7", color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20" },
  { icon: Headphones, title: "Support Tickets", desc: "Submit a detailed ticket for complex issues", badge: "Tracked", color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/10", border: "border-violet-500/20" },
  { icon: Twitter, title: "Twitter / X", desc: "@buznify — DMs open for quick questions", badge: "Social", color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/20" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll reply within 2 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="container relative z-10 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Contact</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a question, issue, or partnership inquiry? We're here 24/7.
          </p>
        </div>
      </section>

      <div className="container pb-20 max-w-5xl mx-auto">
        {/* Contact channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CHANNELS.map(({ icon: Icon, title, desc, badge, color, bg, border }) => (
            <div key={title} className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border} cursor-pointer hover:scale-[1.02] transition-transform`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-6 h-6 ${color}`} />
                <span className={`text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground`}>{badge}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Name *</label>
                    <Input
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
                  <Input
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Message *</label>
                  <textarea
                    rows={5}
                    placeholder="Describe your question or issue in detail..."
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 font-semibold"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Response Times</span>
              </div>
              <div className="space-y-3">
                {[
                  { channel: "Live Chat", time: "< 2 minutes", color: "text-emerald-400" },
                  { channel: "Email", time: "< 2 hours", color: "text-blue-400" },
                  { channel: "Support Ticket", time: "< 6 hours", color: "text-violet-400" },
                  { channel: "Twitter DM", time: "< 4 hours", color: "text-cyan-400" },
                ].map(({ channel, time, color }) => (
                  <div key={channel} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{channel}</span>
                    <span className={`text-xs font-medium ${color}`}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <Clock className="w-5 h-5 text-violet-400 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-2">Support Hours</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our AI chatbot is available 24/7. Human agents are online Monday–Sunday, 8 AM–12 AM UTC.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-violet-500/20">
              <Zap className="w-5 h-5 text-yellow-400 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-2">Quick Help</h3>
              <div className="space-y-2">
                {[
                  { label: "Order not delivered?", href: "/support" },
                  { label: "Refund request", href: "/refund" },
                  { label: "Account issue", href: "/support" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
