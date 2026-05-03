import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Package, Users, FileText, Settings, LogOut, ArrowLeftRight, Archive, Shield, X, Store, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { pathname } = useLocation();
  const { logout, user, setRole } = useAuth();

  let navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  ];

  if (user?.role === 'customer') {
    navItems.push({ name: 'Products', path: '/products', icon: Package });
    navItems.push({ name: 'Services', path: '/services', icon: Settings });
    navItems.push({ name: 'Sellers Directory', path: '/sellers', icon: Store });
  } else {
    // product_seller, service_seller, reseller, super_admin, admin
    if (['super_admin', 'admin', 'product_seller', 'reseller'].includes(user?.role || '')) {
      navItems.push({ name: 'Products', path: '/products', icon: Package });
      navItems.push({ name: 'Inventory', path: '/inventory', icon: Archive });
    }
    if (['super_admin', 'admin', 'service_seller', 'reseller'].includes(user?.role || '')) {
      navItems.push({ name: 'Services', path: '/services', icon: Settings });
    }
    navItems.push({ name: 'POS Desk', path: '/pos', icon: ShoppingCart });
    navItems.push({ name: 'Customers', path: '/customers', icon: Users });
    navItems.push({ name: 'Invoices', path: '/invoices', icon: FileText });
    navItems.push({ name: 'Accounts', path: '/accounts', icon: ArrowLeftRight });
    
    if (['super_admin', 'admin', 'product_seller', 'reseller'].includes(user?.role || '')) {
      navItems.push({ name: 'Warehouses', path: '/warehouses', icon: Archive });
    }
    
    navItems.push({ name: 'Profile / Store', path: '/storefront', icon: Store });
    
    if (['super_admin', 'admin'].includes(user?.role || '')) {
      navItems.push({ name: 'Users', path: '/users', icon: Shield });
      navItems.push({ name: 'Audit Logs', path: '/audit-logs', icon: Shield });
    }
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
          const isActive = pathname === item.path;
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

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
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
