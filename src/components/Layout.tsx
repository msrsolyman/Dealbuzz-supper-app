import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'sonner';
import { Menu } from 'lucide-react';

export default function Layout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background blob */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300 bg-transparent">
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10 w-full transition-all">
          <div className="flex items-center gap-3 md:gap-5">
            <button 
              className="md:hidden p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col">
              <h2 className="font-display font-bold text-slate-800 leading-none">Omni Retail Solutions</h2>
              <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                Workspace ID: {user?.tenantId?.slice(0,6).toUpperCase() || '4092-X'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest mt-0.5 shadow-sm">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full p-0.5 shadow-sm shrink-0">
               <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 uppercase border-2 border-white">
                 {user?.name?.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}
