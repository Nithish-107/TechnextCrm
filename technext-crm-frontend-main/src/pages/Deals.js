import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename);
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

const BASE_URL = "http://localhost:8080/api";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterStage, setFilterStage] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [form, setForm] = useState({
    name: "",
    accountName: "",
    amount: "",
    stage: "Prospecting",
    closingDate: "",
    description: "",
  });

  useEffect(() => {
    fetchDeals();
  }, []);
  const fetchDeals = () =>
    axios
      .get(`${BASE_URL}/deals`)
      .then((res) => setDeals(res.data))
      .catch(() => {});

  const stages = [
    "All",
    "Prospecting",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ];

  const filtered =
    filterStage === "All"
      ? deals
      : deals.filter((d) => d.stage === filterStage);
  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem) await axios.put(`${BASE_URL}/deals/${editItem.id}`, form);
    else await axios.post(`${BASE_URL}/deals`, form);
    setShowModal(false);
    setEditItem(null);
    setForm({
      name: "",
      accountName: "",
      amount: "",
      stage: "Prospecting",
      closingDate: "",
      description: "",
    });
    fetchDeals();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this deal?")) {
      await axios.delete(`${BASE_URL}/deals/${id}`);
      fetchDeals();
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
        : paginated.map((d) => d.id),
    );
  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setShowSortMenu(false);
  };
  const handleFilter = (stage) => {
    setFilterStage(stage);
    setPage(1);
    setSelected([]);
  };

  const handleExport = () => {
    const data = filtered.map((d) => ({
      "Deal Name": d.name || "",
      Account: d.accountName || "",
      "Amount (INR)": d.amount || "",
      Stage: d.stage || "",
      "Closing Date": d.closingDate || "",
      Description: d.description || "",
    }));
    exportToExcel(data, "TechNext_Deals");
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case "Closed Won":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Closed Lost":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Negotiation":
        return { bg: "#fffbeb", color: "#f59e0b" };
      case "Proposal":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      case "Qualified":
        return { bg: "#eff6ff", color: "#3b82f6" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Closed Won":
        return "#10b981";
      case "Closed Lost":
        return "#ef4444";
      case "Negotiation":
        return "#f59e0b";
      case "Proposal":
        return "#8b5cf6";
      case "Qualified":
        return "#3b82f6";
      default:
        return "#6b7280";
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

  const totalValue = filtered.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonValue = deals
    .filter((d) => d.stage === "Closed Won")
    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>Deals</span>
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
                {["name", "accountName", "amount", "stage", "closingDate"].map(
                  (f) => (
                    <div
                      key={f}
                      style={s.sortMenuItem}
                      onClick={() => handleSort(f)}
                    >
                      {f === "accountName"
                        ? "Account"
                        : f === "closingDate"
                          ? "Closing Date"
                          : f.charAt(0).toUpperCase() + f.slice(1)}
                      {sortField === f && (
                        <span style={{ marginLeft: 6, color: "#6366f1" }}>
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  ),
                )}
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
              setEditItem(null);
              setForm({
                name: "",
                accountName: "",
                amount: "",
                stage: "Prospecting",
                closingDate: "",
                description: "",
              });
              setShowModal(true);
            }}
          >
            + Create Deal
          </button>
        </div>
      </div>

      <div style={s.body}>
        {filterOpen && (
          <div style={s.filterPanel}>
            <div style={s.fpHeader}>Filter by</div>
            <div style={s.fpSearch}>
              <input style={s.fpSearchInput} placeholder="🔍 Search deals..." />
            </div>
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>STAGE</div>
              {stages.map((st) => (
                <div
                  key={st}
                  style={{
                    ...s.fpItem,
                    ...(filterStage === st ? s.fpItemActive : {}),
                  }}
                  onClick={() => handleFilter(st)}
                >
                  <input
                    type="checkbox"
                    checked={filterStage === st}
                    onChange={() => handleFilter(st)}
                    style={{ marginRight: 8, cursor: "pointer" }}
                  />
                  {st !== "All" && (
                    <div
                      style={{ ...s.fpDot, background: getStageColor(st) }}
                    />
                  )}
                  <span
                    style={{
                      ...s.fpLabel,
                      ...(filterStage === st
                        ? { color: "#6366f1", fontWeight: 700 }
                        : {}),
                    }}
                  >
                    {st === "All" ? "All Deals" : st}
                  </span>
                  <span style={s.fpCount}>
                    {st === "All"
                      ? deals.length
                      : deals.filter((d) => d.stage === st).length}
                  </span>
                </div>
              ))}
            </div>
            <div style={s.fpDivider} />
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>PIPELINE SUMMARY</div>
              <div style={s.summaryCard}>
                <div style={s.summaryLabel}>Total Pipeline</div>
                <div style={s.summaryVal}>
                  ₹{(totalValue / 100000).toFixed(1)}L
                </div>
              </div>
              <div
                style={{
                  ...s.summaryCard,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div style={s.summaryLabel}>Won Revenue</div>
                <div style={{ ...s.summaryVal, color: "#10b981" }}>
                  ₹{(wonValue / 100000).toFixed(1)}L
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>
              {filtered.length} deals · ₹{(totalValue / 100000).toFixed(1)}L
              pipeline
            </span>
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

          {viewMode === "list" && (
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
                    Deal Name <SortArrow field="name" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("accountName")}
                  >
                    Account <SortArrow field="accountName" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("amount")}
                  >
                    Amount <SortArrow field="amount" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("stage")}
                  >
                    Stage <SortArrow field="stage" />
                  </th>
                  <th
                    style={{ ...s.th, cursor: "pointer" }}
                    onClick={() => handleSort("closingDate")}
                  >
                    Closing Date <SortArrow field="closingDate" />
                  </th>
                  <th style={s.thIcon}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={s.emptyCell}>
                      <div style={s.emptyWrap}>
                        <div style={{ fontSize: "40px" }}>🤝</div>
                        <div style={s.emptyTitle}>No deals yet</div>
                        <div style={s.emptySub}>Create your first deal</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((d) => {
                    const b = getStageBadge(d.stage);
                    return (
                      <tr
                        key={d.id}
                        style={{
                          ...s.trow,
                          ...(selected.includes(d.id) ? s.trowSelected : {}),
                        }}
                      >
                        <td style={s.tdCheck}>
                          <input
                            type="checkbox"
                            checked={selected.includes(d.id)}
                            onChange={() => toggleSelect(d.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={s.td}>
                          <span
                            style={s.nameText}
                            onClick={() => handleEdit(d)}
                          >
                            {d.name}
                          </span>
                        </td>
                        <td style={s.td}>{d.accountName || "—"}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "700",
                            color: "#0f1117",
                          }}
                        >
                          {d.amount
                            ? `₹${parseFloat(d.amount).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: b.bg,
                              color: b.color,
                            }}
                          >
                            {d.stage}
                          </span>
                        </td>
                        <td style={s.td}>{d.closingDate || "—"}</td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button
                              style={s.editBtn}
                              onClick={() => handleEdit(d)}
                            >
                              Edit
                            </button>
                            <button
                              style={s.delBtn}
                              onClick={() => handleDelete(d.id)}
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
          )}

          {viewMode === "kanban" && (
            <div style={s.kanban}>
              {[
                "Prospecting",
                "Qualified",
                "Proposal",
                "Negotiation",
                "Closed Won",
                "Closed Lost",
              ].map((stage) => {
                const stageDeals = deals.filter((d) => d.stage === stage);
                const stageVal = stageDeals.reduce(
                  (sum, d) => sum + (parseFloat(d.amount) || 0),
                  0,
                );
                const b = getStageBadge(stage);
                return (
                  <div key={stage} style={s.kCol}>
                    <div
                      style={{
                        ...s.kHead,
                        borderTop: `3px solid ${getStageColor(stage)}`,
                      }}
                    >
                      <div>
                        <div
                          style={{ ...s.kTitle, color: getStageColor(stage) }}
                        >
                          {stage}
                        </div>
                        <div style={s.kVal}>
                          ₹{(stageVal / 100000).toFixed(1)}L
                        </div>
                      </div>
                      <span style={s.kCount}>{stageDeals.length}</span>
                    </div>
                    {stageDeals.map((d) => (
                      <div
                        key={d.id}
                        style={s.kCard}
                        onClick={() => handleEdit(d)}
                      >
                        <div style={s.kName}>{d.name}</div>
                        <div style={s.kCompany}>{d.accountName || "—"}</div>
                        <div style={s.kAmount}>
                          {d.amount
                            ? `₹${parseFloat(d.amount).toLocaleString("en-IN")}`
                            : "—"}
                        </div>
                        {d.closingDate && (
                          <div style={s.kDate}>📅 {d.closingDate}</div>
                        )}
                      </div>
                    ))}
                    <div
                      style={s.kAdd}
                      onClick={() => {
                        setEditItem(null);
                        setForm({
                          name: "",
                          accountName: "",
                          amount: "",
                          stage,
                          closingDate: "",
                          description: "",
                        });
                        setShowModal(true);
                      }}
                    >
                      + Add Deal
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Deal" : "Create Deal"}
                </div>
                <div style={s.modalSub}>Deal information</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Deal Name *</label>
                <input
                  style={s.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Infosys Q2 Staffing"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Account</label>
                  <input
                    style={s.input}
                    value={form.accountName}
                    onChange={(e) =>
                      setForm({ ...form, accountName: e.target.value })
                    }
                    placeholder="Company name"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Amount (₹)</label>
                  <input
                    style={s.input}
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="500000"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Stage</label>
                  <select
                    style={s.input}
                    value={form.stage}
                    onChange={(e) =>
                      setForm({ ...form, stage: e.target.value })
                    }
                  >
                    {stages
                      .filter((st) => st !== "All")
                      .map((st) => (
                        <option key={st}>{st}</option>
                      ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Closing Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.closingDate}
                    onChange={(e) =>
                      setForm({ ...form, closingDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Description</label>
                <textarea
                  style={{ ...s.input, minHeight: "80px" }}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deal notes..."
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
                  {editItem ? "Update" : "Save Deal"}
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
  summaryCard: {
    background: "#f8f9fc",
    borderRadius: "10px",
    padding: "12px",
    margin: "4px 8px 8px",
    border: "1px solid #e5e7f0",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryVal: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f1117",
    marginTop: "4px",
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
  kanban: {
    display: "flex",
    gap: "14px",
    padding: "16px",
    overflowX: "auto",
    alignItems: "flex-start",
  },
  kCol: {
    minWidth: "220px",
    flex: 1,
    background: "#f8f9fc",
    borderRadius: "12px",
    overflow: "hidden",
  },
  kHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "14px",
    background: "#fff",
    marginBottom: "10px",
  },
  kTitle: { fontSize: "12px", fontWeight: "700" },
  kVal: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#0f1117",
    marginTop: "2px",
  },
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
  kName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "4px",
  },
  kCompany: { fontSize: "12px", color: "#6b7280", marginBottom: "4px" },
  kAmount: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#6366f1",
    marginBottom: "4px",
  },
  kDate: { fontSize: "11px", color: "#9ca3af" },
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
    width: "540px",
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

export default Deals;
