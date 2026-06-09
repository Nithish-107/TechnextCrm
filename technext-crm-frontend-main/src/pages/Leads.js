import React, { useState, useEffect } from "react";
import { getLeads, createLead, updateLead, deleteLead } from "../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination, { usePagination } from "../components/Pagination";

const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

function Leads() {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "LinkedIn",
    status: "New",
    notes: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = () => {
    setLoading(true);
    getLeads()
      .then((res) => {
        setLeads(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Filter by status and search
  const filtered = leads.filter((l) => {
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    const matchSearch =
      !searchVal ||
      l.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchVal.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
      l.phone?.toLowerCase().includes(searchVal.toLowerCase()) ||
      l.source?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  // Pagination using hook
  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    sorted,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editLead) await updateLead(editLead.id, form);
    else await createLead(form);
    setShowModal(false);
    setEditLead(null);
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "LinkedIn",
      status: "New",
      notes: "",
    });
    fetchLeads();
  };

  const handleEdit = (lead) => {
    setEditLead(lead);
    setForm(lead);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this lead?")) {
      await deleteLead(id);
      fetchLeads();
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
        : paginated.map((l) => l.id),
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
    setSelected([]);
  };

  const handleExport = () => {
    const data = filtered.map((l) => ({
      Name: l.name || "",
      Company: l.company || "",
      Email: l.email || "",
      Phone: l.phone || "",
      Source: l.source || "",
      Status: l.status || "",
      Notes: l.notes || "",
    }));
    exportToExcel(data, "TechNext_Leads");
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} leads?`)) return;
    for (const id of selected) await deleteLead(id);
    setSelected([]);
    fetchLeads();
  };

  const getBadge = (status) => {
    switch (status) {
      case "Hot":
        return { bg: "#fef2f2", color: "#ef4444", dot: "#ef4444" };
      case "Warm":
        return { bg: "#fffbeb", color: "#f59e0b", dot: "#f59e0b" };
      case "New":
        return { bg: "#eff6ff", color: "#3b82f6", dot: "#3b82f6" };
      case "Cold":
        return { bg: "#f9fafb", color: "#6b7280", dot: "#6b7280" };
      default:
        return { bg: "#f9fafb", color: "#6b7280", dot: "#6b7280" };
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

  const statuses = ["All", "Hot", "Warm", "New", "Cold"];

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
          Loading leads...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Action Bar */}
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>All Leads</span>
          <span style={s.abCount}>{filtered.length}</span>
          {selected.length > 0 && (
            <div style={s.bulkActions}>
              <span style={s.bulkCount}>{selected.length} selected</span>
              <button style={s.bulkDelBtn} onClick={handleBulkDelete}>
                🗑 Delete
              </button>
              <button style={s.bulkClearBtn} onClick={() => setSelected([])}>
                ✕ Clear
              </button>
            </div>
          )}
        </div>
        <div style={s.abRight}>
          {/* Search */}
          <div style={s.searchBox}>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search leads..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
              }}
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
                {["name", "company", "email", "status", "source"].map((f) => (
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
          <button
            style={{
              ...s.abViewBtn,
              ...(viewMode === "list" ? s.abViewActive : {}),
            }}
            onClick={() => setViewMode("list")}
          >
            ☰
          </button>
          <button
            style={{
              ...s.abViewBtn,
              ...(viewMode === "kanban" ? s.abViewActive : {}),
            }}
            onClick={() => setViewMode("kanban")}
          >
            ⊞
          </button>
          <button style={s.exportBtn} onClick={handleExport}>
            ⬇ Export
          </button>
          <div style={s.abDivider} />
          <button
            style={s.createBtn}
            onClick={() => {
              setEditLead(null);
              setForm({
                name: "",
                company: "",
                email: "",
                phone: "",
                source: "LinkedIn",
                status: "New",
                notes: "",
              });
              setShowModal(true);
            }}
          >
            + Create Lead
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Filter Panel */}
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpHeader}>Filter by</div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>STATUS</div>
              {statuses.map((st) => {
                const b = getBadge(st);
                const count =
                  st === "All"
                    ? leads.length
                    : leads.filter((l) => l.status === st).length;
                return (
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
                    {st !== "All" && (
                      <div style={{ ...s.fpDot, background: b.dot }} />
                    )}
                    <span
                      style={{
                        ...s.fpLabel,
                        ...(filterStatus === st
                          ? { color: "#6366f1", fontWeight: 700 }
                          : {}),
                      }}
                    >
                      {st === "All" ? "All Leads" : st}
                    </span>
                    <span style={s.fpCount}>{count}</span>
                  </div>
                );
              })}
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>QUICK STATS</div>
              <div style={s.fpStat}>
                <span>Total</span>
                <strong>{leads.length}</strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#ef4444" }}>🔥 Hot</span>
                <strong>
                  {leads.filter((l) => l.status === "Hot").length}
                </strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#f59e0b" }}>🌡 Warm</span>
                <strong>
                  {leads.filter((l) => l.status === "Warm").length}
                </strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#3b82f6" }}>✨ New</span>
                <strong>
                  {leads.filter((l) => l.status === "New").length}
                </strong>
              </div>
              <div style={s.fpStat}>
                <span style={{ color: "#6b7280" }}>❄ Cold</span>
                <strong>
                  {leads.filter((l) => l.status === "Cold").length}
                </strong>
              </div>
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>SOURCE</div>
              {[
                "LinkedIn",
                "Referral",
                "Website",
                "Cold Call",
                "Event",
                "Other",
              ].map((src) => {
                const cnt = leads.filter((l) => l.source === src).length;
                if (cnt === 0) return null;
                return (
                  <div key={src} style={s.fpStat}>
                    <span>{src}</span>
                    <strong>{cnt}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          {viewMode === "list" && (
            <div
              style={{
                background: "#fff",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
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
                      Name <SortArrow field="name" />
                    </th>
                    <th
                      style={{ ...s.th, cursor: "pointer" }}
                      onClick={() => handleSort("company")}
                    >
                      Company <SortArrow field="company" />
                    </th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Phone</th>
                    <th
                      style={{ ...s.th, cursor: "pointer" }}
                      onClick={() => handleSort("source")}
                    >
                      Source <SortArrow field="source" />
                    </th>
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
                      <td colSpan={8} style={s.emptyCell}>
                        <div style={s.emptyWrap}>
                          <div
                            style={{ fontSize: "48px", marginBottom: "12px" }}
                          >
                            👤
                          </div>
                          <div style={s.emptyTitle}>
                            {searchVal
                              ? "No leads match your search"
                              : "No leads found"}
                          </div>
                          <div style={s.emptySub}>
                            {searchVal
                              ? `No results for "${searchVal}"`
                              : 'Click "Create Lead" to add your first lead'}
                          </div>
                          {!searchVal && (
                            <button
                              style={{ ...s.createBtn, marginTop: "12px" }}
                              onClick={() => setShowModal(true)}
                            >
                              + Create Lead
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((lead) => {
                      const b = getBadge(lead.status);
                      return (
                        <tr
                          key={lead.id}
                          style={{
                            ...s.trow,
                            ...(selected.includes(lead.id)
                              ? s.trowSelected
                              : {}),
                          }}
                        >
                          <td style={s.tdCheck}>
                            <input
                              type="checkbox"
                              checked={selected.includes(lead.id)}
                              onChange={() => toggleSelect(lead.id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td style={s.td}>
                            <div style={s.nameCell}>
                              <div
                                style={{
                                  ...s.nameAvatar,
                                  background: `hsl(${((lead.name?.charCodeAt(0) || 0) * 137) % 360}, 60%, 55%)`,
                                }}
                              >
                                {lead.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={s.nameText}
                                  onClick={() => handleEdit(lead)}
                                >
                                  {lead.name}
                                </div>
                                {lead.notes && (
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#9ca3af",
                                      marginTop: "1px",
                                    }}
                                  >
                                    {lead.notes.slice(0, 30)}
                                    {lead.notes.length > 30 ? "..." : ""}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={s.td}>{lead.company || "—"}</td>
                          <td style={s.td}>
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                style={{
                                  color: "#6366f1",
                                  textDecoration: "none",
                                }}
                              >
                                {lead.email}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td style={s.td}>{lead.phone || "—"}</td>
                          <td style={s.td}>
                            <span style={s.sourceChip}>
                              {lead.source || "—"}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span
                              style={{
                                ...s.badge,
                                background: b.bg,
                                color: b.color,
                              }}
                            >
                              <span
                                style={{ ...s.badgeDot, background: b.dot }}
                              />
                              {lead.status}
                            </span>
                          </td>
                          <td style={s.td}>
                            <div style={s.actions}>
                              <button
                                style={s.editBtn}
                                onClick={() => handleEdit(lead)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                style={s.delBtn}
                                onClick={() => handleDelete(lead.id)}
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
              {/* Pagination Component */}
              <Pagination
                total={sorted.length}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
              />
            </div>
          )}

          {viewMode === "kanban" && (
            <div style={s.kanban}>
              {["New", "Hot", "Warm", "Cold"].map((status) => {
                const b = getBadge(status);
                const colLeads = leads.filter((l) => l.status === status);
                return (
                  <div key={status} style={s.kCol}>
                    <div
                      style={{ ...s.kHead, borderTop: `3px solid ${b.dot}` }}
                    >
                      <span style={{ ...s.kTitle, color: b.color }}>
                        {status}
                      </span>
                      <span style={s.kCount}>{colLeads.length}</span>
                    </div>
                    <div
                      style={{
                        overflowY: "auto",
                        maxHeight: "calc(100vh - 240px)",
                        padding: "0 8px 8px",
                      }}
                    >
                      {colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          style={s.kCard}
                          onClick={() => handleEdit(lead)}
                        >
                          <div style={s.kCardTop}>
                            <div
                              style={{
                                ...s.kAvatar,
                                background: `hsl(${((lead.name?.charCodeAt(0) || 0) * 137) % 360}, 60%, 55%)`,
                              }}
                            >
                              {lead.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span
                              style={{
                                ...s.badge,
                                background: b.bg,
                                color: b.color,
                                fontSize: "10px",
                              }}
                            >
                              {lead.status}
                            </span>
                          </div>
                          <div style={s.kName}>{lead.name}</div>
                          <div style={s.kCompany}>{lead.company || "—"}</div>
                          <div style={s.kMeta}>{lead.email || "—"}</div>
                          <div style={s.kSource}>{lead.source || "—"}</div>
                        </div>
                      ))}
                    </div>
                    <div
                      style={s.kAdd}
                      onClick={() => {
                        setEditLead(null);
                        setForm({
                          name: "",
                          company: "",
                          email: "",
                          phone: "",
                          source: "LinkedIn",
                          status,
                          notes: "",
                        });
                        setShowModal(true);
                      }}
                    >
                      + Add Lead
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editLead ? "Edit Lead" : "Create New Lead"}
                </div>
                <div style={s.modalSub}>
                  {editLead
                    ? "Update lead information"
                    : "Add a new lead to your pipeline"}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name *</label>
                  <input
                    style={s.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div style={s.formGroup}>
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
                <div style={s.formGroup}>
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
                <div style={s.formGroup}>
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
                <div style={s.formGroup}>
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
                <div style={s.formGroup}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>New</option>
                    <option>Hot</option>
                    <option>Warm</option>
                    <option>Cold</option>
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "80px", resize: "vertical" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
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
                  {editLead ? "Update Lead" : "Create Lead"}
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
    flexWrap: "wrap",
  },
  abLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  abTitle: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  abCount: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  bulkActions: { display: "flex", alignItems: "center", gap: "8px" },
  bulkCount: { fontSize: "13px", fontWeight: "600", color: "#6366f1" },
  bulkDelBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  bulkClearBtn: {
    background: "none",
    border: "none",
    fontSize: "12px",
    color: "#6b7280",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  abRight: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
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
  abBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  abBtnActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
  },
  abViewBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "14px",
    color: "#6b7280",
    cursor: "pointer",
  },
  abViewActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
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
    width: "220px",
    minWidth: "220px",
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
  fpDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
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
  fpStat: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 8px",
    fontSize: "12.5px",
    color: "#6b7280",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
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
  nameText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6366f1",
    cursor: "pointer",
  },
  sourceChip: {
    background: "#f1f3f9",
    color: "#6b7280",
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
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
  kanban: {
    display: "flex",
    gap: "14px",
    padding: "16px",
    overflowX: "auto",
    alignItems: "flex-start",
    height: "100%",
  },
  kCol: {
    minWidth: "240px",
    flex: 1,
    background: "#f8f9fc",
    borderRadius: "12px",
    overflow: "hidden",
  },
  kHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 14px 10px",
    background: "#fff",
    marginBottom: "10px",
  },
  kTitle: { fontSize: "13px", fontWeight: "700" },
  kCount: {
    background: "#f1f3f9",
    borderRadius: "20px",
    padding: "2px 9px",
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "600",
  },
  kCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    cursor: "pointer",
    border: "1px solid #e5e7f0",
    margin: "0 8px 8px",
  },
  kCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  kAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#fff",
  },
  kName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "3px",
  },
  kCompany: { fontSize: "12px", color: "#6b7280", marginBottom: "2px" },
  kMeta: { fontSize: "11.5px", color: "#9ca3af", marginBottom: "2px" },
  kSource: { fontSize: "11px", color: "#6366f1", fontWeight: "600" },
  kAdd: {
    padding: "10px",
    textAlign: "center",
    fontSize: "12.5px",
    color: "#9ca3af",
    cursor: "pointer",
    margin: "0 8px 8px",
    borderRadius: "8px",
    border: "1.5px dashed #e5e7f0",
  },
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

export default Leads;
