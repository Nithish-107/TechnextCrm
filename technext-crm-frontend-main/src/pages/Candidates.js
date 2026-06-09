import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";
const STAGES = [
  "New",
  "Screening",
  "Interview",
  "Offered",
  "Placed",
  "Rejected",
];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStage, setFilterStage] = useState("All");
  const [searchVal, setSearchVal] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentRole: "",
    skills: "",
    experience: "",
    location: "",
    stage: "New",
    notes: "",
    expectedSalary: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/candidates`)
      .then((r) => {
        setCandidates(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = candidates.filter((c) => {
    const matchStage = filterStage === "All" || c.stage === filterStage;
    const matchSearch =
      !searchVal ||
      c.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.skills?.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.currentRole?.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStage && matchSearch;
  });

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem)
      await axios.put(`${BASE_URL}/candidates/${editItem.id}`, form);
    else await axios.post(`${BASE_URL}/candidates`, form);
    setShowModal(false);
    setEditItem(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      currentRole: "",
      skills: "",
      experience: "",
      location: "",
      stage: "New",
      notes: "",
      expectedSalary: "",
    });
    fetchAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete candidate?")) {
      await axios.delete(`${BASE_URL}/candidates/${id}`);
      fetchAll();
    }
  };

  const getStageStyle = (stage) => {
    const styles = {
      New: { bg: "#eff6ff", color: "#3b82f6" },
      Screening: { bg: "#fef3c7", color: "#d97706" },
      Interview: { bg: "#f5f3ff", color: "#8b5cf6" },
      Offered: { bg: "#f0fdf4", color: "#10b981" },
      Placed: { bg: "#eef2ff", color: "#6366f1" },
      Rejected: { bg: "#fef2f2", color: "#ef4444" },
    };
    return styles[stage] || { bg: "#f9fafb", color: "#6b7280" };
  };

  const exportToExcel = () => {
    const data = filtered.map((c) => ({
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      Role: c.currentRole,
      Skills: c.skills,
      Experience: c.experience,
      Location: c.location,
      Stage: c.stage,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `TechNext_Candidates_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

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
          Loading candidates...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Candidates</span>
          <span style={s.count}>{filtered.length}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search candidates..."
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
          <div style={s.viewToggle}>
            <button
              style={{
                ...s.viewBtn,
                ...(viewMode === "list" ? s.viewBtnActive : {}),
              }}
              onClick={() => setViewMode("list")}
            >
              ☰ List
            </button>
            <button
              style={{
                ...s.viewBtn,
                ...(viewMode === "kanban" ? s.viewBtnActive : {}),
              }}
              onClick={() => setViewMode("kanban")}
            >
              ⊞ Board
            </button>
          </div>
          <button style={s.exportBtn} onClick={exportToExcel}>
            ⬇ Export
          </button>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                name: "",
                email: "",
                phone: "",
                currentRole: "",
                skills: "",
                experience: "",
                location: "",
                stage: "New",
                notes: "",
                expectedSalary: "",
              });
              setShowModal(true);
            }}
          >
            + Add Candidate
          </button>
        </div>
      </div>

      {/* Stage Filter */}
      <div style={s.filterBar}>
        {["All", ...STAGES].map((st) => {
          const cnt =
            st === "All"
              ? candidates.length
              : candidates.filter((c) => c.stage === st).length;
          const style =
            st !== "All"
              ? getStageStyle(st)
              : { bg: "#eef2ff", color: "#6366f1" };
          return (
            <button
              key={st}
              style={{
                ...s.filterBtn,
                ...(filterStage === st
                  ? {
                      background: style.bg,
                      color: style.color,
                      border: `1px solid ${style.color}`,
                      fontWeight: "700",
                    }
                  : {}),
              }}
              onClick={() => setFilterStage(st)}
            >
              {st}{" "}
              <span style={{ fontSize: "10px", opacity: 0.7 }}>({cnt})</span>
            </button>
          );
        })}
      </div>

      {viewMode === "list" && (
        <div
          style={{
            background: "#fff",
            margin: "16px",
            borderRadius: "12px",
            border: "1px solid #e5e7f0",
            overflow: "hidden",
            flex: 1,
          }}
        >
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                {[
                  "Candidate",
                  "Role",
                  "Skills",
                  "Experience",
                  "Location",
                  "Stage",
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
                      🪪
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0f1117",
                        marginBottom: "6px",
                      }}
                    >
                      No candidates found
                    </div>
                    <button style={s.addBtn} onClick={() => setShowModal(true)}>
                      + Add Candidate
                    </button>
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const st = getStageStyle(c.stage);
                  return (
                    <tr key={c.id} style={s.trow}>
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
                              background: `hsl(${((c.name?.charCodeAt(0) || 0) * 137) % 360},60%,55%)`,
                            }}
                          >
                            {c.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#6366f1",
                                cursor: "pointer",
                              }}
                              onClick={() => handleEdit(c)}
                            >
                              {c.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>{c.currentRole || "—"}</td>
                      <td style={s.td}>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            maxWidth: "180px",
                          }}
                        >
                          {c.skills
                            ? c.skills
                                .split(",")
                                .slice(0, 3)
                                .map((sk) => (
                                  <span
                                    key={sk}
                                    style={{
                                      background: "#f1f3f9",
                                      borderRadius: "20px",
                                      padding: "2px 8px",
                                      fontSize: "10.5px",
                                      marginRight: "4px",
                                      display: "inline-block",
                                    }}
                                  >
                                    {sk.trim()}
                                  </span>
                                ))
                            : "—"}
                        </div>
                      </td>
                      <td style={s.td}>{c.experience || "—"}</td>
                      <td style={s.td}>{c.location || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {c.stage}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={s.editBtn}
                            onClick={() => handleEdit(c)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            style={s.delBtn}
                            onClick={() => handleDelete(c.id)}
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
      )}

      {viewMode === "kanban" && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px",
            overflowX: "auto",
            flex: 1,
          }}
        >
          {STAGES.map((stage) => {
            const items = candidates.filter((c) => c.stage === stage);
            const st = getStageStyle(stage);
            return (
              <div
                key={stage}
                style={{
                  minWidth: "220px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    background: st.bg,
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: st.color,
                    }}
                  >
                    {stage}
                  </span>
                  <span
                    style={{
                      background: st.color,
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    {items.length}
                  </span>
                </div>
                {items.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "#fff",
                      borderRadius: "10px",
                      border: "1px solid #e5e7f0",
                      padding: "14px",
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                    onClick={() => handleEdit(c)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          ...s.avatar,
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: `hsl(${((c.name?.charCodeAt(0) || 0) * 137) % 360},60%,55%)`,
                        }}
                      >
                        {c.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#0f1117",
                        }}
                      >
                        {c.name}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      {c.currentRole || "—"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {c.location || "—"}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontSize: "12px",
                      color: "#9ca3af",
                      border: "1.5px dashed #e5e7f0",
                      borderRadius: "10px",
                    }}
                  >
                    No candidates
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Candidate" : "Add Candidate"}
                </div>
                <div style={s.modalSub}>Fill in candidate details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Full Name *</label>
                  <input
                    style={s.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Phone</label>
                  <input
                    style={s.input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Email</label>
                  <input
                    style={s.input}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Current Role</label>
                  <input
                    style={s.input}
                    value={form.currentRole}
                    onChange={(e) =>
                      setForm({ ...form, currentRole: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Experience</label>
                  <input
                    style={s.input}
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    placeholder="e.g. 3 years"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Location</label>
                  <input
                    style={s.input}
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.fg}>
                <label style={s.label}>Skills (comma separated)</label>
                <input
                  style={s.input}
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Java, Python"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Expected Salary</label>
                  <input
                    style={s.input}
                    value={form.expectedSalary}
                    onChange={(e) =>
                      setForm({ ...form, expectedSalary: e.target.value })
                    }
                    placeholder="e.g. 8 LPA"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Stage</label>
                  <select
                    style={s.input}
                    value={form.stage}
                    onChange={(e) =>
                      setForm({ ...form, stage: e.target.value })
                    }
                  >
                    {STAGES.map((st) => (
                      <option key={st}>{st}</option>
                    ))}
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
                  {editItem ? "Update" : "Add Candidate"}
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
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
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
  viewToggle: {
    display: "flex",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  viewBtn: {
    background: "none",
    border: "none",
    padding: "6px 14px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  viewBtnActive: { background: "#6366f1", color: "#fff", fontWeight: "700" },
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
  filterBar: {
    display: "flex",
    gap: "8px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
    flexWrap: "wrap",
  },
  filterBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "20px",
    padding: "5px 14px",
    fontSize: "12px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
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
    width: "580px",
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
  modalSub: { fontSize: "12.5px", color: "#9ca3af", marginTop: "3px" },
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
