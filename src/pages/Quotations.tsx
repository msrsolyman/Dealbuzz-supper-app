import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Quotations() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/quotations");
      setQuotations(
        res.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    currentStatus: string,
    newStatus: string,
  ) => {
    try {
      await fetchWithAuth(`/quotations/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Quotation marked as ${newStatus}`);
      loadQuotations();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const convertToInvoice = async (quote: any) => {
    if (
      !confirm(
        "Convert to Invoice? This will deduct stock and mark quote as INVOICED.",
      )
    )
      return;
    try {
      const invoiceNumber =
        "INV-" +
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 1000);
      const invoiceData = {
        invoiceNumber,
        customerId: quote.customerId?._id || undefined,
        items: quote.items,
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        status: "UNPAID",
        dueDate: new Date(),
      };
      await fetchWithAuth("/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData),
      });
      await fetchWithAuth(`/quotations/${quote._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "INVOICED" }),
      });
      toast.success("Converted to Invoice successfully");
      loadQuotations();
    } catch (e) {
      toast.error("Conversion failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      await fetchWithAuth(`/quotations/${id}`, { method: "DELETE" });
      toast.success("Quotation deleted");
      loadQuotations();
    } catch (error) {
      toast.error("Failed to delete quotation");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">
            Quotations
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Manage Estimates & Proposals
          </p>
        </div>
        <button
          onClick={() => {
            // We ideally route to a Create Quote page similar to POS but ignoring stock. For now just show a toast.
            toast.info(
              "Go to POS and use the 'Save as Quote' option (to be added) or build a dedicated quote page.",
            );
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Quote Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
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
              ) : quotations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                  >
                    No quotations found.
                  </td>
                </tr>
              ) : (
                quotations.map((quote: any) => (
                  <tr
                    key={quote._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {quote.quotationNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-slate-900">
                      {formatAmount(quote.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${quote.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : quote.status === "REJECTED" ? "bg-rose-100 text-rose-700" : quote.status === "INVOICED" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {quote.status !== "INVOICED" && (
                          <>
                            <button
                              onClick={() => convertToInvoice(quote)}
                              className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[10px] font-bold uppercase tracking-widest transition-colors mr-2"
                            >
                              Convert to Invoice
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  quote._id,
                                  quote.status,
                                  "ACCEPTED",
                                )
                              }
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  quote._id,
                                  quote.status,
                                  "REJECTED",
                                )
                              }
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(quote._id)}
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
    </div>
  );
}
