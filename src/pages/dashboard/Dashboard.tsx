import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import { fetchWithAuth } from "../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Users,
  FileText,
  ArrowRight,
  Search,
  ShoppingCart,
  Zap,
  Sparkles,
  Shield,
  Settings,
  LayoutGrid,
  Check,
  X,
  PlusCircle,
  Tag,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const [stats, setStats] = useState({
    products: 0,
    invoices: 0,
    lowStockCount: 0,
    lowStockItems: [] as any[],
    logs: [] as any[],
  });
  const [catalog, setCatalog] = useState<{ products: any[]; services: any[] }>({
    products: [],
    services: [],
  });
  const [loading, setLoading] = useState(true);

  // Widget Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState({
    financialMetrics: true,
    quickAccess: true,
    revenueChart: true,
    recentActivities: true,
    demandForecast: true,
  });

  useEffect(() => {
    // Load widget preferences
    const savedWidgets = localStorage.getItem("dashboard_widgets");
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }

    const loadData = async () => {
      try {
        if (user?.role === "customer") {
          const [productsRes, servicesRes] = await Promise.all([
            fetchWithAuth("/products"),
            fetchWithAuth("/services"),
          ]);
          setCatalog({
            products: productsRes.data || [],
            services: servicesRes.data || [],
          });
        } else {
          const [products, invoices, logs] = await Promise.all([
            fetchWithAuth("/products"),
            fetchWithAuth("/invoices?limit=1"),
            fetchWithAuth("/audit-logs?limit=5"),
          ]);

          const rawProducts = products.data || [];
          const lowStockItems = rawProducts.filter(
            (p: any) => p.stockCount <= (p.lowStockThreshold || 5),
          );

          setStats({
            products: products.total || 0,
            invoices: invoices.total || 0,
            lowStockCount: lowStockItems.length,
            lowStockItems: lowStockItems,
            logs: logs.data || [],
          });
        }
      } catch (e: any) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const toggleWidget = (key: keyof typeof widgets) => {
    const newWidgets = { ...widgets, [key]: !widgets[key] };
    setWidgets(newWidgets);
    localStorage.setItem("dashboard_widgets", JSON.stringify(newWidgets));
  };

  const data = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 2000 },
    { name: "Apr", revenue: 2780 },
    { name: "May", revenue: 1890 },
    { name: "Jun", revenue: 2390 },
  ];

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Loading details...</div>
    );

  if (user?.role === "customer") {
    return (
      <div className="flex flex-col gap-8 w-full min-h-full pb-10">
        <div className="bg-white border text-center border-slate-200 rounded-xl p-8 lg:p-12 shadow-sm flex flex-col justify-center items-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
              Explore Our Catalog
            </h1>
            <p className="text-slate-500 text-base md:text-lg mb-8">
              Discover premium products and customized services designed for modern enterprises.
            </p>
            <div className="relative flex items-center w-full max-w-lg mx-auto">
              <Search className="absolute left-3 w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search products & services..."
                className="w-full bg-[#FAFAFA] border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Featured Products
              </h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {catalog.products.length === 0 ? (
              <div className="p-12 bg-white border border-slate-200 border-dashed rounded-xl text-center text-slate-500 shadow-sm text-sm">
                No products available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {catalog.products.map((product) => (
                  <div
                    key={product._id}
                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#FAFAFA] border-b border-slate-100 p-6 flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 transition-colors duration-200" strokeWidth={1.5} />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-semibold text-slate-900 text-base leading-tight line-clamp-1" title={product.name}>
                          {product.name}
                        </h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded border border-slate-200 shrink-0 font-medium">
                          {product.sku || "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                        {product.description || "Premium commercial product for enterprise needs."}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">
                            {t("rate")}
                          </span>
                          <span className="text-lg font-semibold text-slate-900">
                            {formatAmount(product.price)}
                          </span>
                        </div>
                        <button className="w-9 h-9 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm shrink-0">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                Available Services
              </h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {catalog.services.length === 0 ? (
              <div className="p-12 bg-white border border-slate-200 border-dashed rounded-xl text-center text-slate-500 shadow-sm text-sm">
                No services available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalog.services.map((service) => (
                  <div
                    key={service._id}
                    className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    <div className="w-12 h-12 bg-[#FAFAFA] rounded-xl border border-slate-200 flex items-center justify-center mb-5 shrink-0 group-hover:scale-105 transition-transform">
                      {service.mainImage ? (
                        <img
                          src={service.mainImage}
                          alt={service.name}
                          className="w-12 h-12 object-cover rounded-xl"
                        />
                      ) : (
                        <Zap className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-1" title={service.name}>
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                      {service.shortDescription || service.description || "Professional corporate service ensuring optimal outcome and efficiency."}
                    </p>
                    <div className="flex items-center justify-between bg-[#FAFAFA] p-3.5 rounded-lg border border-slate-200 mb-5">
                      <div>
                        <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">
                          Type
                        </span>
                        <span className="text-sm font-semibold text-slate-800 capitalize">
                          {service.priceType?.replace("_", " ") || "Fixed"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">
                          {t("rate")}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatAmount(service.rate || 0)}
                        </span>
                      </div>
                    </div>
                    <button className="w-full py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-medium text-sm hover:bg-slate-50 hover:border-slate-400 transition-colors mt-auto">
                      Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden font-sans">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-6 relative z-20">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
            {t("dashboard")}
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">
            {t("welcome_back")}, {user?.name}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Customize Layout
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> Layout Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries({
                  financialMetrics: "Financial Metrics",
                  quickAccess: "Quick Access",
                  revenueChart: "Revenue Overview",
                  recentActivities: "Recent Activities",
                  demandForecast: "AI Demand Forecast",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                      {label}
                    </span>
                    <div
                      onClick={() => toggleWidget(key as keyof typeof widgets)}
                      className={`w-9 h-5 rounded-full flex items-center transition-colors p-[2px] ${widgets[key as keyof typeof widgets] ? "bg-emerald-500" : "bg-slate-200"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${widgets[key as keyof typeof widgets] ? "translate-x-4" : "translate-x-0"}`}
                      ></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {widgets.financialMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-slate-500">
                {t("total_products")}
              </div>
              <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-mono font-medium text-slate-900 tracking-tight">
                {stats.products}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                +15 added this month
              </div>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-slate-500">
                {t("total_invoices")}
              </div>
              <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-mono font-medium text-slate-900 tracking-tight">
                {stats.invoices}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                3 processing
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl shadow-sm flex flex-col justify-between text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-slate-400">
                Low Stock (FIFO)
              </div>
              <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-mono font-medium text-white tracking-tight">
                {stats.lowStockCount}
              </div>
              <div className="text-xs text-amber-400 font-medium mt-1">
                Needs attention
              </div>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-slate-500">
                {t("active_users")}
              </div>
              <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-mono font-medium text-slate-900 tracking-tight">
                1
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> System Online
              </div>
            </div>
          </div>
        </div>
      )}

      {widgets.quickAccess && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="font-semibold text-slate-800">
              {t("quick_access")}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/invoices"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-[#FAFAFA] hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900">{t("new_invoice")}</span>
                <span className="block text-xs text-slate-500 mt-0.5">Create billing</span>
              </div>
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-[#FAFAFA] hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900">{t("add_product")}</span>
                <span className="block text-xs text-slate-500 mt-0.5">Manage inventory</span>
              </div>
            </Link>
            <Link
              to="/pos"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-[#FAFAFA] hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900">{t("launch_pos")}</span>
                <span className="block text-xs text-slate-500 mt-0.5">Point of Sale</span>
              </div>
            </Link>
            <Link
              to="/services"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-[#FAFAFA] hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-900">{t("manage_services")}</span>
                <span className="block text-xs text-slate-500 mt-0.5">Service catalog</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-900">
              Low Stock Alert ({stats.lowStockItems.length} items)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockItems.slice(0, 5).map((item: any) => (
              <div
                key={item._id}
                className="px-3 py-1.5 bg-white border border-amber-200 rounded-md flex items-center gap-3 shadow-sm"
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-[10px] font-mono font-medium bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100">
                  QTY: {item.stockCount}
                </span>
              </div>
            ))}
            {stats.lowStockItems.length > 5 && (
              <div className="px-3 py-1.5 bg-amber-100/50 border border-amber-200/50 rounded-md flex items-center">
                <span className="text-xs font-medium text-amber-800">
                  +{stats.lowStockItems.length - 5} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {widgets.demandForecast && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-semibold text-slate-900 text-lg tracking-tight mb-1">AI Demand Forecast</h3>
            <p className="text-slate-500 text-sm mb-6">Predictions based on historical sales trends</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#FAFAFA] rounded-md p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" /> High Demand
                </p>
                <p className="font-medium text-slate-800 text-sm">Premium Wireless Headphones</p>
                <div className="mt-2 text-emerald-600 text-[11px] font-mono font-medium">
                  +25% Next Week
                </div>
              </div>
              
              <div className="bg-[#FAFAFA] rounded-md p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" /> Trending Up
                </p>
                <p className="font-medium text-slate-800 text-sm">Smart Watch Series 5</p>
                <div className="mt-2 text-emerald-600 text-[11px] font-mono font-medium">
                  +18% Next Week
                </div>
              </div>

              <div className="bg-[#FAFAFA] rounded-md p-4 border border-slate-200 hover:border-slate-300 transition-colors hidden sm:block">
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                  <Target className="w-3 h-3 text-rose-500" /> Falling Demand
                </p>
                <p className="font-medium text-slate-800 text-sm">Basic Wired Earphones</p>
                <div className="mt-2 text-rose-600 text-[11px] font-mono font-medium">
                  -10% Next Week
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[400px]">
        {widgets.revenueChart && (
          <div
            className={`${widgets.recentActivities ? "lg:col-span-2" : "lg:col-span-3"} bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden`}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 tracking-tight">
                  {t("revenue_overview")}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Monthly Analytics
                </p>
              </div>
              <button className="text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                Export
              </button>
            </div>
            <div className="flex-1 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {widgets.recentActivities && (
          <div
            className={`${widgets.revenueChart ? "lg:col-span-1" : "lg:col-span-3"} bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden`}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  {t("recent_activities")}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Audit Feed
                </p>
              </div>
              <Link
                to="/audit-logs"
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="View All"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar relative">
              <div className="absolute left-[31px] top-8 bottom-8 w-px bg-slate-200" />
              {stats.logs.map((log: any, index: number) => {
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={log._id}
                    className="flex gap-4 relative group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 relative z-10">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex flex-col justify-start pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-800 capitalize">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.collectionName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        By {log.user?.email || "System"}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {format(new Date(log.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {stats.logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-10">
                  <Shield className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-xs font-medium text-slate-500">
                    {t("no_recent_activity")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
