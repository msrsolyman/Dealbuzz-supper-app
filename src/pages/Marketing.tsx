import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import { useTranslation } from "react-i18next";
import { Send, Plus, Trash2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Marketing() {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "EMAIL",
    targetAudience: "ALL",
    message: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/campaigns");
      setCampaigns(res.data);
    } catch (e) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/campaigns", {
        method: "POST",
        body: JSON.stringify({ ...formData, status: "SENT" }), // Simulate instant send
      });
      toast.success("Campaign Sent Successfully!");
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete campaign?")) return;
    try {
      await fetchWithAuth(`/campaigns/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      loadData();
    } catch (e) {
      toast.error("Failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Marketing Hub
          </h1>
          <p className="text-sm font-medium text-white/80">
            Connect with customers via SMS and Email Campaigns
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: "",
              type: "EMAIL",
              targetAudience: "ALL",
              message: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-white text-indigo-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-black/10"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold uppercase">
            Loading...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              No Campaigns Yet
            </h3>
            <p className="text-sm text-slate-500">
              Create your first marketing campaign to boost sales.
            </p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div
              key={c._id}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.type === "EMAIL" ? "bg-fuchsia-50 text-fuchsia-600" : "bg-amber-50 text-amber-600"}`}
              >
                {c.type === "EMAIL" ? (
                  <Mail className="w-6 h-6" />
                ) : (
                  <MessageSquare className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">{c.name}</h3>
                <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <span>Target: {c.targetAudience}</span>
                  <span>•</span>
                  <span className="text-emerald-500">{c.status}</span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-medium">
                {new Date(c.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={() => handleDelete(c._id)}
                className="text-slate-400 hover:text-rose-600 ml-4 p-2 bg-slate-50 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Create Campaign
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Campaign Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                  placeholder="e.g. Eid Mega Sale"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="EMAIL">Email Blast</option>
                    <option value="SMS">SMS Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Contacts</option>
                    <option value="CUSTOMERS">Customers Only</option>
                    <option value="LEADS">Leads/Prospects</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 resize-none"
                  placeholder="Write your promotional message here..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
