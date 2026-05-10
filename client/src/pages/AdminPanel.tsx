import { useState, useMemo, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardShell from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  XCircle,
  Shield,
  TrendingUp,
  RefreshCw,
  Tag,
  Plus,
  Megaphone,
  AlertTriangle,
  Trash2,
  CreditCard,
  RotateCcw,
  Activity,
  Edit2,
  X,
  ImageIcon,
  Star,
  Search,
  Bell,
  Settings,
  Zap,
  Brain,
  ToggleLeft,
  ToggleRight,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign as DollarCircle,
  Gift,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Landmark,
  Smartphone,
  Filter,
  ShieldAlert,
  Eye,
  Globe,
  UserX,
  Upload,
  FileText,
  ArrowDownToLine,
  Banknote,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart,
} from "recharts";
import IconPicker, { ICON_MAP } from "@/components/IconPicker";
import ServiceIcon from "@/components/ServiceIcon";
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tab = "overview" | "users" | "products" | "orders" | "coupons" | "vendors" | "announcements" | "fraud" | "refunds" | "payouts" | "withdrawals" | "notifications" | "services" | "ai_insights" | "categories" | "transactions" | "security_logs" | "alerts";

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    usageLimit: "100",
    expiresAt: "",
  });

  const [chartDays, setChartDays] = useState<7 | 14 | 30>(30);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", type: "info" as "info" | "warning" | "success" });
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Platform Maintenance", message: "Scheduled maintenance on Sunday 2AM UTC. Expect 30 min downtime.", type: "warning", time: "2 hours ago", active: true },
    { id: 2, title: "New Payment Methods Added", message: "We now accept USDT and BNB for wallet top-ups!", type: "success", time: "1 day ago", active: true },
  ]);
  // ── Bulk selection state ─────────────────────────────────────────────────
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [bulkEditModal, setBulkEditModal] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    status: "" as "" | "active" | "inactive" | "pending" | "rejected",
    category: "" as "" | "social_media_accounts" | "streaming_accounts" | "gaming_accounts" | "virtual_numbers" | "growth_services",
    priceAdjType: "" as "" | "set" | "increase_pct" | "decrease_pct" | "increase_fixed" | "decrease_fixed",
    priceAdjValue: "",
    stock: "",
    featured: "" as "" | "true" | "false",
  });

  // ── Product filter/sort state ─────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<"all" | "social_media_accounts" | "streaming_accounts" | "gaming_accounts" | "virtual_numbers" | "growth_services">("all");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "inactive" | "pending" | "rejected">("all");
  const [productSort, setProductSort] = useState<"newest" | "oldest" | "price_high" | "price_low" | "stock_high" | "stock_low">("newest");

  // ── Product modal state ──────────────────────────────────────────────────
  const [productModal, setProductModal] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<NonNullable<typeof allProducts>[number] | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "social_media_accounts" as "social_media_accounts" | "streaming_accounts" | "gaming_accounts" | "virtual_numbers" | "growth_services",
    subcategoryId: null as number | null,
    platform: "",
    price: "",
    originalPrice: "",
    stock: "1",
    imageUrl: "",
    iconKey: "",
    deliveryType: "instant" as "instant" | "manual",
    deliveryData: "",
    featured: false,
    status: "active" as "active" | "inactive" | "pending" | "rejected",
  });

  // ── Push notification state ──────────────────────────────────────────────
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" as "info" | "success" | "warning" });
  // ── Platform autocomplete ─────────────────────────────────────────────────
  const [showPlatformSuggestions, setShowPlatformSuggestions] = useState(false);
  // ── Icon picker ───────────────────────────────────────────────────────────
  const [iconPickerTab, setIconPickerTab] = useState<"icon" | "url">("icon");
  const [iconPickerSearch, setIconPickerSearch] = useState("");
  // ── Credential fields builder ─────────────────────────────────────────────
  type CredField = { id: string; label: string; value: string; sensitive: boolean };
  // Account pool: array of credential sets (each set = array of CredField)
  type AccountSet = { id: string; fields: CredField[] };
  const [credMode, setCredMode] = useState<"pool" | "single" | "json">("pool");
  // Single-account mode (legacy)
  const [credFields, setCredFields] = useState<CredField[]>([]);
  // Multi-account pool mode
  const [accountPool, setAccountPool] = useState<AccountSet[]>([]);
  // Which account in the pool is expanded for editing
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  // Bulk import state
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportDelimiter, setBulkImportDelimiter] = useState<":" | "|" | "\t" | ",">(":");
  const [bulkImportFieldNames, setBulkImportFieldNames] = useState<string[]>(["Email", "Password"]);
  // Derived: parsed preview of bulk import
  const bulkImportPreview = (() => {
    if (!bulkImportText.trim()) return [];
    const lines = bulkImportText.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const parts = line.split(bulkImportDelimiter);
      const fields: CredField[] = bulkImportFieldNames.map((name, i) => ({
        id: Math.random().toString(36).slice(2),
        label: name.trim() || `Field ${i + 1}`,
        value: parts[i]?.trim() ?? "",
        sensitive: ["password","2fa","backup","secret","key","code","token"].some(k => name.toLowerCase().includes(k)),
      }));
      // Append any extra columns beyond named fields as "Extra N"
      for (let i = bulkImportFieldNames.length; i < parts.length; i++) {
        fields.push({ id: Math.random().toString(36).slice(2), label: `Extra ${i + 1}`, value: parts[i]?.trim() ?? "", sensitive: false });
      }
      return { id: Math.random().toString(36).slice(2), fields };
    });
  })();
  const PRESET_FIELDS = [
    { label: "Email", sensitive: false },
    { label: "Password", sensitive: true },
    { label: "Username", sensitive: false },
    { label: "Recovery Email", sensitive: false },
    { label: "2FA Backup Code", sensitive: true },
    { label: "Phone Number", sensitive: false },
    { label: "License Key", sensitive: true },
    { label: "Download Link", sensitive: false },
    { label: "Redeem Code", sensitive: true },
    { label: "Notes", sensitive: false },
  ];
  const KNOWN_PLATFORMS = [
    "Instagram","TikTok","Twitter","Facebook","WhatsApp","Telegram","Snapchat","LinkedIn","Pinterest","Reddit","Discord","Threads",
    "Netflix","Spotify","Disney+","YouTube","Hulu","Amazon Prime","Apple TV+","HBO Max","Twitch","SoundCloud",
    "Steam","Roblox","Minecraft","Fortnite","Valorant","CSGO","PUBG","League of Legends","PlayStation","Xbox","Epic Games",
    "ChatGPT","Claude","Midjourney","OpenAI","Perplexity","ElevenLabs","Runway","Canva","Grammarly","Notion","Adobe",
    "NordVPN","Mullvad VPN","GoLogin","Residential Proxy","Mobile Proxy","IPv6 Proxy","RDP/VPS",
    "Gmail","Outlook","PayPal","Microsoft","CapCut",
  ];
  // ── Service categories state ─────────────────────────────────────────────
  const [categoryUpdating, setCategoryUpdating] = useState<string | null>(null);
  // ── Dynamic Product Categories ──────────────────────────────────────────
  const [catForm, setCatForm] = useState({ slug: "", label: "", icon: "Tag", description: "", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/20 hover:border-violet-500/40", iconColor: "text-violet-400", sortOrder: 0, parentId: null as number | null });
  const [catEditId, setCatEditId] = useState<number | null>(null);
  const [catEditForm, setCatEditForm] = useState({ label: "", icon: "", description: "", sortOrder: 0, parentId: null as number | null });
  const [catDeleteId, setCatDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: revenueChart } = trpc.admin.getRevenueChart.useQuery({ days: chartDays }, { enabled: tab === "overview" });
  const { data: userGrowthChart } = trpc.admin.getUserGrowthChart.useQuery({ days: chartDays }, { enabled: tab === "overview" });
  const { data: allUsers } = trpc.admin.getUsers.useQuery(undefined, { enabled: tab === "users" });
  const { data: allProducts } = trpc.admin.getProducts.useQuery(undefined, { enabled: tab === "products" });
  // Real-time order monitoring with 30s polling
  const { data: allOrders } = trpc.admin.getOrders.useQuery(undefined, { enabled: tab === "orders", refetchInterval: tab === "orders" ? 30000 : false });
  const { data: coupons } = trpc.coupons.list.useQuery(undefined, { enabled: tab === "coupons" });
  const { data: allRefunds } = trpc.refunds.adminList.useQuery(undefined, { enabled: tab === "refunds" });
  const { data: allPayouts } = trpc.payouts.adminList.useQuery(undefined, { enabled: tab === "payouts" });
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<"all" | "pending" | "processing" | "success" | "failed" | "reversed">("all");
  const [rejectModalId, setRejectModalId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { data: allWithdrawals, refetch: refetchWithdrawals } = trpc.admin.getWithdrawals.useQuery(
    { status: withdrawalStatusFilter, limit: 100 },
    { enabled: tab === "withdrawals" }
  );
  const { data: serviceCategories, refetch: refetchCategories } = trpc.admin.getServiceCategories.useQuery(undefined, { enabled: tab === "services" });
  const { data: dbCategories, refetch: refetchDbCategories } = trpc.admin.listCategories.useQuery(undefined, { enabled: tab === "categories" });
  const { data: currentMarkup, refetch: refetchMarkup } = trpc.admin.getGrowthMarkup.useQuery(undefined, { enabled: tab === "services" });
  const [markupInput, setMarkupInput] = useState<string>("30");
  useEffect(() => { if (currentMarkup !== undefined) setMarkupInput(String(typeof currentMarkup === 'object' ? currentMarkup.value : currentMarkup)); }, [currentMarkup]);
  const setMarkupMutation = trpc.admin.setGrowthMarkup.useMutation({
    onSuccess: () => { refetchMarkup(); toast.success("Growth markup updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const { data: currentVnMarkup, refetch: refetchVnMarkup } = trpc.admin.getVirtualNumberMarkup.useQuery(undefined, { enabled: tab === "services" });
  const [vnMarkupInput, setVnMarkupInput] = useState<string>("30");
  useEffect(() => { if (currentVnMarkup !== undefined) setVnMarkupInput(String(typeof currentVnMarkup === 'object' ? currentVnMarkup.value : currentVnMarkup)); }, [currentVnMarkup]);
  const setVnMarkupMutation = trpc.admin.setVirtualNumberMarkup.useMutation({
    onSuccess: () => { refetchVnMarkup(); toast.success("Virtual Number markup updated!"); },
    onError: (e) => toast.error(e.message),
  });

  // ── Admin Transactions ──────────────────────────────────────────────────
  const [txSearch, setTxSearch] = useState("");
  const [txDebouncedSearch, setTxDebouncedSearch] = useState("");
  const [txType, setTxType] = useState<"all" | "deposit" | "withdrawal" | "purchase" | "refund" | "referral_reward" | "admin_credit">("all");
  const [txStatus, setTxStatus] = useState<"all" | "pending" | "completed" | "failed">("all");
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 20;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setTxDebouncedSearch(txSearch);
      setTxPage(1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [txSearch]);
  const { data: adminTxData, isLoading: adminTxLoading } = trpc.wallet.adminTransactions.useQuery(
    { search: txDebouncedSearch, type: txType, status: txStatus, page: txPage, pageSize: TX_PAGE_SIZE },
    { enabled: tab === "transactions" }
  );
  const [secPage, setSecPage] = useState(1);
  const [secSearch, setSecSearch] = useState("");
  const [secSearchInput, setSecSearchInput] = useState("");
  const [secAction, setSecAction] = useState("all");
  const SEC_PAGE_SIZE = 25;
  const { data: secLogsData, isLoading: secLogsLoading } = trpc.admin.getSecurityLogs.useQuery(
    { page: secPage, pageSize: SEC_PAGE_SIZE, search: secSearch || undefined, action: secAction !== "all" ? secAction : undefined },
    { enabled: tab === "security_logs" }
  );
  // Alerts state
  const [alertPage, setAlertPage] = useState(1);
  const ALERT_PAGE_SIZE = 20;
  const [alertForm, setAlertForm] = useState({ type: "warning" as "info"|"warning"|"error"|"success", severity: "medium" as "low"|"medium"|"high"|"critical", title: "", message: "", affectedService: "" });
  const [showAlertForm, setShowAlertForm] = useState(false);
  const { data: allAlertsData, isLoading: allAlertsLoading, refetch: refetchAlerts } = trpc.alerts.getAll.useQuery(
    { limit: ALERT_PAGE_SIZE, offset: (alertPage - 1) * ALERT_PAGE_SIZE },
    { enabled: tab === "alerts" }
  );
  const { data: errorState } = trpc.alerts.getErrorState.useQuery(undefined, { enabled: tab === "alerts", refetchInterval: 30_000 });
  const createAlertMutation = trpc.alerts.create.useMutation({
    onSuccess: () => { toast.success("Alert published!"); setAlertForm({ type: "warning", severity: "medium", title: "", message: "", affectedService: "" }); setShowAlertForm(false); refetchAlerts(); },
    onError: (err: any) => toast.error(err.message),
  });
  const dismissAlertMutation = trpc.alerts.dismiss.useMutation({
    onSuccess: () => { toast.success("Alert dismissed"); refetchAlerts(); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateAlertMutation = trpc.alerts.update.useMutation({
    onSuccess: () => { toast.success("Alert updated"); refetchAlerts(); },
    onError: (err: any) => toast.error(err.message),
  });
  const txTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string; sign: string }> = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400", label: "Deposit", sign: "+" },
    purchase: { icon: ArrowUpRight, color: "text-red-400", label: "Purchase", sign: "-" },
    refund: { icon: ArrowDownLeft, color: "text-blue-400", label: "Refund", sign: "+" },
    admin_credit: { icon: DollarCircle, color: "text-violet-400", label: "Admin Credit", sign: "+" },
    withdrawal: { icon: ArrowUpRight, color: "text-orange-400", label: "Withdrawal", sign: "-" },
    referral_reward: { icon: Gift, color: "text-pink-400", label: "Referral", sign: "+" },
  };
  function handleTxExportCSV() {
    if (!adminTxData?.rows?.length) { toast.error("No transactions to export"); return; }
    const headers = ["ID", "Date", "User Email", "User Name", "Type", "Amount (USD)", "Balance Before", "Balance After", "Reference", "Method", "NGN Amount", "Status", "Description"];
    const rows = adminTxData.rows.map(tx => [
      tx.id,
      new Date(tx.createdAt).toISOString(),
      tx.userEmail ?? "",
      tx.userName ?? "",
      tx.type,
      tx.amount,
      tx.balanceBefore,
      tx.balanceAfter,
      tx.referenceId ?? "",
      tx.paymentChannel ?? (tx.paymentReference ? "paystack" : ""),
      tx.paymentAmountNaira ?? "",
      tx.status,
      (tx.description ?? "").replace(/,/g, ";"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `buznify-admin-transactions-p${txPage}.csv`; a.click();
  }
  // Load all categories (for product form dropdowns) — always enabled
  const { data: allDbCategories } = trpc.products.listCategories.useQuery();
  const { data: aiInsights, isLoading: aiInsightsLoading } = trpc.admin.getAiAnalyticsSummary.useQuery(undefined, { enabled: tab === "ai_insights" });

  const updateRefundMutation = trpc.refunds.adminProcess.useMutation({
    onSuccess: () => { toast.success("Refund status updated"); utils.refunds.adminList.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });
  const updatePayoutMutation = trpc.payouts.adminProcess.useMutation({
    onSuccess: () => { toast.success("Payout status updated"); utils.payouts.adminList.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });
  const approveWithdrawalMutation = trpc.admin.approveWithdrawal.useMutation({
    onSuccess: (data) => {
      toast.success(`Transfer initiated — status: ${data.status}`);
      refetchWithdrawals();
    },
    onError: (err: any) => toast.error(err.message),
  });
  const rejectWithdrawalMutation = trpc.admin.rejectWithdrawal.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal rejected and balance refunded");
      setRejectModalId(null);
      setRejectReason("");
      refetchWithdrawals();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); utils.admin.getUsers.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      utils.admin.getProducts.invalidate();
      setProductModal(null);
      resetProductForm();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.admin.getProducts.invalidate();
      setProductModal(null);
      setEditingProduct(null);
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      utils.admin.getProducts.invalidate();
      setDeleteConfirmId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const bulkUpdateMutation = trpc.products.bulkUpdate.useMutation({
    onSuccess: (data) => {
      toast.success(`Updated ${data.updated} product${data.updated !== 1 ? 's' : ''}`);
      utils.admin.getProducts.invalidate();
      setBulkEditModal(false);
      setSelectedProductIds(new Set());
      setBulkForm({ status: "", category: "", priceAdjType: "", priceAdjValue: "", stock: "", featured: "" });
    },
    onError: (err) => toast.error(err.message),
  });
  const bulkDeleteMutation = trpc.products.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} product${data.deleted !== 1 ? 's' : ''}`);
      utils.admin.getProducts.invalidate();
      setBulkDeleteConfirm(false);
      setSelectedProductIds(new Set());
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBulkUpdate = () => {
    const ids = Array.from(selectedProductIds);
    const updates: Parameters<typeof bulkUpdateMutation.mutate>[0]['updates'] = {};
    if (bulkForm.status) updates.status = bulkForm.status;
    if (bulkForm.category) updates.category = bulkForm.category;
    if (bulkForm.featured !== "") updates.featured = bulkForm.featured === "true";
    if (bulkForm.stock !== "") updates.stock = parseInt(bulkForm.stock) || 0;
    if (bulkForm.priceAdjType && bulkForm.priceAdjValue) {
      updates.priceAdjustment = { type: bulkForm.priceAdjType as any, value: parseFloat(bulkForm.priceAdjValue) || 0 };
    }
    if (Object.keys(updates).length === 0) { toast.error("Select at least one field to update"); return; }
    bulkUpdateMutation.mutate({ ids, updates });
  };

  const resetProductForm = () => {
    setProductForm({
      title: "", description: "", category: "social_media_accounts", subcategoryId: null, platform: "",
      price: "", originalPrice: "", stock: "1", imageUrl: "", iconKey: "", deliveryType: "instant",
      deliveryData: "", featured: false, status: "active",
    });
    setCredFields([]);
    setAccountPool([]);
    setExpandedAccountId(null);
    setCredMode("pool");
  };

  const openEditProduct = (p: NonNullable<typeof allProducts>[number]) => {
    setEditingProduct(p as any);
    setProductForm({
      title: p.title,
      description: p.description ?? "",
      category: p.category as any,
      subcategoryId: (p as any).subcategoryId ?? null,
      platform: p.platform ?? "",
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      stock: String(p.stock),
      imageUrl: p.imageUrl ?? "",
      iconKey: (p as any).iconKey ?? "",
      deliveryType: p.deliveryType as "instant" | "manual",
      deliveryData: p.deliveryData ? JSON.stringify(p.deliveryData, null, 2) : "",
      featured: p.featured,
      status: p.status as any,
    });
    // Load existing deliveryData into credential state
    if (p.deliveryData && Array.isArray(p.deliveryData)) {
      // Multi-account pool: array of {label: value} objects
      const pool: AccountSet[] = (p.deliveryData as Record<string, string>[]).map(account => ({
        id: Math.random().toString(36).slice(2),
        fields: Object.entries(account).map(([label, value]) => ({
          id: Math.random().toString(36).slice(2),
          label,
          value: String(value),
          sensitive: ["password","2fa","backup","secret","key","code","token"].some(k => label.toLowerCase().includes(k)),
        })),
      }));
      setAccountPool(pool);
      setCredFields([]);
      setCredMode("pool");
    } else if (p.deliveryData && typeof p.deliveryData === "object" && !Array.isArray(p.deliveryData)) {
      // Single-account (legacy): flat {label: value} object
      const fields: CredField[] = Object.entries(p.deliveryData as Record<string, string>).map(([label, value]) => ({
        id: Math.random().toString(36).slice(2),
        label,
        value: String(value),
        sensitive: ["password","2fa","backup","secret","key","code","token"].some(k => label.toLowerCase().includes(k)),
      }));
      setCredFields(fields);
      setAccountPool([]);
      setCredMode("single");
    } else {
      setCredFields([]);
      setAccountPool([]);
      setCredMode("pool");
    }
    setExpandedAccountId(null);
    setProductModal("edit");
  };

  const handleProductSubmit = () => {
    let parsedDeliveryData: unknown = undefined;
    let stockOverride: number | undefined = undefined;
    if (credMode === "pool") {
      if (accountPool.length > 0) {
        // Serialize pool as array of {label: value} objects
        parsedDeliveryData = accountPool.map(acct => {
          const obj: Record<string, string> = {};
          acct.fields.forEach(f => { if (f.label.trim()) obj[f.label.trim()] = f.value; });
          return obj;
        });
        // Auto-sync stock to number of accounts in pool
        stockOverride = accountPool.length;
      }
    } else if (credMode === "single") {
      if (credFields.length > 0) {
        const obj: Record<string, string> = {};
        credFields.forEach(f => { if (f.label.trim()) obj[f.label.trim()] = f.value; });
        parsedDeliveryData = obj;
      }
    } else if (productForm.deliveryData.trim()) {
      try { parsedDeliveryData = JSON.parse(productForm.deliveryData); }
      catch { toast.error("Delivery Data must be valid JSON"); return; }
    }
    // Auto re-activate if pool was refilled while product is inactive
    const autoReactivate =
      credMode === "pool" &&
      accountPool.length > 0 &&
      productForm.status === "inactive" &&
      productModal === "edit";
    if (autoReactivate) {
      toast.success("Product automatically re-activated — pool has accounts again!");
    }
    const payload = {
      title: productForm.title,
      description: productForm.description || undefined,
      category: productForm.category,
      subcategoryId: productForm.subcategoryId ?? undefined,
      platform: productForm.platform || undefined,
      price: productForm.price,
      originalPrice: productForm.originalPrice || undefined,
      stock: stockOverride !== undefined ? stockOverride : (parseInt(productForm.stock) || 0),
      imageUrl: productForm.imageUrl || undefined,
      iconKey: productForm.iconKey || undefined,
      deliveryType: productForm.deliveryType,
      deliveryData: parsedDeliveryData,
      featured: productForm.featured,
      status: autoReactivate ? "active" : productForm.status,
    };
    if (productModal === "add") {
      createProductMutation.mutate(payload);
    } else if (productModal === "edit" && editingProduct) {
      updateProductMutation.mutate({ id: (editingProduct as any).id, ...payload });
    }
  };

  const approveProductMutation = trpc.admin.approveProduct.useMutation({
    onSuccess: () => { toast.success("Product approved"); utils.admin.getProducts.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const rejectProductMutation = trpc.admin.rejectProduct.useMutation({
    onSuccess: () => { toast.success("Product rejected"); utils.admin.getProducts.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const seedMutation = trpc.admin.seedDemo.useMutation({
    onSuccess: () => toast.success("Demo data seeded!"),
    onError: (err) => toast.error(err.message),
  });

  const createCatMutation = trpc.admin.createCategory.useMutation({
    onSuccess: () => { toast.success("Category created!"); refetchDbCategories(); setCatForm({ slug: "", label: "", icon: "Tag", description: "", color: "from-violet-500/20 to-purple-500/20", borderColor: "border-violet-500/20 hover:border-violet-500/40", iconColor: "text-violet-400", sortOrder: 0, parentId: null }); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateCatMutation = trpc.admin.updateCategory.useMutation({
    onSuccess: () => { toast.success("Category updated!"); refetchDbCategories(); setCatEditId(null); },
    onError: (err: any) => toast.error(err.message),
  });
  const toggleCatMutation = trpc.admin.toggleCategory.useMutation({
    onSuccess: () => { refetchDbCategories(); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteCatMutation = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => { toast.success("Category deleted!"); refetchDbCategories(); setCatDeleteId(null); },
    onError: (err: any) => toast.error(err.message),
  });
  const seedCatsMutation = trpc.admin.seedDefaultCategories.useMutation({
    onSuccess: (d) => { toast.success(`Seeded ${d.seeded} default categories!`); refetchDbCategories(); },
    onError: (err: any) => toast.error(err.message),
  });

  const broadcastMutation = trpc.admin.broadcastNotification.useMutation({
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.sentTo} users`);
      setNotifForm({ title: "", message: "", type: "info" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateCategoryMutation = trpc.admin.updateServiceCategory.useMutation({
    onSuccess: () => { refetchCategories(); },
    onError: (err: any) => toast.error(err.message),
  });

  const handleCategoryToggle = async (categoryId: string, enabled: boolean) => {
    setCategoryUpdating(categoryId);
    try {
      await updateCategoryMutation.mutateAsync({ categoryId, enabled });
      toast.success(`Category ${enabled ? 'enabled' : 'disabled'}`);
    } finally {
      setCategoryUpdating(null);
    }
  };


  const createCouponMutation = trpc.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Coupon created!");
      setCouponForm({ code: "", discountType: "percentage", discountValue: "", usageLimit: "100", expiresAt: "" });
      utils.coupons.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return null;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }
  if (user?.role !== "admin") {
    return (
      <DashboardShell title="Admin Panel">
        <div className="glass-card rounded-2xl p-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Admin Access Required</h3>
          <p className="text-sm text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardShell>
    );
  }

  const FRAUD_FLAGS = [
    { user: "user_4821", email: "test@tempmail.com", reason: "Multiple failed payment attempts", risk: "high", time: "5 min ago" },
    { user: "user_2934", email: "buyer@guerrillamail.com", reason: "Disposable email domain", risk: "medium", time: "1 hour ago" },
    { user: "user_7103", email: "bulk@protonmail.com", reason: "Bulk order pattern detected", risk: "medium", time: "3 hours ago" },
    { user: "user_5512", email: "reseller@mailinator.com", reason: "Account created < 1 min before purchase", risk: "high", time: "Yesterday" },
  ];
  const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: "overview", label: "Overview", icon: TrendingUp },
    { value: "users", label: "Users", icon: Users },
    { value: "products", label: "Products", icon: Package },
    { value: "orders", label: "Orders", icon: ShoppingCart },
    { value: "coupons", label: "Coupons", icon: Tag },
    { value: "vendors", label: "Vendor Approvals", icon: Shield },
    { value: "announcements", label: "Announcements", icon: Megaphone },
    { value: "fraud", label: "Fraud Detection", icon: AlertTriangle },
    { value: "refunds", label: "Refunds", icon: RotateCcw },
    { value: "payouts", label: "Payouts", icon: CreditCard },
    { value: "withdrawals", label: "Withdrawals", icon: Banknote },
    { value: "notifications", label: "Push Notifications", icon: Bell },
    { value: "services", label: "Service Controls", icon: Settings },
    { value: "ai_insights", label: "AI Insights", icon: Brain },
    { value: "categories", label: "Categories", icon: Tag },
    { value: "transactions", label: "Transactions", icon: DollarCircle },
    { value: "security_logs", label: "Security Logs", icon: ShieldAlert },
    { value: "alerts", label: "Site Alerts", icon: Bell },
  ];

  return (
    <DashboardShell title="Admin Panel" subtitle="Platform management and analytics.">
      {/* Mobile: horizontal scroll tabs */}
      <div className="lg:hidden scroll-x-hidden flex gap-2 mb-6 pb-1 -mx-4 px-4">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              tab === value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 h-9 ml-auto shrink-0"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          Seed Demo Data
        </Button>
      </div>
      {/* Desktop: sticky sidebar only */}
      <div className="hidden lg:flex gap-6 items-start">
        <aside className="sticky top-6 self-start w-[220px] xl:w-[240px] shrink-0">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Admin Panel</p>
            </div>
            {/* Nav items */}
            <div className="p-2 space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
              {TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative ${
                    tab === value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {tab === value && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
            {/* Sidebar footer */}
            <div className="px-2 pb-2 pt-1 border-t border-white/[0.06] space-y-1">
              <Button size="sm" variant="outline" className="w-full border-white/10 bg-white/5 h-8 text-xs" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                <RefreshCw className={`w-3 h-3 mr-1.5 ${seedMutation.isPending ? "animate-spin" : ""}`} />Seed Demo Data
              </Button>
              <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to site
              </a>
            </div>
          </div>
        </aside>
      </div>
      {/* Tab content — shared mobile + desktop, offset on desktop */}
      <div className="lg:pl-[236px] xl:pl-[256px] -mt-0">

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Total Users", value: stats?.users ?? 0, color: "text-violet-400", iconBg: "bg-violet-500/15", border: "border-violet-500/20", sub: "Registered accounts" },
              { icon: ShoppingCart, label: "Total Orders", value: stats?.orders ?? 0, color: "text-cyan-400", iconBg: "bg-cyan-500/15", border: "border-cyan-500/20", sub: "All time" },
              { icon: Package, label: "Products", value: stats?.products ?? 0, color: "text-emerald-400", iconBg: "bg-emerald-500/15", border: "border-emerald-500/20", sub: "Listed" },
              { icon: DollarSign, label: "Revenue", value: `$${stats?.revenue ?? "0.00"}`, color: "text-yellow-400", iconBg: "bg-yellow-500/15", border: "border-yellow-500/20", sub: "Total earned" },
            ].map(({ icon: Icon, label, value, color, iconBg, border, sub }) => (
              <div key={label} className={`glass-card rounded-2xl p-5 border ${border} hover:scale-[1.02] transition-transform cursor-default`}>
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Recent orders — desktop table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
              <button onClick={() => setTab("orders")} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(stats.recentOrders as any[]).map((order: any) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">#{order.id}</td>
                      <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">User #{order.userId}</td>
                      <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">${order.totalAmount}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          order.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                          order.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                          "bg-red-500/15 text-red-400"
                        }`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-foreground">User Management</h2>
            <span className="text-xs text-muted-foreground">{allUsers?.length ?? 0} users</span>
          </div>
          {!allUsers || allUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {u.name?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">{u.name ?? "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.role === "admin" ? "bg-violet-500/15 text-violet-400" :
                        "bg-white/10 text-muted-foreground"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                        className="h-7 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground px-2 focus:outline-none"
                      >
                        <option value="user" className="bg-background">User</option>
                        <option value="vendor" className="bg-background">Vendor</option>
                        <option value="admin" className="bg-background">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Products */}
      {tab === "products" && (
        <div className="space-y-4">
          {/* Header + Add button */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Product Management</h2>
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 border-0 gap-1.5"
              onClick={() => { resetProductForm(); setProductModal("add"); }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </Button>
          </div>

          {/* Filter + Sort bar */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            {/* Row 1: Search + Sort + Clear */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search by title or platform…"
                  className="pl-8 h-8 text-xs bg-white/5 border-white/10"
                />
              </div>
              <select
                value={productSort}
                onChange={e => setProductSort(e.target.value as typeof productSort)}
                className="h-8 text-xs bg-[#0f0f1a] border border-white/10 rounded-md px-2 text-foreground cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_high">Price: High → Low</option>
                <option value="price_low">Price: Low → High</option>
                <option value="stock_high">Stock: High → Low</option>
                <option value="stock_low">Stock: Low → High</option>
              </select>
              {(productSearch || productCategoryFilter !== "all" || productStatusFilter !== "all" || productSort !== "newest") && (
                <button
                  onClick={() => { setProductSearch(""); setProductCategoryFilter("all"); setProductStatusFilter("all"); setProductSort("newest"); }}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-white/10 rounded-md flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
            {/* Row 2: Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "social_media_accounts", "streaming_accounts", "gaming_accounts", "virtual_numbers", "growth_services"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    productCategoryFilter === cat
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </button>
              ))}
            </div>
            {/* Row 3: Status pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-muted-foreground">Status:</span>
              {(["all", "active", "inactive", "pending", "rejected"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setProductStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    productStatusFilter === st
                      ? st === "active" ? "bg-emerald-600 border-emerald-500 text-white"
                        : st === "pending" ? "bg-amber-600 border-amber-500 text-white"
                        : st === "rejected" ? "bg-red-600 border-red-500 text-white"
                        : st === "inactive" ? "bg-white/20 border-white/20 text-white"
                        : "bg-violet-600 border-violet-500 text-white"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered + sorted product list */}
          {(() => {
            const filtered = (allProducts ?? []).filter(p => {
              const matchSearch = !productSearch ||
                p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.platform ?? "").toLowerCase().includes(productSearch.toLowerCase());
              const matchCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
              const matchStatus = productStatusFilter === "all" || p.status === productStatusFilter;
              return matchSearch && matchCat && matchStatus;
            }).sort((a, b) => {
              if (productSort === "newest") return b.id - a.id;
              if (productSort === "oldest") return a.id - b.id;
              if (productSort === "price_high") return Number(b.price) - Number(a.price);
              if (productSort === "price_low") return Number(a.price) - Number(b.price);
              if (productSort === "stock_high") return (b.stock ?? 0) - (a.stock ?? 0);
              if (productSort === "stock_low") return (a.stock ?? 0) - (b.stock ?? 0);
              return 0;
            });
            return (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Select-all checkbox */}
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-violet-500 cursor-pointer"
                  checked={filtered.length > 0 && filtered.every(p => selectedProductIds.has(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(new Set(filtered.map(p => p.id)));
                    } else {
                      setSelectedProductIds(new Set());
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filtered.length}</span> of{" "}
                  <span className="text-foreground font-medium">{allProducts?.length ?? 0}</span> products
                  {selectedProductIds.size > 0 && (
                    <span className="ml-2 text-violet-400 font-medium">· {selectedProductIds.size} selected</span>
                  )}
                </p>
              </div>
              {/* Bulk action toolbar */}
              {selectedProductIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-500 border-0 gap-1"
                    onClick={() => setBulkEditModal(true)}>
                    <Edit2 className="w-3 h-3" /> Edit Selected
                  </Button>
                  <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-500 border-0 gap-1"
                    onClick={() => setBulkDeleteConfirm(true)}>
                    <Trash2 className="w-3 h-3" /> Delete Selected
                  </Button>
                  <button className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground border border-white/10 rounded-md transition-colors"
                    onClick={() => setSelectedProductIds(new Set())}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  {!allProducts || allProducts.length === 0 ? "No products yet." : "No products match your filters."}
                </p>
                {(!allProducts || allProducts.length === 0) && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { resetProductForm(); setProductModal("add"); }}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add your first product
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((p) => (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    selectedProductIds.has(p.id)
                      ? "bg-violet-600/10 border-violet-500/30"
                      : "bg-white/5 border-white/5 hover:bg-white/8"
                  }`}>
                    {/* Row checkbox */}
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-violet-500 cursor-pointer flex-shrink-0"
                      checked={selectedProductIds.has(p.id)}
                      onChange={(e) => {
                        setSelectedProductIds(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(p.id); else next.delete(p.id);
                          return next;
                        });
                      }}
                    />
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                        : (p as any).iconKey
                          ? <ServiceIcon name={(p as any).iconKey} size={22} />
                          : p.platform
                            ? <ServiceIcon name={p.platform} size={22} />
                            : <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                        {p.featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                        ${p.price}{p.originalPrice ? <span className="line-through ml-1 opacity-50">${p.originalPrice}</span> : null}
                        {" · "}
                        {Array.isArray(p.deliveryData) ? (
                          <>
                            <span className="inline-flex items-center gap-0.5 text-violet-400">
                              <Package className="w-2.5 h-2.5" />
                              {(p.deliveryData as unknown[]).length} accounts
                            </span>
                            {(p.deliveryData as unknown[]).length <= 3 && (p.deliveryData as unknown[]).length > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                              </span>
                            )}
                          </>
                        ) : (
                          <span>Stock: {p.stock}</span>
                        )}
                        {" · "}{p.category.replace(/_/g, " ")}
                        {p.platform && <><span>·</span><ServiceIcon name={p.platform} size={12} /><span>{p.platform}</span></>}
                      </div>
                    </div>
                    {/* Status + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === "active" ? "badge-success" :
                        p.status === "pending" ? "badge-warning" :
                        p.status === "inactive" ? "bg-white/10 text-muted-foreground" : "badge-error"
                      }`}>
                        {p.status}
                      </span>
                      {p.status === "pending" && (
                        <>
                          <Button size="sm" className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 border-0"
                            onClick={() => approveProductMutation.mutate({ id: p.id })}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" className="h-7 w-7 p-0 bg-red-600 hover:bg-red-500 border-0"
                            onClick={() => rejectProductMutation.mutate({ id: p.id })}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {/* Refill Pool quick button — only for pool products */}
                      {Array.isArray(p.deliveryData) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Refill account pool"
                          className="h-7 px-2 gap-1 text-[11px] hover:text-cyan-400 hover:bg-cyan-500/10"
                          onClick={() => {
                            openEditProduct(p);
                            // After modal opens, switch to pool mode and open bulk import
                            setTimeout(() => {
                              setCredMode("pool");
                              setBulkImportOpen(true);
                            }, 50);
                          }}
                        >
                          <Upload className="w-3 h-3" />
                          <span className="hidden sm:inline">Refill</span>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-violet-400"
                        onClick={() => openEditProduct(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-red-400"
                        onClick={() => setDeleteConfirmId(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            );
          })()}

          {/* Add / Edit Product Modal */}
          {productModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-foreground">
                    {productModal === "add" ? "Add New Product" : "Edit Product"}
                  </h3>
                  <button onClick={() => { setProductModal(null); setEditingProduct(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Title *</label>
                    <Input value={productForm.title} onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Instagram 10K Followers Account" className="bg-white/5 border-white/10 text-sm" />
                  </div>
                  {/* Category + Platform */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Category *</label>
                      <RadixSelect
                        value={productForm.category}
                        onValueChange={val => setProductForm(f => ({ ...f, category: val as typeof f.category, subcategoryId: null }))}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-sm h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {allDbCategories && allDbCategories.length > 0
                            ? allDbCategories.map(c => (
                                <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
                              ))
                            : (
                                <>
                                  <SelectItem value="social_media_accounts">Social Media Accounts</SelectItem>
                                  <SelectItem value="streaming_accounts">Streaming Accounts</SelectItem>
                                  <SelectItem value="gaming_accounts">Gaming Accounts</SelectItem>
                                  <SelectItem value="virtual_numbers">Virtual Numbers</SelectItem>
                                  <SelectItem value="growth_services">Growth Services</SelectItem>
                                  <SelectItem value="ai_tools">AI Tools</SelectItem>
                                  <SelectItem value="digital_subscriptions">Digital Subscriptions</SelectItem>
                                  <SelectItem value="gaming_currency">Gaming Currency</SelectItem>
                                  <SelectItem value="proxy_networking">Proxy &amp; Networking</SelectItem>
                                  <SelectItem value="verification_services">Verification Services</SelectItem>
                                </>
                              )
                          }
                        </SelectContent>
                      </RadixSelect>
                    </div>
                    <div className="relative">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Platform</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all">
                          <ServiceIcon name={productForm.platform} size={20} />
                        </div>
                        <Input
                          value={productForm.platform}
                          onChange={e => { setProductForm(f => ({ ...f, platform: e.target.value })); setShowPlatformSuggestions(true); }}
                          onFocus={() => setShowPlatformSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowPlatformSuggestions(false), 150)}
                          placeholder="e.g. Instagram, Netflix"
                          className="bg-white/5 border-white/10 text-sm flex-1"
                          autoComplete="off"
                        />
                      </div>
                      {showPlatformSuggestions && productForm.platform && (() => {
                        const q = productForm.platform.toLowerCase();
                        const matches = KNOWN_PLATFORMS.filter(p => p.toLowerCase().includes(q) && p.toLowerCase() !== q);
                        if (!matches.length) return null;
                        return (
                          <div className="absolute z-50 left-11 right-0 mt-1 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                            {matches.slice(0, 8).map(platform => (
                              <button
                                key={platform}
                                type="button"
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors text-left"
                                onMouseDown={() => { setProductForm(f => ({ ...f, platform })); setShowPlatformSuggestions(false); }}
                              >
                                <ServiceIcon name={platform} size={16} />
                                {platform}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                      {productForm.platform && !showPlatformSuggestions && (
                        <p className="text-[10px] text-white/30 mt-1 ml-11">Icon preview updates as you type</p>
                      )}
                    </div>
                  </div>
                  {/* Subcategory */}
                  {(() => {
                    const parentCat = allDbCategories?.find((c: any) => c.slug === productForm.category);
                    const subs = (parentCat as any)?.children ?? [];
                    if (!parentCat || subs.length === 0) return null;
                    return (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Subcategory <span className="opacity-60">(optional)</span></label>
                        <select
                          value={productForm.subcategoryId ?? ""}
                          onChange={e => setProductForm(f => ({ ...f, subcategoryId: e.target.value ? Number(e.target.value) : null }))}
                          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                          <option value="">— No subcategory —</option>
                          {subs.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                  {/* Price + Original Price + Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Price (USD) *</label>
                      <Input type="number" step="0.01" min="0" value={productForm.price}
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="9.99" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Original Price</label>
                      <Input type="number" step="0.01" min="0" value={productForm.originalPrice}
                        onChange={e => setProductForm(f => ({ ...f, originalPrice: e.target.value }))}
                        placeholder="14.99" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Stock *</label>
                      <Input type="number" min="0" value={productForm.stock}
                        onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                        placeholder="100" className="bg-white/5 border-white/10 text-sm" />
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                    <textarea value={productForm.description}
                      onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the product, what's included, warranty, etc."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  {/* Product Icon / Image */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground">Product Icon / Image</label>
                      <div className="flex rounded-lg overflow-hidden border border-white/10 text-[11px]">
                        <button type="button" onClick={() => setIconPickerTab("icon")}
                          className={`px-3 py-1 transition-colors ${iconPickerTab === "icon" ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                          Brand Icon
                        </button>
                        <button type="button" onClick={() => setIconPickerTab("url")}
                          className={`px-3 py-1 transition-colors ${iconPickerTab === "url" ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                          Image URL
                        </button>
                      </div>
                    </div>
                    {iconPickerTab === "url" ? (
                      <div className="flex items-center gap-2">
                        {productForm.imageUrl && (
                          <img src={productForm.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <Input value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))}
                          placeholder="https://..." className="bg-white/5 border-white/10 text-sm flex-1" />
                      </div>
                    ) : (
                      <div>
                        {/* Selected icon preview */}
                        <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <ServiceIcon name={productForm.iconKey || productForm.platform} size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/70 font-medium">{productForm.iconKey ? productForm.iconKey : (productForm.platform ? `Auto: ${productForm.platform}` : "No icon selected")}</p>
                            <p className="text-[10px] text-white/30">Click an icon below to assign it to this product</p>
                          </div>
                          {productForm.iconKey && (
                            <button type="button" onClick={() => setProductForm(f => ({ ...f, iconKey: "" }))}
                              className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Search */}
                        <div className="relative mb-2">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <Input value={iconPickerSearch} onChange={e => setIconPickerSearch(e.target.value)}
                            placeholder="Search icons..." className="bg-white/5 border-white/10 text-xs pl-8 h-8" />
                        </div>
                        {/* Icon grid */}
                        {(() => {
                          const ALL_ICON_KEYS = [
                            ["whatsapp","WhatsApp"],["telegram","Telegram"],["signal","Signal"],["discord","Discord"],["snapchat","Snapchat"],
                            ["instagram","Instagram"],["twitter","Twitter"],["tiktok","TikTok"],["facebook","Facebook"],["youtube","YouTube"],
                            ["linkedin","LinkedIn"],["pinterest","Pinterest"],["reddit","Reddit"],["threads","Threads"],["twitch","Twitch"],
                            ["netflix","Netflix"],["spotify","Spotify"],["hulu","Hulu"],["disneyplus","Disney+"],["prime","Prime"],
                            ["steam","Steam"],["epicgames","Epic Games"],["roblox","Roblox"],["minecraft","Minecraft"],["fortnite","Fortnite"],
                            ["valorant","Valorant"],["csgo","CS:GO"],["pubg","PUBG"],["playstation","PlayStation"],["xbox","Xbox"],
                            ["leagueoflegends","League"],["soundcloud","SoundCloud"],
                            ["chatgpt","ChatGPT"],["claude","Claude"],["openai","OpenAI"],["midjourney","Midjourney"],["perplexity","Perplexity"],
                            ["elevenlabs","ElevenLabs"],["runway","Runway"],["canva","Canva"],["grammarly","Grammarly"],["notion","Notion"],
                            ["adobe","Adobe"],["microsoft","Microsoft"],["capcut","CapCut"],["zoom","Zoom"],["slack","Slack"],
                            ["google","Google"],["gmail","Gmail"],["outlook","Outlook"],["apple","Apple"],
                            ["nordvpn","NordVPN"],["mullvad","Mullvad"],["gologin","GoLogin"],
                            ["paypal","PayPal"],["revolut","Revolut"],["binance","Binance"],["coinbase","Coinbase"],["bybit","Bybit"],
                            ["amazon","Amazon"],["ebay","eBay"],["aliexpress","AliExpress"],
                            ["uber","Uber"],["lyft","Lyft"],["airbnb","Airbnb"],["doordash","DoorDash"],
                            ["tinder","Tinder"],["bumble","Bumble"],["hinge","Hinge"],
                          ];
                          const q = iconPickerSearch.toLowerCase();
                          const filtered = q ? ALL_ICON_KEYS.filter(([k, label]) => k.includes(q) || label.toLowerCase().includes(q)) : ALL_ICON_KEYS;
                          return (
                            <div className="grid grid-cols-6 gap-1.5 max-h-52 overflow-y-auto pr-1">
                              {filtered.map(([key, label]) => (
                                <button
                                  key={key}
                                  type="button"
                                  title={label}
                                  onClick={() => { setProductForm(f => ({ ...f, iconKey: key })); setIconPickerSearch(""); }}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${productForm.iconKey === key ? "border-violet-500 bg-violet-500/20" : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"}`}
                                >
                                  <ServiceIcon name={key} size={20} />
                                  <span className="text-[9px] text-white/40 truncate w-full text-center leading-tight">{label}</span>
                                </button>
                              ))}
                              {filtered.length === 0 && (
                                <div className="col-span-6 text-center py-4 text-xs text-white/30">No icons match "{iconPickerSearch}"</div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  {/* Delivery Type + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Delivery Type</label>
                      <RadixSelect
                        value={productForm.deliveryType}
                        onValueChange={val => setProductForm(f => ({ ...f, deliveryType: val as "instant" | "manual" }))}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </RadixSelect>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                      <RadixSelect
                        value={productForm.status}
                        onValueChange={val => setProductForm(f => ({ ...f, status: val as typeof f.status }))}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </RadixSelect>
                    </div>
                  </div>
                  {/* Delivery Data — Account Pool / Single / Raw JSON */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground">Account Credentials / Delivery Data</label>
                      <div className="flex rounded-lg overflow-hidden border border-white/10 text-[11px]">
                        <button type="button" onClick={() => setCredMode("pool")}
                          className={`px-3 py-1 transition-colors ${credMode === "pool" ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                          Account Pool
                        </button>
                        <button type="button" onClick={() => setCredMode("single")}
                          className={`px-3 py-1 transition-colors ${credMode === "single" ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                          Single
                        </button>
                        <button type="button" onClick={() => setCredMode("json")}
                          className={`px-3 py-1 transition-colors ${credMode === "json" ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                          Raw JSON
                        </button>
                      </div>
                    </div>

                    {/* ── ACCOUNT POOL MODE ── */}
                    {credMode === "pool" && (
                      <div className="space-y-2">
                        {/* Pool summary */}
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-xs text-violet-300 font-medium">
                              {accountPool.length} account{accountPool.length !== 1 ? "s" : ""} in pool
                            </span>
                            {accountPool.length > 0 && (
                              <span className="text-[10px] text-violet-400/60">· stock auto-set to {accountPool.length}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setBulkImportOpen(true)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
                            >
                              <Upload className="w-3 h-3" /> Bulk Import
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newId = Math.random().toString(36).slice(2);
                                setAccountPool(prev => [...prev, {
                                  id: newId,
                                  fields: PRESET_FIELDS.slice(0, 2).map(p => ({ id: Math.random().toString(36).slice(2), label: p.label, value: "", sensitive: p.sensitive })),
                                }]);
                                setExpandedAccountId(newId);
                              }}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Account
                            </button>
                          </div>
                        </div>

                        {/* ── Bulk Import Panel ── */}
                        {bulkImportOpen && (
                          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 overflow-hidden">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-3 py-2.5 border-b border-cyan-500/20">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-xs font-medium text-cyan-300">Bulk Import Accounts</span>
                              </div>
                              <button type="button" onClick={() => { setBulkImportOpen(false); setBulkImportText(""); }}
                                className="text-white/30 hover:text-white/60 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-3 space-y-3">
                              {/* Delimiter + field names row */}
                              <div className="flex flex-wrap items-end gap-3">
                                <div>
                                  <p className="text-[10px] text-white/40 mb-1">Delimiter</p>
                                  <div className="flex rounded-lg overflow-hidden border border-white/10 text-[11px]">
                                    {([":", "|", ",", "\t"] as const).map(d => (
                                      <button key={d} type="button"
                                        onClick={() => setBulkImportDelimiter(d)}
                                        className={`px-3 py-1 transition-colors ${bulkImportDelimiter === d ? "bg-cyan-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                                        {d === "\t" ? "Tab" : d === ":" ? "Colon (:)" : d === "|" ? "Pipe (|)" : "Comma (,)"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-white/40 mb-1">Column names <span className="text-white/20">(comma-separated, e.g. Email,Password,2FA)</span></p>
                                  <input
                                    value={bulkImportFieldNames.join(",")}
                                    onChange={e => setBulkImportFieldNames(e.target.value.split(",").map(s => s.trim()))}
                                    placeholder="Email,Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                  />
                                </div>
                              </div>

                              {/* Paste area */}
                              <div>
                                <p className="text-[10px] text-white/40 mb-1">Paste accounts — one per line</p>
                                <textarea
                                  value={bulkImportText}
                                  onChange={e => setBulkImportText(e.target.value)}
                                  placeholder={`user1@example.com${bulkImportDelimiter === "\t" ? "\t" : bulkImportDelimiter}password1\nuser2@example.com${bulkImportDelimiter === "\t" ? "\t" : bulkImportDelimiter}password2`}
                                  rows={5}
                                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-foreground font-mono resize-none placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                              </div>

                              {/* Preview */}
                              {bulkImportPreview.length > 0 && (
                                <div className="rounded-lg border border-white/10 overflow-hidden">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10">
                                    <span className="text-[10px] text-white/40">Preview — {bulkImportPreview.length} account{bulkImportPreview.length !== 1 ? "s" : ""} detected</span>
                                  </div>
                                  <div className="max-h-40 overflow-y-auto divide-y divide-white/5">
                                    {bulkImportPreview.slice(0, 8).map((acct, i) => (
                                      <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                                        <span className="text-[10px] text-white/20 w-4 flex-shrink-0">{i + 1}</span>
                                        {acct.fields.map(f => (
                                          <span key={f.id} className="text-[10px] text-white/60 font-mono truncate">
                                            <span className="text-white/30">{f.label}: </span>
                                            {f.sensitive ? "••••••" : f.value || <span className="text-white/20">empty</span>}
                                          </span>
                                        ))}
                                      </div>
                                    ))}
                                    {bulkImportPreview.length > 8 && (
                                      <div className="px-3 py-1.5 text-[10px] text-white/20">…and {bulkImportPreview.length - 8} more</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center justify-end gap-2">
                                <button type="button"
                                  onClick={() => { setBulkImportOpen(false); setBulkImportText(""); }}
                                  className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                                  Cancel
                                </button>
                                <button type="button"
                                  disabled={bulkImportPreview.length === 0}
                                  onClick={() => {
                                    setAccountPool(prev => [...prev, ...bulkImportPreview]);
                                    toast.success(`${bulkImportPreview.length} account${bulkImportPreview.length !== 1 ? "s" : ""} added to pool`);
                                    setBulkImportOpen(false);
                                    setBulkImportText("");
                                  }}
                                  className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors">
                                  <Plus className="w-3 h-3" />
                                  Add {bulkImportPreview.length > 0 ? bulkImportPreview.length : ""} Account{bulkImportPreview.length !== 1 ? "s" : ""}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Account cards */}
                        {accountPool.length === 0 && !bulkImportOpen && (
                          <p className="text-[11px] text-white/20 text-center py-4 border border-dashed border-white/10 rounded-xl">
                            Click "Add Account" or "Bulk Import" to populate the pool
                          </p>
                        )}
                        {accountPool.map((acct, acctIdx) => {
                          const isOpen = expandedAccountId === acct.id;
                          return (
                            <div key={acct.id} className="rounded-xl border border-white/10 overflow-hidden">
                              {/* Account header */}
                              <div
                                className="flex items-center gap-2 px-3 py-2.5 bg-white/5 cursor-pointer hover:bg-white/8 transition-colors"
                                onClick={() => setExpandedAccountId(isOpen ? null : acct.id)}
                              >
                                <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center text-[10px] text-violet-300 font-bold flex-shrink-0">{acctIdx + 1}</div>
                                <span className="flex-1 text-xs text-foreground font-medium">
                                  Account #{acctIdx + 1}
                                  {acct.fields.find(f => f.label.toLowerCase().includes("email"))?.value && (
                                    <span className="text-white/30 ml-1.5 font-normal">
                                      — {acct.fields.find(f => f.label.toLowerCase().includes("email"))?.value}
                                    </span>
                                  )}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-white/30">{acct.fields.length} field{acct.fields.length !== 1 ? "s" : ""}</span>
                                  {/* Duplicate button */}
                                  <button
                                    type="button"
                                    title="Duplicate account"
                                    onClick={e => {
                                      e.stopPropagation();
                                      const newId = Math.random().toString(36).slice(2);
                                      setAccountPool(prev => [
                                        ...prev,
                                        { id: newId, fields: acct.fields.map(f => ({ ...f, id: Math.random().toString(36).slice(2), value: "" })) },
                                      ]);
                                      setExpandedAccountId(newId);
                                    }}
                                    className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  {/* Remove button */}
                                  <button
                                    type="button"
                                    title="Remove account"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setAccountPool(prev => prev.filter(a => a.id !== acct.id));
                                      if (expandedAccountId === acct.id) setExpandedAccountId(null);
                                    }}
                                    className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <ChevronRight className={`w-3.5 h-3.5 text-white/20 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                </div>
                              </div>

                              {/* Account fields (expanded) */}
                              {isOpen && (
                                <div className="p-3 space-y-2 bg-white/[0.02]">
                                  {/* Preset quick-add */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {PRESET_FIELDS.filter(p => !acct.fields.some(f => f.label === p.label)).map(preset => (
                                      <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => setAccountPool(prev => prev.map(a => a.id !== acct.id ? a : {
                                          ...a,
                                          fields: [...a.fields, { id: Math.random().toString(36).slice(2), label: preset.label, value: "", sensitive: preset.sensitive }],
                                        }))}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-300 transition-colors"
                                      >+ {preset.label}</button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => setAccountPool(prev => prev.map(a => a.id !== acct.id ? a : {
                                        ...a,
                                        fields: [...a.fields, { id: Math.random().toString(36).slice(2), label: "", value: "", sensitive: false }],
                                      }))}
                                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                                    >+ Custom</button>
                                  </div>
                                  {/* Field rows */}
                                  {acct.fields.map((field, fIdx) => (
                                    <div key={field.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/[0.06]">
                                      <div className="flex-shrink-0 w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[9px] text-white/20 font-mono">{fIdx + 1}</div>
                                      <input
                                        value={field.label}
                                        onChange={e => setAccountPool(prev => prev.map(a => a.id !== acct.id ? a : {
                                          ...a,
                                          fields: a.fields.map(f => f.id === field.id ? { ...f, label: e.target.value } : f),
                                        }))}
                                        placeholder="Field name"
                                        className="w-24 flex-shrink-0 bg-transparent border-b border-white/10 text-xs text-white/60 focus:outline-none focus:border-violet-500 pb-0.5 placeholder:text-white/15"
                                      />
                                      <input
                                        value={field.value}
                                        type={field.sensitive ? "password" : "text"}
                                        onChange={e => setAccountPool(prev => prev.map(a => a.id !== acct.id ? a : {
                                          ...a,
                                          fields: a.fields.map(f => f.id === field.id ? { ...f, value: e.target.value } : f),
                                        }))}
                                        placeholder="Value"
                                        className="flex-1 bg-transparent border-b border-white/10 text-xs text-white/90 font-mono focus:outline-none focus:border-violet-500 pb-0.5 placeholder:text-white/15"
                                      />
                                      <button
                                        type="button"
                                        title={field.sensitive ? "Sensitive" : "Not sensitive"}
                                        onClick={() => setAccountPool(prev => prev.map(a => a.id !== acct.id ? a : {
                                          ...a,
                                          fields: a.fields.map(f => f.id === field.id ? { ...f, sensitive: !f.sensitive } : f),
                                        }))}
                                        className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${field.sensitive ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-white/10 text-white/20 hover:border-white/30"}`}
                                      >{field.sensitive ? "🔒" : "👁"}</button>
                                      <button
                                        type="button"
                                        onClick={() => setAccountPool(prev => prev.map(a => a.id !== acct.id ? a : {
                                          ...a,
                                          fields: a.fields.filter(f => f.id !== field.id),
                                        }))}
                                        className="flex-shrink-0 text-white/20 hover:text-red-400 transition-colors"
                                      ><X className="w-3 h-3" /></button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {accountPool.length > 0 && (
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-white/20">
                              {accountPool.length} account{accountPool.length !== 1 ? "s" : ""} · each buyer gets 1 unique account · stock = {accountPool.length}
                            </p>
                            <button
                              type="button"
                              title="Export pool as CSV"
                              onClick={() => {
                                if (accountPool.length === 0) return;
                                // Collect all unique field labels across all accounts
                                const allLabels = Array.from(new Set(accountPool.flatMap(a => a.fields.map(f => f.label))));
                                const header = allLabels.join(",");
                                const rows = accountPool.map(acct => {
                                  const map: Record<string, string> = {};
                                  acct.fields.forEach(f => { map[f.label] = f.value; });
                                  return allLabels.map(l => `"${(map[l] ?? "").replace(/"/g, '""')}"`).join(",");
                                });
                                const csv = [header, ...rows].join("\n");
                                const blob = new Blob([csv], { type: "text/csv" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `account-pool-${Date.now()}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success(`Exported ${accountPool.length} accounts as CSV`);
                              }}
                              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                            >
                              <Download className="w-2.5 h-2.5" /> Export CSV
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── SINGLE ACCOUNT MODE (legacy) ── */}
                    {credMode === "single" && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {PRESET_FIELDS.filter(p => !credFields.some(f => f.label === p.label)).map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setCredFields(prev => [...prev, { id: Math.random().toString(36).slice(2), label: preset.label, value: "", sensitive: preset.sensitive }])}
                              className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-300 transition-colors"
                            >+ {preset.label}</button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCredFields(prev => [...prev, { id: Math.random().toString(36).slice(2), label: "", value: "", sensitive: false }])}
                            className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
                          >+ Custom</button>
                        </div>
                        {credFields.length === 0 && (
                          <p className="text-[11px] text-white/20 text-center py-3 border border-dashed border-white/10 rounded-xl">
                            Click a field type above to add account credentials
                          </p>
                        )}
                        {credFields.map((field, idx) => (
                          <div key={field.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-white/30 font-mono">{idx + 1}</div>
                            <input
                              value={field.label}
                              onChange={e => setCredFields(prev => prev.map(f => f.id === field.id ? { ...f, label: e.target.value } : f))}
                              placeholder="Field name"
                              className="w-28 flex-shrink-0 bg-transparent border-b border-white/10 text-xs text-white/70 focus:outline-none focus:border-violet-500 pb-0.5 placeholder:text-white/20"
                            />
                            <input
                              value={field.value}
                              type={field.sensitive ? "password" : "text"}
                              onChange={e => setCredFields(prev => prev.map(f => f.id === field.id ? { ...f, value: e.target.value } : f))}
                              placeholder="Value"
                              className="flex-1 bg-transparent border-b border-white/10 text-xs text-white/90 font-mono focus:outline-none focus:border-violet-500 pb-0.5 placeholder:text-white/20"
                            />
                            <button
                              type="button"
                              title={field.sensitive ? "Sensitive (masked)" : "Not sensitive"}
                              onClick={() => setCredFields(prev => prev.map(f => f.id === field.id ? { ...f, sensitive: !f.sensitive } : f))}
                              className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${field.sensitive ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-white/10 text-white/20 hover:border-white/30"}`}
                            >{field.sensitive ? "🔒" : "👁"}</button>
                            <button
                              type="button"
                              onClick={() => setCredFields(prev => prev.filter(f => f.id !== field.id))}
                              className="flex-shrink-0 text-white/20 hover:text-red-400 transition-colors"
                            ><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                        {credFields.length > 0 && (
                          <p className="text-[10px] text-white/20 text-right">
                            {credFields.length} field{credFields.length !== 1 ? "s" : ""} · same credentials delivered to every buyer
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── RAW JSON MODE ── */}
                    {credMode === "json" && (
                      <textarea value={productForm.deliveryData}
                        onChange={e => setProductForm(f => ({ ...f, deliveryData: e.target.value }))}
                        placeholder={'[{"Email":"user@example.com","Password":"pass123"},{"Email":"user2@example.com","Password":"pass456"}]'}
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-foreground font-mono resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500" />
                    )}
                  </div>
                  {/* ── Pool History Log (edit mode only, pool products) ── */}
                  {productModal === "edit" && editingProduct && Array.isArray((editingProduct as any).poolHistory) && (editingProduct as any).poolHistory.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Pool History</label>
                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        <div className="max-h-36 overflow-y-auto divide-y divide-white/5">
                          {[...(editingProduct as any).poolHistory].reverse().map((entry: any, i: number) => (
                            <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.action === "add" ? "bg-emerald-400" : entry.action === "consume" ? "bg-amber-400" : "bg-red-400"}`} />
                              <span className="flex-1 text-[11px] text-white/60">{entry.note ?? entry.action}</span>
                              <span className="text-[10px] text-white/20 flex-shrink-0">
                                {entry.at ? new Date(entry.at).toLocaleString() : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={productForm.featured}
                      onChange={e => setProductForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-violet-500" />
                    <span className="text-sm text-foreground">Featured product <span className="text-xs text-muted-foreground">(shown prominently on marketplace)</span></span>
                  </label>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
                  <Button variant="ghost" size="sm" onClick={() => { setProductModal(null); setEditingProduct(null); }}>
                    Cancel
                  </Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 border-0"
                    disabled={!productForm.title || !productForm.price || createProductMutation.isPending || updateProductMutation.isPending}
                    onClick={handleProductSubmit}>
                    {(createProductMutation.isPending || updateProductMutation.isPending)
                      ? "Saving…"
                      : productModal === "add" ? "Create Product" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Delete Product?</h3>
                <p className="text-xs text-muted-foreground mb-5">This action cannot be undone. The product will be permanently removed.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500 border-0"
                    disabled={deleteProductMutation.isPending}
                    onClick={() => deleteProductMutation.mutate({ id: deleteConfirmId })}>
                    {deleteProductMutation.isPending ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Edit Modal */}
          {bulkEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Bulk Edit Products</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected — only filled fields will be updated</p>
                  </div>
                  <button onClick={() => setBulkEditModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {/* Status */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Status <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <select value={bulkForm.status}
                      onChange={e => setBulkForm(f => ({ ...f, status: e.target.value as typeof f.status }))}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                      <option value="">-- No change --</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {/* Category */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Category <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <select value={bulkForm.category}
                      onChange={e => setBulkForm(f => ({ ...f, category: e.target.value as typeof f.category }))}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                      <option value="">-- No change --</option>
                      <option value="social_media_accounts">Social Media Accounts</option>
                      <option value="streaming_accounts">Streaming Accounts</option>
                      <option value="gaming_accounts">Gaming Accounts</option>
                      <option value="virtual_numbers">Virtual Numbers</option>
                      <option value="growth_services">Growth Services</option>
                    </select>
                  </div>
                  {/* Price Adjustment */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Price Adjustment <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <div className="flex gap-2">
                      <select value={bulkForm.priceAdjType}
                        onChange={e => setBulkForm(f => ({ ...f, priceAdjType: e.target.value as typeof f.priceAdjType }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                        <option value="">-- No change --</option>
                        <option value="set">Set to exact value</option>
                        <option value="increase_pct">Increase by %</option>
                        <option value="decrease_pct">Decrease by %</option>
                        <option value="increase_fixed">Increase by $</option>
                        <option value="decrease_fixed">Decrease by $</option>
                      </select>
                      {bulkForm.priceAdjType && (
                        <Input
                          type="number" step="0.01" min="0"
                          value={bulkForm.priceAdjValue}
                          onChange={e => setBulkForm(f => ({ ...f, priceAdjValue: e.target.value }))}
                          placeholder={bulkForm.priceAdjType.includes('pct') ? '10' : '2.00'}
                          className="w-28 bg-white/5 border-white/10 text-sm"
                        />
                      )}
                    </div>
                  </div>
                  {/* Stock */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Set Stock <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <Input
                      type="number" min="0"
                      value={bulkForm.stock}
                      onChange={e => setBulkForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="e.g. 100"
                      className="bg-white/5 border-white/10 text-sm"
                    />
                  </div>
                  {/* Featured */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Featured <span className="opacity-60">(leave blank to keep unchanged)</span></label>
                    <select value={bulkForm.featured}
                      onChange={e => setBulkForm(f => ({ ...f, featured: e.target.value as typeof f.featured }))}
                      className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground">
                      <option value="">-- No change --</option>
                      <option value="true">Featured (Yes)</option>
                      <option value="false">Not Featured (No)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
                  <Button variant="ghost" size="sm" onClick={() => setBulkEditModal(false)}>Cancel</Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 border-0"
                    disabled={bulkUpdateMutation.isPending}
                    onClick={handleBulkUpdate}>
                    {bulkUpdateMutation.isPending ? "Updating…" : `Update ${selectedProductIds.size} Product${selectedProductIds.size !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Delete Confirmation Modal */}
          {bulkDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Delete {selectedProductIds.size} Product{selectedProductIds.size !== 1 ? 's' : ''}?</h3>
                <p className="text-xs text-muted-foreground mb-5">This action cannot be undone. All selected products will be permanently removed.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500 border-0"
                    disabled={bulkDeleteMutation.isPending}
                    onClick={() => bulkDeleteMutation.mutate({ ids: Array.from(selectedProductIds) })}>
                    {bulkDeleteMutation.isPending ? "Deleting…" : `Delete ${selectedProductIds.size} Product${selectedProductIds.size !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-foreground">All Orders</h2>
            <span className="text-xs text-muted-foreground">{allOrders?.length ?? 0} orders · auto-refreshes every 30s</span>
          </div>
          {!allOrders || allOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Order ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
              {allOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {(order as any).productPlatform && (
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <ServiceIcon name={(order as any).productPlatform} size={14} />
                        </div>
                      )}
                      <span className="font-medium text-foreground truncate max-w-[160px]">
                        {(order as any).productTitle ?? `Order #${order.id}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">#{order.id}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">User #{order.userId}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden xl:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">${order.totalAmount}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                      order.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                      "bg-red-500/15 text-red-400"
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <SendPushButton orderId={order.id} />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Coupons */}
      {tab === "coupons" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Create Coupon
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Code *</label>
                <Input
                  placeholder="SAVE20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm((f) => ({ ...f, discountType: e.target.value as any }))}
                  className="w-full h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none"
                >
                  <option value="percentage" className="bg-background">Percentage (%)</option>
                  <option value="fixed" className="bg-background">Fixed ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Discount Value *</label>
                <Input
                  type="number"
                  placeholder={couponForm.discountType === "percentage" ? "20" : "5.00"}
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm((f) => ({ ...f, discountValue: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Usage Limit</label>
                <Input
                  type="number"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Expires At</label>
                <Input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9"
                  onClick={() => createCouponMutation.mutate({
                    code: couponForm.code,
                    discountType: couponForm.discountType,
                    discountValue: couponForm.discountValue,
                    usageLimit: parseInt(couponForm.usageLimit),
                    expiresAt: couponForm.expiresAt || undefined,
                  })}
                  disabled={createCouponMutation.isPending || !couponForm.code || !couponForm.discountValue}
                >
                  Create Coupon
                </Button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Active Coupons</h2>
            {!coupons || coupons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No coupons yet</p>
            ) : (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-mono font-bold text-primary">{c.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                        {" · "}{c.usedCount}/{c.usageLimit} used
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "badge-success" : "badge-warning"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Announcements */}
      {tab === "announcements" && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-violet-400" />Create Announcement</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <Input value={announcementForm.title} onChange={(e) => setAnnouncementForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" className="h-9 bg-white/5 border-white/10 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm(f => ({ ...f, message: e.target.value }))} placeholder="Announcement message..." rows={3} className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <select value={announcementForm.type} onChange={(e) => setAnnouncementForm(f => ({ ...f, type: e.target.value as any }))} className="h-9 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground px-3 focus:outline-none">
                  <option value="info" className="bg-background">Info</option>
                  <option value="warning" className="bg-background">Warning</option>
                  <option value="success" className="bg-background">Success</option>
                </select>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 h-9" onClick={() => {
                  if (!announcementForm.title || !announcementForm.message) return toast.error("Fill in all fields");
                  setAnnouncements(prev => [{ id: Date.now(), ...announcementForm, time: "Just now", active: true }, ...prev]);
                  setAnnouncementForm({ title: "", message: "", type: "info" });
                  toast.success("Announcement published!");
                }}><Plus className="w-3.5 h-3.5 mr-1.5" />Publish</Button>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Active Announcements</h2>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className={`flex items-start justify-between p-4 rounded-xl border ${ a.type === "warning" ? "bg-yellow-500/5 border-yellow-500/20" : a.type === "success" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/20" }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                  </div>
                  <button onClick={() => { setAnnouncements(prev => prev.filter(x => x.id !== a.id)); toast.success("Removed"); }} className="ml-3 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fraud Detection */}
      {tab === "fraud" && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" />Fraud Flags</h2>
            <span className="text-xs badge-warning px-2 py-0.5 rounded-full">{FRAUD_FLAGS.length} flagged</span>
          </div>
          <div className="space-y-3">
            {FRAUD_FLAGS.map(({ user: u, email, reason, risk, time }) => (
              <div key={u} className={`flex items-start justify-between p-4 rounded-xl border ${ risk === "high" ? "bg-red-500/5 border-red-500/20" : "bg-yellow-500/5 border-yellow-500/20" }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ risk === "high" ? "bg-red-500/20" : "bg-yellow-500/20" }`}>
                    <AlertTriangle className={`w-4 h-4 ${ risk === "high" ? "text-red-400" : "text-yellow-400" }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{u}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${ risk === "high" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400" }`}>{risk}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <p className="text-xs text-muted-foreground">{time}</p>
                  <button onClick={() => toast.success(`${u} flagged for review`)} className="text-xs px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors">Block</button>
                  <button onClick={() => toast.success(`${u} cleared`)} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-foreground font-medium transition-colors">Clear</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Vendor Approvals */}
      {tab === "vendors" && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            Vendor Applications
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Promote users to vendor status so they can list products on the marketplace.</p>
        </div>
      )}
      {/* Refunds */}
      {tab === "refunds" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-400" /> Refund Requests
          </h2>
          {!allRefunds || allRefunds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No refund requests</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Refund</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Reason</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">User / Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(allRefunds as any[]).map((r: any) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">#{r.id}</p>
                        <p className="text-xs text-muted-foreground font-semibold">${r.amount}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground hidden md:table-cell max-w-[200px]">
                        <p className="truncate">{r.reason?.slice(0, 60) ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                        <p>User #{r.userId}</p>
                        <p className="text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          r.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                          r.status === "rejected" ? "bg-red-500/15 text-red-400" :
                          "bg-yellow-500/15 text-yellow-400"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {r.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                              onClick={() => updateRefundMutation.mutate({ id: r.id, status: "approved" })}
                              disabled={updateRefundMutation.isPending}>
                              <CheckCircle className="w-3 h-3 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => updateRefundMutation.mutate({ id: r.id, status: "rejected" })}
                              disabled={updateRefundMutation.isPending}>
                              <XCircle className="w-3 h-3 mr-1" />Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>
      )}

      {/* Payouts */}
      {tab === "payouts" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Vendor Payout Requests
            </h2>
            <span className="text-xs text-muted-foreground">{allPayouts?.length ?? 0} requests</span>
          </div>
          {!allPayouts || allPayouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payout requests</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payout</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Method / Destination</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Vendor / Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(allPayouts as any[]).map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">#{p.id}</p>
                      <p className="text-xs font-semibold text-foreground">${p.amount}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                      <p className="capitalize">{p.method}</p>
                      <p className="text-xs truncate max-w-[160px]">{p.destination}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                      <p>Vendor #{p.vendorId}</p>
                      <p className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.status === "paid" ? "bg-emerald-500/15 text-emerald-400" :
                        p.status === "rejected" ? "bg-red-500/15 text-red-400" :
                        p.status === "processing" ? "bg-violet-500/15 text-violet-400" :
                        "bg-yellow-500/15 text-yellow-400"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {p.status === "pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white border-0"
                            onClick={() => updatePayoutMutation.mutate({ id: p.id, status: "processing" })}
                            disabled={updatePayoutMutation.isPending}>
                            <Activity className="w-3 h-3 mr-1" />Process
                          </Button>
                          <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            onClick={() => updatePayoutMutation.mutate({ id: p.id, status: "paid" })}
                            disabled={updatePayoutMutation.isPending}>
                            <CheckCircle className="w-3 h-3 mr-1" />Paid
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => updatePayoutMutation.mutate({ id: p.id, status: "rejected" })}
                            disabled={updatePayoutMutation.isPending}>
                            <XCircle className="w-3 h-3 mr-1" />Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Withdrawals Tab ──────────────────────────────────────────────── */}
      {tab === "withdrawals" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Withdrawal Requests</h3>
                  <p className="text-xs text-muted-foreground">Manage user bank transfer withdrawals</p>
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-2">
                {/* Status filter */}
                <RadixSelect value={withdrawalStatusFilter} onValueChange={(v) => setWithdrawalStatusFilter(v as typeof withdrawalStatusFilter)}>
                  <SelectTrigger className="w-36 h-8 text-xs glass border-border">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="reversed">Reversed</SelectItem>
                  </SelectContent>
                </RadixSelect>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => refetchWithdrawals()}>
                  <RefreshCw className="w-3 h-3 mr-1" />Refresh
                </Button>
              </div>
            </div>

            {!allWithdrawals || allWithdrawals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowDownToLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No withdrawals found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Bank Account</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Reference</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(allWithdrawals as any[]).map((w: any) => {
                      const statusColors: Record<string, string> = {
                        pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                        processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                        success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                        failed: "bg-red-500/20 text-red-400 border-red-500/30",
                        reversed: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                      };
                      return (
                        <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{w.userName ?? `User #${w.userId}`}</div>
                            <div className="text-xs text-muted-foreground">{w.userEmail ?? ""}</div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="text-foreground">{w.bankName ?? "—"}</div>
                            <div className="text-xs text-muted-foreground font-mono">{w.accountNumber ?? ""}</div>
                            <div className="text-xs text-muted-foreground">{w.accountName ?? ""}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-semibold text-foreground">${parseFloat(w.amountUsd).toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">₦{parseFloat(w.amountNaira).toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">{w.transferReference}</div>
                            {w.transferCode && <div className="font-mono text-xs text-cyan-400 truncate max-w-[140px]">{w.transferCode}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[w.status] ?? "bg-muted text-muted-foreground"}`}>
                              {w.status}
                            </span>
                            {w.failureReason && <div className="text-xs text-red-400 mt-1 max-w-[120px] truncate" title={w.failureReason}>{w.failureReason}</div>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                            {new Date(w.createdAt).toLocaleDateString()}<br/>
                            <span className="text-muted-foreground/60">{new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {(w.status === "pending" || w.status === "failed") && (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                  onClick={() => approveWithdrawalMutation.mutate({ id: w.id })}
                                  disabled={approveWithdrawalMutation.isPending}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  onClick={() => { setRejectModalId(w.id); setRejectReason(""); }}
                                  disabled={rejectWithdrawalMutation.isPending}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />Reject
                                </Button>
                              </div>
                            )}
                            {w.status === "processing" && (
                              <span className="text-xs text-blue-400 flex items-center gap-1 justify-end">
                                <Activity className="w-3 h-3" />Processing
                              </span>
                            )}
                            {w.status === "success" && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                                <CheckCircle className="w-3 h-3" />Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reject Withdrawal Modal */}
          {rejectModalId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-red-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-foreground">Reject Withdrawal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  The user's wallet balance will be refunded automatically. Please provide a reason for the rejection.
                </p>
                <textarea
                  className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  rows={3}
                  placeholder="Reason for rejection (e.g. invalid bank details, suspicious activity)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                    onClick={() => rejectWithdrawalMutation.mutate({ id: rejectModalId, reason: rejectReason })}
                    disabled={!rejectReason.trim() || rejectWithdrawalMutation.isPending}
                  >
                    {rejectWithdrawalMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setRejectModalId(null); setRejectReason(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue & Analytics Charts in Overview */}
      {tab === "overview" && (
        <div className="space-y-4 mt-6">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-foreground">Analytics</span>
            <div className="ml-auto flex gap-1">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    chartDays === d ? "bg-violet-600 text-white" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Revenue + Growth Orders combined chart */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Revenue (Marketplace + Growth Services)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenueChart ?? []}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="adminGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor((revenueChart?.length ?? 7) / 7)} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }}
                  formatter={(v: any, name: string) => [`$${Number(v).toFixed(2)}`, name === "revenue" ? "Marketplace" : "Growth"]}
                />
                <Legend formatter={(v) => v === "revenue" ? "Marketplace" : "Growth Services"} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#adminRevGrad)" />
                <Area type="monotone" dataKey="growth" stroke="#06b6d4" strokeWidth={2} fill="url(#adminGrowthGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Orders + User growth side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Daily Orders</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenueChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor((revenueChart?.length ?? 7) / 7)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">New Users</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={userGrowthChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor((userGrowthChart?.length ?? 7) / 7)} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      {/* ── Push Notifications Tab ────────────────────────────────────────── */}
      {tab === "notifications" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Broadcast Notification</h3>
                <p className="text-xs text-muted-foreground">Send a push notification to all registered users</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notification Type</label>
                <div className="flex gap-2">
                  {(["info", "success", "warning"] as const).map(t => (
                    <button key={t} onClick={() => setNotifForm(f => ({ ...f, type: t }))}
                      className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                        notifForm.type === t
                          ? t === "info" ? "bg-blue-600 text-white" : t === "success" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                          : "glass text-muted-foreground hover:text-foreground"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                <Input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. New Feature Available" className="bg-white/5 border-white/10" maxLength={100} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
                <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your notification message here..." rows={4} maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                <p className="text-xs text-muted-foreground mt-1">{notifForm.message.length}/500</p>
              </div>
              <Button
                onClick={() => { if (!notifForm.title || !notifForm.message) { toast.error("Title and message required"); return; } broadcastMutation.mutate(notifForm); }}
                disabled={broadcastMutation.isPending}
                className="bg-violet-600 hover:bg-violet-500 gap-2">
                <Send className="w-4 h-4" />
                {broadcastMutation.isPending ? "Sending..." : "Send to All Users"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Service Category Controls Tab ─────────────────────────────────── */}
      {tab === "services" && (
        <div className="space-y-4">
          {/* Growth Services Markup */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Growth Services Profit Markup</h3>
                <p className="text-xs text-muted-foreground">Set a global markup % applied on top of API costs. Users see marked-up prices; your profit = markup amount.</p>
              </div>
            </div>
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Markup Percentage (%)</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={1}
                  value={markupInput}
                  onChange={e => setMarkupInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground mt-1">Current saved: <span className="text-violet-400 font-semibold">{(typeof currentMarkup === 'object' ? currentMarkup?.value : currentMarkup) ?? 30}%</span>{typeof currentMarkup === 'object' && currentMarkup?.updatedAt ? <span className="ml-2 text-white/40">· Last updated: {new Date(currentMarkup.updatedAt).toLocaleString()}</span> : null} — preview below updates live as you type</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setMarkupMutation.mutate({ markup: parseFloat(markupInput) || 30 })}
                  disabled={setMarkupMutation.isPending}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-violet-500 text-white hover:bg-violet-600 transition-all disabled:opacity-50"
                >
                  {setMarkupMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Markup
                </button>
                <button
                  onClick={() => { setMarkupInput("30"); setMarkupMutation.mutate({ markup: 30 }); }}
                  disabled={setMarkupMutation.isPending || markupInput === "30"}
                  title="Reset to global default (30%)"
                  className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all disabled:opacity-40"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to 30%
                </button>
              </div>
            </div>

            {/* Live Profit Preview Calculator */}
            {(() => {
              const pct = parseFloat(markupInput) || 0;
              const mult = 1 + pct / 100;
              const examples = [0.10, 0.50, 1.00, 2.50, 5.00, 10.00];
              return (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Profit Preview — at {pct}% markup</p>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">API Cost / 1K</th>
                          <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">User Pays / 1K</th>
                          <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Your Profit / 1K</th>
                          <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examples.map((cost, i) => {
                          const userPrice = cost * mult;
                          const profit = userPrice - cost;
                          return (
                            <tr key={cost} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                              <td className="px-4 py-2.5 text-white/70">${cost.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-right text-white font-medium">${userPrice.toFixed(4)}</td>
                              <td className="px-4 py-2.5 text-right text-emerald-400 font-semibold">+${profit.toFixed(4)}</td>
                              <td className="px-4 py-2.5 text-right text-violet-400">{pct.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Example: 1,000 orders of a $1.00/1K service → you collect <span className="text-white font-medium">${(1.00 * mult * 1000 / 1000).toFixed(2)}</span>, pay API <span className="text-white font-medium">$1.00</span>, keep <span className="text-emerald-400 font-semibold">${((1.00 * mult - 1.00) * 1000 / 1000).toFixed(2)} profit</span> per 1K delivered.</p>
                </div>
              );
            })()}
          </div>

          {/* Virtual Number Markup */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Virtual Numbers Profit Markup</h3>
                <p className="text-xs text-muted-foreground">Set a global markup % applied on top of 5sim API costs. Users see marked-up prices; your profit = markup amount.</p>
              </div>
            </div>
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Markup Percentage (%)</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={1}
                  value={vnMarkupInput}
                  onChange={e => setVnMarkupInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground mt-1">Current saved: <span className="text-cyan-400 font-semibold">{(typeof currentVnMarkup === 'object' ? currentVnMarkup?.value : currentVnMarkup) ?? 30}%</span>{typeof currentVnMarkup === 'object' && currentVnMarkup?.updatedAt ? <span className="ml-2 text-white/40">· Last updated: {new Date(currentVnMarkup.updatedAt).toLocaleString()}</span> : null} — preview below updates live as you type</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setVnMarkupMutation.mutate({ markup: parseFloat(vnMarkupInput) || 30 })}
                  disabled={setVnMarkupMutation.isPending}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-all disabled:opacity-50"
                >
                  {setVnMarkupMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Markup
                </button>
                <button
                  onClick={() => { setVnMarkupInput("30"); setVnMarkupMutation.mutate({ markup: 30 }); }}
                  disabled={setVnMarkupMutation.isPending || vnMarkupInput === "30"}
                  title="Reset to global default (30%)"
                  className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-all disabled:opacity-40"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to 30%
                </button>
              </div>
            </div>
            {/* Live Profit Preview */}
            {(() => {
              const pct = parseFloat(vnMarkupInput) || 0;
              const mult = 1 + pct / 100;
              const examples = [0.05, 0.10, 0.20, 0.50, 1.00, 2.00];
              return (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Profit Preview — at {pct}% markup</p>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">API Cost / Number</th>
                          <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">User Pays</th>
                          <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Your Profit</th>
                          <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examples.map((cost, i) => {
                          const userPrice = cost * mult;
                          const profit = userPrice - cost;
                          return (
                            <tr key={cost} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                              <td className="px-4 py-2.5 text-white/70">${cost.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-right text-white font-medium">${userPrice.toFixed(4)}</td>
                              <td className="px-4 py-2.5 text-right text-emerald-400 font-semibold">+${profit.toFixed(4)}</td>
                              <td className="px-4 py-2.5 text-right text-cyan-400">{pct.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Example: 100 number purchases at $0.20/number → you collect <span className="text-white font-medium">${(0.20 * mult * 100).toFixed(2)}</span>, pay 5sim <span className="text-white font-medium">$20.00</span>, keep <span className="text-emerald-400 font-semibold">${((0.20 * mult - 0.20) * 100).toFixed(2)} profit</span>.</p>
                </div>
              );
            })()}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Service Category Controls</h3>
                <p className="text-xs text-muted-foreground">Enable or disable entire service categories on the platform</p>
              </div>
            </div>
            <div className="space-y-3">
              {(serviceCategories ?? []).map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Zap className={`w-4 h-4 ${cat.enabled ? "text-emerald-400" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{cat.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCategoryToggle(cat.id, !cat.enabled)}
                    disabled={categoryUpdating === cat.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {cat.enabled ? (
                      <><ToggleRight className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400">Enabled</span></>
                    ) : (
                      <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground">Disabled</span></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Categories Tab ─────────────────────────────────────────────────── */}
      {tab === "categories" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Product Categories</h3>
              <p className="text-sm text-muted-foreground">Create and manage marketplace categories. Changes apply instantly to the Marketplace.</p>
            </div>
            <button
              onClick={() => seedCatsMutation.mutate()}
              disabled={seedCatsMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-all disabled:opacity-50"
            >
              {seedCatsMutation.isPending ? <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
              Seed Defaults
            </button>
          </div>

          {/* Create New Category Form */}
          <div className="glass-card rounded-2xl p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Add New Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Slug <span className="text-red-400">*</span></label>
                <Input
                  placeholder="e.g. software_licenses"
                  value={catForm.slug}
                  onChange={e => setCatForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                  className="glass border-white/10"
                />
                <p className="text-xs text-muted-foreground mt-1">Lowercase, underscores only</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Label <span className="text-red-400">*</span></label>
                <Input
                  placeholder="e.g. Software Licenses"
                  value={catForm.label}
                  onChange={e => setCatForm(f => ({ ...f, label: e.target.value }))}
                  className="glass border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                <IconPicker
                  value={catForm.icon}
                  onChange={icon => setCatForm(f => ({ ...f, icon }))}
                  iconColor={catForm.iconColor}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  placeholder="Short description (optional)"
                  value={catForm.description}
                  onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                  className="glass border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={catForm.sortOrder}
                  onChange={e => setCatForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="glass border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Icon Color Class</label>
                <Input
                  placeholder="e.g. text-violet-400"
                  value={catForm.iconColor}
                  onChange={e => setCatForm(f => ({ ...f, iconColor: e.target.value }))}
                  className="glass border-white/10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Parent Category <span className="text-muted-foreground text-xs">(optional — leave empty for top-level)</span></label>
                <select
                  value={catForm.parentId ?? ""}
                  onChange={e => setCatForm(f => ({ ...f, parentId: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full h-9 px-3 rounded-md text-sm glass border border-white/10 bg-background text-foreground"
                >
                  <option value="">— Top-level category —</option>
                  {dbCategories?.filter((c: any) => !c.parentId).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  if (!catForm.slug || !catForm.label) { toast.error("Slug and Label are required"); return; }
                  createCatMutation.mutate(catForm);
                }}
                disabled={createCatMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
              >
                {createCatMutation.isPending ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Category
              </button>
            </div>
          </div>

          {/* Category List */}
          <div className="glass-card rounded-2xl p-6">
            <h4 className="font-semibold text-foreground mb-4">{dbCategories?.length ?? 0} Categories</h4>
            {!dbCategories || dbCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No categories yet. Click "Seed Defaults" to add the 10 built-in categories, or create one above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbCategories.map((cat: any) => (
                  <div key={cat.id} className="space-y-2">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    {catEditId === cat.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          value={catEditForm.label}
                          onChange={e => setCatEditForm(f => ({ ...f, label: e.target.value }))}
                          placeholder="Label"
                          className="glass border-white/10 text-sm"
                        />
                        <div>
                          <IconPicker
                            value={catEditForm.icon}
                            onChange={icon => setCatEditForm(f => ({ ...f, icon }))}
                            iconColor="text-violet-400"
                          />
                        </div>
                        <Input
                          value={catEditForm.description}
                          onChange={e => setCatEditForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Description"
                          className="glass border-white/10 text-sm"
                        />
                        <Input
                          type="number"
                          value={catEditForm.sortOrder}
                          onChange={e => setCatEditForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                          placeholder="Sort Order"
                          className="glass border-white/10 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          {(() => { const Icon = ICON_MAP[cat.icon] ?? ICON_MAP["Tag"]; return <Icon className={`w-4 h-4 ${cat.iconColor}`} />; })()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{cat.label}</p>
                          <p className="text-xs text-muted-foreground">{cat.slug}{cat.description ? ` · ${cat.description}` : ""} · Order: {cat.sortOrder}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      {catEditId === cat.id ? (
                        <>
                          <button
                            onClick={() => updateCatMutation.mutate({ id: cat.id, ...catEditForm })}
                            disabled={updateCatMutation.isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                          >
                            {updateCatMutation.isPending ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setCatEditId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setCatEditId(cat.id); setCatEditForm({ label: cat.label, icon: cat.icon, description: cat.description ?? "", sortOrder: cat.sortOrder, parentId: (cat as any).parentId ?? null }); }}
                          className="p-1.5 rounded-lg bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleCatMutation.mutate({ id: cat.id, enabled: !cat.enabled })}
                        disabled={toggleCatMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                      >
                        {cat.enabled ? (
                          <><ToggleRight className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">On</span></>
                        ) : (
                          <><ToggleLeft className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Off</span></>
                        )}
                      </button>
                      <button
                        onClick={() => setCatDeleteId(cat.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Subcategories */}
                  {(cat as any).children && (cat as any).children.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {(cat as any).children.map((sub: any) => (
                        <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                            {(() => { const Icon = ICON_MAP[sub.icon] ?? ICON_MAP["Tag"]; return <Icon className={`w-3 h-3 ${sub.iconColor}`} />; })()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{sub.label}</p>
                            <p className="text-xs text-muted-foreground">{sub.slug}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleCatMutation.mutate({ id: sub.id, enabled: !sub.enabled })} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all">
                              {sub.enabled ? <><ToggleRight className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">On</span></> : <><ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">Off</span></>}
                            </button>
                            <button onClick={() => setCatDeleteId(sub.id)} className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirm */}
          {catDeleteId !== null && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-card rounded-2xl p-6 max-w-sm w-full">
                <h3 className="font-semibold text-foreground mb-2">Delete Category?</h3>
                <p className="text-sm text-muted-foreground mb-6">This will permanently remove the category. Products using this category will retain their category slug but it will no longer appear in the Marketplace filters.</p>
                <div className="flex gap-3">
                  <button onClick={() => setCatDeleteId(null)} className="flex-1 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                  <button
                    onClick={() => deleteCatMutation.mutate({ id: catDeleteId! })}
                    disabled={deleteCatMutation.isPending}
                    className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    {deleteCatMutation.isPending ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Insights Tab ───────────────────────────────────────────────── */}
      {tab === "ai_insights" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Analytics Summary</h3>
                <p className="text-xs text-muted-foreground">AI-powered insights based on your platform data</p>
              </div>
            </div>
            {aiInsightsLoading ? (
              <div className="flex items-center gap-3 py-8">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Analyzing platform data...</span>
              </div>
            ) : aiInsights ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-foreground leading-relaxed">{aiInsights.summary}</p>
                </div>
                {aiInsights.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Total Revenue", value: `$${aiInsights.stats.revenue}` },
                      { label: "Total Users", value: aiInsights.stats.users },
                      { label: "New Users (7d)", value: aiInsights.stats.newUsers7d },
                      { label: "Total Orders", value: aiInsights.stats.orders },
                      { label: "Orders (7d)", value: aiInsights.stats.newOrders7d },
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available.</p>
            )}
          </div>
        </div>
      )}
      {/* ── Transactions Tab ─────────────────────────────────────────────── */}
      {tab === "transactions" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Controls */}
          <div className="p-5 border-b border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by email or reference…"
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                />
              </div>
              {/* Type filter */}
              <select
                value={txType}
                onChange={e => { setTxType(e.target.value as typeof txType); setTxPage(1); }}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-violet-500/50 transition-all"
              >
                {(["all", "deposit", "withdrawal", "purchase", "refund", "referral_reward", "admin_credit"] as const).map(t => (
                  <option key={t} value={t} className="bg-background">{t === "all" ? "All Types" : t === "admin_credit" ? "Admin Credit" : t === "referral_reward" ? "Referral Reward" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              {/* Status filter */}
              <select
                value={txStatus}
                onChange={e => { setTxStatus(e.target.value as typeof txStatus); setTxPage(1); }}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-violet-500/50 transition-all"
              >
                {(["all", "completed", "pending", "failed"] as const).map(s => (
                  <option key={s} value={s} className="bg-background">{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {/* Export */}
              <Button variant="outline" size="sm" onClick={handleTxExportCSV} className="border-white/10 hover:bg-white/5 gap-1.5 shrink-0">
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {adminTxData ? `${adminTxData.total.toLocaleString()} transaction${adminTxData.total !== 1 ? "s" : ""} found` : "Loading…"}
            </p>
          </div>

          {/* Table */}
          {adminTxLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading transactions…</div>
          ) : !adminTxData || adminTxData.rows.length === 0 ? (
            <div className="p-10 text-center">
              <DollarCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No transactions match your filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">User</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium">Description</th>
                      <th className="text-left px-4 py-3 font-medium">Reference</th>
                      <th className="text-left px-4 py-3 font-medium">Method</th>
                      <th className="text-right px-4 py-3 font-medium">Amount</th>
                      <th className="text-right px-4 py-3 font-medium">Balance After</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {adminTxData.rows.map(tx => {
                      const cfg = txTypeConfig[tx.type] ?? txTypeConfig.deposit;
                      const Icon = cfg.icon;
                      const isCredit = cfg.sign === "+";
                      const isPaystack = !!tx.paymentReference;
                      const channelIcon = tx.paymentChannel === "card" ? <CreditCard className="w-3 h-3" /> : tx.paymentChannel === "bank" ? <Landmark className="w-3 h-3" /> : tx.paymentChannel === "mobile_money" ? <Smartphone className="w-3 h-3" /> : null;
                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()}<br />
                            <span className="opacity-70">{new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{tx.userEmail ?? `UID ${tx.userId}`}</p>
                            {tx.userName && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{tx.userName}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize ${isCredit ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>
                              <Icon className="w-2.5 h-2.5" />{cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{tx.description ?? "—"}</td>
                          <td className="px-4 py-3">
                            {tx.referenceId ? (
                              <div className="flex items-center gap-1.5">
                                <code className="text-[10px] text-violet-300 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded truncate max-w-[110px]">{tx.referenceId}</code>
                                <button onClick={() => { navigator.clipboard.writeText(tx.referenceId!); toast.success("Copied!"); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white transition-all">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {isPaystack ? (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00C3F7]/10 text-[#00C3F7] border border-[#00C3F7]/20 font-medium">
                                  <Zap className="w-2.5 h-2.5" /> Paystack
                                </span>
                                {channelIcon && <span className="text-xs text-muted-foreground flex items-center gap-0.5 capitalize">{channelIcon}{tx.paymentChannel}</span>}
                              </div>
                            ) : <span className="text-xs text-muted-foreground capitalize">{tx.type === "purchase" ? "Wallet" : tx.type === "referral_reward" ? "Referral" : tx.type === "admin_credit" ? "Admin" : "—"}</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold text-sm ${isCredit ? "text-emerald-400" : "text-red-400"}`}>{cfg.sign}${parseFloat(tx.amount).toFixed(2)}</span>
                            {isPaystack && tx.paymentAmountNaira && <p className="text-[10px] text-muted-foreground">₦{parseFloat(tx.paymentAmountNaira).toLocaleString()}</p>}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">${parseFloat(tx.balanceAfter).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            {tx.status === "completed" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium"><CheckCircle className="w-2.5 h-2.5" /> Done</span>
                            ) : tx.status === "pending" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-medium">Pending</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">Failed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-white/[0.04]">
                {adminTxData.rows.map(tx => {
                  const cfg = txTypeConfig[tx.type] ?? txTypeConfig.deposit;
                  const Icon = cfg.icon;
                  const isCredit = cfg.sign === "+";
                  const isPaystack = !!tx.paymentReference;
                  return (
                    <div key={tx.id} className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCredit ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                            <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{tx.userEmail ?? `UID ${tx.userId}`}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>{cfg.sign}${parseFloat(tx.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border capitalize ${isCredit ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>{cfg.label}</span>
                        {isPaystack && <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#00C3F7]/10 text-[#00C3F7] border border-[#00C3F7]/20 font-medium"><Zap className="w-2 h-2" /> Paystack</span>}
                        {tx.status === "completed" ? <span className="text-[10px] text-emerald-400">✓ Done</span> : tx.status === "pending" ? <span className="text-[10px] text-yellow-400">⏳ Pending</span> : <span className="text-[10px] text-red-400">✗ Failed</span>}
                        {tx.referenceId && <code className="text-[10px] text-violet-300 font-mono bg-violet-500/10 px-1.5 py-0.5 rounded">{tx.referenceId.slice(0, 16)}…</code>}
                      </div>
                      {tx.description && <p className="text-xs text-muted-foreground">{tx.description}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {adminTxData.total > TX_PAGE_SIZE && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5">
                  <p className="text-xs text-muted-foreground">
                    Showing {((txPage - 1) * TX_PAGE_SIZE) + 1}–{Math.min(txPage * TX_PAGE_SIZE, adminTxData.total)} of {adminTxData.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1} className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    {Array.from({ length: Math.min(5, Math.ceil(adminTxData.total / TX_PAGE_SIZE)) }, (_, i) => {
                      const totalPages = Math.ceil(adminTxData.total / TX_PAGE_SIZE);
                      let p = i + 1;
                      if (totalPages > 5) {
                        if (txPage <= 3) p = i + 1;
                        else if (txPage >= totalPages - 2) p = totalPages - 4 + i;
                        else p = txPage - 2 + i;
                      }
                      return (
                        <button key={p} onClick={() => setTxPage(p)} className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${txPage === p ? "bg-violet-500/30 text-violet-300 border border-violet-500/40" : "text-muted-foreground hover:bg-white/5"}`}>{p}</button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setTxPage(p => Math.min(Math.ceil(adminTxData.total / TX_PAGE_SIZE), p + 1))} disabled={txPage >= Math.ceil(adminTxData.total / TX_PAGE_SIZE)} className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {tab === "security_logs" && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={secSearchInput}
                onChange={e => setSecSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setSecSearch(secSearchInput); setSecPage(1); } }}
                placeholder="Search by user email or IP…"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <select
              value={secAction}
              onChange={e => { setSecAction(e.target.value); setSecPage(1); }}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-violet-500/50"
            >
              <option value="all">All Actions</option>
              <option value="login_success">Login Success</option>
              <option value="login_failed">Login Failed</option>
              <option value="login_locked">Account Locked</option>
              <option value="email_verified">Email Verified</option>
              <option value="suspicious_deposit">Suspicious Deposit</option>
              <option value="admin_action">Admin Action</option>
              <option value="2fa_enabled">2FA Enabled</option>
              <option value="2fa_disabled">2FA Disabled</option>
            </select>
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-xs" onClick={() => { setSecSearch(secSearchInput); setSecPage(1); }}>
              <Search className="w-3.5 h-3.5 mr-1" /> Search
            </Button>
          </div>
          {secLogsLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading security logs…</div>
          ) : !secLogsData?.rows?.length ? (
            <div className="p-10 text-center">
              <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No security events match your filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                      <th className="text-left px-4 py-3 font-medium">User</th>
                      <th className="text-left px-4 py-3 font-medium">Action</th>
                      <th className="text-left px-4 py-3 font-medium">IP Address</th>
                      <th className="text-left px-4 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {secLogsData.rows.map((log: { id: number; userId: number | null; action: string; ipAddress: string | null; metadata: string | null; createdAt: Date }) => {
                      const isSuspicious = log.action === "suspicious_deposit" || log.action === "login_locked";
                      const isSuccess = log.action === "login_success" || log.action === "email_verified";
                      const isFailed = log.action === "login_failed";
                      let meta: Record<string, unknown> = {};
                      try { meta = log.metadata ? JSON.parse(log.metadata) : {}; } catch {}
                      return (
                        <tr key={log.id} className={`hover:bg-white/[0.02] transition-colors ${isSuspicious ? "bg-red-500/5" : ""}`}>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {log.userId ? (
                              <span className="text-xs font-mono text-violet-300">uid:{log.userId}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isSuspicious ? "bg-red-500/20 text-red-300" :
                              isSuccess ? "bg-emerald-500/20 text-emerald-300" :
                              isFailed ? "bg-amber-500/20 text-amber-300" :
                              "bg-white/10 text-muted-foreground"
                            }`}>
                              {isSuspicious && <AlertTriangle className="w-3 h-3" />}
                              {isSuccess && <CheckCircle className="w-3 h-3" />}
                              {isFailed && <XCircle className="w-3 h-3" />}
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              {log.ipAddress ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                            {Object.keys(meta).length > 0 ? (
                              <span className="font-mono text-xs">{JSON.stringify(meta).slice(0, 80)}{JSON.stringify(meta).length > 80 ? "…" : ""}</span>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {secLogsData.total > SEC_PAGE_SIZE && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <span className="text-xs text-muted-foreground">{secLogsData.total} events</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setSecPage(p => Math.max(1, p - 1))} disabled={secPage === 1} className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    {Array.from({ length: Math.min(5, Math.ceil(secLogsData.total / SEC_PAGE_SIZE)) }, (_, i) => {
                      const totalPages = Math.ceil(secLogsData.total / SEC_PAGE_SIZE);
                      let p = i + 1;
                      if (totalPages > 5) {
                        if (secPage <= 3) p = i + 1;
                        else if (secPage >= totalPages - 2) p = totalPages - 4 + i;
                        else p = secPage - 2 + i;
                      }
                      return (
                        <button key={p} onClick={() => setSecPage(p)} className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${secPage === p ? "bg-violet-500/30 text-violet-300 border border-violet-500/40" : "text-muted-foreground hover:bg-white/5"}`}>{p}</button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setSecPage(p => Math.min(Math.ceil(secLogsData.total / SEC_PAGE_SIZE), p + 1))} disabled={secPage >= Math.ceil(secLogsData.total / SEC_PAGE_SIZE)} className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {tab === "alerts" && (
        <div className="space-y-6">
          {errorState && (
            <div className="glass rounded-2xl p-4 border border-white/5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" /> 5sim API Error Tracker
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Auth Errors (1h)</p>
                  <p className={`text-xl font-bold mt-1 ${errorState.consecutiveAuthErrors >= 5 ? "text-red-400" : "text-foreground"}`}>{errorState.consecutiveAuthErrors}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Avail Errors (1h)</p>
                  <p className={`text-xl font-bold mt-1 ${errorState.consecutiveAvailabilityErrors >= 10 ? "text-amber-400" : "text-foreground"}`}>{errorState.consecutiveAvailabilityErrors}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">API Status</p>
                  <p className={`text-sm font-semibold mt-1 ${errorState.consecutiveAuthErrors >= 5 ? "text-red-400" : errorState.consecutiveAvailabilityErrors >= 10 ? "text-amber-400" : "text-emerald-400"}`}>
                    {errorState.consecutiveAuthErrors >= 5 ? "Auth Failure" : errorState.consecutiveAvailabilityErrors >= 10 ? "Low Availability" : "Healthy"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Auto-Alert</p>
                  <p className="text-sm font-semibold mt-1 text-foreground">{errorState.consecutiveAuthErrors >= 5 || errorState.consecutiveAvailabilityErrors >= 10 ? "Triggered" : "Not triggered"}</p>
                </div>
              </div>
            </div>
          )}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-foreground">Site Alerts</h3>
              <Button size="sm" onClick={() => setShowAlertForm(!showAlertForm)} className="bg-violet-600 hover:bg-violet-500 text-white h-8 gap-1.5">
                <Plus className="w-3.5 h-3.5" /> New Alert
              </Button>
            </div>
            {showAlertForm && (
              <div className="p-4 border-b border-white/5 bg-white/2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <select value={alertForm.type} onChange={e => setAlertForm(f => ({ ...f, type: e.target.value as any }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-violet-500/50">
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Severity</label>
                    <select value={alertForm.severity} onChange={e => setAlertForm(f => ({ ...f, severity: e.target.value as any }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-violet-500/50">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                  <input value={alertForm.title} onChange={e => setAlertForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Virtual Numbers Temporarily Unavailable" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                  <textarea value={alertForm.message} onChange={e => setAlertForm(f => ({ ...f, message: e.target.value }))} rows={2} placeholder="Describe the issue and expected resolution time" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Affected Service (optional)</label>
                  <input value={alertForm.affectedService} onChange={e => setAlertForm(f => ({ ...f, affectedService: e.target.value }))} placeholder="e.g. virtual_numbers, growth_services" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => createAlertMutation.mutate({ ...alertForm, affectedService: alertForm.affectedService || undefined })} disabled={!alertForm.title || !alertForm.message || createAlertMutation.isPending} className="bg-violet-600 hover:bg-violet-500 text-white h-8">
                    {createAlertMutation.isPending ? "Publishing..." : "Publish Alert"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAlertForm(false)} className="h-8 border-white/10 hover:bg-white/5">Cancel</Button>
                </div>
              </div>
            )}
            {allAlertsLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading alerts...</div>
            ) : !allAlertsData?.rows?.length ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No alerts yet. Create one above or wait for auto-triggered alerts from the 5sim error tracker.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5">
                  {allAlertsData.rows.map((alert: any) => (
                    <div key={alert.id} className={`flex items-start gap-3 p-4 ${!alert.isActive ? "opacity-50" : ""}`}>
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.type === "error" ? "bg-red-400" : alert.type === "warning" ? "bg-amber-400" : alert.type === "success" ? "bg-emerald-400" : "bg-blue-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{alert.title}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${alert.type === "error" ? "bg-red-500/20 text-red-300" : alert.type === "warning" ? "bg-amber-500/20 text-amber-300" : alert.type === "success" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"}`}>{alert.type}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground">{alert.severity}</span>
                          {alert.autoTriggered && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">auto</span>}
                          {!alert.isActive && <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">dismissed</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                        {alert.affectedService && <p className="text-xs text-muted-foreground/60 mt-0.5">Service: {alert.affectedService}</p>}
                        <p className="text-xs text-muted-foreground/50 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {alert.isActive ? (
                          <Button size="sm" variant="outline" onClick={() => dismissAlertMutation.mutate({ id: alert.id })} disabled={dismissAlertMutation.isPending} className="h-7 px-2 text-xs border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30">
                            Dismiss
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => updateAlertMutation.mutate({ id: alert.id, isActive: true })} disabled={updateAlertMutation.isPending} className="h-7 px-2 text-xs border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30">
                            Re-activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {allAlertsData.total > ALERT_PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                    <span className="text-xs text-muted-foreground">{allAlertsData.total} alerts total</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setAlertPage(p => Math.max(1, p - 1))} disabled={alertPage === 1} className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setAlertPage(p => Math.min(Math.ceil(allAlertsData.total / ALERT_PAGE_SIZE), p + 1))} disabled={alertPage >= Math.ceil(allAlertsData.total / ALERT_PAGE_SIZE)} className="h-7 w-7 p-0 border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </div>{/* end content offset */}
    </DashboardShell>
  );
}


function SendPushButton({ orderId }: { orderId: number }) {
  const sendPush = trpc.admin.sendOrderPush.useMutation({
    onSuccess: () => toast.success(`Push notification sent for order #${orderId}`),
    onError: (err) => toast.error(err.message ?? "Failed to send push"),
  });
  return (
    <button
      onClick={() => sendPush.mutate({ orderId })}
      disabled={sendPush.isPending}
      title="Send push notification to buyer"
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors disabled:opacity-50"
    >
      {sendPush.isPending ? (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )}
      Push
    </button>
  );
}
