import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import React, { Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

// Lazy Loaded Pages
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const AdminLogin = React.lazy(() => import("./pages/auth/AdminLogin"));
const SellerRegister = React.lazy(() => import("./pages/auth/SellerRegister"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const Products = React.lazy(() => import("./pages/inventory/Products"));
const Invoices = React.lazy(() => import("./pages/sales/Invoices"));
const AuditLogs = React.lazy(() => import("./pages/admin/AuditLogs"));
const Services = React.lazy(() => import("./pages/inventory/Services"));
const Inventory = React.lazy(() => import("./pages/inventory/Inventory"));
const Accounts = React.lazy(() => import("./pages/finance/Accounts"));
const Users = React.lazy(() => import("./pages/hrm/Users"));
const StorefrontProfile = React.lazy(() => import("./pages/storefront/StorefrontProfile"));
const Storefront = React.lazy(() => import("./pages/storefront/Storefront"));
const POS = React.lazy(() => import("./pages/sales/POS"));
const Customers = React.lazy(() => import("./pages/crm/Customers"));
const Warehouses = React.lazy(() => import("./pages/inventory/Warehouses"));
const SellersDirectory = React.lazy(() => import("./pages/hrm/SellersDirectory"));
const SellerProfile = React.lazy(() => import("./pages/hrm/SellerProfile"));
const Reports = React.lazy(() => import("./pages/finance/Reports"));
const Vendors = React.lazy(() => import("./pages/inventory/Vendors"));
const HR = React.lazy(() => import("./pages/hrm/HR"));
const Expenses = React.lazy(() => import("./pages/finance/Expenses"));
const Quotations = React.lazy(() => import("./pages/sales/Quotations"));
const Manufacturing = React.lazy(() => import("./pages/production/Manufacturing"));
const Returns = React.lazy(() => import("./pages/sales/Returns"));
const PurchaseOrders = React.lazy(() => import("./pages/inventory/PurchaseOrders"));
const Marketing = React.lazy(() => import("./pages/marketing/Marketing"));
const Offers = React.lazy(() => import("./pages/marketing/Offers"));
const Support = React.lazy(() => import("./pages/crm/Support"));
const Tasks = React.lazy(() => import("./pages/hrm/Tasks"));
const Delivery = React.lazy(() => import("./pages/inventory/Delivery"));
const Settings = React.lazy(() => import("./pages/settings/Settings"));
const AnalyticsDashboard = React.lazy(() => import("./pages/analytics/AnalyticsDashboard"));

import { HelmetProvider } from "react-helmet-async";

import { ErrorBoundary } from "./components/ErrorBoundary";
const NotFound = React.lazy(() => import("./pages/NotFound"));

function LoadingSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading module...</p>
      </div>
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    const handleOnline = () => {
      toast.dismiss('offline-toast');
      toast.success("Back online! Network connection restored.");
    };
    const handleOffline = () => toast.error("You are offline. Some features may not be available.", { duration: Infinity, id: 'offline-toast' });
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSkeleton />}>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Storefront />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seller-register" element={<SellerRegister />} />

              {/* Protected Dashboard Routes wrapped in Layout */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/services" element={<Services />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/users" element={<Users />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/support" element={<Support />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/manufacturing" element={<Manufacturing />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/sellers" element={<SellersDirectory />} />
                <Route path="/sellers/:id" element={<SellerProfile />} />
                <Route
                  path="/storefront-config"
                  element={<StorefrontProfile />}
                />
                <Route path="/storefront" element={<Storefront />} />
                <Route path="/pos" element={<POS />} />
              </Route>

                <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </SettingsProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}
