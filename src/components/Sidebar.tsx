import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Package, Users, FileText, Settings, LogOut, ArrowLeftRight, Archive, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Services', path: '/services', icon: Settings },
    { name: 'Inventory', path: '/inventory', icon: Archive },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Accounts', path: '/accounts', icon: ArrowLeftRight },
  ];

  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navItems.push({ name: 'Users', path: '/users', icon: Users });
    navItems.push({ name: 'Audit Logs', path: '/audit-logs', icon: Shield });
  }

  return (
    <aside className="w-52 bg-slate-900 h-screen flex flex-col text-white fixed top-0 left-0 border-r border-slate-900">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white shrink-0">DB</div>
          <span className="text-white font-bold tracking-tight text-lg leading-none">DEALBUZZ</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-semibold">Enterprise ERP v2.4</div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] text-slate-500 font-semibold px-3 mb-2 uppercase tracking-wider mt-2">Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive 
                  ? 'text-indigo-400 bg-slate-800/50 border-l-2 border-indigo-500' 
                  : 'text-slate-400 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-rose-400 rounded-md text-xs font-medium transition-colors border-l-2 border-transparent"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
      
      <div className="p-4 bg-slate-950 text-slate-500 text-[10px]">
        Node.js + MongoDB Instance: <span className="text-emerald-500 uppercase font-medium">Cluster-01</span>
      </div>
    </aside>
  );
}
