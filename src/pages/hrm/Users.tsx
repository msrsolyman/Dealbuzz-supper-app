import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import {
  Plus,
  Check,
  X,
  Users as UsersIcon,
  Edit,
  Shield,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const AVAILABLE_FEATURES = [
  { id: "products", label: "Products" },
  { id: "services", label: "Services" },
  { id: "inventory", label: "Inventory" },
  { id: "pos", label: "POS" },
  { id: "customers", label: "Customers" },
  { id: "vendors", label: "Vendors" },
  { id: "tasks", label: "Tasks" },
  { id: "purchase_orders", label: "Purchase Orders" },
  { id: "invoices", label: "Invoices" },
  { id: "delivery", label: "Delivery" },
  { id: "quotations", label: "Quotations" },
  { id: "returns", label: "Returns" },
  { id: "reports", label: "Reports" },
  { id: "accounts", label: "Accounts" },
  { id: "warehouses", label: "Warehouses" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "expenses", label: "Expenses" },
  { id: "hr", label: "HR & Payroll" },
  { id: "marketing", label: "Marketing" },
  { id: "offers", label: "Offers & Promos" },
];

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [editingUser, setEditingUser] = useState<any>(null);
  const [addingUser, setAddingUser] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<any>({});

  const loadUsers = () => {
    setLoading(true);
    fetchWithAuth("/users")
      .then((res) => {
        if (res && res.data) {
          setUsers(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEdit = (u: any) => {
    setEditingUser(u);
    setEditForm({
      status: u.status || "active",
      approvalStatus: u.approvalStatus || "approved",
      allowedFeatures: u.allowedFeatures || [],
    });
  };

  const openAdd = () => {
    setAddingUser(true);
    setEditForm({
      name: "",
      email: "",
      password: "",
      role: "customer",
      status: "active",
      approvalStatus: "approved",
      allowedFeatures: [],
    });
  };

  const handleUpdate = async () => {
    try {
      await fetchWithAuth(`/users/${editingUser._id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      toast.success("User updated successfully");
      setEditingUser(null);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user");
    }
  };

  const handleCreate = async () => {
    try {
      if (!editForm.name || !editForm.email || !editForm.password) {
        throw new Error("Name, email, and password are required.");
      }
      await fetchWithAuth("/users", {
        method: "POST",
        body: JSON.stringify(editForm),
      });
      toast.success("User created successfully");
      setAddingUser(false);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    }
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden font-sans relative">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-bold">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <UsersIcon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            User Management
          </h2>
        </div>
        <button
          onClick={openAdd}
          className="text-sm font-bold text-white uppercase bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-bold">Name</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-center">Approval</th>
              <th className="px-6 py-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-display font-bold text-xs flex items-center justify-center shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                  {u.email}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {u.status !== "inactive" ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 border border-emerald-100 rounded-md text-[10px] uppercase font-bold tracking-widest">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 border border-rose-100 rounded-md text-[10px] uppercase font-bold tracking-widest">
                      <X className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {["product_seller", "service_seller", "reseller"].includes(
                    u.role,
                  ) ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[10px] uppercase font-bold tracking-widest ${
                        u.approvalStatus === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : u.approvalStatus === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {u.approvalStatus || "pending"}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  No users found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading users...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(editingUser || addingUser) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold font-display">
                    {editingUser
                      ? editingUser.name.charAt(0)
                      : editForm.name?.charAt(0) || "+"}
                  </div>
                  <div>
                    <h2 className="text-slate-900 font-bold">
                      {editingUser ? editingUser.name : "Add New User"}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      {editingUser
                        ? `${editingUser.email} • ${editingUser.role.replace("_", " ")}`
                        : "Create a new account"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setAddingUser(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-white shadow-sm rounded-xl border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {addingUser && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none font-mono"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                        placeholder="Secure password"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Role
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="product_seller">Product Seller</option>
                        <option value="service_seller">Service Seller</option>
                        <option value="reseller">Reseller</option>
                        <option value="customer">Customer</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-emerald-500" /> Account
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                    >
                      <option value="active">Active (Can Login)</option>
                      <option value="inactive">Inactive (Suspended)</option>
                    </select>
                  </div>

                  {["product_seller", "service_seller", "reseller"].includes(
                    editingUser ? editingUser.role : editForm.role,
                  ) && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-indigo-500" /> Approval
                        Status
                      </label>
                      <select
                        value={editForm.approvalStatus}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            approvalStatus: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                </div>

                {["product_seller", "service_seller", "reseller"].includes(
                  editingUser ? editingUser.role : editForm.role,
                ) && (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-indigo-500" /> Allowed
                      Modules & Features
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {AVAILABLE_FEATURES.map((f) => (
                        <label
                          key={f.id}
                          className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={editForm.allowedFeatures?.includes(f.id)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setEditForm({
                                  ...editForm,
                                  allowedFeatures: [
                                    ...editForm.allowedFeatures,
                                    f.id,
                                  ],
                                });
                              else
                                setEditForm({
                                  ...editForm,
                                  allowedFeatures:
                                    editForm.allowedFeatures.filter(
                                      (x: string) => x !== f.id,
                                    ),
                                });
                            }}
                          />
                          <span className="text-xs font-semibold text-slate-700">
                            {f.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setAddingUser(false);
                  }}
                  className="px-5 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={addingUser ? handleCreate : handleUpdate}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 uppercase tracking-wider shadow-sm shadow-indigo-500/30"
                >
                  {addingUser ? "Create User" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
