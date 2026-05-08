import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Settings, Hammer, Archive } from 'lucide-react';
import { toast } from 'sonner';

export default function Manufacturing() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    toast.info("This is a structural module for Manufacturing. UI logic inside modal needs complex BOM (Bill of Materials) setup.");
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/manufacturing-orders');
      setOrders(res.data);
    } catch (e) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Manufacturing</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Bill of Materials & Production</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Production Order
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-12 text-center">
         <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Hammer className="w-8 h-8" />
         </div>
         <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Production Module</h3>
         <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
            Create complex Bill of Materials (BOM) to track raw materials converted into finished goods. Automated deduction of components on production complete.
         </p>
      </div>
    </div>
  );
}
