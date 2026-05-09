import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);

  const resendMutation = trpc.auth.resendVerification.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("Verification email sent! Check your inbox.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send verification email.");
    },
  });

  // Only show for logged-in users with unverified email
  if (!user || user.emailVerified || dismissed) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-200 flex-1">
          {sent ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Verification email sent — check your inbox and spam folder.
            </span>
          ) : (
            <>
              <span className="font-medium">Email not verified.</span>{" "}
              Please verify your email address to secure your account and receive notifications.
            </>
          )}
        </p>
        {!sent && (
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 text-xs h-7 px-3 shrink-0"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            <Mail className="w-3 h-3 mr-1" />
            {resendMutation.isPending ? "Sending..." : "Resend email"}
          </Button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-300 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
