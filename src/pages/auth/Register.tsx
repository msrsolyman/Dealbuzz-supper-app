import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { fetchWithAuth } from '../../lib/api';
import { toast } from 'sonner';
import { Settings, Store } from 'lucide-react';

export default function Register() {
  const [activeTab, setActiveTab] = useState<'customer' | 'system'>('customer');
  
  // Customer Registration State
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  // System Initialization State
  const [sysForm, setSysForm] = useState({
    tenantName: '',
    userName: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth('/auth/register-user', {
        method: 'POST',
        body: JSON.stringify(userForm),
      });
      toast.success('Registration successful. You can now login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(sysForm),
      });
      toast.success('System initialized successfully. Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 border-8 border-slate-900 p-4">
      <div className="w-full max-w-md p-8 bg-white border border-slate-200 shadow-xl rounded-2xl relative overflow-hidden">
        
        {/* Decorative corner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <h1 className="text-3xl font-display font-black text-center text-slate-900 tracking-tighter mb-2">DEALBUZZ</h1>
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">
          Join the Ecosystem
        </p>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button 
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'customer' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Customer
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            System Init
          </button>
        </div>

        {activeTab === 'customer' ? (
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Secure Password</label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-6 shadow-xl shadow-slate-900/20 active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSystemSubmit} className="space-y-4">
             <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-800 font-medium">
                    This will initialize the root tenant and your super admin account. Use this only for the first-time setup of Dealbuzz.
                  </p>
                </div>
             </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tenant Name</label>
              <input
                type="text"
                value={sysForm.tenantName}
                onChange={(e) => setSysForm({...sysForm, tenantName: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                placeholder="Acme Corp"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Root Admin Name</label>
              <input
                type="text"
                value={sysForm.userName}
                onChange={(e) => setSysForm({...sysForm, userName: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                placeholder="Super Admin"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Root Email</label>
              <input
                type="email"
                value={sysForm.email}
                onChange={(e) => setSysForm({...sysForm, email: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                placeholder="admin@dealbuzz.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Root Password</label>
              <input
                type="password"
                value={sysForm.password}
                onChange={(e) => setSysForm({...sysForm, password: e.target.value})}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? 'Provisioning...' : 'Provision Platform'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link to="/seller-register" className="flex items-center justify-center gap-2 w-full border-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all">
            <Store className="w-4 h-4" /> Become a Seller
          </Link>
          <div className="text-center mt-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline">Log in securely</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
