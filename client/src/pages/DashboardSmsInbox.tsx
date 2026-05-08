import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { RefreshCw, Phone, MessageSquare, Clock } from "lucide-react";

export default function DashboardSmsInbox() {
  const [selectedNumberId, setSelectedNumberId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: myNumbers } = trpc.virtualNumbers.myNumbers.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const { data: smsMessages, refetch: refetchSms } = trpc.virtualNumbers.getSms.useQuery(
    { numberId: selectedNumberId! },
    { enabled: !!selectedNumberId, refetchInterval: 5000 }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchSms();
    setRefreshing(false);
  };

  return (
    <DashboardShell title="SMS Inbox" subtitle="View incoming SMS messages for your virtual numbers.">
      {!myNumbers || myNumbers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No virtual numbers</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Purchase a virtual number to start receiving SMS messages
          </p>
          <Link href="/virtual-numbers">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
              Get a Number
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Numbers list */}
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">My Numbers</h2>
            <div className="space-y-2">
              {myNumbers.map((num) => {
                const isExpired = num.expiresAt && new Date(num.expiresAt) < new Date();
                return (
                  <div
                    key={num.id}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedNumberId === num.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-white/5 hover:bg-white/8 border border-white/5"
                    }`}
                    onClick={() => setSelectedNumberId(num.id)}
                  >
                    <p className="text-sm font-mono font-semibold text-foreground">{num.number}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{num.countryName}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isExpired ? "badge-warning" : "badge-success"}`}>
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SMS messages */}
          <div className="glass-card rounded-2xl p-5">
            {!selectedNumberId ? (
              <div className="h-full flex items-center justify-center py-16">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a number to view messages</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Messages
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 h-7 text-xs"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {!smsMessages || smsMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Waiting for messages...</p>
                    <p className="text-xs text-muted-foreground mt-1">Auto-refreshes every 5 seconds</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {smsMessages.map((msg) => (
                      <div key={msg.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-primary">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.receivedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground font-mono bg-black/20 p-2 rounded-lg">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
