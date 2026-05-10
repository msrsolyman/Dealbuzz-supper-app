import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function Offers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Product");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const res = await fetchWithAuth("/offers?limit=100");
      setOffers(res.data);
    } catch (e) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        type,
        bannerImage,
        discountPercentage: Number(discountPercentage),
        startDate,
        endDate,
      };

      if (currentOffer) {
        await fetchWithAuth(`/offers/${currentOffer._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Offer updated");
      } else {
        await fetchWithAuth("/offers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Offer created");
      }
      setIsModalOpen(false);
      loadOffers();
    } catch (e) {
      toast.error("Failed to save offer");
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: string,
    priority?: number,
  ) => {
    try {
      const payload: any = { status };
      if (priority !== undefined) payload.priority = priority;

      await fetchWithAuth(`/offers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success(`Offer marked as ${status}`);
      loadOffers();
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await fetchWithAuth(`/offers/${id}`, { method: "DELETE" });
      toast.success("Offer deleted");
      loadOffers();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const openForm = (offer?: any) => {
    if (offer) {
      setCurrentOffer(offer);
      setTitle(offer.title);
      setDescription(offer.description);
      setType(offer.type);
      setBannerImage(offer.bannerImage || "");
      setDiscountPercentage(offer.discountPercentage?.toString() || "");
      setStartDate(
        offer.startDate ? format(new Date(offer.startDate), "yyyy-MM-dd") : "",
      );
      setEndDate(
        offer.endDate ? format(new Date(offer.endDate), "yyyy-MM-dd") : "",
      );
    } else {
      setCurrentOffer(null);
      setTitle("");
      setDescription("");
      setType("Product");
      setBannerImage("");
      setDiscountPercentage("");
      setStartDate("");
      setEndDate("");
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Offers & Promotions
          </h1>
          <p className="text-slate-500">Manage promotional campaigns</p>
        </div>
        {!isSuperAdmin && (
          <button
            onClick={() => openForm()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" /> New Offer
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Title</th>
              <th className="p-4 font-semibold text-slate-600">
                Type/Discount
              </th>
              <th className="p-4 font-semibold text-slate-600">Dates</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              {isSuperAdmin && (
                <th className="p-4 font-semibold text-slate-600">Priority</th>
              )}
              <th className="p-4 font-semibold text-slate-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr
                key={offer._id}
                className="border-b border-slate-50 hover:bg-slate-50"
              >
                <td className="p-4">
                  <div className="font-medium text-slate-900">
                    {offer.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {offer.description}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 mb-1">
                    <Tag className="w-3 h-3" /> {offer.type}
                  </span>
                  <div>{offer.discountPercentage}% Off</div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {format(new Date(offer.startDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(offer.endDate), "MMM d, yyyy")}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      offer.status === "APPROVED" || offer.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : offer.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {offer.status}
                  </span>
                </td>
                {isSuperAdmin && (
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                        {offer.priority === 999
                          ? "Normal"
                          : `P${offer.priority}`}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              offer._id,
                              offer.status,
                              Math.max(1, offer.priority - 1),
                            )
                          }
                          className="text-xs text-indigo-600 font-medium"
                        >
                          ↑ Elevate
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              offer._id,
                              offer.status,
                              offer.priority + 1,
                            )
                          }
                          className="text-xs text-slate-500 font-medium"
                        >
                          ↓ Drop
                        </button>
                      </div>
                    </div>
                  </td>
                )}
                <td className="p-4 text-right space-x-2">
                  {isSuperAdmin ? (
                    <>
                      {offer.status !== "APPROVED" &&
                        offer.status !== "ACTIVE" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(offer._id, "ACTIVE")
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-xl"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      {offer.status !== "REJECTED" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(offer._id, "REJECTED")
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openForm(offer)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No offers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {currentOffer ? "Edit Offer" : "New Offer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Offer Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Target Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2"
                  >
                    <option value="Product">Products</option>
                    <option value="Service">Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Banner Image URL or Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="flex-1 w-full border border-slate-200 rounded-xl p-2"
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {bannerImage && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 relative">
                    <img
                      src={bannerImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
