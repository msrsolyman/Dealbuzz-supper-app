import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { Truck, MapPin, Package, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Delivery() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/invoices");
      // Filter out invoices that don't need delivery or are just draft. Wait, let's show SENT and PAID
      const deliveryInvoices = res.data.filter(
        (i: any) => i.status !== "DRAFT" && i.status !== "VOID",
      );
      setInvoices(deliveryInvoices);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchWithAuth(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify({ deliveryStatus: status }),
      });
      toast.success("Delivery status updated");
      loadDeliveries();
    } catch (e) {
      toast.error("Failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Logistics & Delivery
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mt-1">
            Track Orders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map(
          (statusOption) => (
            <div
              key={statusOption}
              className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 flex flex-col h-[70vh]"
            >
              <div className="flex items-center gap-2 mb-4 px-2">
                {statusOption === "PENDING" && (
                  <Package className="w-5 h-5 text-slate-400" />
                )}
                {statusOption === "PROCESSING" && (
                  <MapPin className="w-5 h-5 text-amber-500" />
                )}
                {statusOption === "SHIPPED" && (
                  <Truck className="w-5 h-5 text-indigo-500" />
                )}
                {statusOption === "DELIVERED" && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="font-black text-slate-900 text-sm tracking-widest">
                  {statusOption}
                </h3>
                <span className="ml-auto bg-white border border-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {
                    invoices.filter(
                      (i) => (i.deliveryStatus || "PENDING") === statusOption,
                    ).length
                  }
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 px-1">
                {invoices
                  .filter(
                    (i) => (i.deliveryStatus || "PENDING") === statusOption,
                  )
                  .map((inv) => (
                    <div
                      key={inv._id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono font-black text-sm text-slate-900">
                          {inv.invoiceNumber}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mb-4 flex gap-1 items-center">
                        Customer:{" "}
                        <strong>{inv.customerId?.name || "Walk-in"}</strong>
                      </div>
                      {statusOption !== "DELIVERED" && (
                        <select
                          value={inv.deliveryStatus || "PENDING"}
                          onChange={(e) =>
                            updateStatus(inv._id, e.target.value)
                          }
                          className="w-full text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500"
                        >
                          <option value="PENDING">Set Pending</option>
                          <option value="PROCESSING">Set Processing</option>
                          <option value="SHIPPED">Set Shipped</option>
                          <option value="DELIVERED">Set Delivered</option>
                        </select>
                      )}
                      {statusOption === "DELIVERED" && (
                        <div className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">
                          Delivery Complete
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
