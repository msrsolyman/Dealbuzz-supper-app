import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Users as UsersIcon, 
  Calendar,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function SalesTargets() {
  const { formatAmount } = useSettings();
  const { user: currentUser } = useAuth();
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    userId: "",
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    targetAmount: 0,
    achievedAmount: 0,
    notes: ""
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [targetsRes, usersRes] = await Promise.all([
        fetchWithAuth("/sales-targets"),
        fetchWithAuth("/users?role=all")
      ]);
      setTargets(targetsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (target?: any) => {
    if (target) {
      setIsEditing(true);
      setFormData({
        ...target,
        userId: target.userId?._id || target.userId
      });
    } else {
      setIsEditing(false);
      setFormData({
        _id: "",
        userId: "",
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        targetAmount: 0,
        achievedAmount: 0,
        notes: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchWithAuth(`/sales-targets/${formData._id}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
        toast.success("Sales target updated");
      } else {
        await fetchWithAuth("/sales-targets", {
          method: "POST",
          body: JSON.stringify(formData)
        });
        toast.success("Sales target created");
      }
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to save target");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this target?")) return;
    try {
      await fetchWithAuth(`/sales-targets/${id}`, { method: "DELETE" });
      toast.success("Sales target deleted");
      loadData();
    } catch (e) {
      toast.error("Failed to delete target");
    }
  };

  const calculateProgress = (target: any) => {
    if (!target.targetAmount) return 0;
    return Math.min(100, Math.round((target.achievedAmount / target.targetAmount) * 100));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Target className="w-6 h-6" />
            </div>
            Sales Targets
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage and track sales goals for your team members.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Set New Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Progress</p>
              <h4 className="text-2xl font-black text-slate-900">
                {targets.length > 0 ? Math.round(targets.reduce((acc, t) => acc + calculateProgress(t), 0) / targets.length) : 0}%
              </h4>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${targets.length > 0 ? targets.reduce((acc, t) => acc + calculateProgress(t), 0) / targets.length : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Targets Met</p>
              <h4 className="text-2xl font-black text-slate-900">
                {targets.filter(t => calculateProgress(t) >= 100).length} / {targets.length}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Team members who achieved 100% or more.</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Goals</p>
              <h4 className="text-2xl font-black text-slate-900">{targets.length}</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Current active sales targets for this cycle.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-black text-slate-900 uppercase tracking-tight">Active Team Targets</h3>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-600">{months[new Date().getMonth()]} {new Date().getFullYear()}</span>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : targets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">No sales targets set yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target vs Achieved</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {targets.map((target) => {
                  const progress = calculateProgress(target);
                  return (
                    <tr key={target._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                            {(target.userId?.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{target.userId?.name || 'Unknown User'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{target.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-wider border border-slate-200">
                          {months[target.month]} {target.year}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[150px] space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-black">
                            <span className={progress >= 100 ? 'text-emerald-600' : 'text-indigo-600'}>{progress}%</span>
                            <span className="text-slate-300">100%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-slate-900">{formatAmount(target.achievedAmount)}</p>
                          <p className="text-[10px] font-bold text-slate-400">Target: {formatAmount(target.targetAmount)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(target)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(target._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Target Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-8 pb-0">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {isEditing ? "Edit Target" : "Set New Target"}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sales Performance Goal</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Team Member</label>
                      <select
                        required
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select a user...</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Month</label>
                          <select
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                          >
                            {months.map((m, i) => (
                              <option key={m} value={i}>{m}</option>
                            ))}
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Year</label>
                          <input
                            type="number"
                            required
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              value={formData.targetAmount}
                              onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">BDT</span>
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Achieved Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              value={formData.achievedAmount}
                              onChange={(e) => setFormData({ ...formData, achievedAmount: Number(e.target.value) })}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">BDT</span>
                          </div>
                       </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Internal Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any specific context for this target..."
                        rows={3}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3 pb-8">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                      {isEditing ? "Update Target" : "Set Target"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
