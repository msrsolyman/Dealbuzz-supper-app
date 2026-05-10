import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // Verify it's an admin/super_admin
      if (!['admin', 'super_admin'].includes(data.user.role)) {
         throw new Error('Access denied. Administrator privileges required.');
      }
      login(data.token, data.user);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans text-slate-200 p-4">
      <div className="w-full max-w-sm p-8 bg-[#0B1120] border border-slate-800 shadow-2xl rounded-2xl relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-indigo-500" />
        </div>
        
        <h1 className="text-3xl font-display font-black text-center text-white tracking-tighter mb-2">DB-ADMIN</h1>
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">
          Restricted Access Console
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0e1526] border border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 text-white font-mono"
              placeholder="admin@dealbuzz.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Passcode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0e1526] border border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 text-white font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 shadow-xl shadow-indigo-900/50 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Authorize Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
