import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadData = () => {
    fetchWithAuth("/customers")
      .then((res) => setCustomers(res.data || []))
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchWithAuth(`/customers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Customer updated");
      } else {
        await fetchWithAuth("/customers", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Customer created");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", phone: "", email: "", address: "" });
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete customer?")) return;
    try {
      await fetchWithAuth(`/customers/${id}`, { method: "DELETE" });
      toast.success("Deleted successfully");
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            Customers
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", phone: "", email: "", address: "" });
            setIsModalOpen(true);
          }}
          className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">New Customer</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Name</th>
              <th className="px-6 py-4 font-bold">Contact</th>
              <th className="px-6 py-4 font-bold text-right">Total Spent</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-display font-bold text-xs flex items-center justify-center">
                      {item.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{item.phone}</div>
                  <div className="text-xs text-slate-500">
                    {item.email || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-display font-black text-sm">
                    ${item.totalSpent?.toFixed(2) || "0.00"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setFormData(item);
                        setIsModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  No customers found. Add your first customer!
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading customers...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8 border border-slate-200/60 shadow-2xl">
            <h2 className="text-xl font-display font-bold mb-6 text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {editingId ? (
                  <Edit2 className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
              {editingId ? "Edit Customer" : "New Customer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Phone
                </label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="flex justify-end pt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
