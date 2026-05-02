import { Outlet, Navigate } from 'react-router';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'sonner';

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-52 flex flex-col h-screen overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4 text-xs">
            <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 font-mono text-slate-600">TENANT_ID: #{user?.tenantId?.slice(0,6).toUpperCase() || '4092-X'}</span>
            <h2 className="font-semibold text-slate-600">Omni Retail Solutions</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold leading-tight">{user?.name}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded uppercase font-semibold mt-0.5">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
