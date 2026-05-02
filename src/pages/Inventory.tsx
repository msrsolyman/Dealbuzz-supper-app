import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Plus, Edit2, Trash2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Inventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inventory uses the products endpoint but with more focus on stock and valuation
    fetchWithAuth('/products')
      .then(res => setInventory(res.data || []))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Inventory Levels</h3>
        <button 
          className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 flex items-center"
        >
          <ArrowRightLeft className="w-3 h-3 mr-1" /> Stock Adjustment
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-bold tracking-wider">Product Name</th>
              <th className="px-4 py-2 font-bold tracking-wider">SKU</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">In Stock</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Unit Value</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventory.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{item.sku}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.stockCount < 10 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {item.stockCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">${item.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">${(item.price * item.stockCount).toFixed(2)}</td>
              </tr>
            ))}
            {inventory.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No inventory found.</td></tr>
            )}
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
