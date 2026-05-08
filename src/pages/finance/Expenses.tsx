import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Trash2, Tag, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function Expenses() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ category: 'Rent', amount: 0, date: new Date().toISOString().slice(0, 10), description: '', referenceNo: '' });

  const categories = ['Rent', 'Utilities', 'Travel', 'Meals', 'Supplies', 'Marketing', 'Salary', 'Other'];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/expenses');
      setExpenses(res.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/expenses', {
        method: 'POST',
        body: JSON.stringify({...formData, userId: '123456789012345678901234'}), // temporary fallback, backend should use req.user.id
      });
      toast.success('Expense added');
      setIsModalOpen(false);
      loadExpenses();
    } catch (error) {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await fetchWithAuth(`/expenses/${id}`, { method: 'DELETE' });
      toast.success('Expense deleted');
      loadExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Expenses</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Manage Daily Costs</p>
        </div>
        <button
          onClick={() => {
            setFormData({ category: 'Rent', amount: 0, date: new Date().toISOString().slice(0, 10), description: '', referenceNo: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No expenses found.</td></tr>
              ) : (
                expenses.map((expense: any) => (
                  <tr key={expense._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {expense.description}
                      {expense.referenceNo && <div className="text-[10px] text-slate-400 mt-1">Ref: {expense.referenceNo}</div>}
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-rose-600">{formatAmount(expense.amount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDelete(expense._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Add Expense</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date *</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category *</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-900">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount *</label>
                <input required type="number" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-900" rows={2} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference No</label>
                <input type="text" value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition-all tracking-widest">Cancel</button>
                <button type="submit" className="px-8 py-3 text-xs font-black text-white uppercase bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 tracking-widest">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
