import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import { Plus, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Returns() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [returns, setReturns] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    invoiceId: "",
    reason: "",
    refundAmount: 0,
    items: [] as any[],
  });

  useEffect(() => {
    loadReturns();
    loadInvoices();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/returns");
      setReturns(
        res.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const res = await fetchWithAuth("/invoices");
      setInvoices(res.data);
    } catch (e) {
      toast.error("Failed to load invoices");
    }
  };

  const handleInvoiceSelect = (id: string) => {
    const inv = invoices.find((i) => i._id === id);
    setSelectedInvoice(inv);
    if (inv) {
      setFormData({
        ...formData,
        invoiceId: id,
        reason: "",
        refundAmount: 0,
        items: inv.items
          .filter((item: any) => item.productId)
          .map((item: any) => ({
            productId: item.productId._id || item.productId,
            name: item.productId.name || "Product",
            quantity: 0,
            maxQty: item.quantity,
            condition: "GOOD",
          })),
      });
    }
  };

  const handleItemQtyChange = (idx: number, qty: number) => {
    const updated = [...formData.items];
    updated[idx].quantity = qty;
    setFormData({ ...formData, items: updated });
  };

  const handleItemCondChange = (idx: number, cond: string) => {
    const updated = [...formData.items];
    updated[idx].condition = cond;
    setFormData({ ...formData, items: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const returnItems = formData.items
      .filter((i) => i.quantity > 0)
      .map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        condition: i.condition,
      }));

    if (returnItems.length === 0)
      return toast.error("Must return at least 1 item");

    try {
      await fetchWithAuth("/returns", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: formData.invoiceId,
          reason: formData.reason,
          refundAmount: formData.refundAmount,
          items: returnItems,
          status: "PENDING",
        }),
      });
      toast.success("Return created initially as PENDING");
      setIsModalOpen(false);
      loadReturns();
    } catch (error: any) {
      toast.error("Failed to save return: " + error.message);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm("Mark as complete and adjust stock?")) return;
    try {
      await fetchWithAuth(`/returns/${id}/complete`, { method: "POST" });
      toast.success("Return completed and stock adjusted");
      loadReturns();
    } catch (e: any) {
      toast.error("Failed to complete return: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this return?")) return;
    try {
      await fetchWithAuth(`/returns/${id}`, { method: "DELETE" });
      toast.success("Return deleted");
      loadReturns();
    } catch (error) {
      toast.error("Failed to delete return");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">
            Returns & Refunds
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Manage Product Returns
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              invoiceId: "",
              reason: "",
              refundAmount: 0,
              items: [],
            });
            setSelectedInvoice(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" /> New Return
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Refund</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                  >
                    Loading...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                  >
                    No returns found.
                  </td>
                </tr>
              ) : (
                returns.map((ret: any) => (
                  <tr
                    key={ret._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ret.reason}</td>
                    <td className="px-6 py-4 font-mono font-black text-rose-600">
                      {formatAmount(ret.refundAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${ret.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {ret.status === "PENDING" && (
                          <button
                            onClick={() => handleComplete(ret._id)}
                            className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ret._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
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
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Product Return
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto w-full flex-1 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Select Invoice *
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {formatAmount(inv.total)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Items from Invoice
                  </div>
                  <div className="divide-y divide-slate-100">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="p-4 flex gap-4 items-center">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Max returnable: {item.maxQty}
                          </p>
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Return Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.maxQty}
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemQtyChange(idx, Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-bold outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="w-40">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Condition
                          </label>
                          <select
                            value={item.condition}
                            onChange={(e) =>
                              handleItemCondChange(idx, e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-bold outline-none focus:border-indigo-500"
                          >
                            <option value="GOOD">Good (Back to Stock)</option>
                            <option value="DAMAGED">Damaged</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Why returned?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.refundAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        refundAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition-all tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 text-xs font-black text-white uppercase bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 tracking-widest"
              >
                Save Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
