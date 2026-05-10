import React, { useState, useEffect, useMemo, useRef } from "react";
import { fetchWithAuth } from "../lib/api";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  DollarSign,
  Receipt,
  Package,
  Zap,
  Filter,
  User,
  Warehouse as WarehouseIcon,
  Wifi,
  WifiOff,
  ScanBarcode,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "motion/react";

export default function POS() {
  const { t } = useTranslation();
  const { formatAmount } = useSettings();
  const { user, token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "product" | "service">(
    "all",
  );

  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineSyncing, setOfflineSyncing] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus Search Bar/Barcode on unhandled keydown (barcode scanner simulation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (
          e.key === "Enter" &&
          e.target === searchInputRef.current &&
          search
        ) {
          // If hit enter inside search, try to find an exact match
          const match = catalog.find(
            (p) =>
              p.sku === search || p.name.toLowerCase() === search.toLowerCase(),
          );
          if (match) {
            addToCart(match);
            setSearch("");
          } else {
            toast.error("No product found for barcode/search.");
          }
        }
        return;
      }

      // Barcode scanners act like fast keyboards. If hitting Enter, check buffer.
      if (e.key === "Enter") {
        if (barcodeBuffer.length > 0) {
          const match = catalog.find((p) => p.sku === barcodeBuffer);
          if (match) {
            addToCart(match);
            toast.success(`Scanned: ${match.name}`);
          } else {
            toast.error(`Barcode not found: ${barcodeBuffer}`);
          }
          setBarcodeBuffer("");
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setBarcodeBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcodeBuffer, catalog, cart]);

  // Clear barcode buffer if it's inactive (prevent garbage typing)
  useEffect(() => {
    if (barcodeBuffer) {
      const timeout = setTimeout(() => setBarcodeBuffer(""), 100);
      return () => clearTimeout(timeout);
    }
  }, [barcodeBuffer]);

  // Offline/Online Status Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online! Syncing offline operations...");
      syncOfflineOrders();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncOfflineOrders = async () => {
    const pendingOrdersJSON = localStorage.getItem("offline_pos_orders");
    if (!pendingOrdersJSON) return;

    try {
      setOfflineSyncing(true);
      const pendingOrders = JSON.parse(pendingOrdersJSON);
      if (!Array.isArray(pendingOrders)) return;

      for (const order of pendingOrders) {
        await fetchWithAuth("/invoices", {
          method: "POST",
          body: JSON.stringify(order),
        });
      }

      localStorage.removeItem("offline_pos_orders");
      toast.success("Successfully synced offline orders to server.");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to sync all offline orders.");
    } finally {
      setOfflineSyncing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, servRes, custRes, whRes] = await Promise.all([
          fetchWithAuth("/products"),
          fetchWithAuth("/services"),
          fetchWithAuth("/customers"),
          fetchWithAuth("/warehouses"),
        ]);

        const prods = (prodRes.data || []).map((p: any) => ({
          ...p,
          _type: "Product",
        }));
        const servs = (servRes.data || []).map((s: any) => ({
          ...s,
          _type: "Service",
        }));

        setProducts(prods);
        setServices(servs);
        setCustomers(custRes.data || []);
        setWarehouses(whRes.data || []);
        setCatalog([...prods, ...servs]);
      } catch (e: any) {
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      if (filterType === "product" && item._type !== "Product") return false;
      if (filterType === "service" && item._type !== "Service") return false;
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(search.toLowerCase())) ||
        (item.barcode && item.barcode.toLowerCase() === search.toLowerCase())
      );
    });
  }, [catalog, search, filterType]);

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search) {
      // If there's exclusively one match
      if (filteredCatalog.length === 1) {
        addToCart(filteredCatalog[0]);
        toast.success("Barcode scanned: " + filteredCatalog[0].name);
        setSearch("");
      } else if (filteredCatalog.length === 0) {
        toast.error("Product not found for barcode: " + search);
        setSearch("");
      }
    }
  };

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        if (item._type === "Product" && existing.quantity >= item.stockCount) {
          toast.warning("Not enough stock available");
          return prev;
        }
        return prev.map((i) =>
          i._id === item._id
            ? {
                ...i,
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * i.rate,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          _id: item._id,
          itemType: item._type,
          itemId: item._id,
          name: item.name,
          quantity: 1,
          rate: item._type === "Product" ? item.price : item.rate,
          total: item._type === "Product" ? item.price : item.rate,
          stockCount: item._type === "Product" ? item.stockCount : null,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          const newQ = Math.max(1, item.quantity + delta);
          if (
            item.itemType === "Product" &&
            item.stockCount !== null &&
            newQ > item.stockCount
          ) {
            toast.warning("Cannot exceed available stock");
            return item;
          }
          return { ...item, quantity: newQ, total: newQ * item.rate };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt;
  const taxAmt = (taxable * taxRate) / 100;
  const grandTotal = taxable + taxAmt;

  const handleSaveQuote = async () => {
    if (cart.length === 0) return toast.warning("Cart is empty");
    setLoading(true);
    try {
      const quotationNumber =
        "QT-" +
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 1000);
      const quoteData = {
        quotationNumber,
        customerId: selectedCustomerId || undefined,
        items: cart,
        subtotal,
        tax: taxAmt,
        total: grandTotal,
        status: "DRAFT",
      };
      await fetchWithAuth("/quotations", {
        method: "POST",
        body: JSON.stringify(quoteData),
      });
      toast.success("Quotation saved successfully");
      setCart([]);
    } catch (e: any) {
      toast.error("Failed to save quote");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.warning("Cart is empty");

    const invoiceNumber =
      "INV-" +
      Date.now().toString().slice(-6) +
      Math.floor(Math.random() * 1000);
    const invoiceData = {
      invoiceNumber,
      customerId: selectedCustomerId || undefined,
      warehouseId: selectedWarehouseId || undefined,
      items: cart,
      subtotal,
      tax: taxAmt,
      total: grandTotal,
      status: "PAID",
      dueDate: new Date(),
    };

    if (isOffline) {
      // Save offline
      const existing = localStorage.getItem("offline_pos_orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.push(invoiceData);
      localStorage.setItem("offline_pos_orders", JSON.stringify(orders));
      toast.success("Offline mode: Sale saved locally pending sync");
      setCart([]);
      return;
    }

    setLoading(true);
    try {
      await fetchWithAuth("/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData),
      });

      toast.success("Sale completed successfully!");
      setCart([]);

      // Update local stock in UI immediately
      setCatalog((prev) =>
        prev.map((item) => {
          const cartItem = cart.find((c) => c._id === item._id);
          if (cartItem && item._type === "Product") {
            return { ...item, stockCount: item.stockCount - cartItem.quantity };
          }
          return item;
        }),
      );
    } catch (e: any) {
      toast.error("Failed to complete sale: " + e.message);
      // Fallback to offline storage if network error
      const existing = localStorage.getItem("offline_pos_orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.push(invoiceData);
      localStorage.setItem("offline_pos_orders", JSON.stringify(orders));
      toast.info("Sale saved locally due to connection error.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  if (
    ![
      "super_admin",
      "admin",
      "product_seller",
      "service_seller",
      "reseller",
    ].includes(user?.role || "")
  ) {
    return <div className="p-8 text-center text-slate-500">Access Denied</div>;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 font-sans">
      {/* Product Catalog Side */}
      <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-[50vh] relative">
        {/* Offline indicator */}
        <AnimatePresence>
          {(isOffline || offlineSyncing) && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`absolute top-0 left-0 w-full z-20 py-2 px-4 flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-widest text-white shadow-md ${offlineSyncing ? "bg-indigo-500" : "bg-rose-500"}`}
            >
              {offlineSyncing ? (
                <Wifi className="w-4 h-4 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {offlineSyncing
                ? "Syncing..."
                : "Offline Mode Active - Changes saved locally"}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`p-5 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between bg-slate-50/50 ${isOffline || offlineSyncing ? "mt-8" : ""}`}
        >
          <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl">
            <button
              onClick={() => setFilterType("all")}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${filterType === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("all_items")}
            </button>
            <button
              onClick={() => setFilterType("product")}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${filterType === "product" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("products")}
            </button>
            <button
              onClick={() => setFilterType("service")}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${filterType === "service" ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t("services")}
            </button>
          </div>
          <div className="relative w-full xl:w-[400px] shrink-0 group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or scan barcode... (Press Enter)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleBarcodeScan}
              className="w-full pl-12 pr-10 py-3 text-sm bg-white border-2 border-slate-200 hover:border-indigo-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:font-normal placeholder:text-slate-400"
            />
            <ScanBarcode className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <span className="font-bold uppercase tracking-widest text-[10px] text-slate-400">
                Syncing System...
              </span>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <Package className="w-20 h-20 mb-4 opacity-20" strokeWidth={1} />
              <p className="font-black uppercase tracking-[0.2em] text-xs">
                Terminal Not Found
              </p>
              <p className="text-xs mt-2 font-medium">
                Refine your search parameters
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
            >
              <AnimatePresence>
                {filteredCatalog.map((item, idx) => (
                  <motion.div
                    layout
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: (idx % 10) * 0.05 }}
                    onClick={() => addToCart(item)}
                    className="bg-white border-2 border-slate-100 rounded-3xl p-5 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${item._type === "Product" ? "bg-indigo-50 text-indigo-600" : "bg-fuchsia-50 text-fuchsia-600"}`}
                      >
                        {item._type === "Product" ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>
                      {item._type === "Product" && (
                        <div className={`flex flex-col items-end`}>
                          <span
                            className={`text-[9px] font-black uppercase tracking-tighter ${item.stockCount > 5 ? "text-emerald-500" : "text-rose-500"}`}
                          >
                            {item.stockCount > 0
                              ? `${item.stockCount} Left`
                              : "Out of Stock"}
                          </span>
                          <div
                            className={`h-1 w-12 rounded-full mt-1 bg-slate-100 overflow-hidden`}
                          >
                            <div
                              className={`h-full ${item.stockCount > 5 ? "bg-emerald-400" : "bg-rose-400"}`}
                              style={{
                                width: `${Math.min(100, (item.stockCount / 20) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 leading-tight relative z-10 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h4>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 mb-4">
                      {item.category}
                    </div>

                    <div className="mt-auto flex items-end justify-between relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 leading-none mb-1">
                          Price
                        </span>
                        <span className="text-xl font-mono font-black text-slate-900 leading-none">
                          {formatAmount(
                            item._type === "Product" ? item.price : item.rate,
                          )}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-active:scale-90">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* POS Cart Sidebar */}
      <div className="w-full md:w-[400px] xl:w-[460px] shrink-0 bg-white border border-slate-200/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center gap-4 relative overflow-hidden">
          <motion.div
            animate={{ scale: cart.length > 0 ? [1, 1.2, 1] : 1 }}
            className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center relative z-10 shadow-lg shadow-indigo-600/30"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
          </motion.div>
          <div className="relative z-10">
            <h3 className="font-display font-bold text-xl leading-tight">
              {t("current_sale")}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
                Terminal #01 Active
              </span>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end relative z-10">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
              Queue
            </span>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-indigo-600/20">
              {cart.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 flex flex-col custom-scrollbar space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1 px-1">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t("customer")}
                </span>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-slate-50/30 font-bold transition-all cursor-pointer appearance-none"
              >
                <option value="">{t("walk_in")}</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1 px-1">
                <WarehouseIcon className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t("warehouses")}
                </span>
              </div>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500 bg-slate-50/30 font-bold transition-all cursor-pointer appearance-none"
              >
                <option value="">{t("none_main")}</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-[200px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                <div className="w-20 h-20 bg-white border border-dashed border-slate-200 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                  {t("cart_is_empty")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {cart.map((item) => (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative group hover:border-indigo-300 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.itemType === "Product" ? "bg-indigo-50 text-indigo-500" : "bg-fuchsia-50 text-fuchsia-500"}`}
                      >
                        {item.itemType === "Product" ? (
                          <Package className="w-5 h-5" />
                        ) : (
                          <Zap className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-xs truncate uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-2">
                          <span className="font-mono text-indigo-600">
                            {formatAmount(item.rate)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="uppercase tracking-widest">
                            Total: {formatAmount(item.total)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 bg-slate-50 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Minus className="w-3" />
                        </button>
                        <span className="text-[11px] font-black w-4 text-center text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Plus className="w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 p-8 bg-white space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Coupon Code
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="w-full bg-transparent font-mono font-black text-slate-900 border-none outline-none text-sm uppercase"
                />
                <button
                  onClick={() => {
                    if (couponCode.toUpperCase() === "VIP20") {
                      setDiscount(20);
                      toast.success("Coupon Applied: 20% off");
                    } else if (couponCode.toUpperCase() === "WELCOME10") {
                      setDiscount(10);
                      toast.success("Coupon Applied: 10% off");
                    } else {
                      toast.error("Invalid Coupon");
                      setDiscount(0);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                {t("discount_percent")}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-black text-slate-900 border-none outline-none text-xl"
                />
                <span className="text-slate-400 font-black">%</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                {t("tax_percent")}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-transparent font-mono font-black text-slate-900 border-none outline-none text-xl"
                />
                <span className="text-slate-400 font-black">%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Grand Total Settlement
              </span>
              <span className="text-slate-400 text-xs font-mono line-through opacity-50">
                {formatAmount(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-display font-black text-slate-900 tracking-tighter">
                {formatAmount(grandTotal)}
              </span>
              <motion.div
                animate={{
                  opacity: discount > 0 ? 1 : 0,
                  scale: discount > 0 ? 1 : 0.8,
                }}
                className="bg-emerald-500 text-white px-2 py-1 rounded text-[9px] font-black uppercase"
              >
                Saved {formatAmount(discountAmt)}
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout}
              className="col-span-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black h-16 rounded-3xl flex justify-center items-center gap-3 shadow-2xl shadow-emerald-500/30 transition-all disabled:opacity-30 disabled:shadow-none group"
            >
              <Banknote className="w-7 h-7 group-active:scale-90 transition-transform" />
              <span className="text-lg uppercase tracking-widest">
                {t("pay_cash")}
              </span>
            </button>
            <button
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout}
              className="bg-slate-950 hover:bg-slate-800 text-white font-black py-4 rounded-2xl flex flex-col items-center gap-1 transition-all disabled:opacity-30"
            >
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] uppercase tracking-widest">
                {t("card")}
              </span>
            </button>
            <button
              disabled={cart.length === 0 || loading}
              onClick={handleSaveQuote}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black py-4 rounded-2xl flex flex-col items-center gap-1 transition-all disabled:opacity-30 border-2 border-indigo-100"
            >
              <Receipt className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest">
                Save Quote
              </span>
            </button>
            <button
              disabled={cart.length === 0 || loading}
              onClick={() => setCart([])}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-4 rounded-2xl flex flex-col items-center gap-1 transition-all disabled:opacity-30 border-2 border-rose-100"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest">
                Clear
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
