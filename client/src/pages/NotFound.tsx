import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] sm:text-[14rem] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, oklch(0.78 0.2 290), oklch(0.7 0.2 200))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px oklch(0.65 0.25 290 / 0.4))",
            }}
          >
            404
          </div>
          {/* Glitch lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          </div>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center mb-6 animate-float">
          <Zap className="w-8 h-8 text-violet-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
          The page you're looking for has been moved, deleted, or doesn't exist in this dimension. Let's get you back on track.
        </p>

        {/* Trust badge strip */}
        <div className="glass rounded-xl px-6 py-3 mb-10 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
            <span className="text-white/20">·</span>
            <span>Buznify Marketplace</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/">
            <Button
              size="lg"
              className="h-11 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
