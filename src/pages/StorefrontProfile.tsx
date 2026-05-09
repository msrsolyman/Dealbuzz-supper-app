import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Camera, Save, MapPin, Globe, Phone, Mail, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '../lib/api';
import { useNavigate } from 'react-router';

export default function StorefrontProfile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    address: '',
    phone: '',
    email: user?.email || '',
    website: '',
    coverColor: '#4f46e5',
    logoUrl: '',
    coverPhoto: ''
  });

  useEffect(() => {
    // Populate with actual user data if available
    setFormData(prev => ({
      ...prev,
      storeName: user?.companyName || user?.name || (user?.role === 'product_seller' ? 'My Premium Store' : user?.role === 'service_seller' ? 'Expert Services Agency' : 'Global Reseller network'),
      description: user?.companyDescription || user?.bio || '',
      address: user?.address || '',
      phone: user?.phone || '',
      website: user?.website || '',
      coverColor: user?.coverColor || '#4f46e5',
      logoUrl: user?.profilePicture || '',
      coverPhoto: user?.coverPhoto || ''
    }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        name: user?.name, // Keep existing name
        companyName: formData.storeName,
        companyDescription: formData.description,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        coverColor: formData.coverColor,
        profilePicture: formData.logoUrl,
        coverPhoto: formData.coverPhoto,
        bio: formData.description
      };
      const res = await fetchWithAuth('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setUser(res.user);
      
      toast.success('Storefront profile updated successfully!');
      toast.info('Customers will now see your updated profile.');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'customer') {
    return <div className="p-8 text-center text-slate-500">Customers do not have a public storefront profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <Store className="w-5 h-5 text-indigo-600" />
            </div>
            Storefront Setup
          </h1>
          <p className="text-sm text-slate-500 mt-2 ml-1">
            Customize how your business appears to customers. Make it attractive!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-widest border border-indigo-100 shadow-sm">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Cover Image/Color Area */}
        <div 
          className="h-56 w-full relative group transition-colors duration-300"
          style={{ 
            backgroundColor: formData.coverColor,
            backgroundImage: formData.coverPhoto ? `url(${formData.coverPhoto})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-3">
            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <label className="cursor-pointer flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:scale-105 active:scale-95 duration-200 relative overflow-hidden">
                 <Camera className="w-4 h-4" /> Upload Cover Photo
                 <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverPhoto')} className="absolute inset-0 opacity-0 cursor-pointer" />
               </label>
               <label className="cursor-pointer flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:scale-105 active:scale-95 duration-200 relative overflow-hidden">
                 <div className="w-4 h-4 rounded-full border border-slate-300" style={{backgroundColor: formData.coverColor}}></div> Color
                 <input type="color" name="coverColor" value={formData.coverColor} onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               </label>
            </div>
          </div>
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-72 h-72 bg-white/40 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-72 h-72 bg-white/20 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/3"></div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 relative">
          {/* Avatar / Logo */}
          <div className="absolute -top-20 left-8 z-10">
            <div className="w-28 h-28 rounded-3xl bg-white p-1.5 border border-slate-200 shadow-xl overflow-hidden relative">
              <label className="w-full h-full rounded-2xl bg-slate-50 border-2 border-slate-200/60 border-dashed flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer transition-all relative group overflow-hidden block">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 m-auto mt-7" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-indigo-600" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
              </label>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <Building2 className="w-3.5 h-3.5" /> Store Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corporation" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 bg-slate-50/50 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <Sparkles className="w-3.5 h-3.5" /> Description / Catchphrase
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers what makes you amazing..." 
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 resize-none bg-slate-50/50 focus:bg-white font-medium" 
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-medium">This will be displayed on your public storefront page.</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <MapPin className="w-3.5 h-3.5" /> Business Address
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Commerce St, City" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 bg-slate-50/50 focus:bg-white font-medium" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                    <Phone className="w-3.5 h-3.5" /> Contact Phone
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 bg-slate-50/50 focus:bg-white font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                    <Mail className="w-3.5 h-3.5" /> Support Email
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 bg-slate-50/50 focus:bg-white font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                  <Globe className="w-3.5 h-3.5" /> Website (Optional)
                </label>
                <input 
                  type="url" 
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.yourdomain.com" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 bg-slate-50/50 focus:bg-white font-medium" 
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate(`/sellers/${user?._id}`)}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors border border-slate-200 shadow-sm flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Preview Store
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
