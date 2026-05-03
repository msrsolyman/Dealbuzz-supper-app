import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Plus, Check, X, Users as UsersIcon } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only super_admin or admin can do this realistically
    fetchWithAuth('/users')
        .then(res => {
            if(res && res.data) {
                setUsers(res.data);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
  }, []);

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-bold">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <UsersIcon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">User Management</h2>
        </div>
        <button 
          className="text-sm font-bold text-white uppercase bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Name</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-display font-bold text-xs flex items-center justify-center">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {u.isActive !== false ? <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 border border-emerald-100 rounded-md text-[10px] uppercase font-bold tracking-widest"><Check className="w-3 h-3" /> Active</span> : <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 border border-rose-100 rounded-md text-[10px] uppercase font-bold tracking-widest"><X className="w-3 h-3" /> Inactive</span>}
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No users found.</td></tr>
            )}
            {loading && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Loading users...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
