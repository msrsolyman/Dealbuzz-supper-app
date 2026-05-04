import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, Search, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Storefront() {
  const { formatAmount } = useSettings();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetchWithAuth('/products?limit=100');
      setProducts(res.data || []);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) {
        return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.name} added to cart`);
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

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const invoiceData = {
        customerId: user?._id,
        items: cart.map(i => ({
          itemId: i._id,
          itemType: 'Product',
          name: i.name,
          quantity: i.qty,
          rate: i.price,
          total: i.qty * i.price
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

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Dealbuzz Store</h1>
          <p className="text-indigo-200 text-sm font-medium">Browse our premium selection</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-colors backdrop-blur-md"
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-fuchsia-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-indigo-600">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-14 pr-6 font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
        />
        <Search className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <div key={product._id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col">
              <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-6">
                {product.mainImage ? (
                  <img src={product.mainImage} alt={product.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="text-4xl font-black text-slate-200">{product.name.substring(0, 2).toUpperCase()}</div>
                )}
                {product.stockCount <= 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">{product.category}</div>
                <h3 className="font-bold text-slate-800 mb-1 leading-snug">{product.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{product.shortDescription || 'High quality product'}</p>
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-lg font-black font-mono text-slate-900 tracking-tighter">{formatAmount(product.price)}</div>
                  </div>
                  <button 
                    disabled={product.stockCount <= 0}
                    onClick={() => addToCart(product)}
                    className="w-10 h-10 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No products found.
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-black text-slate-900 uppercase tracking-tight">Your Cart</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-xl shadow-sm">
                  <Minus className="w-4 h-4 rotate-45 transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <ShoppingCart className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item._id} className="flex gap-4 items-center bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 shrink-0">
                        {item.mainImage ? (
                          <img src={item.mainImage} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-xs font-black text-slate-300">{item.name.substring(0,2).toUpperCase()}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                        <div className="text-xs font-mono font-bold text-slate-500 mt-1">{formatAmount(item.price)}</div>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                        <button onClick={() => item.qty === 1 ? removeFromCart(item._id) : updateQty(item._id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white rounded shadow-sm transition-all text-lg font-medium leading-none">-</button>
                        <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white rounded shadow-sm transition-all text-lg font-medium leading-none">+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-mono font-black tracking-tighter text-slate-900">{formatAmount(cartTotal)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] flex justify-center items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Checkout Now
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
