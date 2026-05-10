import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Plus,
  GripVertical,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Tasks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });

  const loadTasks = async () => {
    try {
      const res = await fetchWithAuth("/tasks");
      setTasks(res.data);
    } catch (e) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await fetchWithAuth(`/tasks/${editItem._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Task updated");
      } else {
        await fetchWithAuth("/tasks", {
          method: "POST",
          body: JSON.stringify({ ...formData, createdBy: user?._id }),
        });
        toast.success("Task created");
      }
      setIsModalOpen(false);
      setEditItem(null);
      loadTasks();
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
      });
    } catch (e) {
      toast.error("Failed to save task");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchWithAuth(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      loadTasks();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchWithAuth(`/tasks/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      loadTasks();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const columns = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
  const getColIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
      case "IN_PROGRESS":
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case "REVIEW":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "DONE":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500">Kanban Board for your team</p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setFormData({
              title: "",
              description: "",
              status: "TODO",
              priority: "MEDIUM",
              dueDate: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
        {columns.map((col) => (
          <div
            key={col}
            className="bg-slate-50 border border-slate-200 rounded-2xl min-w-[300px] w-80 shrink-0 snap-start flex flex-col h-[calc(100vh-200px)]"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                {getColIcon(col)}
                {col.replace("_", " ")}
              </div>
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold">
                {tasks.filter((t) => t.status === col).length}
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {tasks
                .filter((t) => t.status === col)
                .map((task) => (
                  <div
                    key={task._id}
                    className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900">{task.title}</h4>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div
                        className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded ${
                          task.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.priority}
                      </div>
                      <div className="flex gap-1">
                        {col !== "TODO" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                task._id,
                                columns[columns.indexOf(col) - 1],
                              )
                            }
                            className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 bg-slate-100 hover:bg-indigo-50 rounded font-medium"
                          >
                            ← Prev
                          </button>
                        )}

                        {col !== "DONE" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                task._id,
                                columns[columns.indexOf(col) + 1],
                              )
                            }
                            className="text-xs text-slate-500 hover:text-indigo-600 px-2 py-1 bg-slate-100 hover:bg-indigo-50 rounded font-medium"
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem(task);
                        setFormData(task);
                        setIsModalOpen(true);
                      }}
                      className="absolute inset-0 w-full h-full cursor-pointer z-0 opacity-0"
                      title="Edit Task"
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">
                {editItem ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
