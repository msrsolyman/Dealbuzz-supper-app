import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      const data = await fetchWithAuth('/invoices');
      setInvoices(data.data);
    } catch (e: any) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

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
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Invoices</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-bold tracking-wider">Invoice #</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Total</th>
              <th className="px-4 py-2 font-bold tracking-wider">Status</th>
              <th className="px-4 py-2 font-bold tracking-wider">Due Date</th>
              <th className="px-4 py-2 font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-slate-900 flex items-center">
                  <FileText className="w-3 h-3 mr-2 text-slate-400 inline" />
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">${inv.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status?.toUpperCase() === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status?.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{format(new Date(inv.dueDate), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => downloadPDF(inv)}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center justify-end w-full"
                  >
                    <Download className="w-3 h-3 mr-1" /> PDF
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No invoices.</td></tr>
            )}
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
