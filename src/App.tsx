import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import AuditLogs from './pages/AuditLogs';
import Services from './pages/Services';
import Inventory from './pages/Inventory';
import Accounts from './pages/Accounts';
import Users from './pages/Users';
import StorefrontProfile from './pages/StorefrontProfile';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Warehouses from './pages/Warehouses';
import SellersDirectory from './pages/SellersDirectory';
import SellerProfile from './pages/SellerProfile';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="services" element={<Services />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="users" element={<Users />} />
              <Route path="customers" element={<Customers />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="sellers" element={<SellersDirectory />} />
              <Route path="sellers/:id" element={<SellerProfile />} />
              <Route path="storefront" element={<StorefrontProfile />} />
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
