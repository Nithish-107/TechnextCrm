import React, { useState } from "react";

function Documents() {
  const [docs, setDocs] = useState([
    {
      id: 1,
      name: "TechNext Staffing Agreement Template",
      type: "Contract",
      size: "245 KB",
      modified: "2026-06-01",
      owner: "Admin User",
      tag: "Legal",
    },
    {
      id: 2,
      name: "Client Onboarding Checklist",
      type: "Checklist",
      size: "128 KB",
      modified: "2026-05-28",
      owner: "Ria Kapoor",
      tag: "Onboarding",
    },
    {
      id: 3,
      name: "Candidate Offer Letter Template",
      type: "Template",
      size: "98 KB",
      modified: "2026-05-20",
      owner: "Dev Malhotra",
      tag: "HR",
    },
    {
      id: 4,
      name: "Q1 2026 Placement Report",
      type: "Report",
      size: "512 KB",
      modified: "2026-04-05",
      owner: "Admin User",
      tag: "Reports",
    },
    {
      id: 5,
      name: "Job Description - React Developer",
      type: "JD",
      size: "76 KB",
      modified: "2026-05-15",
      owner: "Ria Kapoor",
      tag: "Recruitment",
    },
    {
      id: 6,
      name: "NDA Template - Client",
      type: "Contract",
      size: "189 KB",
      modified: "2026-03-12",
      owner: "Sam Pillai",
      tag: "Legal",
    },
    {
      id: 7,
      name: "Interview Scorecard Template",
      type: "Template",
      size: "64 KB",
      modified: "2026-05-10",
      owner: "Dev Malhotra",
      tag: "Recruitment",
    },
    {
      id: 8,
      name: "TechNext Company Profile",
      type: "Presentation",
      size: "2.4 MB",
      modified: "2026-04-20",
      owner: "Admin User",
      tag: "Marketing",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [filterTag, setFilterTag] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "Template",
    tag: "General",
  });
  const [selected, setSelected] = useState([]);

  const tags = ["All", ...new Set(docs.map((d) => d.tag))];
  const filtered = docs.filter((d) => {
    const matchTag = filterTag === "All" || d.tag === filterTag;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    setDocs([
      ...docs,
      {
        id: docs.length + 1,
        name: form.name,
        type: form.type,
        size: "—",
        modified: new Date().toISOString().split("T")[0],
        owner: "Admin User",
        tag: form.tag,
      },
    ]);
    setShowModal(false);
    setForm({ name: "", type: "Template", tag: "General" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this document?"))
      setDocs(docs.filter((d) => d.id !== id));
  };

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === filtered.length ? [] : filtered.map((d) => d.id),
    );

  const getTypeBadge = (type) => {
    switch (type) {
      case "Contract":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Template":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Report":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "JD":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      case "Checklist":
        return { bg: "#fffbeb", color: "#f59e0b" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "Contract":
        return "📋";
      case "Template":
        return "📝";
      case "Report":
        return "📊";
      case "JD":
        return "💼";
      case "Checklist":
        return "✅";
      case "Presentation":
        return "📑";
      default:
        return "📄";
    }
  };

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>Documents</span>
          <span style={s.abCount}>{filtered.length}</span>
        </div>
        <div style={s.abRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button style={s.createBtn} onClick={() => setShowModal(true)}>
            + Add Document
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Filter Panel */}
        <div style={s.filterPanel}>
          <div style={s.fpHeader}>Filter by</div>
          <div style={s.fpSection}>
            <div style={s.fpSectionTitle}>TAG</div>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  ...s.fpItem,
                  ...(filterTag === tag ? s.fpItemActive : {}),
                }}
                onClick={() => setFilterTag(tag)}
              >
                <input
                  type="checkbox"
                  checked={filterTag === tag}
                  onChange={() => setFilterTag(tag)}
                  style={{ marginRight: 8, cursor: "pointer" }}
                />
                <span
                  style={{
                    ...s.fpLabel,
                    ...(filterTag === tag
                      ? { color: "#6366f1", fontWeight: 700 }
                      : {}),
                  }}
                >
                  {tag === "All" ? "All Documents" : tag}
                </span>
                <span style={s.fpCount}>
                  {tag === "All"
                    ? docs.length
                    : docs.filter((d) => d.tag === tag).length}
                </span>
              </div>
            ))}
          </div>
          <div style={s.fpDivider} />
          <div style={s.fpSection}>
            <div style={s.fpSectionTitle}>BY TYPE</div>
            {[
              "Contract",
              "Template",
              "Report",
              "JD",
              "Checklist",
              "Presentation",
            ].map((type) => (
              <div key={type} style={s.fpStatRow}>
                <span style={s.fpStatLabel}>{type}</span>
                <span style={s.fpCount}>
                  {docs.filter((d) => d.type === type).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>Total Documents {filtered.length}</span>
          </div>

          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.thCheck}>
                  <input
                    type="checkbox"
                    checked={
                      selected.length === filtered.length && filtered.length > 0
                    }
                    onChange={toggleAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Tag</th>
                <th style={s.th}>Size</th>
                <th style={s.th}>Modified</th>
                <th style={s.th}>Owner</th>
                <th style={s.thIcon}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={s.emptyCell}>
                    <div style={s.emptyWrap}>
                      <div style={{ fontSize: "40px" }}>📄</div>
                      <div style={s.emptyTitle}>No documents found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const b = getTypeBadge(doc.type);
                  return (
                    <tr
                      key={doc.id}
                      style={{
                        ...s.trow,
                        ...(selected.includes(doc.id) ? s.trowSelected : {}),
                      }}
                    >
                      <td style={s.tdCheck}>
                        <input
                          type="checkbox"
                          checked={selected.includes(doc.id)}
                          onChange={() => toggleSelect(doc.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={s.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>
                            {getFileIcon(doc.type)}
                          </span>
                          <span style={s.docName}>{doc.name}</span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: b.bg,
                            color: b.color,
                          }}
                        >
                          {doc.type}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.tagChip}>{doc.tag}</span>
                      </td>
                      <td style={s.td}>{doc.size}</td>
                      <td style={s.td}>{doc.modified}</td>
                      <td style={s.td}>{doc.owner}</td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button style={s.viewBtn}>View</button>
                          <button
                            style={s.delBtn}
                            onClick={() => handleDelete(doc.id)}
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
                <div style={s.modalTitle}>Add Document</div>
                <div style={s.modalSub}>Add a new document record</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAdd} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Document Name *</label>
                <input
                  style={s.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Document name"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Type</label>
                  <select
                    style={s.input}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option>Template</option>
                    <option>Contract</option>
                    <option>Report</option>
                    <option>JD</option>
                    <option>Checklist</option>
                    <option>Presentation</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Tag</label>
                  <select
                    style={s.input}
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  >
                    <option>General</option>
                    <option>Legal</option>
                    <option>HR</option>
                    <option>Recruitment</option>
                    <option>Onboarding</option>
                    <option>Reports</option>
                    <option>Marketing</option>
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
                  Save
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
  abRight: { display: "flex", alignItems: "center", gap: "10px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "7px 12px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#0f1117",
    width: "200px",
    fontFamily: "inherit",
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
  fpDivider: { height: "1px", background: "#f1f3f9", margin: "12px 0" },
  fpStatRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "5px 8px",
  },
  fpStatLabel: { fontSize: "12.5px", color: "#6b7280" },
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
  docName: {
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
  tagChip: {
    background: "#f1f3f9",
    color: "#6b7280",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "600",
  },
  actions: { display: "flex", gap: "6px" },
  viewBtn: {
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
    width: "480px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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

export default Documents;
