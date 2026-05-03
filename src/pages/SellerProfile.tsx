import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { fetchWithAuth } from '../lib/api';
import { Store, Star, ShieldCheck, MessageSquare, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function SellerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const loadData = async () => {
    try {
      const [sellersRes, reviewsRes] = await Promise.all([
        fetchWithAuth('/sellers'),
        fetchWithAuth(`/reviews?sellerId=${id}`)
      ]);
      const foundSeller = sellersRes.data?.find((s: any) => s._id === id);
      setSeller(foundSeller);
      setReviews(reviewsRes.data || []);
    } catch (e) {
      toast.error('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    try {
      await fetchWithAuth('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          sellerId: id,
          customerId: user?._id || user?.id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      toast.success('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (!seller) return <div className="p-8 text-center text-rose-500 font-bold">Seller not found</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans">
      {/* Seller Header */}
      <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm mb-8 relative">
        <div className="absolute top-0 left-0 w-full h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2"></div>
        <div className="h-48 bg-gradient-to-br from-[#0B1120] via-indigo-900 to-fuchsia-900 relative overflow-hidden">
          {/* Decorative Pattern overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>
        </div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 relative z-10">
          <div className="-mt-16 w-32 h-32 bg-white rounded-2xl shadow-xl border-[6px] border-white flex items-center justify-center text-indigo-600 shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Store className="w-14 h-14 relative z-10" strokeWidth={1.5} />
          </div>
          <div className="pt-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-black text-slate-900 flex items-center gap-2 mb-1">
                  {seller.name} <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                </h1>
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50/80 border border-indigo-100 text-xs font-bold text-indigo-700 uppercase tracking-widest mt-1">
                  <Star className="w-3.5 h-3.5 mr-1.5" />
                  {seller.role.replace('_', ' ')}
                </div>
                <div className="flex items-center gap-3 mt-4 text-sm text-slate-600 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-display font-bold text-slate-900 text-base">{averageRating}</span>
                  <span className="text-slate-400 font-medium">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Info */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent opacity-100 rounded-bl-full pointer-events-none"></div>
            <h3 className="font-display font-bold text-slate-900 mb-5 text-lg flex items-center gap-2 relative z-10">
               <Store className="w-5 h-5 text-indigo-500" />
               About Business
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed relative z-10">
              We are a verified merchant on the platform, providing high-quality products and services to our customers. 
              Our commitment is to deliver excellence and ensure customer satisfaction in every transaction.
            </p>
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 font-medium text-sm text-slate-600 relative z-10">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-400" /> 
                <span>Member since <strong>2026</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reviews */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-7 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <h3 className="font-display font-bold text-slate-900 mb-8 text-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100"><MessageSquare className="w-5 h-5" /></div>
               Customer Reviews
            </h3>

            {/* Leave a review form - Only for customers */}
            {user?.role === 'customer' && (
              <form onSubmit={submitReview} className="mb-10 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/50 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 relative z-10">Leave a Review</h4>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className={`transition-all hover:scale-110 ${newReview.rating >= star ? 'text-amber-500' : 'text-slate-300 hover:text-amber-300'}`}
                    >
                      <Star className={`w-7 h-7 ${newReview.rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <div className="relative z-10">
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with this seller..."
                    className="w-full border border-slate-200/80 rounded-xl pl-4 pr-14 py-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white resize-none shadow-sm transition-all"
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  ></textarea>
                  <button 
                    type="submit"
                    className="absolute right-3 bottom-4 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Review List */}
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review._id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-fuchsia-100 border border-white shadow-sm flex items-center justify-center text-indigo-700 font-display font-bold text-sm">
                        {review.customerId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-none mb-1">{review.customerId?.name || 'Unknown User'}</div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 mt-1.5">
                          <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-[3.25rem]">
                    {review.comment}
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                     <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">No reviews yet. Be the first to leave one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
