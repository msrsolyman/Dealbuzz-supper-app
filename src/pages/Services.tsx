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
  Clock,
  Search,
  Shield,
  Settings2,
  Box,
  Zap,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";

const TABS = [
  { id: "basic", label: "Basic Info", icon: FileText },
  { id: "pricing", label: "Pricing Structure", icon: Tags },
  { id: "details", label: "Service Details", icon: Box },
  { id: "location", label: "Location & Availability", icon: MapPin },
  { id: "booking", label: "Booking System", icon: Clock },
  { id: "media", label: "Images & Media", icon: ImageIcon },
  { id: "provider", label: "Provider Info", icon: Shield },
];

export default function Services() {
  const { t } = useTranslation();
  const { currency, formatAmount } = useSettings();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const getInitialForm = () => ({
    name: "",
    category: "",
    providerName: "",
    shortDescription: "",
    priceType: "fixed",
    rate: 0,
    packagesRaw: "",
    discount: 0,
    description: "",
    whatsIncluded: "",
    whatsNotIncluded: "",
    serviceProcess: "",
    serviceArea: "",
    availableTime: "",
    serviceType: "on_site",
    bookingType: "schedule",
    leadTimeHours: 24,
    maxBookingsPerDay: 5,
    mainImage: "",
    galleryImages: "",
    demoVideoUrl: "",
    providerExperience: "",
    providerRating: 0,
    contactInfo: "",
    cancellationPolicy: "",
    refundPolicy: "",
    warranty: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [formData, setFormData] = useState(getInitialForm());

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!formData.name) {
      toast.error("Please enter at least a Service Name to generate copy.");
      return;
    }
    setIsGenerating(true);
    const loadingToast = toast.loading("Generating AI marketing copy...");
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        brand: formData.providerName,
        features: formData.whatsIncluded,
      };

      const res = await fetchWithAuth("/ai/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setFormData((prev) => ({
        ...prev,
        shortDescription: res.shortDescription || prev.shortDescription,
        description: res.description || prev.description,
        whatsIncluded: Array.isArray(res.benefits)
          ? res.benefits.join("\n")
          : res.benefits || prev.whatsIncluded, // using benefits as whatsIncluded
        metaTitle: res.metaTitle || prev.metaTitle,
        metaDescription: res.metaDescription || prev.metaDescription,
      }));
      toast.success("Generated marketing copy successfully!", {
        id: loadingToast,
      });
    } catch (e: any) {
      toast.error(e.message || "AI Generation failed", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await fetchWithAuth("/services");
      setServices(data.data || []);
    } catch (e: any) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenModal = () => {
    setFormData(getInitialForm());
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
      const payload = {
        ...formData,
        whatsIncluded: formData.whatsIncluded
          ? formData.whatsIncluded.split("\n").map((s: any) => s.trim())
          : [],
        whatsNotIncluded: formData.whatsNotIncluded
          ? formData.whatsNotIncluded.split("\n").map((s: any) => s.trim())
          : [],
        serviceProcess: formData.serviceProcess
          ? formData.serviceProcess.split("\n").map((s: any) => s.trim())
          : [],
        galleryImages: formData.galleryImages
          ? formData.galleryImages.split(",").map((s: any) => s.trim())
          : [],
        tags: formData.tags
          ? formData.tags.split(",").map((s: any) => s.trim())
          : [],
      };

      await fetchWithAuth("/services", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Service created");
      setIsModalOpen(false);
      loadServices();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchWithAuth(`/services/${id}`, { method: "DELETE" });
      toast.success("Service deleted");
      loadServices();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-bold">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center text-fuchsia-600 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            Services Management
          </h2>
        </div>
        <button
          onClick={handleOpenModal}
          className="text-sm font-bold text-white uppercase bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-fuchsia-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Add Service</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Image</th>
              <th className="px-6 py-4 font-bold">Name & Category</th>
              <th className="px-6 py-4 font-bold text-right">Pricing</th>
              <th className="px-6 py-4 font-bold text-center">Type</th>
              <th className="px-6 py-4 font-bold text-center">Booking</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((s) => (
              <tr
                key={s._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  {s.mainImage ? (
                    <img
                      src={s.mainImage}
                      alt={s.name}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-fuchsia-50 rounded-xl border border-fuchsia-100 flex items-center justify-center text-fuchsia-400 shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 line-clamp-1">
                    {s.name}
                  </div>
                  <div className="text-xs uppercase font-semibold text-slate-500 mt-1 tracking-wider">
                    {s.category}{" "}
                    {s.providerName ? `• by ${s.providerName}` : ""}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-slate-900 text-base">
                    {formatAmount(s.rate)}
                  </div>
                  <div className="text-[10px] text-fuchsia-600 uppercase font-bold tracking-widest mt-0.5 bg-fuchsia-50 px-2 py-0.5 rounded-md inline-block">
                    {s.priceType.replace("_", " ")}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border bg-slate-50 text-slate-600 border-slate-200">
                    {s.serviceType ? s.serviceType.replace("_", " ") : "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${s.bookingType === "instant" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-indigo-50 text-indigo-700 border-indigo-100"}`}
                  >
                    {s.bookingType || "SCHEDULE"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all shadow-sm">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  No services found. Add your first service!
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading services...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-fuchsia-500" /> Setup New Service
              </h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-fuchsia-100 to-indigo-100 text-indigo-700 hover:from-fuchsia-200 hover:to-indigo-200 text-xs font-bold rounded-lg transition-all shadow-sm border border-indigo-200 disabled:opacity-50"
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
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-48 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-x-auto md:overflow-y-auto shrink-0 p-2 space-x-2 md:space-x-0 md:space-y-1 flex md:flex-col">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-auto md:w-full flex shrink-0 whitespace-nowrap items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === tab.id ? "bg-fuchsia-100 text-fuchsia-700" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form
                  id="serviceForm"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {activeTab === "basic" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Service Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                          placeholder="e.g. Home AC Repair"
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
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 bg-white"
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
                            Provider Name
                          </label>
                          <input
                            type="text"
                            name="providerName"
                            value={formData.providerName}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="e.g. John's Cooling"
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
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none"
                          placeholder="Fast, reliable cooling..."
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {activeTab === "pricing" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Pricing Model
                          </label>
                          <select
                            name="priceType"
                            value={formData.priceType}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 bg-white"
                          >
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly Rate</option>
                            <option value="package">Package / Tiered</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Base Rate / Starting Price{" "}
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
                              name="rate"
                              value={formData.rate}
                              onChange={handleChange}
                              className="w-full border border-slate-200 rounded pl-7 pr-3 py-2 text-sm outline-none focus:border-fuchsia-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          name="discount"
                          value={formData.discount}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "details" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Full Description
                        </label>
                        <textarea
                          rows={4}
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none"
                          placeholder="Detailed explanation of the service..."
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            What's Included (One per line)
                          </label>
                          <textarea
                            rows={4}
                            name="whatsIncluded"
                            value={formData.whatsIncluded}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none"
                            placeholder="✔ Inspection&#10;✔ Basic Parts"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            What's Not Included (One per line)
                          </label>
                          <textarea
                            rows={4}
                            name="whatsNotIncluded"
                            value={formData.whatsNotIncluded}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none"
                            placeholder="Gas Refill&#10;Major Replacements"
                          ></textarea>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Service Process Steps (One per line)
                        </label>
                        <textarea
                          rows={3}
                          name="serviceProcess"
                          value={formData.serviceProcess}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none"
                          placeholder="Step 1: Booking&#10;Step 2: Arrival..."
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {activeTab === "location" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Service Delivery Method
                          </label>
                          <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 bg-white"
                          >
                            <option value="on_site">
                              On-Site (At Customer Location)
                            </option>
                            <option value="remote">Remote (Online)</option>
                            <option value="pickup">Drop-off / Pickup</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Available Times
                          </label>
                          <input
                            type="text"
                            name="availableTime"
                            value={formData.availableTime}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="e.g. Mon-Fri 9AM-5PM"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Service Area / Coverage
                        </label>
                        <input
                          type="text"
                          name="serviceArea"
                          value={formData.serviceArea}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                          placeholder="e.g. Chittagong City Only"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "booking" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Booking Type
                          </label>
                          <select
                            name="bookingType"
                            value={formData.bookingType}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 bg-white"
                          >
                            <option value="schedule">
                              Schedule (Select Date & Time)
                            </option>
                            <option value="instant">Instant (ASAP)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Lead Time (Hours in advance)
                          </label>
                          <input
                            type="number"
                            min="0"
                            name="leadTimeHours"
                            value={formData.leadTimeHours}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Max Bookings Per Day
                        </label>
                        <input
                          type="number"
                          min="1"
                          name="maxBookingsPerDay"
                          value={formData.maxBookingsPerDay}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 font-mono"
                        />
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
                            className="flex-1 w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
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
                          Gallery / Past Work (Comma Separated)
                        </label>
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={3}
                            name="galleryImages"
                            value={formData.galleryImages}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none"
                            placeholder="https://..., https://..."
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
                          Demo / Explainer Video URL
                        </label>
                        <input
                          type="url"
                          name="demoVideoUrl"
                          value={formData.demoVideoUrl}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "provider" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Provider Experience
                          </label>
                          <input
                            type="text"
                            name="providerExperience"
                            value={formData.providerExperience}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="e.g. 5+ Years"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Contact Info
                          </label>
                          <input
                            type="text"
                            name="contactInfo"
                            value={formData.contactInfo}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="e.g. Phone or Email"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Warranty / Guarantee
                          </label>
                          <input
                            type="text"
                            name="warranty"
                            value={formData.warranty}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="e.g. 30 Days Quality Guarantee"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Cancellation Policy
                          </label>
                          <input
                            type="text"
                            name="cancellationPolicy"
                            value={formData.cancellationPolicy}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                            placeholder="e.g. Free cancellation up to 24hr"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Tags / SEO Keywords
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                          placeholder="AC Repair, Chittagong, Home Service"
                        />
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
                Cancel
              </button>
              <button
                type="submit"
                form="serviceForm"
                className="px-6 py-2 text-xs font-bold text-white uppercase bg-fuchsia-600 rounded hover:bg-fuchsia-700 shadow-md"
              >
                Publish Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
