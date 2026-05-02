import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', price: 0, description: '' });

  const loadProducts = async () => {
    try {
      const data = await fetchWithAuth('/products');
      setProducts(data.data);
    } catch (e: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Product created');
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', category: '', price: 0, description: '' });
      loadProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      loadProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Product Inventory</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Product
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-bold tracking-wider">Name</th>
              <th className="px-4 py-2 font-bold tracking-wider">SKU</th>
              <th className="px-4 py-2 font-bold tracking-wider">Category</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Price</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Stock</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{p.sku}</td>
                <td className="px-4 py-3 text-slate-600">{p.category}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stockCount < 10 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {p.stockCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 mr-2"><Edit2 className="w-3 h-3 inline" /></button>
                  <button onClick={() => handleDelete(p._id)} className="text-rose-600 hover:text-rose-800"><Trash2 className="w-3 h-3 inline" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No products found.</td></tr>
            )}
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded w-full max-w-sm p-5 border border-slate-200 shadow-xl">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-900">Add Product</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SKU</label>
                <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end pt-3 gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase border border-transparent hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-[10px] font-bold text-white uppercase bg-indigo-600 rounded hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
