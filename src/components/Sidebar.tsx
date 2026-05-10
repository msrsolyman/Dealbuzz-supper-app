import { Link, useLocation } from "react-router";
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
  TrendingUp,
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
    if (canAccess("reports")) {
      navItems.push({ name: "Reports", path: "/reports", icon: BarChart3 });
      navItems.push({ name: "Analytics", path: "/analytics", icon: TrendingUp });
    }
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
      className={`w-64 bg-slate-50 h-screen flex flex-col text-slate-600 fixed top-0 left-0 border-r border-slate-200 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="h-16 px-6 border-b border-slate-200 flex justify-between items-center bg-transparent shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center font-semibold text-white shrink-0">
            <span className="text-[10px]">DB</span>
          </div>
          <span className="text-slate-900 font-semibold tracking-tight text-sm">
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

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] text-slate-400 font-medium px-3 mb-2 mt-2">
          Overview
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
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "text-slate-900 bg-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 flex flex-col gap-3 bg-slate-50">
        {user?.role === "super_admin" && (
          <div className="bg-slate-100 p-3 rounded-md border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wide flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Dev Tools
            </div>
            <select
              value={user?.role || "admin"}
              onChange={(e) => {
                if (setRole) {
                  setRole(e.target.value);
                }
              }}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-md px-2.5 py-1.5 outline-none focus:border-slate-400 transition-colors cursor-pointer"
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
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
