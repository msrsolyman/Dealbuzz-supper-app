import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would normally fetch services, but since we don't have a services endpoint yet, 
    // let's use some placeholder logic or connect to the actual backend if built
    setLoading(false);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Services Management</h3>
        <button 
          className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Service
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-bold tracking-wider">Name</th>
              <th className="px-4 py-2 font-bold tracking-wider">Type</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Price</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {services.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No services found.</td></tr>
            )}
            {loading && <tr><td colSpan={4} className="px-4 py-6 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
