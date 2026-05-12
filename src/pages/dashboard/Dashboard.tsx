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
import { Link } from "react-router-dom";

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
    salesTargets: true,
  });

  const [salesTargets, setSalesTargets] = useState<any[]>([]);

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
          const [products, invoices, logs, targets] = await Promise.all([
            fetchWithAuth("/products"),
            fetchWithAuth("/invoices?limit=1"),
            fetchWithAuth("/audit-logs?limit=5"),
            fetchWithAuth("/sales-targets"),
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
          setSalesTargets(targets.data || []);
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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-[1.1] mb-4">
              Next-Gen{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400">
                Digital Commerce
              </span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base mb-6 max-w-xl leading-relaxed">
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold tracking-tight text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                  <Package className="w-4 h-4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold tracking-tight text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 border border-fuchsia-100 shadow-sm">
                  <Zap className="w-4 h-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
    <div className="space-y-8 overflow-hidden font-sans pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-20">
        <div>
          <h1
            className="text-3xl font-display font-black text-slate-900 tracking-tight"
          >
            {t("dashboard")}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {t("welcome_back")}, {user?.name}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm border border-slate-200/60 hover:shadow-md"
          >
            <Settings className="w-4 h-4 text-indigo-500" />
            Customize Layout
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-3 w-72 bg-white/90 backdrop-blur-xl border border-white rounded-2xl shadow-2xl z-50 p-5 transform origin-top-right transition-all">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-500" /> Active Widgets
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries({
                  financialMetrics: "Financial Metrics",
                  quickAccess: "Quick Access",
                  revenueChart: "Revenue Overview",
                  recentActivities: "Recent Activities",
                  salesTargets: "Sales Targets",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                      {label}
                    </span>
                    <div
                      onClick={() => toggleWidget(key as keyof typeof widgets)}
                      className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 shadow-inner ${widgets[key as keyof typeof widgets] ? "bg-indigo-500" : "bg-slate-200"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${widgets[key as keyof typeof widgets] ? "translate-x-5" : "translate-x-0"}`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/50 backdrop-blur-sm p-6 border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full pointer-events-none transition-opacity duration-500"></div>
            <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 text-indigo-500">
              <Package
                className="w-10 h-10"
                strokeWidth={1.5}
              />
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-3 relative z-10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              {t("total_products")}
            </div>
            <div className="text-4xl font-display font-black text-slate-900 mb-3 relative z-10 tracking-tight">
              {stats.products}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest relative z-10 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +15 added
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-fuchsia-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full pointer-events-none transition-opacity duration-500"></div>
            <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 text-fuchsia-500">
              <FileText
                className="w-10 h-10"
                strokeWidth={1.5}
              />
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-3 relative z-10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>
              {t("total_invoices")}
            </div>
            <div className="text-4xl font-display font-black text-slate-900 mb-3 relative z-10 tracking-tight">
              {stats.invoices}
            </div>
            <div className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-widest relative z-10 flex items-center gap-1">
              Processing
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 border border-slate-700 shadow-xl rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full pointer-events-none transition-opacity duration-500"></div>
            <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 text-amber-500">
              <Zap className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <div className="text-[11px] text-slate-300 uppercase font-black tracking-widest mb-3 relative z-10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              {t("inventory")} <span className="opacity-50">(FIFO)</span>
            </div>
            <div className="text-4xl font-display font-black text-white mb-3 relative z-10 tracking-tight">
              {stats.lowStockCount}
            </div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest relative z-10 flex items-center gap-1">
              Items low stock
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full pointer-events-none transition-opacity duration-500"></div>
            <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 text-sky-500">
              <Users className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-3 relative z-10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              {t("active_users")}
            </div>
            <div className="text-4xl font-display font-black text-slate-900 mb-3 relative z-10 tracking-tight">
              1
            </div>
            <div className="text-[10px] text-sky-600 font-bold uppercase tracking-widest relative z-10 flex items-center gap-1">
              System Online
            </div>
          </div>
        </div>
      )}

      {widgets.quickAccess && (
        <div className="bg-white/50 backdrop-blur-md border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-xl tracking-tight">
                {t("quick_access")}
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Jump directly into daily workflows
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/invoices"
              className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <PlusCircle className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 mb-1">
                  {t("new_invoice")}
                </span>
                <span className="text-sm text-slate-500 font-medium">Create and send</span>
              </div>
            </Link>
            <Link
              to="/products"
              className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-fuchsia-300 hover:shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-fuchsia-500" />
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 mb-1">
                  {t("add_product")}
                </span>
                <span className="text-sm text-slate-500 font-medium">Update inventory</span>
              </div>
            </Link>
            <Link
              to="/pos"
              className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 mb-1">
                  {t("launch_pos")}
                </span>
                <span className="text-sm text-slate-500 font-medium">Ring up sales directly</span>
              </div>
            </Link>
            <Link
              to="/services"
              className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Tag className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <span className="block text-base font-bold text-slate-900 mb-1">
                  {t("manage_services")}
                </span>
                <span className="text-sm text-slate-500 font-medium">Add service offerings</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {widgets.salesTargets && salesTargets.length > 0 && (
        <div className="bg-white/50 backdrop-blur-md border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-xl tracking-tight">Sales Goals Progress</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Current team member target status</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesTargets.slice(0, 3).map((target) => {
              const progress = Math.min(100, Math.round((target.achievedAmount / target.targetAmount) * 100));
              return (
                <div key={target._id} className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{target.userId?.name || 'Team Member'}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(0, target.month).toLocaleString('default', { month: 'long' })} {target.year}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${progress >= 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {progress}%
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">{formatAmount(target.achievedAmount)} achieved</span>
                      <span className="font-black text-slate-400 uppercase tracking-widest">{formatAmount(target.targetAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-900 uppercase tracking-tight">
                  Low Stock Alert
                </h3>
                <p className="text-[11px] font-bold text-amber-700/70 uppercase tracking-widest mt-0.5">
                  {stats.lowStockItems.length} items need restock
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 flex-1 md:justify-end">
              {stats.lowStockItems.slice(0, 5).map((item: any) => (
                <div
                  key={item._id}
                  className="px-4 py-2.5 bg-white border border-amber-200/60 rounded-xl flex items-center gap-3 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded uppercase tracking-wider">
                    QTY: {item.stockCount}
                  </span>
                </div>
              ))}
              {stats.lowStockItems.length > 5 && (
                <div className="px-4 py-2.5 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center min-w-[3rem]">
                  <span className="text-xs font-bold text-amber-700">
                    +{stats.lowStockItems.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:h-[450px]">
        {widgets.revenueChart && (
          <div
            className={`${widgets.recentActivities ? "lg:col-span-2" : "lg:col-span-3"} bg-white/50 backdrop-blur-md border border-white rounded-[2.5rem] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden`}
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-tight">
                  {t("revenue_overview")}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                  Monthly Analytics
                </p>
              </div>
              <button className="text-[10px] font-black text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all shadow-sm">
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
                    tickFormatter={(value) => `$${value}`}
                    style={{
                      fontSize: "12px",
                      fill: "#64748b",
                      fontWeight: 600,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9", radius: 8 }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontWeight: 600,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#6366f1"
                    radius={[8, 8, 8, 8]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {widgets.recentActivities && (
          <div
            className={`${widgets.revenueChart ? "lg:col-span-1" : "lg:col-span-3"} bg-white/50 backdrop-blur-md border border-white rounded-[2.5rem] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden`}
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="font-display font-black text-slate-900 flex items-center gap-2 text-lg tracking-tight">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  {t("recent_activities")}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Live Audit Feed
                </p>
              </div>
              <Link
                to="/audit-logs"
                className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex-1 p-8 pb-4 space-y-6 overflow-auto custom-scrollbar relative">
              <div className="absolute left-[45px] top-10 bottom-10 w-px bg-slate-200" />
              {stats.logs.map((log: any, index: number) => {
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={log._id}
                    className="flex gap-4 relative group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm relative z-10 group-hover:border-indigo-400 group-hover:shadow-indigo-500/20 transition-all">
                      <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex flex-col justify-start pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest border border-slate-200">
                          {log.collectionName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-1">
                        User: {log.user?.email || "System"}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block flex items-center gap-1">
                        {format(new Date(log.createdAt), "h:mm a, MMM d")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {stats.logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
                  <Shield className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    {t("no_recent_activity")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-[2rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4 rounded">
            <Sparkles className="w-3 h-3" /> AI Engine Active
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-black tracking-tighter mb-3 leading-tight">
            Demand Forecasting
          </h3>
          <p className="text-indigo-200 text-xs md:text-sm leading-relaxed max-w-lg font-medium mb-6">
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
