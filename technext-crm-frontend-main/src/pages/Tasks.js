import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Normal",
    status: "Pending",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/tasks`)
      .then((r) => {
        setTasks(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    const matchPriority =
      filterPriority === "All" || t.priority === filterPriority;
    const matchSearch =
      !searchVal ||
      t.title?.toLowerCase().includes(searchVal.toLowerCase()) ||
      t.assignedTo?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem) await axios.put(`${BASE_URL}/tasks/${editItem.id}`, payload);
    else await axios.post(`${BASE_URL}/tasks`, payload);
    setShowModal(false);
    setEditItem(null);
    setForm({
      title: "",
      description: "",
      priority: "Normal",
      status: "Pending",
      dueDate: "",
      assignedTo: "",
    });
    fetchAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete task?")) {
      await axios.delete(`${BASE_URL}/tasks/${id}`);
      fetchAll();
    }
  };
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === "Done" ? "Pending" : "Done";
    await axios.put(`${BASE_URL}/tasks/${task.id}`, {
      ...task,
      status: newStatus,
    });
    fetchAll();
  };

  const getPriorityStyle = (p) =>
    ({
      High: { bg: "#fef2f2", color: "#ef4444" },
      Medium: { bg: "#fffbeb", color: "#f59e0b" },
      Normal: { bg: "#eff6ff", color: "#3b82f6" },
      Low: { bg: "#f0fdf4", color: "#10b981" },
    })[p] || { bg: "#f9fafb", color: "#6b7280" };
  const getStatusStyle = (s) =>
    ({
      Done: { bg: "#f0fdf4", color: "#10b981" },
      Pending: { bg: "#fffbeb", color: "#f59e0b" },
      InProgress: { bg: "#eff6ff", color: "#3b82f6" },
    })[s] || { bg: "#f9fafb", color: "#6b7280" };

  const isOverdue = (task) =>
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "Done";

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "4px solid #eef2ff",
            borderTop: "4px solid #6366f1",
          }}
        />
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>
          Loading tasks...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Tasks</span>
          <span style={s.count}>{filtered.length}</span>
          <span
            style={{
              background: "#f0fdf4",
              color: "#10b981",
              fontSize: "11px",
              fontWeight: "700",
              padding: "2px 9px",
              borderRadius: "20px",
            }}
          >
            {tasks.filter((t) => t.status === "Done").length} Done
          </span>
          <span
            style={{
              background: "#fef2f2",
              color: "#ef4444",
              fontSize: "11px",
              fontWeight: "700",
              padding: "2px 9px",
              borderRadius: "20px",
            }}
          >
            {tasks.filter((t) => isOverdue(t)).length} Overdue
          </span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search tasks..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            {searchVal && (
              <span
                style={{
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "11px",
                }}
                onClick={() => setSearchVal("")}
              >
                ✕
              </span>
            )}
          </div>
          <select
            style={s.filterSel}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option>Pending</option>
            <option>InProgress</option>
            <option>Done</option>
          </select>
          <select
            style={s.filterSel}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Normal</option>
            <option>Low</option>
          </select>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                title: "",
                description: "",
                priority: "Normal",
                status: "Pending",
                dueDate: "",
                assignedTo: "",
              });
              setShowModal(true);
            }}
          >
            + Add Task
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          margin: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7f0",
          overflow: "hidden",
        }}
      >
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {[
                "",
                "Task",
                "Priority",
                "Assigned To",
                "Due Date",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} style={s.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    ✅
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      marginBottom: "6px",
                      color: "#0f1117",
                    }}
                  >
                    No tasks found
                  </div>
                  <button style={s.addBtn} onClick={() => setShowModal(true)}>
                    + Add Task
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((task) => {
                const ps = getPriorityStyle(task.priority);
                const ss = getStatusStyle(task.status);
                const overdue = isOverdue(task);
                return (
                  <tr
                    key={task.id}
                    style={{
                      ...s.trow,
                      ...(task.status === "Done" ? { opacity: 0.6 } : {}),
                      ...(overdue ? { background: "#fff5f5" } : {}),
                    }}
                  >
                    <td style={{ padding: "12px 8px 12px 16px" }}>
                      <input
                        type="checkbox"
                        checked={task.status === "Done"}
                        onChange={() => handleToggleStatus(task)}
                        style={{
                          cursor: "pointer",
                          width: "16px",
                          height: "16px",
                          accentColor: "#6366f1",
                        }}
                      />
                    </td>
                    <td style={s.td}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: task.status === "Done" ? "#9ca3af" : "#0f1117",
                          textDecoration:
                            task.status === "Done" ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            marginTop: "2px",
                          }}
                        >
                          {task.description.slice(0, 50)}
                          {task.description.length > 50 ? "..." : ""}
                        </div>
                      )}
                      {overdue && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#ef4444",
                          }}
                        >
                          ⚠️ Overdue
                        </span>
                      )}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background: ps.bg,
                          color: ps.color,
                        }}
                      >
                        {task.priority || "Normal"}
                      </span>
                    </td>
                    <td style={s.td}>{task.assignedTo || "—"}</td>
                    <td
                      style={{
                        ...s.td,
                        color: overdue ? "#ef4444" : "#374151",
                        fontWeight: overdue ? "700" : "400",
                      }}
                    >
                      {task.dueDate || "—"}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background: ss.bg,
                          color: ss.color,
                        }}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          style={s.editBtn}
                          onClick={() => handleEdit(task)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          style={s.delBtn}
                          onClick={() => handleDelete(task.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination
          total={filtered.length}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Task" : "Add Task"}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={s.fg}>
                <label style={s.label}>Task Title *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Task title"
                />
              </div>
              <div style={s.fg}>
                <label style={s.label}>Description</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Priority</label>
                  <select
                    style={s.input}
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Normal</option>
                    <option>Low</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Pending</option>
                    <option>InProgress</option>
                    <option>Done</option>
                  </select>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Due Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Assigned To</label>
                  <input
                    style={s.input}
                    value={form.assignedTo}
                    onChange={(e) =>
                      setForm({ ...form, assignedTo: e.target.value })
                    }
                    placeholder="Team member name"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7f0",
                }}
              >
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  {editItem ? "Update" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#f8f9fc",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "10px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  title: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  count: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 10px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "12.5px",
    color: "#374151",
    fontFamily: "inherit",
    width: "140px",
  },
  filterSel: {
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "12.5px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    color: "#374151",
  },
  addBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8f9fc" },
  th: {
    padding: "11px 14px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    textAlign: "left",
    borderBottom: "1px solid #e5e7f0",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },
  trow: { borderBottom: "1px solid #f1f3f9", transition: "background 0.1s" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  badge: {
    fontSize: "11.5px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "20px",
  },
  editBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,17,23,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 998,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "520px",
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
  },
  modalTitle: { fontSize: "17px", fontWeight: "800", color: "#0f1117" },
  closeBtn: {
    background: "#f1f3f9",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6b7280",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  fg: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    padding: "10px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "#0f1117",
  },
  cancelBtn: {
    background: "#fff",
    color: "#6b7280",
    border: "1.5px solid #e5e7f0",
    borderRadius: "9px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  saveBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
};
