import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  ArrowLeftRight,
  Archive,
  Shield,
  Target,
  X,
  Store,
  ShoppingCart,
  Globe,
  Coins,
  BarChart3,
  Truck,
  Briefcase,
  RotateCcw,
  Megaphone,
  Truck as TruckDelivery,
  MessageSquare,
  ListTodo,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useSettings } from "../context/SettingsContext";

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { pathname } = useLocation();
  const { logout, user, setRole } = useAuth();
  const { t } = useTranslation();
  const { currency, setCurrency, availableCurrencies, language, setLanguage } =
    useSettings();

  let navItems = [
    { name: t("dashboard"), path: "/dashboard", icon: LayoutDashboard },
  ];

  if (user?.role === "customer") {
    navItems.push({
      name: "Shop Online",
      path: "/storefront",
      icon: ShoppingCart,
    });
    navItems.push({
      name: "Products",
      path: "/storefront?tab=products",
      icon: Package,
    });
    navItems.push({
      name: "Services",
      path: "/storefront?tab=services",
      icon: Settings,
    });
    navItems.push({
      name: t("sellers_directory"),
      path: "/sellers",
      icon: Store,
    });
    navItems.push({ name: "My Invoices", path: "/invoices", icon: FileText });
    navItems.push({ name: "Support", path: "/support", icon: MessageSquare });
    navItems.push({ name: "Settings", path: "/settings", icon: Settings });
  } else {
    // product_seller, service_seller, reseller, super_admin, admin
    const isSuperOrAdmin = ["super_admin", "admin"].includes(user?.role || "");
    const isSellerOrReseller = [
      "product_seller",
      "service_seller",
      "reseller",
    ].includes(user?.role || "");

    // Helper to check if feature is allowed for seller, or if user is admin
    const canAccess = (feature: string) => {
      if (isSuperOrAdmin) return true;
      if (isSellerOrReseller) return user?.allowedFeatures?.includes(feature);
      return false;
    };

    if (canAccess("products") || canAccess("inventory")) {
      if (canAccess("products"))
        navItems.push({
          name: t("products"),
          path: "/products",
          icon: Package,
        });
      if (canAccess("inventory"))
        navItems.push({
          name: t("inventory"),
          path: "/inventory",
          icon: Archive,
        });
    }
    if (canAccess("services")) {
      navItems.push({ name: t("services"), path: "/services", icon: Settings });
    }
    if (canAccess("pos"))
      navItems.push({ name: t("pos"), path: "/pos", icon: ShoppingCart });
    if (canAccess("customers"))
      navItems.push({ name: t("customers"), path: "/customers", icon: Users });
    if (canAccess("vendors"))
      navItems.push({ name: "Vendors", path: "/vendors", icon: Truck });
    if (canAccess("tasks"))
      navItems.push({ name: "Tasks", path: "/tasks", icon: ListTodo });
    if (canAccess("support"))
      navItems.push({ name: "Support", path: "/support", icon: MessageSquare });
    if (canAccess("purchase_orders"))
      navItems.push({
        name: "Purchase Orders",
        path: "/purchase-orders",
        icon: FileText,
      });
    if (canAccess("invoices"))
      navItems.push({ name: t("invoices"), path: "/invoices", icon: FileText });
    if (canAccess("sales_targets"))
      navItems.push({ name: "Sales Targets", path: "/sales-targets", icon: Target });
    if (canAccess("delivery"))
      navItems.push({
        name: "Delivery",
        path: "/delivery",
        icon: TruckDelivery,
      });
    if (canAccess("quotations"))
      navItems.push({
        name: "Quotations",
        path: "/quotations",
        icon: FileText,
      });
    if (canAccess("returns"))
      navItems.push({ name: "Returns", path: "/returns", icon: RotateCcw });
    if (canAccess("reports"))
      navItems.push({ name: "Reports", path: "/reports", icon: BarChart3 });
    if (canAccess("accounts"))
      navItems.push({
        name: t("accounts"),
        path: "/accounts",
        icon: ArrowLeftRight,
      });

    if (canAccess("warehouses"))
      navItems.push({
        name: t("warehouses"),
        path: "/warehouses",
        icon: Archive,
      });
    if (canAccess("manufacturing"))
      navItems.push({
        name: "Manufacturing",
        path: "/manufacturing",
        icon: Package,
      });
    if (canAccess("expenses"))
      navItems.push({ name: "Expenses", path: "/expenses", icon: Coins });
    if (canAccess("hr"))
      navItems.push({ name: "HR & Payroll", path: "/hr", icon: Briefcase });

    if (canAccess("marketing"))
      navItems.push({ name: "Marketing", path: "/marketing", icon: Megaphone });
    if (canAccess("offers"))
      navItems.push({ name: "Offers/Promos", path: "/offers", icon: FileText });

    // Storefront configuration is generally for all sellers + admins
    if (isSuperOrAdmin || isSellerOrReseller) {
      navItems.push({
        name: t("profile_store"),
        path: "/storefront-config",
        icon: Store,
      });
    }

    if (isSuperOrAdmin) {
      navItems.push({ name: t("users"), path: "/users", icon: Shield });
      navItems.push({
        name: t("audit_logs"),
        path: "/audit-logs",
        icon: Shield,
      });
    }

    // Always add settings to all users at the end
    navItems.push({ name: "Settings", path: "/settings", icon: Settings });
  }

  return (
    <aside
      className={`w-64 bg-white/70 backdrop-blur-xl h-[calc(100vh-2rem)] my-4 ml-4 rounded-2xl flex flex-col text-slate-600 fixed top-0 left-0 border border-slate-200/50 shadow-xl shadow-slate-200/20 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-[120%]"}`}
    >
      <div className="h-16 px-6 border-b border-slate-100 flex justify-between items-center bg-transparent shrink-0 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-indigo-500/30">
            <span className="text-[11px] tracking-wider">DB</span>
          </div>
          <span className="text-slate-900 font-bold tracking-tight text-lg">
            Dealbuzz
          </span>
        </div>
        <button
          className="md:hidden text-slate-400 hover:text-slate-900"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 mb-3 mt-2">
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const searchParamsExtracted = item.path.split("?")[1] || "";
          const pathOnly = item.path.split("?")[0];

          let isActive = pathname === pathOnly;
          if (isActive && searchParamsExtracted) {
            isActive = window.location.search.includes(searchParamsExtracted);
          } else if (
            isActive &&
            !searchParamsExtracted &&
            window.location.search.includes("tab=")
          ) {
            isActive = false;
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "text-indigo-700 bg-indigo-50 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-3 rounded-b-2xl bg-white/50">
        {user?.role === "super_admin" && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="text-[10px] text-indigo-500 uppercase font-black mb-3 tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Dev Overlay
            </div>
            <select
              value={user?.role || "admin"}
              onChange={(e) => {
                if (setRole) {
                  setRole(e.target.value);
                }
              }}
              className="w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="super_admin">Super Admin</option>
              <option value="product_seller">Product Seller</option>
              <option value="service_seller">Service Seller</option>
              <option value="reseller">Reseller</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-red-500" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
