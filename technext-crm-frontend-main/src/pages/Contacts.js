import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination, { usePagination } from "../components/Pagination";

const BASE_URL = "http://localhost:8080/api";

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    source: "LinkedIn",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/contacts`)
      .then((r) => {
        setItems(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = items.filter(
    (item) =>
      !searchVal ||
      item.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchVal.toLowerCase()) ||
      item.phone?.toLowerCase().includes(searchVal.toLowerCase()),
  );

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem)
      await axios.put(`${BASE_URL}/contacts/${editItem.id}`, payload);
    else await axios.post(`${BASE_URL}/contacts`, payload);
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
    if (window.confirm("Delete this contact?")) {
      await axios.delete(`${BASE_URL}/contacts/${id}`);
      fetchAll();
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#0ea5e9",
      "#ec4899",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
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
          Loading contacts...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Contacts</span>
          <span style={s.count}>{filtered.length}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search contacts..."
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
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
          >
            + Add Contact
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
                "Name",
                "Company",
                "Email",
                "Phone",
                "Designation",
                "Source",
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
                  style={{ padding: "60px", textAlign: "center" }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                    👤
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#0f1117",
                      marginBottom: "6px",
                    }}
                  >
                    No contacts found
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      marginBottom: "16px",
                    }}
                  >
                    Add your first contact to get started
                  </div>
                  <button
                    style={s.addBtn}
                    onClick={() => {
                      setEditItem(null);
                      setForm(emptyForm);
                      setShowModal(true);
                    }}
                  >
                    + Add Contact
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} style={s.trow}>
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
                          width: "34px",
                          height: "34px",
                          borderRadius: "9px",
                          background: getAvatarColor(item.name),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {item.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#6366f1",
                            cursor: "pointer",
                          }}
                          onClick={() => handleEdit(item)}
                        >
                          {item.name}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {item.notes?.slice(0, 30)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{item.company || "—"}</td>
                  <td style={s.td}>
                    {item.email ? (
                      <a
                        href={`mailto:${item.email}`}
                        style={{ color: "#6366f1", textDecoration: "none" }}
                      >
                        {item.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={s.td}>{item.phone || "—"}</td>
                  <td style={s.td}>{item.designation || "—"}</td>
                  <td style={s.td}>
                    <span style={s.chip}>{item.source || "—"}</span>
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
              ))
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
                  {editItem ? "Edit Contact" : "Add New Contact"}
                </div>
                <div style={s.modalSub}>Fill in contact details</div>
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
                    placeholder="John Doe"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Company</label>
                  <input
                    style={s.input}
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    placeholder="Company Ltd."
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
                    placeholder="john@company.com"
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
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Designation</label>
                  <input
                    style={s.input}
                    value={form.designation}
                    onChange={(e) =>
                      setForm({ ...form, designation: e.target.value })
                    }
                    placeholder="HR Manager"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Source</label>
                  <select
                    style={s.input}
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                  >
                    <option>LinkedIn</option>
                    <option>Referral</option>
                    <option>Website</option>
                    <option>Cold Call</option>
                    <option>Event</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div style={s.fg}>
                <label style={s.label}>Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px", resize: "vertical" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
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
                  {editItem ? "Update Contact" : "Add Contact"}
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
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
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
