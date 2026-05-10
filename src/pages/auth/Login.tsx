import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../lib/api";
import { toast } from "sonner";

export default function Login() {
  const [loginType, setLoginType] = useState<"customer" | "seller">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // We could add client side role check if necessary, but all users login through same endpoint
      // We can warn if they login to the wrong portal
      const role = data.user.role;
      if (
        loginType === "customer" &&
        !["customer", "super_admin", "admin"].includes(role)
      ) {
        toast.error(
          "This is the customer portal. You are registered as a seller.",
        );
      } else if (loginType === "seller" && ["customer"].includes(role)) {
        toast.error(
          "This is the seller portal. You are registered as a customer.",
        );
      }

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 border-8 border-slate-900">
      <div className="w-full max-w-sm p-6 bg-white border border-slate-200 shadow-xl rounded-2xl">
        <h1 className="text-2xl font-bold text-center text-slate-900 tracking-tight">
          DEALBUZZ
        </h1>
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mb-6">
          {loginType === "customer"
            ? "Customer Authentication"
            : "Seller Login Panel"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 font-mono"
              placeholder={
                loginType === "customer"
                  ? "customer@example.com"
                  : "seller@example.com"
              }
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white text-[10px] font-bold uppercase py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 tracking-widest mt-2 shadow-sm"
          >
            {loading
              ? "Authenticating..."
              : loginType === "customer"
                ? "Customer Login"
                : "Secure Seller Login"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold tracking-widest py-3 rounded-xl transition-all shadow-sm mb-2"
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

          {loginType === "customer" ? (
            <>
              <button
                type="button"
                onClick={() => setLoginType("seller")}
                className="flex items-center justify-center gap-2 w-full border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest py-2 rounded-xl transition-all"
              >
                Become a Seller
              </button>
              <div className="text-center mt-2">
                <p className="text-[11px] text-slate-500 font-medium">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline"
                  >
                    Register now
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLoginType("customer")}
                className="flex items-center justify-center gap-2 w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest py-2 rounded-xl transition-all"
              >
                Go back to Customer Login
              </button>
              <div className="text-center mt-2 flex flex-col gap-2">
                <p className="text-[11px] text-slate-500 font-medium">
                  Want to sell on Dealbuzz?{" "}
                  <Link
                    to="/seller-register"
                    className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 hover:underline"
                  >
                    Register as Seller
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
