import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({
    name: "",
    industry: "",
    city: "",
    website: "",
    status: "Prospect",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);
  const fetchAccounts = () =>
    axios
      .get(`${BASE_URL}/accounts`)
      .then((res) => setAccounts(res.data))
      .catch(() => {});

  const filtered =
    filterStatus === "All"
      ? accounts
      : accounts.filter((a) => a.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem) await axios.put(`${BASE_URL}/accounts/${editItem.id}`, form);
    else await axios.post(`${BASE_URL}/accounts`, form);
    setShowModal(false);
    setEditItem(null);
    setForm({
      name: "",
      industry: "",
      city: "",
      website: "",
      status: "Prospect",
    });
    fetchAccounts();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this account?")) {
      await axios.delete(`${BASE_URL}/accounts/${id}`);
      fetchAccounts();
    }
  };
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === paginated.length && paginated.length > 0
        ? []
        : paginated.map((a) => a.id),
    );
  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setShowSortMenu(false);
  };
  const handleFilter = (status) => {
    setFilterStatus(status);
    setPage(1);
    setSelected([]);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "Active":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Onboarding":
        return { bg: "#fffbeb", color: "#f59e0b" };
      case "Inactive":
        return { bg: "#fef2f2", color: "#ef4444" };
      default:
        return { bg: "#eff6ff", color: "#3b82f6" };
    }
  };

  const SortArrow = ({ field }) => (
    <span
      style={{
        marginLeft: 3,
        color: sortField === field ? "#6366f1" : "#d1d5db",
        fontSize: 10,
      }}
    >
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const avatarColors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#0ea5e9",
  ];
  const getColor = (name) =>
    avatarColors[name ? name.charCodeAt(0) % avatarColors.length : 0];

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>Accounts</span>
          <span style={s.abCount}>{filtered.length}</span>
        </div>
        <div style={s.abRight}>
          <button
            style={{ ...s.abBtn, ...(filterOpen ? s.abBtnActive : {}) }}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            ⧩ Filter
          </button>
          <div style={{ position: "relative" }}>
            <button
              style={s.abBtn}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              ↕ Sort
            </button>
            {showSortMenu && (
              <div style={s.sortMenu}>
                {["name", "industry", "city", "status"].map((f) => (
                  <div
                    key={f}
                    style={s.sortMenuItem}
                    onClick={() => handleSort(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {sortField === f && (
                      <span style={{ marginLeft: 6, color: "#6366f1" }}>
                        {sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={s.abDivider} />
          <button
            style={s.createBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                name: "",
                industry: "",
                city: "",
                website: "",
                status: "Prospect",
              });
              setShowModal(true);
            }}
          >
            + Create Account
          </button>
        </div>
      </div>

      <div style={s.body}>
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpHeader}>Filter by</div>
            <div style={s.fpSearch}>
              <input
                style={s.fpSearchInput}
                placeholder="🔍 Search accounts..."
              />
            </div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>STATUS</div>
              {["All", "Prospect", "Onboarding", "Active", "Inactive"].map(
                (st) => (
                  <div
                    key={st}
                    style={{
                      ...s.fpItem,
                      ...(filterStatus === st ? s.fpItemActive : {}),
                    }}
                    onClick={() => handleFilter(st)}
                  >
                    <input
                      type="checkbox"
                      checked={filterStatus === st}
                      onChange={() => handleFilter(st)}
                      style={{ marginRight: 8, cursor: "pointer" }}
                    />
                    <span
                      style={{
                        ...s.fpLabel,
                        ...(filterStatus === st
                          ? { color: "#6366f1", fontWeight: 700 }
                          : {}),
                      }}
                    >
                      {st === "All" ? "All Accounts" : st}
                    </span>
                    <span style={s.fpCount}>
                      {st === "All"
                        ? accounts.length
                        : accounts.filter((a) => a.status === st).length}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>{filtered.length} accounts</span>
            <div style={s.pgRight}>
              <button
                style={{ ...s.pgBtn, ...(page === 1 ? s.pgBtnDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ◀
              </button>
              <span style={s.pgInfo}>
                {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)}
              </span>
              <button
                style={{
                  ...s.pgBtn,
                  ...(page === totalPages || totalPages === 0
                    ? s.pgBtnDisabled
                    : {}),
                }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                ▶
              </button>
            </div>
          </div>

          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.thCheck}>
                  <input
                    type="checkbox"
                    checked={
                      selected.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("name")}
                >
                  Account Name <SortArrow field="name" />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("industry")}
                >
                  Industry <SortArrow field="industry" />
                </th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("city")}
                >
                  City <SortArrow field="city" />
                </th>
                <th style={s.th}>Website</th>
                <th
                  style={{ ...s.th, cursor: "pointer" }}
                  onClick={() => handleSort("status")}
                >
                  Status <SortArrow field="status" />
                </th>
                <th style={s.thIcon}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={s.emptyCell}>
                    <div style={s.emptyWrap}>
                      <div style={{ fontSize: "40px" }}>🏢</div>
                      <div style={s.emptyTitle}>No accounts yet</div>
                      <div style={s.emptySub}>Create your first account</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((a) => {
                  const b = getStatusBadge(a.status);
                  return (
                    <tr
                      key={a.id}
                      style={{
                        ...s.trow,
                        ...(selected.includes(a.id) ? s.trowSelected : {}),
                      }}
                    >
                      <td style={s.tdCheck}>
                        <input
                          type="checkbox"
                          checked={selected.includes(a.id)}
                          onChange={() => toggleSelect(a.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={s.td}>
                        <div style={s.nameCell}>
                          <div
                            style={{
                              ...s.nameAvatar,
                              background: getColor(a.name),
                            }}
                          >
                            {a.name ? a.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <span
                            style={s.nameText}
                            onClick={() => handleEdit(a)}
                          >
                            {a.name}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>{a.industry || "—"}</td>
                      <td style={s.td}>{a.city || "—"}</td>
                      <td style={s.td}>
                        {a.website ? (
                          <a
                            href={a.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#6366f1", textDecoration: "none" }}
                          >
                            {a.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: b.bg,
                            color: b.color,
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button
                            style={s.editBtn}
                            onClick={() => handleEdit(a)}
                          >
                            Edit
                          </button>
                          <button
                            style={s.delBtn}
                            onClick={() => handleDelete(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Account" : "Create Account"}
                </div>
                <div style={s.modalSub}>Account details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Account Name *</label>
                <input
                  style={s.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Company name"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Industry</label>
                  <input
                    style={s.input}
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    placeholder="e.g. IT, Finance"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>City</label>
                  <input
                    style={s.input}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Website</label>
                  <input
                    style={s.input}
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Prospect</option>
                    <option>Onboarding</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div style={s.modalFoot}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  {editItem ? "Update" : "Save"}
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
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    gap: "8px",
  },
  abLeft: { display: "flex", alignItems: "center", gap: "10px" },
  abTitle: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  abCount: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  abRight: { display: "flex", alignItems: "center", gap: "6px" },
  abBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
  },
  abBtnActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
  },
  abDivider: {
    width: "1px",
    height: "24px",
    background: "#e5e7f0",
    margin: "0 6px",
  },
  createBtn: {
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
  body: { display: "flex", flex: 1, overflow: "hidden" },
  filterPanel: {
    width: "230px",
    minWidth: "230px",
    background: "#fff",
    borderRight: "1px solid #e5e7f0",
    overflowY: "auto",
    padding: "16px 0",
  },
  fpHeader: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "0 16px 12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fpSearch: { padding: "0 12px 12px" },
  fpSearchInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "12.5px",
    outline: "none",
    boxSizing: "border-box",
    background: "#f8f9fc",
  },
  fpSection: { marginBottom: "8px", padding: "0 8px" },
  fpSectionTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "6px 8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fpItem: {
    display: "flex",
    alignItems: "center",
    padding: "7px 8px",
    cursor: "pointer",
    borderRadius: "8px",
    userSelect: "none",
    gap: "6px",
  },
  fpItemActive: { background: "#eef2ff" },
  fpLabel: { flex: 1, fontSize: "13px", color: "#374151", fontWeight: "500" },
  fpCount: {
    fontSize: "11px",
    color: "#9ca3af",
    background: "#f1f3f9",
    padding: "1px 8px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #f1f3f9",
  },
  pgTotal: { fontSize: "12.5px", color: "#6b7280", fontWeight: "500" },
  pgRight: { display: "flex", alignItems: "center", gap: "8px" },
  pgBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "11px",
    cursor: "pointer",
    color: "#6b7280",
  },
  pgBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  pgInfo: { fontSize: "12px", color: "#6b7280" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "#f8f9fc" },
  thCheck: {
    padding: "12px 10px 12px 20px",
    borderBottom: "1px solid #e5e7f0",
  },
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
  thIcon: {
    padding: "11px 14px",
    fontSize: "10.5px",
    color: "#9ca3af",
    fontWeight: "700",
    borderBottom: "1px solid #e5e7f0",
  },
  trow: { borderBottom: "1px solid #f1f3f9", transition: "background 0.1s" },
  trowSelected: { background: "#fafbff" },
  tdCheck: { padding: "12px 10px 12px 20px" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  nameAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  nameText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6366f1",
    cursor: "pointer",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "700",
  },
  actions: { display: "flex", gap: "6px" },
  editBtn: {
    background: "#eef2ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyCell: { padding: "60px", textAlign: "center" },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  emptyTitle: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  emptySub: { fontSize: "13px", color: "#9ca3af" },
  sortMenu: {
    position: "absolute",
    top: "36px",
    left: 0,
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    zIndex: 100,
    minWidth: "160px",
  },
  sortMenuItem: {
    padding: "9px 14px",
    fontSize: "12.5px",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
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
    flexShrink: 0,
  },
  modalBody: { padding: "24px" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  formGroup: {
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
  modalFoot: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7f0",
    marginTop: "8px",
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

export default Accounts;
