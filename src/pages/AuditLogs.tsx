import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchWithAuth('/audit-logs');
        setLogs(data.data);
      } catch (e: any) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">System Audit Logs</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-bold tracking-wider">Timestamp</th>
              <th className="px-4 py-2 font-bold tracking-wider">Action</th>
              <th className="px-4 py-2 font-bold tracking-wider">Module / Collection</th>
              <th className="px-4 py-2 font-bold tracking-wider">User ID / IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{format(new Date(log.createdAt), 'MMM d, yyyy h:mm:ss a')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold 
                    ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' : 
                      log.action === 'UPDATE' ? 'bg-indigo-100 text-indigo-700' : 
                      log.action === 'DELETE' ? 'bg-rose-100 text-rose-700' : 
                      'bg-purple-100 text-purple-700'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{log.collectionName}</td>
                <td className="px-4 py-3">
                  <div className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1 w-fit rounded">{log.userId}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{log.ipAddress}</div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No audit logs found.</td></tr>
            )}
            {loading && <tr><td colSpan={4} className="px-4 py-6 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
