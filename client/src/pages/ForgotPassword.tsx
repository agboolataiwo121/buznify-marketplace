import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Zap, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      // In dev mode, the token is returned directly
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Buznify</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {submitted ? "Check your email for a reset link" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                If an account exists for <span className="text-foreground font-medium">{email}</span>, a reset link has been sent.
              </p>
              {/* Dev mode: show token directly */}
              {resetToken && (
                <div className="glass rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs text-amber-400 font-medium mb-1">Dev Mode — Reset Token:</p>
                  <p className="text-xs font-mono text-foreground break-all">{resetToken}</p>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="text-xs text-violet-400 hover:text-violet-300 mt-2 block"
                  >
                    Click here to reset password →
                  </Link>
                </div>
              )}
              <Link href="/login">
                <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 focus:border-violet-500/50"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold"
                disabled={forgotMutation.isPending}
              >
                {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link href="/login">
                <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
