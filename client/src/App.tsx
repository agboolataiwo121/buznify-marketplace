import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import GrowthServices from "./pages/GrowthServices";
import VirtualNumbers from "./pages/VirtualNumbers";
import Dashboard from "./pages/Dashboard";
import DashboardWallet from "./pages/DashboardWallet";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardReferrals from "./pages/DashboardReferrals";
import DashboardNotifications from "./pages/DashboardNotifications";
import DashboardSmsInbox from "./pages/DashboardSmsInbox";
import VendorDashboard from "./pages/VendorDashboard";
import AdminPanel from "./pages/AdminPanel";
import Support from "./pages/Support";
import TicketDetail from "./pages/TicketDetail";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Security from "./pages/Security";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/product/:id" component={ProductDetail} />
      <Route path="/growth" component={GrowthServices} />
      <Route path="/virtual-numbers" component={VirtualNumbers} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/wallet" component={DashboardWallet} />
      <Route path="/dashboard/orders" component={DashboardOrders} />
      <Route path="/dashboard/referrals" component={DashboardReferrals} />
      <Route path="/dashboard/notifications" component={DashboardNotifications} />
      <Route path="/dashboard/sms-inbox" component={DashboardSmsInbox} />
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/support" component={Support} />
      <Route path="/support/:id" component={TicketDetail} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/refund" component={RefundPolicy} />
      <Route path="/security" component={Security} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
