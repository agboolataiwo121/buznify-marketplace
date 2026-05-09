import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Link } from "wouter";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success");
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
    if (t) {
      setStatus("loading");
      verifyMutation.mutate({ token: t });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            )}
            {status === "idle" && (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
            {status === "idle" && "Email verification"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <p className="text-muted-foreground text-sm">Please wait while we verify your email address.</p>
          )}
          {status === "success" && (
            <>
              <p className="text-muted-foreground text-sm">
                Your email address has been verified successfully. You can now access all features.
              </p>
              <Button className="w-full" onClick={() => setLocation("/dashboard")}>
                Go to Dashboard
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-muted-foreground text-sm">{errorMsg || "The verification link is invalid or has expired."}</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => setLocation("/dashboard/security")}>
                  Request new link
                </Button>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full">Back to Dashboard</Button>
                </Link>
              </div>
            </>
          )}
          {status === "idle" && !token && (
            <>
              <p className="text-muted-foreground text-sm">No verification token found. Please use the link from your email.</p>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
