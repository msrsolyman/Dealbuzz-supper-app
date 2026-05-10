import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function Inventory() {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    type: "IN",
    quantity: 1,
    unitCost: 0,
    costingMethod: "FIFO",
    notes: "",
  });

  const loadData = async () => {
    try {
      const [invRes, whRes] = await Promise.all([
        fetchWithAuth("/products"),
        fetchWithAuth("/warehouses"),
      ]);
      setInventory(invRes.data || []);
      setWarehouses(whRes.data || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return toast.error("Select a product");

    try {
      await fetchWithAuth("/inventory", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("Stock adjusted successfully");
      setIsModalOpen(false);
      setFormData({
        productId: "",
        warehouseId: "",
        type: "IN",
        quantity: 1,
        unitCost: 0,
        costingMethod: "FIFO",
        notes: "",
      });
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-bold">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            Inventory Levels
          </h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-bold text-white uppercase bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Stock Adjustment</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Product Name</th>
              <th className="px-6 py-4 font-bold">SKU</th>
              <th className="px-6 py-4 font-bold text-right">In Stock</th>
              <th className="px-6 py-4 font-bold text-right">Unit Value</th>
              <th className="px-6 py-4 font-bold text-right">Total Value</th>
              <th className="px-6 py-4 font-bold text-right">In Warehouses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4 font-bold text-slate-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600 bg-slate-50/50 rounded-lg">
                  {item.sku}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${item.stockCount <= (item.lowStockThreshold || 5) ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse flex items-center justify-center gap-1 shadow-sm" : item.stockCount < 20 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    {item.stockCount <= (item.lowStockThreshold || 5) && (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {item.stockCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900 text-base">
                  ${item.price?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-right font-bold text-indigo-600 text-base">
                  ${((item.price || 0) * item.stockCount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col gap-1.5 items-end">
                    {item.warehouseStock && item.warehouseStock.length > 0 ? (
                      item.warehouseStock.map((ws: any) => {
                        const wh = warehouses.find(
                          (w) => w._id === ws.warehouseId,
                        );
                        if (!wh) return null;
                        return (
                          <span
                            key={ws.warehouseId}
                            className="text-[10px] uppercase tracking-widest font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100"
                          >
                            {wh.name}: {ws.stockCount}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md border-dashed">
                        Unassigned
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  No inventory found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading inventory...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded w-full max-w-sm p-5 border border-slate-200 shadow-xl">
            <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-900">
              Stock Adjustment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="">Select a product...</option>
                  {inventory.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Warehouse
                  </label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) =>
                      setFormData({ ...formData, warehouseId: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="">No specific warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="IN">ADD STOCK (IN)</option>
                    <option value="OUT">REMOVE STOCK (OUT)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Unit Cost
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitCost: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Costing Method
                  </label>
                  <select
                    required
                    value={formData.costingMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costingMethod: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="FIFO">FIFO</option>
                    <option value="LIFO">LIFO</option>
                    <option value="AVERAGE">AVERAGE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase border border-transparent hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-[10px] font-bold text-white uppercase bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
