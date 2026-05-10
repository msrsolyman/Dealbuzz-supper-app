import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { toast } from 'sonner';

export default function Login() {
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
      login(data.token, data.user);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 border-8 border-slate-900">
      <div className="w-full max-w-sm p-6 bg-white border border-slate-200 shadow-xl">
        <h1 className="text-2xl font-bold text-center text-slate-900 tracking-tight">DEALBUZZ</h1>
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-6">Tenant Authentication</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white text-[10px] font-bold uppercase py-2 rounded border border-indigo-700 hover:bg-indigo-700 transition-colors disabled:opacity-50 tracking-wider mt-2 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link to="/seller-register" className="flex items-center justify-center gap-2 w-full border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest py-2 rounded-xl transition-all">
            Become a Seller
          </Link>
          <div className="text-center mt-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline">Register now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
