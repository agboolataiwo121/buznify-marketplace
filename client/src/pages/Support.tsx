import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Zap,
  Shield,
  HelpCircle,
} from "lucide-react";

const CATEGORIES: { value: "billing" | "technical" | "account" | "order" | "other"; label: string }[] = [
  { value: "order", label: "Order Issue" },
  { value: "billing", label: "Payment / Billing" },
  { value: "account", label: "Account Access" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
];

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export default function Support() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    category: "order" as "billing" | "technical" | "account" | "order" | "other",
    priority: "medium" as typeof PRIORITIES[number],
  });

  const utils = trpc.useUtils();
  const { data: tickets, isLoading } = trpc.support.myTickets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      toast.success("Support ticket created! We'll respond within 24 hours.");
      setShowForm(false);
      setForm({ subject: "", message: "", category: "order", priority: "medium" });
      utils.support.myTickets.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    createMutation.mutate(form);
  };

  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    open: { icon: Clock, color: "text-yellow-400", label: "Open" },
    in_progress: { icon: MessageSquare, color: "text-blue-400", label: "In Progress" },
    resolved: { icon: CheckCircle, color: "text-emerald-400", label: "Resolved" },
    closed: { icon: XCircle, color: "text-muted-foreground", label: "Closed" },
  };

  const priorityColor: Record<string, string> = {
    low: "text-emerald-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    urgent: "text-red-400",
  };

  return (
    <DashboardShell title="Support Center" subtitle="Get help with your orders and account.">
      {/* FAQ quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Zap, title: "Instant Delivery", desc: "How automated delivery works", color: "text-yellow-400" },
          { icon: Shield, title: "Refund Policy", desc: "When and how to request refunds", color: "text-emerald-400" },
          { icon: HelpCircle, title: "Account Help", desc: "Login issues and account recovery", color: "text-violet-400" },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="glass-card rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all group"
            onClick={() => toast.info("FAQ section coming soon")}
          >
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {/* New ticket button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">My Tickets</h2>
        <Button
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9"
          onClick={() => {
            if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
            setShowForm(!showForm);
          }}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Ticket
        </Button>
      </div>

      {/* Create ticket form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Create Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as "billing" | "technical" | "account" | "order" | "other" }))}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none focus:border-primary/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-background">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as any }))}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none focus:border-primary/50"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p} className="bg-background capitalize">{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject *</label>
              <Input
                placeholder="Brief description of your issue"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message *</label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={4}
                required
                className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {!isAuthenticated ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to view tickets</h3>
          <Button
            className="mt-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-16 animate-shimmer" />
          ))}
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tickets yet</h3>
          <p className="text-sm text-muted-foreground">Create a ticket if you need help</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const config = statusConfig[ticket.status] ?? statusConfig.open;
            const Icon = config.icon;
            return (
              <Link key={ticket.id} href={`/support/${ticket.id}`}>
                <div className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-all group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    ticket.status === "open" ? "bg-yellow-500/20" :
                    ticket.status === "resolved" ? "bg-emerald-500/20" : "bg-blue-500/20"
                  }`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{ticket.category}</span>
                      <span className={`text-xs font-medium ${priorityColor[ticket.priority] ?? "text-muted-foreground"}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ticket.status === "open" ? "badge-warning" :
                      ticket.status === "resolved" ? "badge-success" : "badge-purple"
                    }`}>
                      {config.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
