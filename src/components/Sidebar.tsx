import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Package, Users, FileText, Settings, LogOut, ArrowLeftRight, Archive, Shield, X, Store, ShoppingCart, Globe, Coins, BarChart3, Truck, Briefcase, RotateCcw, Megaphone, Truck as TruckDelivery, MessageSquare, ListTodo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { pathname } = useLocation();
  const { logout, user, setRole } = useAuth();
  const { t } = useTranslation();
  const { currency, setCurrency, availableCurrencies, language, setLanguage } = useSettings();

  let navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
  ];

  if (user?.role === 'customer') {
    navItems.push({ name: 'Shop Online', path: '/storefront', icon: ShoppingCart });
    navItems.push({ name: 'Products', path: '/storefront?tab=products', icon: Package });
    navItems.push({ name: 'Services', path: '/storefront?tab=services', icon: Settings });
    navItems.push({ name: t('sellers_directory'), path: '/sellers', icon: Store });
    navItems.push({ name: 'My Invoices', path: '/invoices', icon: FileText });
    navItems.push({ name: 'Support', path: '/support', icon: MessageSquare });
    navItems.push({ name: 'Settings', path: '/settings', icon: Settings });
  } else {
    // product_seller, service_seller, reseller, super_admin, admin
    const isSuperOrAdmin = ['super_admin', 'admin'].includes(user?.role || '');
    const isSellerOrReseller = ['product_seller', 'service_seller', 'reseller'].includes(user?.role || '');
    
    // Helper to check if feature is allowed for seller, or if user is admin
    const canAccess = (feature: string) => {
      if (isSuperOrAdmin) return true;
      if (isSellerOrReseller) return user?.allowedFeatures?.includes(feature);
      return false;
    };

    if (canAccess('products') || canAccess('inventory')) {
      if (canAccess('products')) navItems.push({ name: t('products'), path: '/products', icon: Package });
      if (canAccess('inventory')) navItems.push({ name: t('inventory'), path: '/inventory', icon: Archive });
    }
    if (canAccess('services')) {
      navItems.push({ name: t('services'), path: '/services', icon: Settings });
    }
    if (canAccess('pos')) navItems.push({ name: t('pos'), path: '/pos', icon: ShoppingCart });
    if (canAccess('customers')) navItems.push({ name: t('customers'), path: '/customers', icon: Users });
    if (canAccess('vendors')) navItems.push({ name: 'Vendors', path: '/vendors', icon: Truck });
    if (canAccess('tasks')) navItems.push({ name: 'Tasks', path: '/tasks', icon: ListTodo });
    if (canAccess('support')) navItems.push({ name: 'Support', path: '/support', icon: MessageSquare });
    if (canAccess('purchase_orders')) navItems.push({ name: 'Purchase Orders', path: '/purchase-orders', icon: FileText });
    if (canAccess('invoices')) navItems.push({ name: t('invoices'), path: '/invoices', icon: FileText });
    if (canAccess('delivery')) navItems.push({ name: 'Delivery', path: '/delivery', icon: TruckDelivery });
    if (canAccess('quotations')) navItems.push({ name: 'Quotations', path: '/quotations', icon: FileText });
    if (canAccess('returns')) navItems.push({ name: 'Returns', path: '/returns', icon: RotateCcw });
    if (canAccess('reports')) navItems.push({ name: 'Reports', path: '/reports', icon: BarChart3 });
    if (canAccess('accounts')) navItems.push({ name: t('accounts'), path: '/accounts', icon: ArrowLeftRight });
    
    if (canAccess('warehouses')) navItems.push({ name: t('warehouses'), path: '/warehouses', icon: Archive });
    if (canAccess('manufacturing')) navItems.push({ name: 'Manufacturing', path: '/manufacturing', icon: Package });
    if (canAccess('expenses')) navItems.push({ name: 'Expenses', path: '/expenses', icon: Coins });
    if (canAccess('hr')) navItems.push({ name: 'HR & Payroll', path: '/hr', icon: Briefcase });

    if (canAccess('marketing')) navItems.push({ name: 'Marketing', path: '/marketing', icon: Megaphone });
    if (canAccess('offers')) navItems.push({ name: 'Offers/Promos', path: '/offers', icon: FileText });

    // Storefront configuration is generally for all sellers + admins
    if (isSuperOrAdmin || isSellerOrReseller) {
      navItems.push({ name: t('profile_store'), path: '/storefront-config', icon: Store });
    }
    
    if (isSuperOrAdmin) {
      navItems.push({ name: t('users'), path: '/users', icon: Shield });
      navItems.push({ name: t('audit_logs'), path: '/audit-logs', icon: Shield });
    }
    
    // Always add settings to all users at the end
    navItems.push({ name: 'Settings', path: '/settings', icon: Settings });
  }

  return (
    <aside className={`w-64 bg-[#0B1120] h-screen flex flex-col text-slate-300 fixed top-0 left-0 border-r border-[#1e293b] z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-slate-800/60 flex justify-between items-start bg-[#0e1526]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-indigo-500/20 shadow-inner">
              <span className="font-display">DB</span>
            </div>
            <span className="text-white font-display font-bold tracking-tight text-xl leading-none">DEALBUZZ</span>
          </div>
          <div className="text-[9px] text-fuchsia-400 mt-2 uppercase tracking-[0.2em] font-bold">Enterprise ERP v2.4</div>
        </div>
        <button className="md:hidden text-slate-400 hover:text-white mt-1" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] text-slate-500 font-bold px-3 mb-3 uppercase tracking-wider mt-2">Core Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const searchParamsExtracted = item.path.split('?')[1] || '';
          const pathOnly = item.path.split('?')[0];
          
          let isActive = pathname === pathOnly;
          if (isActive && searchParamsExtracted) {
            // Need to check if current window.location.search includes the params provided in the item.path
            isActive = window.location.search.includes(searchParamsExtracted);
          } else if (isActive && !searchParamsExtracted && window.location.search.includes('tab=')) {
            // If it's the base /storefront but there is a tab specified, don't mark base shop online as active (or do, up to preference. we will disable it here so only the specific tab is highlighted)
            isActive = false;
          }

          return (
             <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'text-white bg-indigo-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />}
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-fuchsia-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-slate-800/80 flex flex-col gap-3 bg-[#0B1120]">
        {user?.role === 'super_admin' && (
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-indigo-400 uppercase font-bold mb-2 tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Dev Tools
            </div>
            <select 
              value={user?.role || 'admin'} 
              onChange={(e) => {
                if (setRole) {
                  setRole(e.target.value);
                }
              }}
              className="w-full bg-[#0B1120] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="super_admin">Super Admin</option>
              <option value="product_seller">Product Seller</option>
              <option value="service_seller">Service Seller</option>
              <option value="reseller">Reseller</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t('logout')}</span>
        </button>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="relative group">
            <Globe className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-300 text-[10px] rounded-lg pl-7 pr-2 py-2 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>
          <div className="relative group">
            <Coins className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <select 
              value={currency.code}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-300 text-[10px] rounded-lg pl-7 pr-2 py-2 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              {availableCurrencies.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-4 bg-[#060a13] flex items-center justify-between border-t border-[#1e293b]">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Node DB:</span>
        <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
           Cluster-01
        </span>
      </div>
    </aside>
  );
}
