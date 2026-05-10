import { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

import { Shield } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchWithAuth("/audit-logs");
        setLogs(data.data);
      } catch (e: any) {
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl flex flex-col h-full overflow-hidden shadow-sm font-sans">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-bold">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-sm relative overflow-hidden">
            <Shield className="w-5 h-5 relative z-10 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            System Audit Logs
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Timestamp</th>
              <th className="px-6 py-4 font-bold">Action</th>
              <th className="px-6 py-4 font-bold">Module / Collection</th>
              <th className="px-6 py-4 font-bold">User ID / IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr
                key={log._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                  {format(new Date(log.createdAt), "MMM d, yyyy h:mm:ss a")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border 
                    ${
                      log.action === "CREATE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : log.action === "UPDATE"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : log.action === "DELETE"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-purple-50 text-purple-700 border-purple-100"
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {log.collectionName}
                </td>
                <td className="px-6 py-4">
                  <div
                    className="font-mono text-xs font-medium text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block truncate max-w-[200px]"
                    title={log.userId}
                  >
                    {log.userId}
                  </div>
                  <div className="font-mono text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                    {log.ipAddress}
                  </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading audit logs...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
