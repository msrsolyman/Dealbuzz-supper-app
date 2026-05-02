import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    invoices: 0,
    logs: [] as any[]
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, invoices, logs] = await Promise.all([
          fetchWithAuth('/products?limit=1'),
          fetchWithAuth('/invoices?limit=1'),
          fetchWithAuth('/audit-logs?limit=5')
        ]);
        setStats({
          products: products.total || 0,
          invoices: invoices.total || 0,
          logs: logs.data || []
        });
      } catch (e) {
        console.error("Failed to load stats");
      }
    };
    loadStats();
  }, []);

  const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Products</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.products}</div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">+15 new this month</div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Invoices</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.invoices}</div>
          <div className="text-[10px] text-indigo-600 mt-1 font-medium">Pending payments</div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Inventory (FIFO)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">12,890</div>
          <div className="text-[10px] text-amber-600 mt-1 font-medium">8 items low stock</div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Users</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">1</div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">System normal</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[500px]">
        <div className="col-span-2 bg-white border border-slate-200 rounded flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold">Revenue Overview</h3>
            <button className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 px-2 py-1 rounded">Export PDF</button>
          </div>
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} textAnchor="middle" style={{fontSize: '12px', fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} style={{fontSize: '12px', fill: '#64748b'}} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold">Audit Logs (RBAC)</h3>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {stats.logs.map((log: any, index: number) => {
              const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
              const textColors = ['text-indigo-600', 'text-emerald-600', 'text-amber-600', 'text-rose-600', 'text-cyan-600'];
              const badgeColors = ['bg-indigo-50', 'bg-emerald-50', 'bg-amber-50', 'bg-rose-50', 'bg-cyan-50'];
              
              const cIndex = index % bgColors.length;
              
              return (
                <div key={log._id} className="flex gap-3">
                  <div className={`w-1 h-8 ${bgColors[cIndex]} rounded-full mt-1`}></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{log.action} {log.collectionName}</span>
                    <span className="text-[10px] text-slate-500">By: {String(log.userId).slice(0, 8)} • {format(new Date(log.createdAt), 'HH:mm:ss')}</span>
                    {log.documentId && (
                      <span className={`text-[10px] ${textColors[cIndex]} ${badgeColors[cIndex]} px-1 w-fit rounded mt-1 truncate max-w-[150px]`}>
                        ID: {String(log.documentId).slice(0, 12)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {stats.logs.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
