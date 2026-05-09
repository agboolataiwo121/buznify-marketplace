import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare, Send, Clock, CheckCircle, Shield, Sparkles } from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [reply, setReply] = useState("");
  const utils = trpc.useUtils();

  const { data: ticket, isLoading } = trpc.support.getTicket.useQuery(
    { id: parseInt(id ?? "0") },
    { enabled: !!id }
  );

  const replyMutation = trpc.support.addMessage.useMutation({
    onSuccess: () => {
      toast.success("Reply sent!");
      setReply("");
      utils.support.getTicket.invalidate({ id: parseInt(id ?? "0") });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const closeMutation = trpc.support.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Ticket closed");
      utils.support.getTicket.invalidate({ id: parseInt(id ?? "0") });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const suggestReplyMutation = trpc.support.suggestReply.useMutation({
    onSuccess: (data) => {
      if (data.suggestion) setReply(data.suggestion);
      toast.success("AI suggestion loaded — review and edit before sending");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <DashboardShell title="Ticket">
        <div className="glass-card rounded-2xl p-8 animate-shimmer h-48" />
      </DashboardShell>
    );
  }

  if (!ticket) {
    return (
      <DashboardShell title="Ticket Not Found">
        <div className="glass-card rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Ticket not found</p>
        </div>
      </DashboardShell>
    );
  }

  const t = ticket.ticket;
  const messages = ticket.messages ?? [];

  return (
    <DashboardShell title={`Ticket #${t.id}`} subtitle={t.subject}>
      {/* Ticket info */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            t.status === "open" ? "badge-warning" :
            t.status === "resolved" ? "badge-success" : "badge-purple"
          }`}>
            {t.status}
          </span>
          <span className="text-xs text-muted-foreground">{t.category}</span>
          <span className="text-xs text-muted-foreground capitalize">{t.priority} priority</span>
          <span className="text-xs text-muted-foreground">
            {new Date(t.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-4">
        {messages.map((r: any) => (
          <div
            key={r.id}
            className={`flex gap-3 ${r.isStaff ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              r.isStaff ? "bg-violet-500/20" : "bg-white/10"
            }`}>
              {r.isStaff ? (
                <Shield className="w-4 h-4 text-violet-400" />
              ) : (
                <span className="text-xs font-bold text-foreground">U</span>
              )}
            </div>
            <div className={`flex-1 max-w-[80%] ${r.isStaff ? "items-end" : ""}`}>
              <div className={`p-3 rounded-xl text-sm ${
                r.isStaff
                  ? "bg-violet-500/10 border border-violet-500/20 text-foreground"
                  : "bg-white/5 border border-white/5 text-foreground"
              }`}>
                {r.message}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {r.isStaff ? "Support Team" : "You"} · {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {t.status !== "closed" && t.status !== "resolved" && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Add Reply</h3>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50 resize-none mb-3"
          />
          <div className="flex gap-3 flex-wrap">
            <Button
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
              onClick={() => replyMutation.mutate({ ticketId: t.id, message: reply })}
              disabled={!reply.trim() || replyMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
            {(user as { role?: string } | null)?.role === "admin" && (
              <Button
                variant="outline"
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                onClick={() => suggestReplyMutation.mutate({ ticketId: t.id })}
                disabled={suggestReplyMutation.isPending}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {suggestReplyMutation.isPending ? "Generating..." : "AI Suggest"}
              </Button>
            )}
            <Button
              variant="outline"
              className="border-white/10 bg-white/5"
              onClick={() => closeMutation.mutate({ id: t.id, status: "resolved" })}
              disabled={closeMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Resolved
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
