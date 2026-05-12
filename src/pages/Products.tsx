import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Tags,
  Image as ImageIcon,
  FileText,
  Truck,
  Search,
  Shield,
  Settings2,
  Box,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

export default function Products() {
  const { t } = useTranslation();
  const { formatAmount, currency } = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const generateSKU = () => {
    return (
      "PRD-" +
      Date.now().toString().slice(-6) +
      Math.random().toString(36).substring(2, 5).toUpperCase()
    );
  };

  const getInitialForm = () => ({
    name: "",
    category: "",
    brand: "",
    shortDescription: "",
    price: 0,
    regularPrice: 0,
    discount: 0,
    stockCount: 0,
    lowStockThreshold: 5,
    sku: generateSKU(),
    barcode: "",
    mainImage: "",
    galleryImages: "",
    videoUrl: "",
    description: "",
    features: "",
    benefits: "",
    usageInstructions: "",
    deliveryCharge: 0,
    deliveryTime: "",
    locationAvailability: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    searchKeywords: "",
    warrantyInfo: "",
    returnPolicy: "",
    supplierInfo: "",
  });

  const [formData, setFormData] = useState(getInitialForm());

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!formData.name) {
      toast.error("Please enter at least a Product Name to generate copy.");
      return;
    }
    setIsGenerating(true);
    const loadingToast = toast.loading("Generating AI marketing copy...");
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Generate a compelling e-commerce product description for:
Name: ${formData.name}
Category: ${formData.category}
Brand: ${formData.brand}
Features: ${formData.features}

