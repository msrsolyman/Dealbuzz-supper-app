import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Download, Eye, FileText, Lock } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending';
}

export default function Accounts() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Define permissions based on role
  const canViewBalances = ['super_admin', 'admin', 'dev'].includes(user?.role || '');
  const canExportData = ['super_admin', 'admin', 'dev'].includes(user?.role || '');
  const canAddTransaction = ['super_admin', 'admin', 'staff', 'dev'].includes(user?.role || '');
  const canManageSettings = ['super_admin', 'admin'].includes(user?.role || '');
  const canViewAmounts = ['super_admin', 'admin', 'dev'].includes(user?.role || '');

  useEffect(() => {
    fetchWithAuth('/accounting-transactions')
      .then(res => setTransactions(res.data || []))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role === 'customer') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm m-4 p-8">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-center max-w-md">Your current role (<span className="font-semibold text-slate-700">Customer</span>) does not grant permissions to view the tenant's financial accounts and ledgers.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Accounts & Transactions</h1>
          <p className="text-sm text-slate-500 mt-2">
            Manage tenant finances and ledgers. 
            {!canViewBalances && <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold bg-amber-50 text-amber-700 border border-amber-100"><Lock className="w-3 h-3" /> Limited Access Mode</span>}
          </p>
        </div>
        
        <div className="flex gap-3">
          {canExportData && (
            <button className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          {canAddTransaction && (
            <button className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-500/20 active:scale-95">
              <Plus className="w-4 h-4" />
              New Transaction
            </button>
          )}
        </div>
      </div>

      {canViewBalances && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-16 h-16" />
             </div>
             <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Balance</div>
             <div className="text-4xl font-display font-bold text-slate-900 tracking-tight">$24,500.00</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Plus className="w-16 h-16 text-emerald-600" />
             </div>
             <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Monthly Income</div>
             <div className="text-4xl font-display font-bold text-emerald-600 tracking-tight">$8,250.00</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Lock className="w-16 h-16 text-amber-600" />
             </div>
             <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Pending Invoices</div>
             <div className="text-4xl font-display font-bold text-amber-600 tracking-tight">$1,430.00</div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/60 rounded-3xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                <FileText className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          </div>
          {canManageSettings && (
             <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
               Account Settings
             </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-slate-500">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <th className="py-4 px-6 font-bold">Date</th>
                  <th className="py-4 px-6 font-bold">Description</th>
                  <th className="py-4 px-6 font-bold">Amount</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {transactions.map((txn: any) => (
                  <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 text-slate-600 font-medium whitespace-nowrap">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : ''}</td>
                    <td className="py-4 px-6 text-slate-900 font-bold">{txn.description || txn.reference}</td>
                    <td className="py-4 px-6 font-display font-medium whitespace-nowrap text-base">
                      {canViewAmounts ? (
                        <span className={txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}>
                          {txn.type === 'CREDIT' ? '+' : '-'}${txn.amount?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">***</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        txn.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {txn.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm">
                           <Eye className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-500 font-medium">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
