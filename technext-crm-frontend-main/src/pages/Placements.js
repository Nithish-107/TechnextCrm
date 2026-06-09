import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";

export default function Placements() {
  const [placements, setPlacements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    candidateName: "",
    jobTitle: "",
    clientCompany: "",
    salary: "",
    commission: "",
    startDate: "",
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/placements`)
      .then((r) => {
        setPlacements(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = placements.filter((p) => {
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    const matchSearch =
      !searchVal ||
      p.candidateName?.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.jobTitle?.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.clientCompany?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchSearch;
  });

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const totalCommission = filtered.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem)
      await axios.put(`${BASE_URL}/placements/${editItem.id}`, payload);
    else await axios.post(`${BASE_URL}/placements`, payload);
    setShowModal(false);
    setEditItem(null);
    setForm({
      candidateName: "",
      jobTitle: "",
      clientCompany: "",
      salary: "",
      commission: "",
      startDate: "",
      status: "Active",
      notes: "",
    });
    fetchAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete placement?")) {
      await axios.delete(`${BASE_URL}/placements/${id}`);
      fetchAll();
    }
  };

  const exportToExcel = () => {
    const data = filtered.map((p) => ({
      Candidate: p.candidateName,
      Job: p.jobTitle,
      Client: p.clientCompany,
      Salary: p.salary,
      Commission: p.commission,
      StartDate: p.startDate,
      Status: p.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placements");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `TechNext_Placements_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const getStatusStyle = (s) =>
    ({
      Active: { bg: "#f0fdf4", color: "#10b981" },
      Completed: { bg: "#eff6ff", color: "#3b82f6" },
      Terminated: { bg: "#fef2f2", color: "#ef4444" },
    })[s] || { bg: "#f9fafb", color: "#6b7280" };

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
          Loading placements...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Placements</span>
          <span style={s.count}>{filtered.length}</span>
          <span
            style={{
              background: "#f5f3ff",
              color: "#8b5cf6",
              fontSize: "11px",
              fontWeight: "700",
              padding: "2px 9px",
              borderRadius: "20px",
            }}
          >
            Commission: ₹{(totalCommission / 100000).toFixed(1)}L
          </span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search placements..."
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
            <option>Active</option>
            <option>Completed</option>
            <option>Terminated</option>
          </select>
          <button style={s.exportBtn} onClick={exportToExcel}>
            ⬇ Export
          </button>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                candidateName: "",
                jobTitle: "",
                clientCompany: "",
                salary: "",
                commission: "",
                startDate: "",
                status: "Active",
                notes: "",
              });
              setShowModal(true);
            }}
          >
            + Add Placement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "14px 20px",
          background: "#fff",
          borderBottom: "1px solid #e5e7f0",
          overflowX: "auto",
        }}
      >
        {[
          {
            label: "Total Placements",
            value: placements.length,
            icon: "🏆",
            color: "#8b5cf6",
            bg: "#f5f3ff",
          },
          {
            label: "Active",
            value: placements.filter((p) => p.status === "Active").length,
            icon: "✅",
            color: "#10b981",
            bg: "#f0fdf4",
          },
          {
            label: "Completed",
            value: placements.filter((p) => p.status === "Completed").length,
            icon: "🎯",
            color: "#3b82f6",
            bg: "#eff6ff",
          },
          {
            label: "Total Commission",
            value: `₹${(totalCommission / 100000).toFixed(1)}L`,
            icon: "💰",
            color: "#f59e0b",
            bg: "#fffbeb",
          },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              background: k.bg,
              borderRadius: "10px",
              minWidth: "160px",
              flex: 1,
            }}
          >
            <span style={{ fontSize: "20px" }}>{k.icon}</span>
            <div>
              <div
                style={{ fontSize: "18px", fontWeight: "800", color: k.color }}
              >
                {k.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                {k.label}
              </div>
            </div>
          </div>
        ))}
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
                "Candidate",
                "Job Title",
                "Client Company",
                "Start Date",
                "Salary",
                "Commission",
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
                  colSpan={8}
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🏆
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      marginBottom: "6px",
                      color: "#0f1117",
                    }}
                  >
                    No placements yet
                  </div>
                  <button style={s.addBtn} onClick={() => setShowModal(true)}>
                    + Add Placement
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const ss = getStatusStyle(p.status);
                return (
                  <tr key={p.id} style={s.trow}>
                    <td style={s.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            ...s.avatar,
                            background: `hsl(${((p.candidateName?.charCodeAt(0) || 0) * 137) % 360},60%,55%)`,
                          }}
                        >
                          {p.candidateName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#6366f1",
                            cursor: "pointer",
                          }}
                          onClick={() => handleEdit(p)}
                        >
                          {p.candidateName}
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>{p.jobTitle || "—"}</td>
                    <td style={s.td}>{p.clientCompany || "—"}</td>
                    <td style={s.td}>{p.startDate || "—"}</td>
                    <td
                      style={{ ...s.td, fontWeight: "700", color: "#6366f1" }}
                    >
                      ₹{parseFloat(p.salary || 0).toLocaleString("en-IN")}
                    </td>
                    <td
                      style={{ ...s.td, fontWeight: "800", color: "#8b5cf6" }}
                    >
                      ₹{parseFloat(p.commission || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background: ss.bg,
                          color: ss.color,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={s.editBtn} onClick={() => handleEdit(p)}>
                          ✏️ Edit
                        </button>
                        <button
                          style={s.delBtn}
                          onClick={() => handleDelete(p.id)}
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
                  {editItem ? "Edit Placement" : "Add Placement"}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Candidate Name *</label>
                  <input
                    style={s.input}
                    value={form.candidateName}
                    onChange={(e) =>
                      setForm({ ...form, candidateName: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Job Title</label>
                  <input
                    style={s.input}
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm({ ...form, jobTitle: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Client Company</label>
                  <input
                    style={s.input}
                    value={form.clientCompany}
                    onChange={(e) =>
                      setForm({ ...form, clientCompany: e.target.value })
                    }
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Start Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Salary (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: e.target.value })
                    }
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Commission (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    value={form.commission}
                    onChange={(e) =>
                      setForm({ ...form, commission: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Terminated</option>
                  </select>
                </div>
              </div>
              <div style={s.fg}>
                <label style={s.label}>Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
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
                  {editItem ? "Update" : "Add Placement"}
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
    width: "160px",
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
  exportBtn: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12.5px",
    color: "#10b981",
    cursor: "pointer",
    fontWeight: "600",
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
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
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
    width: "560px",
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