Return a valid JSON object with the following fields:
shortDescription: string (snappy intro)
description: string (full comprehensive description)
benefits: string[] (array of benefits)
metaTitle: string (SEO title)
metaDescription: string (SEO description)`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(result.text || "{}");

      setFormData((prev) => ({
        ...prev,
        shortDescription: data.shortDescription || prev.shortDescription,
        description: data.description || prev.description,
        benefits: Array.isArray(data.benefits)
          ? data.benefits.join("\n")
          : data.benefits || prev.benefits,
        metaTitle: data.metaTitle || prev.metaTitle,
        metaDescription: data.metaDescription || prev.metaDescription,
      }));
      toast.success("Generated marketing copy successfully!", {
        id: loadingToast,
      });
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "AI Generation failed", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchWithAuth("/products");
      setProducts(data.data || []);
    } catch (e: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = () => {
    setFormData(getInitialForm());
    setEditingId(null);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setFormData({
      ...getInitialForm(),
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      shortDescription: product.shortDescription || "",
      price: product.price || 0,
      regularPrice: product.regularPrice || 0,
      discount: product.discount || 0,
      stockCount: product.stockCount || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      sku: product.sku || "",
      mainImage: product.mainImage || "",
      galleryImages: Array.isArray(product.galleryImages)
        ? product.galleryImages.join(", ")
        : "",
      videoUrl: product.videoUrl || "",
      description: product.description || "",
      features: Array.isArray(product.features)
        ? product.features.join("\n")
        : "",
      benefits: Array.isArray(product.benefits)
        ? product.benefits.join("\n")
        : "",
      usageInstructions: product.usageInstructions || "",
      deliveryCharge: product.deliveryCharge || 0,
      deliveryTime: product.deliveryTime || "",
      locationAvailability: product.locationAvailability || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      searchKeywords: Array.isArray(product.searchKeywords)
        ? product.searchKeywords.join(", ")
        : "",
      warrantyInfo: product.warrantyInfo || "",
      returnPolicy: product.returnPolicy || "",
      supplierInfo: product.supplierInfo || "",
      barcode: product.barcode || "",
    });
    setEditingId(product._id);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }),
    ).then((results) => {
      setFormData((prev) => {
        const existing = prev.galleryImages
          ? prev.galleryImages
              .split(",")
              .map((s: any) => s.trim())
              .filter(Boolean)
          : [];
        return { ...prev, galleryImages: [...existing, ...results].join(", ") };
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // transform comma separated strings to arrays if needed
      const payload = {
        ...formData,
        galleryImages: formData.galleryImages
          ? formData.galleryImages.split(",").map((s: any) => s.trim())
          : [],
        features: formData.features
          ? formData.features.split("\n").map((s: any) => s.trim())
          : [],
        benefits: formData.benefits
          ? formData.benefits.split("\n").map((s: any) => s.trim())
          : [],
        tags: formData.tags
          ? formData.tags.split(",").map((s: any) => s.trim())
          : [],
        searchKeywords: formData.searchKeywords
          ? formData.searchKeywords.split(",").map((s: any) => s.trim())
          : [],
      };

      if (editingId) {
        await fetchWithAuth(`/products/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Product updated");
      } else {
        await fetchWithAuth("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Product created");
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchWithAuth(`/products/${id}`, { method: "DELETE" });
      toast.success("Product deleted");
      loadProducts();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden font-sans">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
            <Box className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("product_inventory")}
          </h2>
        </div>
        <button
          onClick={handleOpenModal}
          className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">{t("add_product")}</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-[#FAFAFA] text-slate-500 text-[11px] uppercase tracking-widest font-semibold border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3">{t("main_image")}</th>
              <th className="px-6 py-3">{t("name_category")}</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3 text-right">{t("rate")} (Disc %)</th>
              <th className="px-6 py-3 text-right">{t("stock")}</th>
              <th className="px-6 py-3 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {products.map((p, idx) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: (idx % 10) * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    {p.mainImage ? (
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 line-clamp-1">
                      {p.name}
                    </div>
                    <div className="text-xs uppercase font-semibold text-slate-500 mt-1 tracking-wider">
                      {p.category} {p.brand ? `• ${p.brand}` : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 tracking-tight bg-slate-50/50 rounded-lg">
                    {p.sku}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-900 text-base">
                      {formatAmount(p.price)}
                    </div>
                    {p.discount > 0 && (
                      <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        -{p.discount}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border inline-flex items-center justify-center gap-1.5 ${p.stockCount <= (p.lowStockThreshold || 5) ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse" : p.stockCount < 20 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}
                    >
                      {p.stockCount <= (p.lowStockThreshold || 5) && (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {p.stockCount} {t("in_stock")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(p)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {products.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  No products found. Add your first product!
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  {t("loading_details")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200"
            >
              <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-slate-500" />{" "}
                  {editingId ? t("edit_product") : t("setup_new_product")}
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded-md transition-colors border border-indigo-200 disabled:opacity-50"
                    title="Auto-generate description, features, meta tags based on name and category"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGenerating ? "Generating..." : "AI Enhance"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-48 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-x-auto md:overflow-y-auto shrink-0 p-3 space-x-2 md:space-x-0 md:space-y-1 flex md:flex-col">
                  {[
                    { id: "basic", label: t("basic_info"), icon: FileText },
                    { id: "pricing", label: t("pricing_stock"), icon: Tags },
                    { id: "media", label: t("images_media"), icon: ImageIcon },
                    {
                      id: "details",
                      label: t("detailed_description"),
                      icon: Box,
                    },
                    {
                      id: "shipping",
                      label: t("shipping_delivery"),
                      icon: Truck,
                    },
                    { id: "seo", label: t("seo_display"), icon: Search },
                    { id: "advanced", label: t("advanced_info"), icon: Shield },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-auto md:w-full flex shrink-0 whitespace-nowrap items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? "bg-white text-indigo-600 border border-slate-200 shadow-sm" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent"}`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form
                    id="productForm"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {activeTab === "basic" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Product Name{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="e.g. Vintage Leather Jacket"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Category <span className="text-rose-500">*</span>
                            </label>
                            <select
                              required
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            >
                              <option value="">Select Category</option>
                              {Object.entries(
                                t("categories", { returnObjects: true }),
                              ).map(([key, value]: [string, any]) => (
                                <option key={key} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Brand Name
                            </label>
                            <input
                              type="text"
                              name="brand"
                              value={formData.brand}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                              placeholder="e.g. Acme"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              SKU
                            </label>
                            <input
                              type="text"
                              name="sku"
                              value={formData.sku}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Barcode
                            </label>
                            <input
                              type="text"
                              name="barcode"
                              value={formData.barcode}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                              placeholder="Scan or type"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Short Description
                          </label>
                          <textarea
                            rows={3}
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                            placeholder="A brief snappy intro..."
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {activeTab === "pricing" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Selling Price{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-400 font-bold">
                                {currency.symbol}
                              </span>
                              <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded pl-7 pr-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Regular Price (MRP)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-400 font-bold">
                                {currency.symbol}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="regularPrice"
                                value={formData.regularPrice}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded pl-7 pr-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Discount (%)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded pl-3 pr-7 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                              />
                              <span className="absolute right-3 top-2 text-slate-400 font-bold">
                                %
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              name="stockCount"
                              value={formData.stockCount}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              {t("low_stock_threshold")}
                            </label>
                            <input
                              type="number"
                              min="0"
                              name="lowStockThreshold"
                              value={formData.lowStockThreshold}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              SKU / Code{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <input
                              required
                              type="text"
                              name="sku"
                              value={formData.sku}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Auto-generated if left blank
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "media" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Main Image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              name="mainImage"
                              value={formData.mainImage}
                              onChange={handleChange}
                              className="flex-1 w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                              placeholder="https://..."
                            />
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-xs font-bold flex items-center justify-center transition-colors">
                              Upload File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(e, "mainImage")
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Gallery Image URLs (Comma Separated)
                          </label>
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={3}
                              name="galleryImages"
                              value={formData.galleryImages}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                              placeholder="https://img1..., https://img2..."
                            ></textarea>
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-xs font-bold self-start transition-colors">
                              Upload Multiple Files
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Video Demo URL
                          </label>
                          <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "details" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Product Details
                          </label>
                          <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                            placeholder="Full comprehensive description..."
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Features (One per line)
                            </label>
                            <textarea
                              rows={4}
                              name="features"
                              value={formData.features}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                              placeholder="✔ High Quality Material&#10;✔ Long Lasting"
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Benefits (One per line)
                            </label>
                            <textarea
                              rows={4}
                              name="benefits"
                              value={formData.benefits}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                              placeholder="Saves time&#10;Easy to use"
                            ></textarea>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Usage Instructions
                          </label>
                          <textarea
                            rows={3}
                            name="usageInstructions"
                            value={formData.usageInstructions}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                            placeholder="How to use the product..."
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {activeTab === "shipping" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Delivery Charge
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-400 font-bold">
                                {currency.symbol}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="deliveryCharge"
                                value={formData.deliveryCharge}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded pl-7 pr-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Delivery Time (Est.)
                            </label>
                            <input
                              type="text"
                              name="deliveryTime"
                              value={formData.deliveryTime}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                              placeholder="e.g. 2-3 Business Days"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Location Availability
                          </label>
                          <input
                            type="text"
                            name="locationAvailability"
                            value={formData.locationAvailability}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="e.g. Nationwide delivery"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "seo" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Meta Title
                          </label>
                          <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="e.g. Buy the Best Hair Trimmer Online"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Meta Description
                          </label>
                          <textarea
                            rows={3}
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                            placeholder="Get the premium hair trimmer with free shipping..."
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Search Keywords (Comma Separated)
                          </label>
                          <input
                            type="text"
                            name="searchKeywords"
                            value={formData.searchKeywords}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="best trimmer, t9 trimmer, hair clipper"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Tags (Comma Separated)
                          </label>
                          <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            placeholder="Electronics, Men's Grooming, Sale"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "advanced" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Barcode (UPC/EAN)
                            </label>
                            <input
                              type="text"
                              name="barcode"
                              value={formData.barcode}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Supplier / Vendor Info
                            </label>
                            <input
                              type="text"
                              name="supplierInfo"
                              value={formData.supplierInfo}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                              placeholder="e.g. Vendor Name ID"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Warranty Info
                            </label>
                            <input
                              type="text"
                              name="warrantyInfo"
                              value={formData.warrantyInfo}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                              placeholder="e.g. 1 Year Official Warranty"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Return Policy
                            </label>
                            <input
                              type="text"
                              name="returnPolicy"
                              value={formData.returnPolicy}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500"
                              placeholder="e.g. 7 Days Free Return"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 uppercase border border-transparent hover:bg-slate-200 rounded"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  form="productForm"
                  className="px-6 py-2 text-xs font-bold text-white uppercase bg-indigo-600 rounded hover:bg-indigo-700 shadow-md"
                >
                  {editingId ? t("save_changes") : t("submit_product")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
