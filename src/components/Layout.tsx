import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { Toaster } from "sonner";
import { Menu } from "lucide-react";
import SellerAIAssistant from "./SellerAIAssistant";

export default function Layout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 text-sm font-sans antialiased overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 md:ml-[280px] flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300">

        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-8 shrink-0 w-full transition-all m-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] w-[calc(100%-2rem)] mx-auto top-0 z-10 sticky">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100/50 rounded-xl transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="font-bold tracking-tight text-slate-900 text-base">
                Dealbuzz
              </h2>
              <span className="hidden sm:inline-block text-slate-300 px-1 font-light">/</span>
              <div className="hidden sm:flex text-[11px] font-mono text-slate-500 items-center gap-2 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                {user?.tenantId?.slice(0, 6).toUpperCase() || "SYSTEMHQ"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">
                {user?.name}
              </span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-white text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 pt-2 md:pt-4 relative custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
      <SellerAIAssistant />
      <Toaster position="top-center" richColors />
    </div>
  );
}
