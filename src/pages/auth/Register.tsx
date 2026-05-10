import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { fetchWithAuth } from "../../lib/api";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().default("customer"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "customer",
    },
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost. Relaxing it slightly to allow all if OAUTH_AUTH_SUCCESS to ensure it works in all preview domains.
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        toast.success("Successfully logged in with Google!");
        login(event.data.token, event.data.user);
        navigate("/dashboard");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [login, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("/api/auth/google/url");
      if (!response.ok) throw new Error("Failed to get auth URL");
      const { url } = await response.json();
      const authWindow = window.open(
        url,
        "oauth_popup",
        "width=600,height=700",
      );
      if (!authWindow) {
        toast.error(
          "Please allow popups for this site to connect your account.",
        );
        return;
      }

      // Fallback polling in case postMessage fails
      const pollTimer = window.setInterval(() => {
        if (authWindow.closed) {
          window.clearInterval(pollTimer);
          const token = localStorage.getItem("token");
          const userStr = localStorage.getItem("user");
          if (token && userStr) {
            toast.success("Successfully logged in with Google!");
            login(token, JSON.parse(userStr));
            navigate("/dashboard");
          }
        }
      }, 500);
    } catch (err) {
      toast.error("Google OAuth error");
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await fetchWithAuth("/auth/register-user", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Registration successful. You can now login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 border-8 border-slate-900 p-4">
      <div className="w-full max-w-md p-8 bg-white border border-slate-200 shadow-xl rounded-2xl relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

        <h1 className="text-3xl font-display font-black text-center text-slate-900 tracking-tighter mb-2">
          DEALBUZZ
        </h1>
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">
          Join the Ecosystem
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium ${
                errors.name ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono ${
                errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Secure Password
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium ${
                errors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-6 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? "Creating Account..." : "Continue"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold tracking-widest py-3 rounded-xl transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <Link
            to="/seller-register"
            className="flex items-center justify-center gap-2 w-full border-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all mt-2"
          >
            <Store className="w-4 h-4" /> Become a Seller
          </Link>
          <div className="text-center mt-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline"
              >
                Log in securely
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
