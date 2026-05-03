import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Store, Star, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function SellersDirectory() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithAuth('/sellers')
      .then(res => setSellers(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading sellers...</div>;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col pt-4 font-sans">
      <div className="mb-10 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 border border-slate-200/60 shadow-sm text-indigo-600 font-bold uppercase tracking-widest text-[10px] mb-4">
          <Store className="w-3.5 h-3.5" /> Trusted Network
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight mb-4 leading-tight relative z-10">Sellers Directory</h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg relative z-10">Explore top-rated sellers and exceptional businesses across our unified commerce network.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sellers.map(seller => (
            <div 
            key={seller._id} 
            onClick={() => navigate(`/sellers/${seller._id}`)}
            className="group bg-white rounded-3xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer flex flex-col relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div 
               className="h-28 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-rose-500"
               style={seller.coverPhoto ? { backgroundImage: `url(${seller.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
             >
               {/* Pattern overlay */}
               {!seller.coverPhoto && <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>}
               {seller.coverPhoto && <div className="absolute inset-0 bg-black/20"></div>}
               <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center text-indigo-600 font-bold group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 relative z-10 overflow-hidden">
                 {seller.profilePicture ? (
                    <img src={seller.profilePicture} alt={seller.name} className="w-full h-full object-cover" />
                 ) : (
                    <Store className="w-7 h-7" />
                 )}
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 flex-1 flex flex-col relative z-10">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-1 flex items-center gap-2 leading-tight truncate">
                {seller.name} <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              </h3>
              <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest mb-4 bg-indigo-50/50 inline-block w-fit px-2 py-0.5 rounded-md border border-indigo-100 mt-1">{seller.role.replace('_', ' ')}</p>
              <div className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                {seller.bio || "Providing premium products and exceptional services. View profile for more details."}
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs text-amber-700 font-bold ml-1.5">4.0</span>
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                  Profile <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
        {sellers.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No sellers found in the directory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
