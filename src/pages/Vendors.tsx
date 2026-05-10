import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Truck,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function Vendors() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    address: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/vendors");
      setVendors(res.data);
    } catch (error) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchWithAuth(`/vendors/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Vendor updated");
      } else {
        await fetchWithAuth("/vendors", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("Vendor added");
      }
      setIsModalOpen(false);
      loadVendors();
    } catch (error) {
      toast.error("Failed to save vendor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await fetchWithAuth(`/vendors/${id}`, { method: "DELETE" });
      toast.success("Vendor deleted");
      loadVendors();
    } catch (error) {
      toast.error("Failed to delete vendor");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">
            Vendors & Suppliers
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Manage Supply Chain
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              phone: "",
              email: "",
              company: "",
              address: "",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Vendor Details</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Balance Owed</th>
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
              ) : vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                  >
                    No vendors found.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor: any) => (
                  <tr
                    key={vendor._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {vendor.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {vendor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {vendor.company || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {vendor.phone}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-rose-600">
                      {formatAmount(vendor.balanceDue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setFormData({
                              name: vendor.name,
                              phone: vendor.phone,
                              email: vendor.email || "",
                              company: vendor.company || "",
                              address: vendor.address || "",
                            });
                            setEditingId(vendor._id);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {editingId ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                {/* Close icon could be added here */}✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Phone *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition-all tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 text-xs font-black text-white uppercase bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 tracking-widest"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
