import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Users, FileText, ArrowRight, Search, ShoppingCart, Zap, Sparkles, Shield, Settings, LayoutGrid, Check, X, PlusCircle, Tag, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    invoices: 0,
    logs: [] as any[]
  });
  const [catalog, setCatalog] = useState<{products: any[], services: any[]}>({ products: [], services: [] });
  const [loading, setLoading] = useState(true);

  // Widget Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState({
    financialMetrics: true,
    quickAccess: true,
    revenueChart: true,
    recentActivities: true
  });

  useEffect(() => {
    // Load widget preferences
    const savedWidgets = localStorage.getItem('dashboard_widgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }

    const loadData = async () => {
      try {
        if (user?.role === 'customer') {
          const [productsRes, servicesRes] = await Promise.all([
            fetchWithAuth('/products'),
            fetchWithAuth('/services')
          ]);
          setCatalog({
            products: productsRes.data || [],
            services: servicesRes.data || []
          });
        } else {
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
    localStorage.setItem('dashboard_widgets', JSON.stringify(newWidgets));
  };


  const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;

  if (user?.role === 'customer') {
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
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400">Digital Commerce</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
              Explore our curated selection of premium products and advanced services tailored for the modern enterprise ecosystem.
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
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm"><Package className="w-5 h-5" /></div>
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
                {catalog.products.map(product => (
                  <div key={product._id} className="group relative bg-white border border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300">
                    <div className="aspect-[4/3] bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent opacity-0 rounded-bl-[100px] pointer-events-none transition-opacity duration-300 group-hover:opacity-100"></div>
                      <Package className="w-16 h-16 text-slate-300 group-hover:text-indigo-400 transition-colors duration-300 drop-shadow-sm relative z-10" strokeWidth={1} />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-display font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={product.name}>{product.name}</h3>
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-md border border-slate-200 shrink-0 uppercase tracking-widest font-bold">
                          {product.sku || 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-6 leading-relaxed">
                        {product.description || 'Premium commercial product for enterprise needs.'}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
                          <span className="text-2xl font-display font-bold text-slate-900">${product.price.toFixed(2)}</span>
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
                <div className="w-10 h-10 rounded-xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 border border-fuchsia-100 shadow-sm"><Zap className="w-5 h-5" /></div>
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
                {catalog.services.map(service => (
                  <div key={service._id} className="group relative bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 hover:border-fuchsia-300 transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-fuchsia-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] pointer-events-none transition-opacity duration-300"></div>
                    <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
                      {service.mainImage ? (
                         <img src={service.mainImage} alt={service.name} className="w-14 h-14 object-cover rounded-2xl" />
                      ) : (
                         <Zap className="w-6 h-6 text-fuchsia-500" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-800 mb-3 truncate relative z-10" title={service.name}>{service.name}</h3>
                    <p className="text-sm text-slate-500 mb-8 h-10 line-clamp-2 leading-relaxed relative z-10">
                        {service.shortDescription || service.description || 'Professional corporate service ensuring optimal outcome and efficiency.'}
                    </p>
                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6 relative z-10">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Type</span>
                        <span className="text-sm font-semibold text-slate-700 capitalize">{service.priceType?.replace('_', ' ') || 'Fixed'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Rate</span>
                        <span className="text-lg font-display font-bold text-slate-900">${(service.rate || 0).toFixed(2)}</span>
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
          <h1 className="text-2xl font-display font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Welcome back, {user?.name}</p>
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
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Layout Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {Object.entries({
                  financialMetrics: 'Financial Metrics',
                  quickAccess: 'Quick Access',
                  revenueChart: 'Revenue Overview',
                  recentActivities: 'Recent Activities'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{label}</span>
                    <div 
                      onClick={() => toggleWidget(key as keyof typeof widgets)}
                      className={`w-10 h-6 rounded-full flex items-center transition-colors p-1 ${widgets[key as keyof typeof widgets] ? 'bg-indigo-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${widgets[key as keyof typeof widgets] ? 'translate-x-4' : 'translate-x-0'}`}></div>
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
          <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Package className="w-16 h-16 text-indigo-500 transform rotate-12" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 relative z-10">Total Products</div>
            <div className="text-4xl font-display font-bold text-slate-900 mb-1 relative z-10">{stats.products}</div>
            <div className="text-xs text-emerald-600 font-semibold relative z-10">+15 new this month</div>
          </div>
          
          <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <FileText className="w-16 h-16 text-fuchsia-500 transform -rotate-12" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 relative z-10">Total Invoices</div>
            <div className="text-4xl font-display font-bold text-slate-900 mb-1 relative z-10">{stats.invoices}</div>
            <div className="text-xs text-indigo-600 font-semibold relative z-10">Pending payments</div>
          </div>
          
          <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap className="w-16 h-16 text-amber-500 transform rotate-6" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 relative z-10">Inventory (FIFO)</div>
            <div className="text-4xl font-display font-bold text-slate-900 mb-1 relative z-10">12,890</div>
            <div className="text-xs text-amber-600 font-semibold relative z-10">8 items low stock</div>
          </div>
          
          <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Users className="w-16 h-16 text-sky-500 transform -rotate-6" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 relative z-10">Active Users</div>
            <div className="text-4xl font-display font-bold text-slate-900 mb-1 relative z-10">1</div>
            <div className="text-xs text-slate-400 font-semibold relative z-10">System normal</div>
          </div>
        </div>
      )}

      {widgets.quickAccess && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/invoices" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors group">
              <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-2" />
              <span className="text-sm font-semibold">New Invoice</span>
            </Link>
            <Link to="/products" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:text-fuchsia-700 transition-colors group">
              <Package className="w-6 h-6 text-slate-400 group-hover:text-fuchsia-500 mb-2" />
              <span className="text-sm font-semibold">Add Product</span>
            </Link>
            <Link to="/pos" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors group">
              <ShoppingCart className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-2" />
              <span className="text-sm font-semibold">Launch POS</span>
            </Link>
            <Link to="/services" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors group">
              <Tag className="w-6 h-6 text-slate-400 group-hover:text-amber-500 mb-2" />
              <span className="text-sm font-semibold">Manage Services</span>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[450px]">
        {widgets.revenueChart && (
          <div className={`${widgets.recentActivities ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-slate-200/60 rounded-2xl flex flex-col shadow-sm`}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-display font-bold text-slate-800">Revenue Overview</h3>
              <button className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">Export PDF</button>
            </div>
            <div className="flex-1 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} textAnchor="middle" style={{fontSize: '12px', fill: '#64748b', fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} style={{fontSize: '12px', fill: '#64748b', fontWeight: 600}} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {widgets.recentActivities && (
          <div className={`${widgets.revenueChart ? 'lg:col-span-1' : 'lg:col-span-3'} bg-white border border-slate-200/60 rounded-2xl flex flex-col shadow-sm`}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Activities
              </h3>
              <Link to="/audit-logs" className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-800 transition-colors">View All</Link>
            </div>
            <div className="flex-1 p-5 space-y-5 overflow-auto custom-scrollbar">
              {stats.logs.map((log: any, index: number) => {
                const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-sky-500'];
                const textColors = ['text-indigo-600', 'text-emerald-600', 'text-fuchsia-600', 'text-rose-600', 'text-sky-600'];
                const badgesBg = ['bg-indigo-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-rose-50', 'bg-sky-50'];
                
                const cIndex = index % bgColors.length;
                
                return (
                  <div key={log._id} className="flex gap-4 group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badgesBg[cIndex]} ${textColors[cIndex]}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-sm font-bold text-slate-800">{log.action} <span className="opacity-70">{log.collectionName}</span></span>
                      <span className="text-xs text-slate-500 font-medium">By: {String(log.userId).slice(0, 8)} • {format(new Date(log.createdAt), 'HH:mm')}</span>
                    </div>
                  </div>
                );
              })}
              {stats.logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Shield className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No recent activity.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

