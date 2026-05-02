import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Plus, Check, X } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only super_admin or admin can do this realistically
    fetchWithAuth('/users')
        .then(data => {
            if(data && Array.isArray(data)) {
                setUsers(data);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">User Management</h3>
        <button 
          className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" /> Add User
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-bold tracking-wider">Name</th>
              <th className="px-4 py-2 font-bold tracking-wider">Email</th>
              <th className="px-4 py-2 font-bold tracking-wider">Role</th>
              <th className="px-4 py-2 font-bold tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700">
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {u.isActive !== false ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Active</span> : <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Inactive</span>}
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No users found.</td></tr>
            )}
            {loading && <tr><td colSpan={4} className="px-4 py-6 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
