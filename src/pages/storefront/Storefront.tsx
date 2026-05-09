import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useSearchParams } from 'react-router';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, Search, CreditCard, ShoppingBag, Briefcase, Star, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Storefront() {
  const { formatAmount } = useSettings();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>('all');
  const [offers, setOffers] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (offers.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [offers]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'products' || tabParam === 'services') {
      setActiveTab(tabParam as 'products' | 'services');
    } else {
      setActiveTab('all');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'all' | 'products' | 'services') => {
    setActiveTab(tab);
    if (tab === 'all') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, servRes, offersRes] = await Promise.all([
        fetchWithAuth('/products?limit=100'),
        fetchWithAuth('/services?limit=100'),
        fetchWithAuth('/offers?status=ACTIVE&limit=10')
      ]);
      const prods = (prodRes.data || []).map((p: any) => ({ ...p, itemType: 'Product', sellPrice: p.price }));
      const servs = (servRes.data || []).map((s: any) => ({ ...s, itemType: 'Service', sellPrice: s.rate }));
      setItems([...prods, ...servs]);
      
      const activeOffers = (offersRes.data || []).sort((a: any, b: any) => a.priority - b.priority);
      setOffers(activeOffers);
    } catch (e) {
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) {
        return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i._id === id) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i._id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const invoiceData = {
        customerId: user?._id || undefined, // customerId is optional if not strictly tracked or we can enforce it.
        items: cart.map(i => ({
          itemId: i._id,
          itemType: i.itemType,
          name: i.name,
          quantity: i.qty,
          rate: i.sellPrice,
          total: i.qty * i.sellPrice
        })),
        subtotal: cartTotal,
        tax: 0,
        discount: 0,
        total: cartTotal,
        dueDate: new Date(),
        status: 'OPEN',
        paymentMethod: 'bKash' // default
      };

      await fetchWithAuth('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData)
      });
      toast.success('Order placed successfully! Check your invoices.');
      setCart([]);
      setIsCartOpen(false);
    } catch (e) {
      toast.error('Failed to place order');
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                        (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
    const matchTab = activeTab === 'all' || 
                     (activeTab === 'products' && item.itemType === 'Product') || 
                     (activeTab === 'services' && item.itemType === 'Service');
    return matchSearch && matchTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Navbar Header */}
      <div className="flex justify-between items-center bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Dealbuzz</h1>
            <p className="text-sm font-medium text-slate-500">Premium Storefront</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-slate-700" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Promotional Slideshow */}
      {offers.filter(o => activeTab === 'all' || o.type.toLowerCase() === activeTab.replace(/s$/, '')).length > 0 ? (
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl h-[400px]">
          {offers.filter(o => activeTab === 'all' || o.type.toLowerCase() === activeTab.replace(/s$/, '')).map((offer, index) => (
            <div 
              key={offer._id} 
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              style={{
                backgroundImage: offer.bannerImage ? `url(${offer.bannerImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: offer.bannerImage ? '#000' : (offer.type === 'Service' ? '#4a044e' : '#312e81')
              }}
            >
              <div className="absolute inset-0 bg-black/50 mix-blend-multiply"></div>
              <div className="relative p-10 lg:p-16 flex flex-col items-start justify-center h-full gap-6 w-full max-w-2xl text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-widest text-white shadow-xl">
                  {offer.priority === 1 && <Star className="w-4 h-4 text-amber-400 fill-current" />}
                  {!offer.priority || offer.priority > 1 ? <Flame className="w-4 h-4 text-rose-400" /> : null}
                  {offer.type} Offer
                </div>
                <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white drop-shadow-lg">
                  {offer.title}
                </h2>
                <p className="text-lg lg:text-xl text-white/90 font-medium max-w-lg leading-relaxed drop-shadow">
                  {offer.description}
                </p>
                <div className="mt-4 flex items-center gap-6">
                  {offer.discountPercentage > 0 && <span className="text-3xl font-black text-amber-400 drop-shadow-md">{offer.discountPercentage}% OFF</span>}
                  <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-colors shadow-xl shadow-white/10 flex items-center gap-3">
                    {offer.type === 'Service' ? 'Book Now' : 'Shop Now'} <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Slideshow dots */}
          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
             {offers.filter(o => activeTab === 'all' || o.type.toLowerCase() === activeTab.replace(/s$/, '')).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)} 
                  className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                />
             ))}
          </div>
        </div>
      ) : (
        <div className={`relative overflow-hidden rounded-[2.5rem] text-white shadow-2xl transition-colors duration-500 ${
          activeTab === 'services' ? 'bg-fuchsia-900' : 
          activeTab === 'products' ? 'bg-indigo-900' : 'bg-slate-900'
        }`}>
          <div className={`absolute inset-0 opacity-90 mix-blend-multiply ${
            activeTab === 'services' ? 'bg-gradient-to-r from-fuchsia-600 to-rose-600' : 
            activeTab === 'products' ? 'bg-gradient-to-r from-indigo-600 to-cyan-600' : 
            'bg-gradient-to-r from-indigo-600 to-fuchsia-600'
          }`}></div>
          
          <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-amber-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s'}}></div>
          
          <div className="relative p-10 lg:p-16 flex flex-col items-start gap-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-white shadow-xl">
              <Flame className="w-4 h-4 text-amber-400" /> 
              {activeTab === 'services' ? 'Service Mega Offer' : activeTab === 'products' ? 'Product Flash Sale' : 'Festive Mega Sale'}
            </div>
            
            <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              {activeTab === 'services' ? (
                <>Elevate<br/>Your Life<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">Top Services</span></>
              ) : activeTab === 'products' ? (
                <>Discover<br/>The Best<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">New Gadgets</span></>
              ) : (
                <>Welcome<br/>To The<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">Future</span></>
              )}
            </h2>
            
            <p className="text-lg lg:text-xl text-white/90 font-medium max-w-lg leading-relaxed">
              {activeTab === 'services' 
                ? 'Get up to 30% discount on personalized services based on your past preferences.'
                : activeTab === 'products'
                ? 'Curated products matching your shopping behavior. Grab them before they run out!'
                : 'Get up to 50% discount on selected premium products and top-rated services. Limited time only!'}
            </p>
            
            <button className={`mt-4 bg-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-xl shadow-white/10 flex items-center gap-3 ${
              activeTab === 'services' ? 'text-fuchsia-900 hover:bg-fuchsia-100' : 
              activeTab === 'products' ? 'text-indigo-900 hover:bg-cyan-100' : 'text-slate-900 hover:bg-slate-100'
            }`}>
              {activeTab === 'services' ? 'Book Now' : 'Shop Now'} <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder={activeTab === 'services' ? "Search recommended services..." : activeTab === 'products' ? "Search curated products..." : "Search for amazing products or services..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
          />
          <Search className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Products
          </button>
          <button
            onClick={() => handleTabChange('services')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'services' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Services
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            {activeTab === 'products' ? 'Recommended Products for You' : 
             activeTab === 'services' ? 'Top Services Based On Your Needs' : 
             'Curated For You'}
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Based on your activity and preferences</p>
        </div>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(item => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={item._id} 
              className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              <div className={`aspect-square relative overflow-hidden flex items-center justify-center p-6 ${item.itemType === 'Service' ? 'bg-fuchsia-50' : 'bg-indigo-50/50'}`}>
                {/* Badge specifying product vs service */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md flex items-center gap-1.5 ${
                  item.itemType === 'Service' 
                    ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200' 
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                  {item.itemType === 'Service' ? <Briefcase className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                  {item.itemType}
                </div>
                
                {item.mainImage ? (
                  <img src={item.mainImage} alt={item.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
                ) : (
                  <div className={`text-5xl font-black opacity-30 ${item.itemType === 'Service' ? 'text-fuchsia-400' : 'text-indigo-400'}`}>
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                {item.itemType === 'Product' && item.stockCount <= 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.category || 'General'}</div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" /> 4.9
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-2 leading-snug line-clamp-2">{item.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1">{item.shortDescription || 'High quality premium item ready for you.'}</p>
                
                <div className="flex justify-between items-end mt-auto">
                  <div className="flex flex-col">
                    {item.regularPrice && item.regularPrice > item.sellPrice && (
                      <span className="text-xs text-slate-400 line-through font-medium">{formatAmount(item.regularPrice)}</span>
                    )}
                    <div className="text-xl font-black font-mono text-slate-900 tracking-tighter">
                      {formatAmount(item.sellPrice)}
                      {item.priceType === 'hourly' && <span className="text-xs text-slate-500 font-sans tracking-normal ml-1">/hr</span>}
                    </div>
                  </div>
                  <button 
                    disabled={item.itemType === 'Product' && item.stockCount <= 0}
                    onClick={() => addToCart(item)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      item.itemType === 'Service' 
                        ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-fuchsia-600/20 hover:shadow-fuchsia-600/40' 
                        : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20 hover:shadow-indigo-600/40'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {!loading && filtered.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-500 font-medium">Try adjusting your search or category filters.</p>
        </div>
      )}

      {/* Cart Drawer - same functionality as before but visually tweaked */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-[100dvh] shadow-2xl flex flex-col relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Your Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 flex items-center justify-center rounded-xl shadow-sm transition-colors">
                  <Minus className="w-4 h-4 rotate-45 transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                     <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                      <ShoppingCart className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-500">Your cart is empty</p>
                    <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl mt-4">Continue Shopping</button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item._id} className="flex gap-4 items-center bg-white border border-slate-100 p-3 rounded-2xl shadow-sm group hover:border-slate-300 transition-colors">
                      <div className={`w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center p-2 shrink-0 ${item.itemType === 'Service' ? 'bg-fuchsia-50' : 'bg-slate-50'}`}>
                        {item.mainImage ? (
                          <img src={item.mainImage} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <div className={`text-xs font-black ${item.itemType === 'Service' ? 'text-fuchsia-300' : 'text-slate-300'}`}>{item.name.substring(0,2).toUpperCase()}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.itemType}</div>
                        <h4 className="font-bold text-slate-800 text-sm truncate leading-tight">{item.name}</h4>
                        <div className="text-xs font-mono font-bold text-indigo-600 mt-1.5">{formatAmount(item.sellPrice)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeFromCart(item._id)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider">Remove</button>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button onClick={() => item.qty === 1 ? removeFromCart(item._id) : updateQty(item._id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-white rounded transition-colors font-medium">-</button>
                          <span className="text-xs font-black w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item._id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors font-medium">+</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-white">
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-500">Subtotal</span>
                      <span className="text-sm font-bold font-mono text-slate-700">{formatAmount(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-500">Tax & Fees</span>
                      <span className="text-sm font-bold font-mono text-slate-400">Calculated later</span>
                    </div>
                    <div className="h-px bg-slate-200 w-full mb-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total</span>
                      <span className="text-2xl font-mono font-black tracking-tighter text-indigo-600">{formatAmount(cartTotal)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] flex justify-center items-center gap-2"
                  >
                    Checkout Now <CreditCard className="w-5 h-5 ml-1" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

