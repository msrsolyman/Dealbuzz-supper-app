import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Trash2, CheckCircle2, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchaseOrders() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [pos, setPos] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
     vendorId: '', 
     warehouseId: '', 
     expectedDate: '', 
     items: [] as any[] 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, vRes, pRes, wRes] = await Promise.all([
         fetchWithAuth('/purchase-orders'),
         fetchWithAuth('/vendors'),
         fetchWithAuth('/products'),
         fetchWithAuth('/warehouses')
      ]);
      setPos(poRes.data || []);
      setVendors(vRes.data || []);
      setProducts(pRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { productId: '', quantity: 1, unitCost: 0, total: 0 }] });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unitCost') {
      updated[index].total = updated[index].quantity * updated[index].unitCost;
    }
    setFormData({ ...formData, items: updated });
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const poNumber = 'PO-' + Date.now().toString().slice(-6);
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    
    try {
      await fetchWithAuth('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
           vendorId: formData.vendorId,
           warehouseId: formData.warehouseId || undefined,
           expectedDate: formData.expectedDate || undefined,
           poNumber,
           items: formData.items,
           subtotal,
           total: subtotal,
           status: 'DRAFT'
        }),
      });
      toast.success('PO Created');
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to create PO');
    }
  };

  const handleReceive = async (id: string) => {
    if(!confirm("Receive stock from this PO?")) return;
    try {
      await fetchWithAuth(`/purchase-orders/${id}/receive`, { method: 'POST' });
      toast.success('PO Received and Stock Updated!');
      loadData();
    } catch (e: any) {
      toast.error('Failed to receive PO: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete PO?")) return;
    try {
      await fetchWithAuth(`/purchase-orders/${id}`, { method: 'DELETE' });
      toast.success('PO deleted');
      loadData();
    } catch (e: any) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Purchase Orders</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mt-1">Manage Supplier Orders</p>
        </div>
        <button onClick={() => {
           setFormData({ vendorId: '', warehouseId: '', expectedDate: '', items: [] });
           setIsModalOpen(true);
        }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-all flex items-center gap-2">
           <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Loading...</td></tr>
              ) : pos.length === 0 ? (
                 <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No Purchase Orders found.</td></tr>
              ) : pos.map(po => (
                <tr key={po._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black font-mono text-slate-900">{po.poNumber}</td>
                  <td className="px-6 py-4">{po.vendorId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatAmount(po.total)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {po.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        {po.status !== 'RECEIVED' && (
                           <button onClick={() => handleReceive(po._id)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              Receive
                           </button>
                        )}
                        <button onClick={() => handleDelete(po._id)} className="text-slate-400 hover:text-rose-600 p-2"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        // Add PO Modal
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create Purchase Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Trash2 className="w-4 h-4 opacity-0" /><span className="text-xl leading-none absolute top-6 right-6">×</span></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vendor</label>
                    <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500">
                       <option value="">-- Select Vendor --</option>
                       {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Destination Warehouse</label>
                    <select value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500">
                       <option value="">-- Main Store --</option>
                       {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Order Items</h3>
                   <button onClick={addItem} type="button" className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-indigo-100">
                      <Plus className="w-3 h-3" /> Add Item
                   </button>
                </div>
                
                <div className="space-y-3">
                   {formData.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <div className="flex-1">
                            <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                               <option value="">Select Product...</option>
                               {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                         </div>
                         <div className="w-24">
                            <input type="number" value={item.quantity === 0 ? '' : item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} placeholder="Qty" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                         </div>
                         <div className="w-32">
                            <input type="number" step="0.01" value={item.unitCost === 0 ? '' : item.unitCost} onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))} placeholder="Cost" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                         </div>
                         <div className="w-32 font-mono font-bold text-slate-900 text-right">
                            {formatAmount(item.total)}
                         </div>
                         <button onClick={() => removeItem(idx)} type="button" className="text-rose-400 hover:text-rose-600 p-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   ))}
                   {formData.items.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest">
                         No items added
                      </div>
                   )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
               <div className="flex-1 flex items-center text-sm font-black text-slate-900 uppercase tracking-widest gap-2">
                 Total: <span className="font-mono text-indigo-600 text-lg">{formatAmount(formData.items.reduce((s, i) => s + i.total, 0))}</span>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition-all tracking-widest">Cancel</button>
               <button onClick={handleSubmit} className="px-8 py-3 text-xs font-black text-white uppercase bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 tracking-widest">Submit Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
