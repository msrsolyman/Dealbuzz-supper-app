import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Legend
} from 'recharts';
import { 
    TrendingUp, Package, Users, DollarSign, Download, Activity as ActivityIcon, FileText, ArrowUpRight, ArrowDownRight, Printer
} from 'lucide-react';
import { format } from 'date-fns';
import * as xlsx from 'xlsx';

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDocs = async () => {
            try {
                const res = await fetchWithAuth('/analytics/dashboard');
                setData(res);
            } catch (error: any) {
                toast.error("Failed to load analytics data: " + error.message);
            } finally {
                setLoading(false);
            }
        };
        loadDocs();
    }, []);

    const handleExportExcel = () => {
        if (!data) return;
        const ws = xlsx.utils.json_to_sheet(data.salesOverTime);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Sales");
        xlsx.writeFile(wb, `SalesAnalytics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        toast.success("Excel exported successfully");
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">No data available</div>;

    const { summary, salesOverTime, topProducts, recentActivity } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Advanced Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time business performance and metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
                        <Printer className="w-4 h-4" />
                        Print/PDF
                    </button>
                    <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm shadow-sm shadow-emerald-600/20">
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-slate-900">${summary.totalRevenue?.toLocaleString()}</h3>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                        <span className="text-emerald-500 font-medium">+${summary.recentRevenue?.toLocaleString()}</span>
                        <span className="text-slate-500 ml-2">last 30 days</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Customers</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary.totalCustomers}</h3>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                        <span className="text-emerald-500 font-medium">+{summary.recentCustomers}</span>
                        <span className="text-slate-500 ml-2">last 30 days</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Products Configured</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary.totalProducts}</h3>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                        Across all categories
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Inventory Value</p>
                            <h3 className="text-2xl font-bold text-slate-900">${summary.inventoryValuation?.toLocaleString()}</h3>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                        Based on current stock
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Over Time (Last 30 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Top Selling Products</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [value, 'Units Sold']}
                                />
                                <Bar dataKey="sold" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Recent System Activity</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ActivityIcon className="w-4 h-4" />
                        Live Feed
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Time</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3 rounded-r-lg">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentActivity.map((log: any) => (
                                <tr key={log._id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-500">
                                        {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold
                                            ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                              log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                              'bg-slate-100 text-slate-700'}`}>
                                            {log.action} {log.collectionName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {log.userId?.name || 'System / Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 truncate max-w-xs" title={log.documentId}>
                                        {log.documentId}
                                    </td>
                                </tr>
                            ))}
                            {recentActivity.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                        No recent activity
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Custom Print Styles included locally since we want it for this component specifically */}
            <style>
                {`
                @media print {
                    body {
                        background: white !important;
                    }
                    .shadow-sm, .shadow {
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    button {
                        display: none !important;
                    }
                }
                `}
            </style>
        </div>
    );
}
