import { useState, useRef } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Camera,
  Edit3,
  Check,
  X,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Star,
  Lock,
  Eye,
  EyeOff,
  Download,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { generateReceiptPdf } from "@/lib/receiptGenerator";

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock },
  processing: { label: "Processing", color: "text-blue-400", icon: Loader2 },
  completed: { label: "Completed", color: "text-emerald-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-400", icon: XCircle },
  refunded: { label: "Refunded", color: "text-orange-400", icon: XCircle },
};

export default function UserProfile() {
  const { user: authUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<number | null>(null);
  const [buyingAgainId, setBuyingAgainId] = useState<number | null>(null);
  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { data: profile, refetch: refetchProfile } = trpc.profile.get.useQuery(undefined, {
    enabled: !!authUser,
  });

  const changePasswordMutation = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  const buyAgainMutation = trpc.orders.create.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Order placed! Check your purchase history for delivery details.");
      setBuyingAgainId(null);
      void utils.profile.purchaseHistory.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to place order. Please try again.");
      setBuyingAgainId(null);
    },
  });

  const handleBuyAgain = (order: { id: number; productId: number }) => {
    setBuyingAgainId(order.id);
    buyAgainMutation.mutate({ productId: order.productId, quantity: 1 });
  };

  const pwRules = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One number", ok: /[0-9]/.test(newPassword) },
  ];

  const utils = trpc.useUtils();

  const handleDownloadReceipt = async (orderId: number) => {
    setDownloadingReceiptId(orderId);
    try {
      const receipt = await utils.profile.getOrderReceipt.fetch({ orderId });
      generateReceiptPdf(receipt);
    } catch {
      toast.error("Failed to generate receipt. Please try again.");
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const { data: purchaseHistory, isLoading: historyLoading } = trpc.profile.purchaseHistory.useQuery(
    { limit: historyLimit },
    { enabled: !!authUser }
  );

  const updateName = trpc.profile.updateName.useMutation({
    onSuccess: () => {
      toast.success("Display name updated.");
      setEditingName(false);
      refetchProfile();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleStartEditName = () => {
    setNameValue(profile?.name ?? "");
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (!nameValue.trim()) return;
    updateName.mutate({ name: nameValue.trim() });
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar must be under 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json() as { success?: boolean; avatarUrl?: string; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Upload failed");
      toast.success("Profile picture updated.");
      refetchProfile();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyReferralCode = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
      toast.success("Referral code copied!");
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "—";

  const avatarInitials = (profile?.name ?? authUser?.name ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!authUser) {
    return (
    <DashboardShell title="Profile">
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    </DashboardShell>
    );
  }

  return (
    <DashboardShell title="My Profile" subtitle="Manage your account details and purchase history">
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account details and view your purchase history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ── Left: Avatar + Basic Info ── */}
          <div className="md:col-span-1 space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500/40 cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {avatarInitials}
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 border-2 border-background flex items-center justify-center transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Name */}
                <div className="w-full">
                  {editingName ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="h-8 text-sm bg-white/5 border-white/20"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300" onClick={handleSaveName} disabled={updateName.isPending}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setEditingName(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">{profile?.name ?? authUser.name}</h2>
                      <button onClick={handleStartEditName} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{profile?.email ?? authUser.email}</p>
                </div>

                <Separator className="bg-white/10" />

                {/* Stats */}
                <div className="w-full grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-violet-400">${(profile?.balance ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Balance</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{purchaseHistory?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </div>

                {/* Role badge */}
                <div className="flex items-center gap-2">
                  {profile?.role === "admin" ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <Star className="w-3 h-3 mr-1" /> Admin
                    </Badge>
                  ) : (
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                      <User className="w-3 h-3 mr-1" /> Member
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="text-foreground font-medium">{memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last sign in</span>
                  <span className="text-foreground font-medium">
                    {profile?.lastSignedIn ? new Date(profile.lastSignedIn).toLocaleDateString() : "—"}
                  </span>
                </div>
                {profile?.referralCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Referral code</span>
                    <button
                      onClick={copyReferralCode}
                      className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-mono text-xs transition-colors"
                    >
                      {profile.referralCode}
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Purchase History ── */}
          <div className="md:col-span-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-violet-400" />
                      Purchase History
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">All your marketplace orders</CardDescription>
                  </div>
                  {purchaseHistory && purchaseHistory.length > 0 && (
                    <Badge variant="secondary" className="bg-white/5 text-muted-foreground">
                      {purchaseHistory.length} orders
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                  </div>
                ) : !purchaseHistory || purchaseHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No purchases yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your orders will appear here once you make a purchase.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                      onClick={() => window.location.href = "/marketplace"}
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchaseHistory.map((order) => {
                      const statusCfg = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending;
                      const StatusIcon = statusCfg.icon;
                      return (
                        <div
                          key={order.id}
                          className="flex items-start justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Package className="w-4 h-4 text-violet-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                Order #{order.id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              {order.deliveryData != null && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                                  {(() => {
                                    const raw = typeof order.deliveryData === "string"
                                      ? order.deliveryData
                                      : JSON.stringify(order.deliveryData as Record<string, unknown>);
                                    return raw.length > 60 ? raw.slice(0, 60) + "…" : raw;
                                  })()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                            <span className="text-sm font-bold text-foreground">
                              ${parseFloat(order.totalAmount).toFixed(2)}
                            </span>
                            <div className={`flex items-center gap-1 text-xs font-medium ${statusCfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); void handleDownloadReceipt(order.id); }}
                                disabled={downloadingReceiptId === order.id}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-violet-400 transition-colors disabled:opacity-50"
                                title="Download Receipt"
                              >
                                {downloadingReceiptId === order.id
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <Download className="w-3 h-3" />}
                                Receipt
                              </button>
                              {order.productId != null && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleBuyAgain({ id: order.id, productId: order.productId }); }}
                                  disabled={buyingAgainId === order.id}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-400 transition-colors disabled:opacity-50"
                                  title="Buy Again"
                                >
                                  {buyingAgainId === order.id
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <RotateCcw className="w-3 h-3" />}
                                  Buy Again
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {purchaseHistory.length >= historyLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground hover:text-foreground"
                        onClick={() => setHistoryLimit((l) => l + 20)}
                      >
                        Load more
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          {/* Change Password */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-base">Change Password</CardTitle>
                  <CardDescription className="text-xs">
                    Update your account password. OAuth-only users can set a password here.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowCurrentPw((v) => !v)}
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowNewPw((v) => !v)}
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {pwRules.map((rule) => (
                      <li key={rule.label} className={"flex items-center gap-2 text-xs " + (rule.ok ? "text-emerald-400" : "text-muted-foreground")}>
                        {rule.ok
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={"flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-10" + (confirmPassword && confirmPassword !== newPassword ? " border-red-500" : "")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPw((v) => !v)}
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending || !newPassword || !confirmPassword}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white"
              >
                {changePasswordMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" /> Update Password</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Push Notification Preferences */}
          <NotificationPreferencesCard />

          {/* Appearance */}
          <AppearanceCard />
      </div>
    </DashboardShell>
  );
}

function NotificationPreferencesCard() {
  const { permission, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const isSupported = permission !== "unsupported";
  const isEnabled = permission === "granted";

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
          Push Notifications
        </CardTitle>
        <CardDescription className="text-xs mt-0.5">Get instant alerts when your orders are delivered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isSupported ? (
          <p className="text-xs text-muted-foreground">Push notifications are not supported in your browser.</p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {isEnabled ? "Notifications enabled" : "Notifications disabled"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEnabled
                  ? "You will receive a push alert when an order is delivered."
                  : "Enable to get instant delivery alerts on this device."}
              </p>
            </div>
            <button
              onClick={isEnabled ? unsubscribe : subscribe}
              disabled={isLoading || permission === "denied"}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                isEnabled ? "bg-violet-600" : "bg-white/10"
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}
        {permission === "denied" && (
          <p className="text-xs text-amber-400">
            Notifications are blocked in your browser settings. To re-enable, click the lock icon in your browser address bar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AppearanceCard() {
  const { theme, toggleTheme, switchable } = useTheme();
  if (!switchable || !toggleTheme) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          Appearance
        </CardTitle>
        <CardDescription className="text-xs mt-0.5">
          Choose how Buznify looks for you. Your preference is saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <button
            onClick={() => theme === "light" ? null : toggleTheme()}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button
            onClick={() => theme === "dark" ? null : toggleTheme()}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-xs font-medium">Dark</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Currently using <span className="font-medium text-foreground">{theme === "dark" ? "Dark" : "Light"} Mode</span>
        </p>
      </CardContent>
    </Card>
  );
}
