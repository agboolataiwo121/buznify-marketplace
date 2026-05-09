import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw, Shield, AlertTriangle } from "lucide-react";

export default function DashboardApiKeys() {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const { data: keys = [], isLoading, refetch } = trpc.apiKeys.list.useQuery();
  const create = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      refetch();
      setNewKey(data.key);
      setShowForm(false);
      setLabel("");
              toast.success("Server key created — copy it now, it won't be shown again!");
    },
    onError: (e) => toast.error(e.message),
  });
  const revoke = trpc.apiKeys.revoke.useMutation({
            onSuccess: () => { refetch(); toast.success("Server key revoked"); },
    onError: (e) => toast.error(e.message),
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardShell title="Server Keys">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">Manage your server keys for programmatic access to Buznify services</p>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Key
          </Button>
        </div>

        {/* New Key Alert */}
        {newKey && (
          <div className="glass-card rounded-xl p-4 border border-green-500/40 bg-green-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold text-sm">New Server Key Created</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-300 text-xs">Copy this key now — it will not be shown again for security reasons.</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3">
              <code className="text-green-300 text-sm flex-1 break-all">
                {showKey ? newKey : newKey.substring(0, 12) + "•".repeat(24)}
              </code>
              <button onClick={() => setShowKey(!showKey)} className="text-gray-400 hover:text-white">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => copyKey(newKey)} className="text-gray-400 hover:text-green-400">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={() => setNewKey(null)}
            >
              I've saved my key
            </Button>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="glass-card rounded-xl p-5 border border-violet-500/30">
            <h3 className="text-white font-semibold mb-4">Create New Server Key</h3>
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-1 block">Key Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Production App, Test Integration"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => create.mutate({ label })}
                disabled={create.isPending || !label.trim()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              >
                {create.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Generate Key
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-gray-400">Cancel</Button>
            </div>
          </div>
        )}

        {/* Keys List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No server keys yet</h3>
            <p className="text-gray-400">Create a server key to integrate Buznify into your applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k: any) => (
              <div key={k.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Key className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{k.label}</span>
                      <Badge className={k.isActive ? "bg-green-500/20 text-green-300 border-green-500/30 text-xs" : "bg-red-500/20 text-red-300 border-red-500/30 text-xs"}>
                        {k.isActive ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      Created {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsedAt && ` • Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                {k.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs"
                    onClick={() => revoke.mutate({ id: k.id })}
                    disabled={revoke.isPending}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* API Docs Link */}
        <div className="glass-card rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-white text-sm font-medium">Server Documentation</div>
              <div className="text-gray-400 text-xs">Learn how to use the Buznify server to automate orders and manage services</div>
            </div>
            <a href="/api-docs" className="ml-auto">
              <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs">
                View Docs
              </Button>
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
