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
    <div className="flex min-h-screen bg-slate-50 border-slate-100 font-sans text-slate-900 overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Futuristic Backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 md:hidden transition-all duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300 bg-transparent">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-10 w-full transition-all">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-xl transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col">
              <h2 className="font-display font-black text-slate-900 uppercase tracking-wide text-lg h-5 overflow-visible">Omni Retail Solutions</h2>
              <div className="text-[10px] font-black text-indigo-500 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Network ID: {user?.tenantId?.slice(0,6).toUpperCase() || '4092-X'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800 leading-tight tracking-wide">{user?.name}</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded uppercase font-black tracking-widest mt-1">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-2xl p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 transform hover:scale-105 transition-transform cursor-pointer">
               <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-sm font-black text-indigo-600 uppercase border border-white">
                 {user?.name?.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative custom-scrollbar">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}
