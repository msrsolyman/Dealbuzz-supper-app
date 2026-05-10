import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import {
  Calendar,
  CheckSquare,
  FileText,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function HR() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [activeTab, setActiveTab] = useState("attendance"); // attendance, leaves, payroll

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Data states
  const [attendances, setAttendances] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersRes = await fetchWithAuth("/users");
      // Only staff and admins
      setUsers(
        usersRes.data.filter((u: any) =>
          ["admin", "staff", "super_admin"].includes(u.role),
        ),
      );

      if (activeTab === "attendance") {
        const res = await fetchWithAuth("/attendances");
        setAttendances(res.data);
      } else if (activeTab === "leaves") {
        const res = await fetchWithAuth("/leaves");
        setLeaves(res.data);
      } else if (activeTab === "payroll") {
        const res = await fetchWithAuth("/payrolls");
        setPayrolls(res.data);
      }
    } catch (e) {
      toast.error("Failed to load HR data");
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Unknown";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = "";
      if (activeTab === "attendance") endpoint = "/attendances";
      if (activeTab === "leaves") endpoint = "/leaves";
      if (activeTab === "payroll") endpoint = "/payrolls";

      if (formData._id) {
        await fetchWithAuth(`${endpoint}/${formData._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success(`${activeTab} updated successfully`);
      } else {
        await fetchWithAuth(endpoint, {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success(`${activeTab} created successfully`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      let endpoint = "";
      if (activeTab === "attendance") endpoint = "/attendances";
      if (activeTab === "leaves") endpoint = "/leaves";
      if (activeTab === "payroll") endpoint = "/payrolls";

      await fetchWithAuth(`${endpoint}/${id}`, { method: "DELETE" });
      toast.success("Record deleted");
      loadData();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const openModalForNew = () => {
    if (activeTab === "attendance") {
      setFormData({
        userId: "",
        date: new Date().toISOString().slice(0, 10),
        status: "PRESENT",
      });
    } else if (activeTab === "leaves") {
      setFormData({
        userId: "",
        startDate: "",
        endDate: "",
        reason: "",
        status: "PENDING",
      });
    } else if (activeTab === "payroll") {
      const d = new Date();
      setFormData({
        userId: "",
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        baseSalary: 0,
        commission: 0,
        deductions: 0,
        netSalary: 0,
        status: "PENDING",
      });
    }
    setIsModalOpen(true);
  };

  // Helpers to calculate net salary dynamically in form
  const handlePayrollChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: Number(value) };
      updated.netSalary =
        (updated.baseSalary || 0) +
        (updated.commission || 0) -
        (updated.deductions || 0);
      return updated;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">
            HR & Payroll
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Manage Workforce
          </p>
        </div>
        <button
          onClick={openModalForNew}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/50 border border-slate-200/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "attendance" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <CheckSquare className="w-4 h-4" /> Attendance
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "leaves" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <Calendar className="w-4 h-4" /> Leaves
        </button>
        <button
          onClick={() => setActiveTab("payroll")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "payroll" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <FileText className="w-4 h-4" /> Payroll
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "attendance" && (
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Check-In / Out</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendances.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                      >
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {attendances.map((a) => (
                    <tr
                      key={a._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {getUserName(a.userId)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${a.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" : a.status === "ABSENT" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {a.checkIn
                          ? new Date(a.checkIn).toLocaleTimeString()
                          : "-"}{" "}
                        /{" "}
                        {a.checkOut
                          ? new Date(a.checkOut).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setFormData({
                                ...a,
                                date: new Date(a.date)
                                  .toISOString()
                                  .slice(0, 10),
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "leaves" && (
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                      >
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {leaves.map((l) => (
                    <tr
                      key={l._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {getUserName(l.userId)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-xs">
                        {new Date(l.startDate).toLocaleDateString()} -{" "}
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                        {l.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${l.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : l.status === "REJECTED" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setFormData({
                                ...l,
                                startDate: new Date(l.startDate)
                                  .toISOString()
                                  .slice(0, 10),
                                endDate: new Date(l.endDate)
                                  .toISOString()
                                  .slice(0, 10),
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(l._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "payroll" && (
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Basic / Comm. / Ded.</th>
                    <th className="px-6 py-4">Net Salary</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                      >
                        No records
                      </td>
                    </tr>
                  ) : null}
                  {payrolls.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {getUserName(p.userId)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {p.month}/{p.year}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {p.baseSalary} / +{p.commission} / -{p.deductions}
                      </td>
                      <td className="px-6 py-4 font-mono font-black text-indigo-600 text-base">
                        {formatAmount(p.netSalary)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${p.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setFormData(p);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {formData._id ? "Edit" : "Add"} {activeTab}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <form id="hrForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Employee *
                  </label>
                  <select
                    required
                    value={formData.userId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, userId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-sans"
                  >
                    <option value="">Select Employee</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {activeTab === "attendance" && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status || "PRESENT"}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                      >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="HALF_DAY">Half Day</option>
                        <option value="ON_LEAVE">On Leave</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "leaves" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.startDate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.endDate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Reason
                      </label>
                      <textarea
                        required
                        value={formData.reason || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, reason: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status || "PENDING"}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "payroll" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Month *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          required
                          value={formData.month || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              month: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Year *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.year || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              year: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-3 lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Base Salary
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.baseSalary || 0}
                          onChange={(e) =>
                            handlePayrollChange("baseSalary", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                      <div className="col-span-3 lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Commission
                        </label>
                        <input
                          type="number"
                          value={formData.commission || 0}
                          onChange={(e) =>
                            handlePayrollChange("commission", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                      <div className="col-span-3 lg:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Deductions
                        </label>
                        <input
                          type="number"
                          value={formData.deductions || 0}
                          onChange={(e) =>
                            handlePayrollChange("deductions", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Net Salary
                      </label>
                      <input
                        type="number"
                        disabled
                        value={formData.netSalary || 0}
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-black text-indigo-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status || "PENDING"}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                      </select>
                    </div>
                  </>
                )}
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hover:bg-slate-100 rounded-xl transition-all tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="hrForm"
                className="px-8 py-3 text-xs font-black text-white uppercase bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 tracking-widest"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
