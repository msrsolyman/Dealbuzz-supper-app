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
    <div className="flex min-h-screen bg-[#FAFAFA] text-slate-900 text-sm font-sans antialiased overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 w-full transition-all">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold tracking-tight text-slate-800 text-sm">
                Omni Retail
              </h2>
              <span className="hidden sm:inline-block text-slate-300 px-1">/</span>
              <div className="hidden sm:flex text-xs font-mono text-slate-500 items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.tenantId?.slice(0, 6).toUpperCase() || "4092-X"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-700">
                {user?.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium border border-slate-300 shadow-sm cursor-pointer">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 relative custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <SellerAIAssistant />
      <Toaster position="top-center" richColors />
    </div>
  );
}
