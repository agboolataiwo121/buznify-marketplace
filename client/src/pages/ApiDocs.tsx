import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Code, Key, ChevronRight, Copy, CheckCircle, Zap, Shield, Globe } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const ENDPOINTS = [
  {
    method: "GET", path: "/api/v1/products", desc: "List all available products",
    params: [{ name: "category", type: "string", req: false, desc: "Filter by category" }, { name: "limit", type: "number", req: false, desc: "Results per page (default: 20)" }],
    response: `{ "data": [{ "id": 1, "title": "Instagram 10K", "price": "49.99", "category": "social_media_accounts", "stock": 5 }], "total": 120, "page": 1 }`,
  },
  {
    method: "GET", path: "/api/v1/products/:id", desc: "Get a single product by ID",
    params: [{ name: "id", type: "number", req: true, desc: "Product ID" }],
    response: `{ "id": 1, "title": "Instagram 10K", "price": "49.99", "description": "...", "stock": 5 }`,
  },
  {
    method: "POST", path: "/api/v1/orders", desc: "Create a new order",
    params: [{ name: "productId", type: "number", req: true, desc: "Product to purchase" }, { name: "couponCode", type: "string", req: false, desc: "Optional discount coupon" }],
    response: `{ "orderId": "ord_abc123", "status": "delivered", "deliveryData": "email:pass@example.com", "amount": 49.99 }`,
  },
  {
    method: "GET", path: "/api/v1/orders/:id", desc: "Get order status and delivery data",
    params: [{ name: "id", type: "string", req: true, desc: "Order ID" }],
    response: `{ "orderId": "ord_abc123", "status": "delivered", "deliveryData": "...", "createdAt": "2025-01-01T00:00:00Z" }`,
  },
  {
    method: "GET", path: "/api/v1/wallet/balance", desc: "Get your wallet balance",
    params: [],
    response: `{ "balance": "125.50", "currency": "USD" }`,
  },
  {
    method: "GET", path: "/api/v1/virtual-numbers", desc: "List available virtual numbers",
    params: [{ name: "country", type: "string", req: false, desc: "ISO country code (e.g. US, GB)" }, { name: "service", type: "string", req: false, desc: "Target service (e.g. whatsapp)" }],
    response: `{ "numbers": [{ "id": 1, "number": "+1555000123", "country": "US", "price": "0.50" }] }`,
  },
  {
    method: "POST", path: "/api/v1/virtual-numbers/:id/sms", desc: "Get SMS messages for a number",
    params: [{ name: "id", type: "number", req: true, desc: "Virtual number ID" }],
    response: `{ "messages": [{ "sender": "Google", "message": "Your code is 123456", "receivedAt": "2025-01-01T12:00:00Z" }] }`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  POST: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  PUT: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  DELETE: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function ApiDocs() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText("bz_live_sk_xxxxxxxxxxxxxxxxxxxxxxxx");
    setCopied(true);
    toast.success("Server key copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const ep = ENDPOINTS[selected];

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
            <span className="text-foreground">Server Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            <span className="gradient-text">Server</span> Documentation
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Integrate Buznify into your application. Automate purchases, check order status, and manage virtual numbers programmatically.
          </p>
        </div>
      </section>

      <div className="container pb-20 max-w-6xl mx-auto">
        {/* Quick start */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Key, title: "Authentication", desc: "Bearer token via server key", color: "text-violet-400" },
            { icon: Globe, title: "Base URL", desc: "https://api.buznify.com/v1", color: "text-blue-400" },
            { icon: Zap, title: "Rate Limit", desc: "1,000 requests / hour", color: "text-yellow-400" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div>
                <p className="text-xs font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* API Key demo */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-violet-500/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-400" />
              Your Server Key
            </h3>
            <span className="text-xs badge-warning px-2 py-0.5 rounded-full">Demo Key</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono border border-white/5">
              bz_live_sk_xxxxxxxxxxxxxxxxxxxxxxxx
            </code>
            <button onClick={copyKey} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Include in all requests: <code className="text-violet-400">Authorization: Bearer &lt;your_server_key&gt;</code>
          </p>
        </div>

        {/* Endpoint explorer */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Endpoint list */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Endpoints</h3>
            {ENDPOINTS.map((ep, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left glass-card rounded-xl p-3 transition-all ${selected === i ? "border-violet-500/40 bg-violet-500/5" : "hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                </div>
                <code className="text-xs text-foreground">{ep.path}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{ep.desc}</p>
              </button>
            ))}
          </div>

          {/* Endpoint detail */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-bold px-2 py-1 rounded border ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                <code className="text-sm text-foreground font-mono">{ep.path}</code>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{ep.desc}</p>

              {ep.params.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-foreground mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                        <code className="text-xs text-violet-400 font-mono w-24 flex-shrink-0">{p.name}</code>
                        <span className="text-xs text-blue-400 w-14 flex-shrink-0">{p.type}</span>
                        <span className={`text-xs flex-shrink-0 ${p.req ? "text-red-400" : "text-muted-foreground"}`}>{p.req ? "required" : "optional"}</span>
                        <span className="text-xs text-muted-foreground">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-foreground mb-3">Example Response</h4>
                <pre className="bg-black/40 rounded-xl p-4 text-xs text-emerald-400 font-mono overflow-x-auto border border-white/5">
                  {ep.response}
                </pre>
              </div>
            </div>

            {/* cURL example */}
            <div className="glass-card rounded-2xl p-6">
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                cURL Example
              </h4>
              <pre className="bg-black/40 rounded-xl p-4 text-xs text-cyan-400 font-mono overflow-x-auto border border-white/5">
{`curl -X ${ep.method} \\
  https://api.buznify.com/v1${ep.path.replace(":id", "1")} \\
  -H "Authorization: Bearer bz_live_sk_xxx" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </div>
        </div>

        {/* SDK note */}
        <div className="mt-8 glass-card rounded-2xl p-6 border border-blue-500/20 flex items-start gap-4">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Need an SDK?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official Node.js and Python SDKs are coming soon. In the meantime, use the REST API directly or{" "}
              <Link href="/contact" className="text-primary hover:underline">contact us</Link> for integration support.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
