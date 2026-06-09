import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";

export default function Jobs() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const emptyForm = {
    title: "",
    clientCompany: "",
    location: "",
    jobType: "Full Time",
    experience: "",
    salary: "",
    skills: "",
    status: "Open",
    description: "",
    openings: 1,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/jobs`)
      .then((r) => {
        setItems(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = items.filter((item) => {
    const matchStatus = filterStatus === "All" || item.status === filterStatus;
    const matchSearch =
      !searchVal ||
      item.title?.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.clientCompany?.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.skills?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchSearch;
  });

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem) await axios.put(`${BASE_URL}/jobs/${editItem.id}`, payload);
    else await axios.post(`${BASE_URL}/jobs`, payload);
    setShowModal(false);
    setEditItem(null);
    setForm(emptyForm);
    fetchAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this job?")) {
      await axios.delete(`${BASE_URL}/jobs/${id}`);
      fetchAll();
    }
  };

  const getStatusStyle = (status) =>
    ({
      Open: { bg: "#f0fdf4", color: "#10b981" },
      Closed: { bg: "#fef2f2", color: "#ef4444" },
      OnHold: { bg: "#fffbeb", color: "#f59e0b" },
      Filled: { bg: "#eff6ff", color: "#3b82f6" },
    })[status] || { bg: "#f9fafb", color: "#6b7280" };

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
          Loading job orders...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Job Orders</span>
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
            {items.filter((j) => j.status === "Open").length} Open
          </span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search jobs..."
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
            <option>Open</option>
            <option>Closed</option>
            <option>OnHold</option>
            <option>Filled</option>
          </select>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
          >
            + Add Job
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
                "Job Title",
                "Client Company",
                "Location",
                "Type",
                "Experience",
                "Openings",
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
                  style={{ padding: "60px", textAlign: "center" }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                    💼
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#0f1117",
                      marginBottom: "6px",
                    }}
                  >
                    No job orders found
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      marginBottom: "16px",
                    }}
                  >
                    Create your first job order
                  </div>
                  <button
                    style={s.addBtn}
                    onClick={() => {
                      setEditItem(null);
                      setForm(emptyForm);
                      setShowModal(true);
                    }}
                  >
                    + Add Job
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((item) => {
                const ss = getStatusStyle(item.status);
                return (
                  <tr key={item.id} style={s.trow}>
                    <td style={s.td}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#6366f1",
                          cursor: "pointer",
                        }}
                        onClick={() => handleEdit(item)}
                      >
                        {item.title}
                      </div>
                      {item.skills && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            marginTop: "2px",
                          }}
                        >
                          {item.skills?.slice(0, 40)}
                        </div>
                      )}
                    </td>
                    <td style={s.td}>{item.clientCompany || "—"}</td>
                    <td style={s.td}>{item.location || "—"}</td>
                    <td style={s.td}>
                      <span style={s.chip}>{item.jobType || "Full Time"}</span>
                    </td>
                    <td style={s.td}>{item.experience || "—"}</td>
                    <td
                      style={{ ...s.td, fontWeight: "700", color: "#6366f1" }}
                    >
                      {item.openings || 1}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background: ss.bg,
                          color: ss.color,
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          style={s.editBtn}
                          onClick={() => handleEdit(item)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          style={s.delBtn}
                          onClick={() => handleDelete(item.id)}
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
                  {editItem ? "Edit Job Order" : "Create Job Order"}
                </div>
                <div style={s.modalSub}>Fill in job details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Job Title *</label>
                  <input
                    style={s.input}
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                    placeholder="e.g. React Developer"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Client Company</label>
                  <input
                    style={s.input}
                    value={form.clientCompany}
                    onChange={(e) =>
                      setForm({ ...form, clientCompany: e.target.value })
                    }
                    placeholder="Client company name"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Location</label>
                  <input
                    style={s.input}
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Bangalore, Remote"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Job Type</label>
                  <select
                    style={s.input}
                    value={form.jobType}
                    onChange={(e) =>
                      setForm({ ...form, jobType: e.target.value })
                    }
                  >
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                    <option>Freelance</option>
                    <option>Internship</option>
                  </select>
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
                    placeholder="e.g. 3-5 years"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Salary Range</label>
                  <input
                    style={s.input}
                    value={form.salary}
                    onChange={(e) =>
                      setForm({ ...form, salary: e.target.value })
                    }
                    placeholder="e.g. 8-12 LPA"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>No. of Openings</label>
                  <input
                    style={s.input}
                    type="number"
                    min="1"
                    value={form.openings}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        openings: parseInt(e.target.value) || 1,
                      })
                    }
                  />
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
                    <option>Open</option>
                    <option>Closed</option>
                    <option>OnHold</option>
                    <option>Filled</option>
                  </select>
                </div>
              </div>
              <div style={s.fg}>
                <label style={s.label}>Required Skills</label>
                <input
                  style={s.input}
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, Node.js, MySQL (comma separated)"
                />
              </div>
              <div style={s.fg}>
                <label style={s.label}>Job Description</label>
                <textarea
                  style={{ ...s.input, minHeight: "80px", resize: "vertical" }}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Job description..."
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
                  {editItem ? "Update Job" : "Create Job"}
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
  chip: {
    background: "#f1f3f9",
    color: "#6b7280",
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
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
