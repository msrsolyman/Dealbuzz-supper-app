import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';
import { FileText, Download, Plus, Trash2, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export default function Invoices() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ 
    customerId: '', dueDate: '', 
    status: 'DRAFT', invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    items: [{ name: '', itemType: 'Product', quantity: 1, rate: 0, total: 0 }],
    subtotal: 0, tax: 0, total: 0, taxRate: 5
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await fetchWithAuth('/invoices');
      setInvoices(data.data || []);
      
      const resCustomers = await fetchWithAuth('/customers');
      setCustomers(resCustomers.data || []);
    } catch (e: any) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const calculateTotals = (items = formData.items, taxRate = formData.taxRate) => {
    const subtotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.rate), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return toast.error('Please select a customer');

    const { subtotal, tax, total } = calculateTotals();

    try {
      await fetchWithAuth('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          subtotal,
          tax,
          total
        }),
      });
      toast.success('Invoice created');
      setIsModalOpen(false);
      loadInvoices();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const downloadPDF = (invoice: any) => {
    const doc = new jsPDF();
    doc.text(`Invoice #${invoice.invoiceNumber}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(invoice.createdAt), 'MMM d, yyyy')}`, 14, 30);
    doc.text(`Status: ${invoice.status}`, 14, 35);
    
    // Check if items is array before using spread
    const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
    
    autoTable(doc, {
      startY: 45,
      head: [['Item', 'Type', 'Quantity', 'Rate', 'Total']],
      body: safeItems.map((item: any) => [
        item.name,
        item.itemType,
        item.quantity,
        `$${item.rate.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY || 45;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 140, finalY + 15);
    doc.setFontSize(12);
    doc.text(`Total: $${invoice.total.toFixed(2)}`, 140, finalY + 25);

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl flex flex-col h-full overflow-hidden shadow-sm font-sans">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-bold">
           <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
             <FileText className="w-5 h-5" />
           </div>
           <h2 className="text-2xl font-display font-bold tracking-tight">{t('invoices')}</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-bold text-white uppercase bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
        >
          {t('create_invoice')}
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">{t('invoice_number')}</th>
              <th className="px-6 py-4 font-bold">{t('customer')}</th>
              <th className="px-6 py-4 font-bold text-right">{t('total')}</th>
              <th className="px-6 py-4 font-bold text-center">{t('status')}</th>
              <th className="px-6 py-4 font-bold">{t('due_date')}</th>
              <th className="px-6 py-4 font-bold text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-mono font-bold text-slate-900 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-indigo-400 inline" />
                  {inv.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{inv.customerId?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 text-base">{formatAmount(inv.total)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${inv.status?.toUpperCase() === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{inv.status?.toUpperCase()}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">{format(new Date(inv.dueDate), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => downloadPDF(inv)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">{t('no_invoices_found')}</td></tr>
            )}
            {loading && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">{t('loading_invoices')}</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded w-full max-w-lg p-5 border border-slate-200 shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-900">{t('create_invoice')}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('customer')}</label>
                  <div className="relative">
                    {formData.customerId ? (
                      <div className="flex flex-col border border-slate-200 rounded p-2 bg-slate-50 gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">
                            {customers.find(c => c._id === formData.customerId)?.name || 'Loading customer...'}
                          </span>
                          <button type="button" onClick={() => setFormData({...formData, customerId: ''})} className="text-slate-400 hover:text-slate-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {customers.find(c => c._id === formData.customerId)?.email || customers.find(c => c._id === formData.customerId)?.phone || ''}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search customer..." 
                            value={customerSearch}
                            onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                            onFocus={() => setShowCustomerDropdown(true)}
                            className="w-full border border-slate-200 rounded pl-8 pr-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                        {showCustomerDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto">
                            {customers.filter(c => 
                              (c.name?.toLowerCase() || '').includes(customerSearch.toLowerCase()) || 
                              (c.email?.toLowerCase() || '').includes(customerSearch.toLowerCase()) ||
                              (c.phone?.toLowerCase() || '').includes(customerSearch.toLowerCase())
                            ).map(c => (
                              <div 
                                key={c._id} 
                                onClick={() => { setFormData({...formData, customerId: c._id}); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                                className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                              >
                                <div className="text-xs font-bold text-slate-800">{c.name}</div>
                                <div className="text-[10px] text-slate-500">{c.email}</div>
                              </div>
                            ))}
                            {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                              <div className="p-2 text-xs text-slate-500 text-center">No customers found</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('due_date')}</label>
                  <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
                </div>
              </div>
              
              <div className="border border-slate-200 rounded p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('item_details')}</h4>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, items: [...formData.items, { name: '', itemType: 'Product', quantity: 1, rate: 0, total: 0 }]})}
                    className="text-xs flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> {t('add_item')}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block sm:hidden text-[10px] font-bold text-slate-400 mb-1">Item Name</label>
                        <input required placeholder="Item Name" type="text" value={item.name} onChange={e => {
                          const newItm = [...formData.items];
                          newItm[index].name = e.target.value;
                          setFormData({...formData, items: newItm});
                        }} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label className="block sm:hidden text-[10px] font-bold text-slate-400 mb-1">Type</label>
                        <select required value={item.itemType} onChange={e => {
                          const newItm = [...formData.items];
                          newItm[index].itemType = e.target.value as any;
                          setFormData({...formData, items: newItm});
                        }} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500">
                          <option value="Product">Product</option>
                          <option value="Service">Service</option>
                        </select>
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block sm:hidden text-[10px] font-bold text-slate-400 mb-1">Qty</label>
                        <input required placeholder="Qty" type="number" min="1" value={item.quantity} onChange={e => {
                          const newItm = [...formData.items];
                          newItm[index].quantity = Number(e.target.value);
                          newItm[index].total = newItm[index].quantity * newItm[index].rate;
                          setFormData({...formData, items: newItm});
                        }} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block sm:hidden text-[10px] font-bold text-slate-400 mb-1">Rate</label>
                        <input required placeholder="Rate" type="number" min="0" step="0.01" value={item.rate || ''} onChange={e => {
                          const newItm = [...formData.items];
                          newItm[index].rate = Number(e.target.value);
                          newItm[index].total = newItm[index].quantity * newItm[index].rate;
                          setFormData({...formData, items: newItm});
                        }} className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" />
                      </div>
                      <div className="col-span-12 sm:col-span-1 flex justify-end">
                        {formData.items.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                               const newItm = formData.items.filter((_, i) => i !== index);
                               setFormData({...formData, items: newItm});
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex flex-col items-end text-sm space-y-1">
                    <div className="flex justify-between w-full sm:w-64 text-slate-500">
                      <span>{t('subtotal')}:</span>
                      <span className="font-mono">{formatAmount(calculateTotals().subtotal)}</span>
                    </div>
                    <div className="flex justify-between w-full sm:w-64 text-slate-500 items-center">
                      <span className="flex items-center gap-2">
                        {t('tax_rate')}: 
                        <div className="relative">
                          <input type="number" min="0" max="100" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})} className="w-16 border border-slate-200 rounded px-2 py-0.5 text-xs text-right outline-none focus:border-indigo-500 pr-5" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">%</span>
                        </div>
                      </span>
                      <span className="font-mono">{formatAmount(calculateTotals().tax)}</span>
                    </div>
                    <div className="flex justify-between w-full sm:w-64 text-slate-800 font-bold pt-1 border-t border-slate-200 mt-1">
                      <span>{t('total')}:</span>
                      <span className="font-mono text-base">{formatAmount(calculateTotals().total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase hover:bg-slate-100 rounded-xl transition-colors">{t('cancel')}</button>
                <button type="submit" className="px-6 py-2 text-xs font-bold text-white uppercase bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">{t('create_invoice')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
