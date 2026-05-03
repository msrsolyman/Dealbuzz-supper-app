import React, { useState, useEffect, useMemo } from 'react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, DollarSign, Receipt, Package, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export default function POS() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');

  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, servRes, custRes, whRes] = await Promise.all([
          fetchWithAuth('/products'),
          fetchWithAuth('/services'),
          fetchWithAuth('/customers'),
          fetchWithAuth('/warehouses')
        ]);
        
        const prods = (prodRes.data || []).map((p: any) => ({ ...p, _type: 'Product' }));
        const servs = (servRes.data || []).map((s: any) => ({ ...s, _type: 'Service' }));
        
        setProducts(prods);
        setServices(servs);
        setCustomers(custRes.data || []);
        setWarehouses(whRes.data || []);
        setCatalog([...prods, ...servs]);
      } catch (e: any) {
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      if (filterType === 'product' && item._type !== 'Product') return false;
      if (filterType === 'service' && item._type !== 'Service') return false;
      return item.name.toLowerCase().includes(search.toLowerCase()) || 
             (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
    });
  }, [catalog, search, filterType]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        if (item._type === 'Product' && existing.quantity >= item.stockCount) {
          toast.warning('Not enough stock available');
          return prev;
        }
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.rate } : i);
      }
      return [...prev, {
        _id: item._id,
        itemType: item._type,
        itemId: item._id,
        name: item.name,
        quantity: 1,
        rate: item._type === 'Product' ? item.price : item.rate,
        total: item._type === 'Product' ? item.price : item.rate,
        stockCount: item._type === 'Product' ? item.stockCount : null
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQ = Math.max(1, item.quantity + delta);
        if (item.itemType === 'Product' && item.stockCount !== null && newQ > item.stockCount) {
          toast.warning('Cannot exceed available stock');
          return item;
        }
        return { ...item, quantity: newQ, total: newQ * item.rate };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };


  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt;
  const taxAmt = (taxable * taxRate) / 100;
  const grandTotal = taxable + taxAmt;

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.warning('Cart is empty');
    setLoading(true);
    try {
      const invoiceNumber = 'INV-' + Date.now().toString().slice(-6) + Math.floor(Math.random()*1000);
      const invoiceData = {
        invoiceNumber,
        customerId: selectedCustomerId || undefined,
        warehouseId: selectedWarehouseId || undefined,
        items: cart,
        subtotal,
        tax: taxAmt,
        total: grandTotal,
        status: 'PAID',
        dueDate: new Date(),
      };

      await fetchWithAuth('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData)
      });
      
      toast.success('Sale completed successfully!');
      setCart([]);
      
      // Update local stock in UI immediately
      setCatalog(prev => prev.map(item => {
        const cartItem = cart.find(c => c._id === item._id);
        if (cartItem && item._type === 'Product') {
          return { ...item, stockCount: item.stockCount - cartItem.quantity };
        }
        return item;
      }));

    } catch (e: any) {
      toast.error('Failed to complete sale: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!['super_admin', 'admin', 'product_seller', 'service_seller', 'reseller'].includes(user?.role || '')) {
    return <div className="p-8 text-center text-slate-500">Access Denied</div>;
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 font-sans">
      {/* Product Catalog Side */}
      <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-[50vh]">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="flex gap-2 bg-slate-100/80 p-1 rounded-xl">
            <button onClick={() => setFilterType('all')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('all_items')}</button>
            <button onClick={() => setFilterType('product')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'product' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-700'}`}>{t('products')}</button>
            <button onClick={() => setFilterType('service')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === 'service' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20' : 'text-slate-500 hover:text-slate-700'}`}>{t('services')}</button>
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-5 h-5 absolute left-3.5 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('search_catalog')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium placeholder:font-normal" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
               <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <span className="font-medium text-sm">Loading catalog...</span>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Package className="w-16 h-16 text-slate-200 mb-3" strokeWidth={1.5} />
              <p className="font-medium">No items found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCatalog.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => addToCart(item)}
                  className="bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full transition-opacity pointer-events-none"></div>
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${item._type === 'Product' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'}`}>
                      {item._type}
                    </span>
                    {item._type === 'Product' && (
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-slate-50 ${item.stockCount > 5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                         Stock: {item.stockCount}
                       </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-2 leading-relaxed relative z-10">{item.name}</h4>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 relative z-10">{item.category}</div>
                  <div className="mt-auto flex items-center justify-between relative z-10">
                    <span className="text-lg font-display font-bold text-slate-900">{formatAmount(item._type === 'Product' ? item.price : item.rate)}</span>
                    <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POS Cart Sidebar */}
      <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-[#0B1120] text-white flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -translate-y-1/2 translate-x-1/4 rounded-full"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center relative z-10">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <h3 className="font-display font-bold text-lg leading-tight">{t('current_sale')}</h3>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">{t('register')} #1</div>
          </div>
          <span className="ml-auto bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold relative z-10 shadow-sm">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col custom-scrollbar">
          <div className="mb-4 p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('customer')}</label>
              <select 
                value={selectedCustomerId} 
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 font-medium cursor-pointer transition-all"
              >
                <option value="">{t('walk_in')}</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('warehouses')}</label>
              <select 
                value={selectedWarehouseId} 
                onChange={e => setSelectedWarehouseId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 font-medium cursor-pointer transition-all"
              >
                <option value="">{t('none_main')}</option>
                {warehouses.map(w => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <ShoppingCart className="w-8 h-8 opacity-40" />
              </div>
              <p className="font-medium text-slate-500">{t('cart_is_empty')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('select_items_to_start')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item._id} className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 relative overflow-hidden group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {item.itemType === 'Product' ? <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> : <Zap className="w-3.5 h-3.5 text-fuchsia-500 shrink-0" />}
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                       <span>{formatAmount(item.rate)}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span className="text-slate-400">{t('quantity')}: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 rounded-xl p-1 border border-slate-100 max-h-min">
                    <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-sm transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-sm transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-display font-bold text-slate-900 w-16 text-right">{formatAmount(item.total)}</div>
                  <button onClick={() => removeFromCart(item._id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shrink-0 transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-6 bg-white space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">{t('subtotal')}</span>
              <span className="font-bold text-slate-800">{formatAmount(subtotal)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">{t('discount_percent')}</span>
              <input 
                type="number" 
                min="0" max="100" 
                value={discount} 
                onChange={e => setDiscount(Number(e.target.value))} 
                className="w-20 border border-slate-200 rounded-lg px-2.5 py-1.5 text-right font-medium outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">{t('tax_percent')}</span>
              <input 
                type="number" 
                min="0" max="100" 
                value={taxRate} 
                onChange={e => setTaxRate(Number(e.target.value))} 
                className="w-20 border border-slate-200 rounded-lg px-2.5 py-1.5 text-right font-medium outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <span className="font-display font-bold text-slate-900 text-lg">{t('total')}</span>
            <span className="text-3xl font-display font-black text-indigo-600 tracking-tight">{formatAmount(grandTotal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-2">
            <button 
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout} 
              className="col-span-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Banknote className="w-6 h-6" /> <span className="text-base uppercase tracking-wider">{t('pay_cash')}</span>
            </button>
            <button 
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout} 
              className="bg-[#0B1120] hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 text-indigo-400" /> <span className="text-sm">{t('card')}</span>
            </button>
            <button 
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout} 
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 border border-indigo-100"
            >
              <Receipt className="w-5 h-5 text-indigo-600" /> <span className="text-sm">{t('save_draft')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
