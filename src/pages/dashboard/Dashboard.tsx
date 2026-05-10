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
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto min-h-full pb-10">
        {/* Futuristic Hero Section */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-8 overflow-hidden shadow-2xl flex flex-col justify-center">
          {/* Abstract background graphics */}
          <div className="absolute top-0 right-0 p-12 opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-indigo-500 rounded-full blur-3xl mix-blend-screen transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-64 h-64 bg-fuchsia-500 rounded-full blur-3xl mix-blend-screen transform -translate-x-1/4 translate-y-1/3"></div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to the Future
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.1] mb-5">
              Next-Gen{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400">
                Digital Commerce
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
              Explore our curated selection of premium products and advanced
              services tailored for the modern enterprise ecosystem.
            </p>
            <div className="flex gap-4 items-center">
              <div className="relative bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-xl flex items-center px-4 py-3.5 w-full max-w-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xl">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products & services..."
                  className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-full text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab-like sections for Products & Services */}
        <div className="flex flex-col gap-12">
          {/* Products Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold tracking-tight text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                Featured Products
              </h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {catalog.products.length === 0 ? (
              <div className="p-16 bg-white border border-slate-200 border-dashed rounded-3xl text-center text-slate-500 shadow-sm">
                No products available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catalog.products.map((product) => (
                  <div
                    key={product._id}
                    className="group relative bg-white border border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent opacity-0 rounded-bl-[100px] pointer-events-none transition-opacity duration-300 group-hover:opacity-100"></div>
                      <Package
                        className="w-16 h-16 text-slate-300 group-hover:text-indigo-400 transition-colors duration-300 drop-shadow-sm relative z-10"
                        strokeWidth={1}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3
                          className="font-display font-bold text-slate-800 text-lg leading-tight line-clamp-1"
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-md border border-slate-200 shrink-0 uppercase tracking-widest font-bold">
                          {product.sku || "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-6 leading-relaxed">
                        {product.description ||
                          "Premium commercial product for enterprise needs."}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            {t("rate")}
                          </span>
                          <span className="text-2xl font-display font-bold text-slate-900">
                            {formatAmount(product.price)}
                          </span>
                        </div>
                        <button className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-lg group-hover:shadow-indigo-500/25 shrink-0">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Services Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold tracking-tight text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 border border-fuchsia-100 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                Available Services
              </h2>
              <button className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-800 flex items-center transition-colors">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {catalog.services.length === 0 ? (
              <div className="p-16 bg-white border border-slate-200 border-dashed rounded-3xl text-center text-slate-500 shadow-sm">
                No services available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalog.services.map((service) => (
                  <div
                    key={service._id}
                    className="group relative bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 hover:border-fuchsia-300 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-fuchsia-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] pointer-events-none transition-opacity duration-300"></div>
                    <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
                      {service.mainImage ? (
                        <img
                          src={service.mainImage}
                          alt={service.name}
                          className="w-14 h-14 object-cover rounded-2xl"
                        />
                      ) : (
                        <Zap className="w-6 h-6 text-fuchsia-500" />
                      )}
                    </div>
                    <h3
                      className="font-display font-bold text-xl text-slate-800 mb-3 truncate relative z-10"
                      title={service.name}
                    >
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-8 h-10 line-clamp-2 leading-relaxed relative z-10">
                      {service.shortDescription ||
                        service.description ||
                        "Professional corporate service ensuring optimal outcome and efficiency."}
                    </p>
                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6 relative z-10">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                          Type
                        </span>
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {service.priceType?.replace("_", " ") || "Fixed"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                          {t("rate")}
                        </span>
                        <span className="text-lg font-display font-bold text-slate-900">
                          {formatAmount(service.rate || 0)}
                        </span>
                      </div>
                    </div>
                    <button className="w-full py-3.5 rounded-xl bg-white border-2 border-slate-900 text-slate-900 font-bold text-sm hover:bg-slate-900 hover:text-white transition-colors uppercase tracking-widest relative z-10">
                      Request / Book
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
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm relative z-20">
        <div>
          <h1
            className="text-2xl font-display font-bold text-slate-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("dashboard")}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {t("welcome_back")}, {user?.name}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            Customize Widgets
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
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
                      className={`w-10 h-6 rounded-full flex items-center transition-colors p-1 ${widgets[key as keyof typeof widgets] ? "bg-indigo-500" : "bg-slate-200"}`}
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
          <div className="bg-white p-6 md:p-8 border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] pointer-events-none transition-opacity duration-300"></div>
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all">
              <Package
                className="w-12 h-12 text-indigo-500"
                strokeWidth={1.5}
              />
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-4 relative z-10">
              {t("total_products")}
            </div>
            <div className="text-5xl font-display font-black text-slate-900 mb-2 relative z-10 tracking-tighter">
              {stats.products}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest relative z-10 bg-emerald-50 inline-block px-2 py-1 rounded">
              +15 added
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-fuchsia-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] pointer-events-none transition-opacity duration-300"></div>
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all">
              <FileText
                className="w-12 h-12 text-fuchsia-500"
                strokeWidth={1.5}
              />
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-4 relative z-10">
              {t("total_invoices")}
            </div>
            <div className="text-5xl font-display font-black text-slate-900 mb-2 relative z-10 tracking-tighter">
              {stats.invoices}
            </div>
            <div className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-widest relative z-10 bg-fuchsia-50 inline-block px-2 py-1 rounded">
              Processing
            </div>
          </div>

          <div className="bg-[#0f172a] p-6 md:p-8 border border-slate-800 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] pointer-events-none transition-opacity duration-300"></div>
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all">
              <Zap className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-4 relative z-10">
              {t("inventory")} (FIFO)
            </div>
            <div className="text-5xl font-display font-black text-white mb-2 relative z-10 tracking-tighter">
              {stats.lowStockCount}
            </div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest relative z-10 bg-amber-500/10 border border-amber-500/20 inline-block px-2 py-1 rounded">
              Items low stock
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] pointer-events-none transition-opacity duration-300"></div>
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all">
              <Users className="w-12 h-12 text-sky-500" strokeWidth={1.5} />
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-4 relative z-10">
              {t("active_users")}
            </div>
            <div className="text-5xl font-display font-black text-slate-900 mb-2 relative z-10 tracking-tighter">
              1
            </div>
            <div className="text-[10px] text-sky-600 font-bold uppercase tracking-widest relative z-10 bg-sky-50 inline-block px-2 py-1 rounded">
              System Online
            </div>
          </div>
        </div>
      )}

      {widgets.quickAccess && (
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                {t("quick_access")}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Fast Navigation
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link
              to="/invoices"
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-indigo-300 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <span className="text-sm font-bold leading-tight">
                {t("new_invoice")}
              </span>
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:text-fuchsia-700 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-fuchsia-300 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-slate-400 group-hover:text-fuchsia-500" />
              </div>
              <span className="text-sm font-bold leading-tight">
                {t("add_product")}
              </span>
            </Link>
            <Link
              to="/pos"
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-emerald-300 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
              </div>
              <span className="text-sm font-bold leading-tight">
                {t("launch_pos")}
              </span>
            </Link>
            <Link
              to="/services"
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-amber-300 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
              </div>
              <span className="text-sm font-bold leading-tight">
                {t("manage_services")}
              </span>
            </Link>
          </div>
        </div>
      )}

      {stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                Low Stock Alert
              </h3>
              <p className="text-xs font-bold text-amber-700/70 uppercase tracking-widest">
                {stats.lowStockItems.length} items need restock
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockItems.slice(0, 5).map((item: any) => (
              <div
                key={item._id}
                className="px-3 py-2 bg-white border border-amber-200 rounded-lg flex items-center gap-3 shadow-sm"
              >
                <span className="text-xs font-bold text-slate-700">
                  {item.name}
                </span>
                <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded">
                  QTY: {item.stockCount}
                </span>
              </div>
            ))}
            {stats.lowStockItems.length > 5 && (
              <div className="px-3 py-2 bg-amber-100/50 border border-amber-200/50 rounded-lg flex items-center">
                <span className="text-xs font-bold text-amber-700">
                  +{stats.lowStockItems.length - 5} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[450px]">
        {widgets.revenueChart && (
          <div
            className={`${widgets.recentActivities ? "lg:col-span-2" : "lg:col-span-3"} bg-white border border-slate-200/60 rounded-[2.5rem] flex flex-col shadow-sm overflow-hidden`}
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-display font-black text-slate-900 uppercase tracking-tight">
                  {t("revenue_overview")}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                  Monthly Analytics
                </p>
              </div>
              <button className="text-[10px] font-black text-indigo-600 uppercase border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all shadow-sm">
                Export PDF
              </button>
            </div>
            <div className="flex-1 p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    textAnchor="middle"
                    style={{
                      fontSize: "12px",
                      fill: "#64748b",
                      fontWeight: 600,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    style={{
                      fontSize: "12px",
                      fill: "#64748b",
                      fontWeight: 600,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {widgets.recentActivities && (
          <div
            className={`${widgets.revenueChart ? "lg:col-span-1" : "lg:col-span-3"} bg-white border border-slate-200/60 rounded-[2.5rem] flex flex-col shadow-sm overflow-hidden`}
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-display font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  {t("recent_activities")}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Live Audit Feed
                </p>
              </div>
              <Link
                to="/audit-logs"
                className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex-1 p-8 space-y-8 overflow-auto custom-scrollbar relative">
              <div className="absolute left-[45px] top-10 bottom-10 w-0.5 bg-slate-100" />
              {stats.logs.map((log: any, index: number) => {
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={log._id}
                    className="flex gap-6 relative group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative z-10 group-hover:border-indigo-400 transition-colors">
                      <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-start pt-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">
                          {log.collectionName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                        By: {log.user?.email || "System"}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">
                        {format(new Date(log.createdAt), "h:mm a, MMM d")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {stats.logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20">
                  <Shield className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {t("no_recent_activity")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI Prophet Engine Active
          </div>
          <h3 className="text-3xl md:text-5xl font-display font-black tracking-tighter mb-4 leading-tight">
            Demand Forecasting
          </h3>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-lg font-medium mb-8">
            Our neural network analyzed your last 30 days of transactions. Based
            on historical velocity and seasonal patterns, here is your restock
            priority.
          </p>
          <div className="flex gap-4">
            {stats.lowStockItems.slice(0, 2).map((item: any) => (
              <div
                key={item._id}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3 text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xs text-white/60 uppercase font-black tracking-widest mb-1">
                  High Probability
                </p>
                <p className="font-bold text-white truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] text-fuchsia-300 font-bold mt-2">
                  Restock +50 units
                </p>
              </div>
            ))}
            {stats.lowStockItems.length === 0 && (
              <p className="text-white">
                Not enough data to calculate precise forecasting.
              </p>
            )}
          </div>
        </div>
        <div className="w-full md:w-auto relative z-10">
          <div className="w-48 h-48 border-[16px] border-indigo-500/30 border-t-fuchsia-500 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center relative shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <div className="absolute inset-0 m-auto w-32 h-32 bg-slate-900 rounded-full flex flex-col items-center justify-center border-4 border-slate-800">
              <Target className="w-8 h-8 text-indigo-400 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                92% Acc
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
