import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  BarChart3,
  Calendar,
  FileText,
  Download,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { format, subMonths, isSameMonth } from "date-fns";

export default function Reports() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("sales"); // sales, inventory, profit
  const [timeRange, setTimeRange] = useState("6months");

  const [data, setData] = useState<any>({
    salesByCategory: [],
    monthlyRevenue: [],
    inventoryValuation: 0,
    inventoryByCategory: [],
    profitAndLoss: [],
  });

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // In a real app we would have dedicated reporting endpoints.
      // Here we will fetch products and invoices and aggregate on client side.
      const [productsRes, invoicesRes, accountsRes] = await Promise.all([
        fetchWithAuth("/products?limit=1000"),
        fetchWithAuth("/invoices?limit=1000"),
        fetchWithAuth("/accounts?"),
      ]);

      const products = productsRes.data || [];
      const invoices = invoicesRes.data || [];
      const accounts = accountsRes.data || [];

      // 1. Sales by category
      // Calculate from invoice items that match products
      const categorySales: Record<string, number> = {};

      // 2. Monthly Revenue
      const monthlyData: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        monthlyData[format(d, "MMM yyyy")] = 0;
      }

      invoices.forEach((inv: any) => {
        const monthKey = format(new Date(inv.createdAt), "MMM yyyy");
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += inv.total;
        }

        // For category sales
        inv.items?.forEach((item: any) => {
          // just assuming a category if item matches product name (since we don't have product ref in item natively without complex lookup)
          // Simplified: we will just use the product list to find categories
          const product = products.find((p: any) => p.name === item.name);
          const cat = product?.category || "Uncategorized";
          categorySales[cat] = (categorySales[cat] || 0) + item.total;
        });
      });

      // 3. Inventory Valuation
      let totalValuation = 0;
      const invByCategory: Record<string, number> = {};

      products.forEach((p: any) => {
        const val = p.price * p.stockCount;
        totalValuation += val;
        const cat = p.category || "Uncategorized";
        invByCategory[cat] = (invByCategory[cat] || 0) + val;
      });

      // 4. Profit and Loss
      // Simplified simulation: assuming 30% margin on all sales for cost of goods
      const pnl = Object.keys(monthlyData).map((month) => {
        const rev = monthlyData[month];
        const cost = rev * 0.7; // assuming 70% cost
        const profit = rev - cost;
        return {
          month,
          revenue: rev,
          cost,
          profit,
        };
      });

      // 5. Balance Sheet
      const assets = accounts.filter((a: any) => a.type === "ASSET");
      const liabilities = accounts.filter((a: any) => a.type === "LIABILITY");
      const equity = accounts.filter((a: any) => a.type === "EQUITY");

      const totalAssets = assets.reduce(
        (sum: number, a: any) => sum + a.balance,
        0,
      );
      const totalLiabilities = liabilities.reduce(
        (sum: number, a: any) => sum + a.balance,
        0,
      );
      const totalEquity = equity.reduce(
        (sum: number, a: any) => sum + a.balance,
        0,
      );

      setData({
        salesByCategory: Object.keys(categorySales).map((k) => ({
          name: k,
          value: categorySales[k],
        })),
        monthlyRevenue: Object.keys(monthlyData).map((k) => ({
          month: k,
          revenue: monthlyData[k],
        })),
        inventoryValuation: totalValuation,
        inventoryByCategory: Object.keys(invByCategory).map((k) => ({
          name: k,
          value: invByCategory[k],
        })),
        profitAndLoss: pnl,
        balanceSheet: {
          assets,
          liabilities,
          equity,
          totalAssets,
          totalLiabilities,
          totalEquity,
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#f43f5e",
    "#6366f1",
    "#ec4899",
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">
            Business Reports
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Analytics & Financial Insights
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/50 border border-slate-200/60 rounded-2xl w-fit">
        <button
          onClick={() => setReportType("sales")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === "sales" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <TrendingUp className="w-4 h-4" /> Sales Report
        </button>
        <button
          onClick={() => setReportType("inventory")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === "inventory" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <PieChartIcon className="w-4 h-4" /> Inventory Valuation
        </button>
        <button
          onClick={() => setReportType("profit")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === "profit" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <BarChart3 className="w-4 h-4" /> Profit & Loss
        </button>
        <button
          onClick={() => setReportType("balanceSheet")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === "balanceSheet" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
        >
          <FileText className="w-4 h-4" /> Balance Sheet
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {reportType === "sales" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                        Monthly Revenue
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                        Last 6 Months
                      </p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthlyRevenue}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                          width={60}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "16px",
                            color: "#0f172a",
                            fontSize: "12px",
                            fontWeight: "bold",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                        Sales By Category
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                        All Time
                      </p>
                    </div>
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    {data.salesByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.salesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {data.salesByCategory.map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderColor: "#e2e8f0",
                              borderRadius: "16px",
                              color: "#0f172a",
                              fontSize: "12px",
                              fontWeight: "bold",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              paddingTop: "10px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        No Data Available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {reportType === "inventory" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] pointer-events-none" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mb-2">
                    Total Inventory Value
                  </h3>
                  <div className="text-4xl font-display font-black tracking-tighter">
                    {formatAmount(data.inventoryValuation)}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                      Valuation By Category
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                      Current Stock Value
                    </p>
                  </div>
                </div>
                <div className="h-80 flex justify-center">
                  {data.inventoryByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.inventoryByCategory}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                          width={60}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "16px",
                            color: "#0f172a",
                            fontSize: "12px",
                            fontWeight: "bold",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center">
                      No Data Available
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {reportType === "profit" && (
            <>
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                      Profit & Loss Trend
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                      Last 6 Months
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.profitAndLoss}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          borderRadius: "16px",
                          color: "#0f172a",
                          fontSize: "12px",
                          fontWeight: "bold",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          paddingTop: "10px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#3b82f6",
                          strokeWidth: 2,
                          stroke: "#ffffff",
                        }}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#ef4444",
                          strokeWidth: 2,
                          stroke: "#ffffff",
                        }}
                        name="Cost (Est.)"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#10b981",
                          strokeWidth: 2,
                          stroke: "#ffffff",
                        }}
                        name="Net Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table view */}
              <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                    P&L Summary
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <th className="py-4 px-6 text-left border-b border-slate-100">
                          Period
                        </th>
                        <th className="py-4 px-6 text-right border-b border-slate-100">
                          Revenue
                        </th>
                        <th className="py-4 px-6 text-right border-b border-slate-100">
                          Cost (Est.)
                        </th>
                        <th className="py-4 px-6 text-right border-b border-slate-100">
                          Net Profit
                        </th>
                        <th className="py-4 px-6 text-right border-b border-slate-100">
                          Margin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.profitAndLoss.map((row: any, i: number) => {
                        const margin =
                          row.revenue > 0
                            ? (row.profit / row.revenue) * 100
                            : 0;
                        return (
                          <tr
                            key={i}
                            className="text-sm hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-4 px-6 font-bold text-slate-700">
                              {row.month}
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-bold text-sky-600">
                              {formatAmount(row.revenue)}
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-bold text-rose-600">
                              {formatAmount(row.cost)}
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-black text-emerald-600">
                              {formatAmount(row.profit)}
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-bold text-slate-500">
                              {margin.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {reportType === "balanceSheet" && data.balanceSheet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets & Liabilities */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-sky-50 flex justify-between items-center">
                    <h3 className="font-display font-black text-sky-900 uppercase tracking-tight">
                      Assets
                    </h3>
                    <div className="text-xl font-mono font-black text-sky-700">
                      {formatAmount(data.balanceSheet.totalAssets)}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {data.balanceSheet.assets.map((a: any) => (
                      <div
                        key={a._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          {a.name}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {formatAmount(a.balance)}
                        </span>
                      </div>
                    ))}
                    {data.balanceSheet.assets.length === 0 && (
                      <p className="text-xs text-slate-400">
                        No asset accounts.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-rose-50 flex justify-between items-center">
                    <h3 className="font-display font-black text-rose-900 uppercase tracking-tight">
                      Liabilities
                    </h3>
                    <div className="text-xl font-mono font-black text-rose-700">
                      {formatAmount(data.balanceSheet.totalLiabilities)}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {data.balanceSheet.liabilities.map((a: any) => (
                      <div
                        key={a._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          {a.name}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {formatAmount(a.balance)}
                        </span>
                      </div>
                    ))}
                    {data.balanceSheet.liabilities.length === 0 && (
                      <p className="text-xs text-slate-400">
                        No liability accounts.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Equity & Summary */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-emerald-50 flex justify-between items-center">
                    <h3 className="font-display font-black text-emerald-900 uppercase tracking-tight">
                      Equity
                    </h3>
                    <div className="text-xl font-mono font-black text-emerald-700">
                      {formatAmount(data.balanceSheet.totalEquity)}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {data.balanceSheet.equity.map((a: any) => (
                      <div
                        key={a._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          {a.name}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {formatAmount(a.balance)}
                        </span>
                      </div>
                    ))}
                    {data.balanceSheet.equity.length === 0 && (
                      <p className="text-xs text-slate-400">
                        No equity accounts.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total Assets
                    </span>
                    <span className="text-lg font-mono font-bold text-sky-400">
                      {formatAmount(data.balanceSheet.totalAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total L + E
                    </span>
                    <span className="text-lg font-mono font-bold text-fuchsia-400">
                      {formatAmount(
                        data.balanceSheet.totalLiabilities +
                          data.balanceSheet.totalEquity,
                      )}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest text-white">
                      Equation Match
                    </span>
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${data.balanceSheet.totalAssets === data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {data.balanceSheet.totalAssets ===
                      data.balanceSheet.totalLiabilities +
                        data.balanceSheet.totalEquity
                        ? "BALANCED"
                        : "IMBALANCED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
