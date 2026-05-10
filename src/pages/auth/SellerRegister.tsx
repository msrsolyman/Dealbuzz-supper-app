import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { fetchWithAuth } from "../../lib/api";
import { toast } from "sonner";
import { Store, Briefcase, RefreshCw } from "lucide-react";

export default function SellerRegister() {
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "product_seller",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth("/auth/register-user", {
        method: "POST",
        body: JSON.stringify(userForm),
      });
      toast.success(
        "Registration successful! Please wait for super admin approval before logging in.",
      );
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 border-8 border-indigo-600 p-4">
      <div className="w-full max-w-md p-8 bg-white border border-slate-200 shadow-xl rounded-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

        <h1 className="text-3xl font-display font-black text-center text-slate-900 tracking-tighter mb-2">
          DEALBUZZ
        </h1>
        <p className="text-center text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-8">
          Partner Onboarding
        </p>

        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              I am applying as a...
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { id: "product_seller", label: "Product Seller", icon: Store },
                {
                  id: "service_seller",
                  label: "Service Provider",
                  icon: Briefcase,
                },
                { id: "reseller", label: "Reseller", icon: RefreshCw },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setUserForm({ ...userForm, role: r.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${userForm.role === r.id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"}`}
                >
                  <r.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Company/Full Name
            </label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              placeholder="Acme Trading Co."
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
              placeholder="hello@acme.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Secure Password
            </label>
            <input
              type="password"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              placeholder="••••••••"
              required
            />
            <p className="text-[10px] text-amber-600 mt-2 font-medium">
              Your application will be reviewed by our platform administrators
              before account activation.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Already a partner?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline"
            >
              Log in
            </Link>
          </p>
          <div className="mt-2">
            <Link
              to="/register"
              className="text-[10px] text-slate-400 hover:text-slate-600 underline"
            >
              Register as a customer instead?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
