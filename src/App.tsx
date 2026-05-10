import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import SellerRegister from './pages/auth/SellerRegister';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/inventory/Products';
import Invoices from './pages/sales/Invoices';
import AuditLogs from './pages/admin/AuditLogs';
import Services from './pages/inventory/Services';
import Inventory from './pages/inventory/Inventory';
import Accounts from './pages/finance/Accounts';
import Users from './pages/hrm/Users';
import StorefrontProfile from './pages/storefront/StorefrontProfile';
import Storefront from './pages/storefront/Storefront';
import POS from './pages/sales/POS';
import Customers from './pages/crm/Customers';
import Warehouses from './pages/inventory/Warehouses';
import SellersDirectory from './pages/hrm/SellersDirectory';
import SellerProfile from './pages/hrm/SellerProfile';
import Reports from './pages/finance/Reports';
import Vendors from './pages/inventory/Vendors';
import HR from './pages/hrm/HR';
import Expenses from './pages/finance/Expenses';
import Quotations from './pages/sales/Quotations';
import Manufacturing from './pages/production/Manufacturing';
import Returns from './pages/sales/Returns';
import PurchaseOrders from './pages/inventory/PurchaseOrders';
import Marketing from './pages/marketing/Marketing';
import Offers from './pages/marketing/Offers';
import Support from './pages/crm/Support';
import Tasks from './pages/hrm/Tasks';
import Delivery from './pages/inventory/Delivery';
import Settings from './pages/settings/Settings';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/seller-register" element={<SellerRegister />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="services" element={<Services />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="users" element={<Users />} />
              <Route path="customers" element={<Customers />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="hr" element={<HR />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="quotations" element={<Quotations />} />
              <Route path="returns" element={<Returns />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="offers" element={<Offers />} />
              <Route path="delivery" element={<Delivery />} />
              <Route path="support" element={<Support />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="manufacturing" element={<Manufacturing />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="sellers" element={<SellersDirectory />} />
              <Route path="sellers/:id" element={<SellerProfile />} />
              <Route path="storefront-config" element={<StorefrontProfile />} />
              <Route path="storefront" element={<Storefront />} />
              <Route path="pos" element={<POS />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </SettingsProvider>
    </AuthProvider>
  );
}
