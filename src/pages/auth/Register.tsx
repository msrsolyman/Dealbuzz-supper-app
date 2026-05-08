import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { fetchWithAuth } from '../../lib/api';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    tenantName: '',
    userName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Registration successful. Please login.');
      navigate('/login');
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
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-6">System Initialization</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tenant Subsystem</label>
            <input
              type="text"
              value={formData.tenantName}
              onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Root Admin Name</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Root Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Encryption Key (Password)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white text-[10px] font-bold uppercase py-2 rounded border border-indigo-700 hover:bg-indigo-700 transition-colors disabled:opacity-50 tracking-wider mt-2 shadow-sm"
          >
            {loading ? 'Provisioning...' : 'Provision Tenant'}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wide">
          Tenant exists? <Link to="/login" className="text-indigo-600 hover:underline">Access Terminal</Link>
        </div>
      </div>
    </div>
  );
}
