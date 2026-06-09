import React, { useState } from "react";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Q2 IT Staffing Drive",
      type: "Email",
      status: "Active",
      startDate: "2026-05-01",
      endDate: "2026-06-30",
      target: 50,
      reached: 32,
      owner: "Sam Pillai",
    },
    {
      id: 2,
      name: "React Developer Outreach",
      type: "LinkedIn",
      status: "Active",
      startDate: "2026-05-15",
      endDate: "2026-06-15",
      target: 30,
      reached: 18,
      owner: "Ria Kapoor",
    },
    {
      id: 3,
      name: "Campus Recruitment 2026",
      type: "Event",
      status: "Planned",
      startDate: "2026-07-01",
      endDate: "2026-07-31",
      target: 100,
      reached: 0,
      owner: "Dev Malhotra",
    },
    {
      id: 4,
      name: "Infosys BPM Annual Drive",
      type: "Email",
      status: "Completed",
      startDate: "2026-03-01",
      endDate: "2026-04-30",
      target: 40,
      reached: 40,
      owner: "Sam Pillai",
    },
    {
      id: 5,
      name: "Fintech Talent Hunt",
      type: "LinkedIn",
      status: "Paused",
      startDate: "2026-04-01",
      endDate: "2026-05-31",
      target: 25,
      reached: 12,
      owner: "Ria Kapoor",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState({
    name: "",
    type: "Email",
    status: "Planned",
    startDate: "",
    endDate: "",
    target: "",
    owner: "",
  });

  const filtered =
    filterStatus === "All"
      ? campaigns
      : campaigns.filter((c) => c.status === filterStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editItem) {
      setCampaigns(
        campaigns.map((c) =>
          c.id === editItem.id
            ? { ...form, id: editItem.id, reached: editItem.reached }
            : c,
        ),
      );
    } else {
      setCampaigns([
        ...campaigns,
        { ...form, id: campaigns.length + 1, reached: 0 },
      ]);
    }
    setShowModal(false);
    setEditItem(null);
    setForm({
      name: "",
      type: "Email",
      status: "Planned",
      startDate: "",
      endDate: "",
      target: "",
      owner: "",
    });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = (id) => {
    if (window.confirm("Delete campaign?"))
      setCampaigns(campaigns.filter((c) => c.id !== id));
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "Active":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Planned":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Completed":
        return { bg: "#f9fafb", color: "#6b7280" };
      case "Paused":
        return { bg: "#fffbeb", color: "#f59e0b" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case "Active":
        return "#10b981";
      case "Planned":
        return "#3b82f6";
      case "Completed":
        return "#6b7280";
      case "Paused":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "Email":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      case "LinkedIn":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Event":
        return { bg: "#fffbeb", color: "#f59e0b" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const totalReached = campaigns.reduce((sum, c) => sum + (c.reached || 0), 0);
  const totalTarget = campaigns.reduce(
    (sum, c) => sum + (parseInt(c.target) || 0),
    0,
  );
  const activeCampaigns = campaigns.filter((c) => c.status === "Active").length;

  return (
    <div style={s.page}>
      <div style={s.actionBar}>
        <div style={s.abLeft}>
          <span style={s.abTitle}>Campaigns</span>
          <span style={s.abCount}>{filtered.length}</span>
        </div>
        <div style={s.abRight}>
          <button
            style={s.createBtn}
            onClick={() => {
              setEditItem(null);
              setForm({
                name: "",
                type: "Email",
                status: "Planned",
                startDate: "",
                endDate: "",
                target: "",
                owner: "",
              });
              setShowModal(true);
            }}
          >
            + Create Campaign
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={s.kpiRow}>
        <div style={s.kpi}>
          <div style={s.kpiIcon}>📢</div>
          <div style={s.kpiVal}>{campaigns.length}</div>
          <div style={s.kpiLabel}>Total Campaigns</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiIcon}>🟢</div>
          <div style={{ ...s.kpiVal, color: "#10b981" }}>{activeCampaigns}</div>
          <div style={s.kpiLabel}>Active</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiIcon}>👥</div>
          <div style={s.kpiVal}>{totalReached}</div>
          <div style={s.kpiLabel}>Total Reached</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiIcon}>🎯</div>
          <div style={s.kpiVal}>
            {totalTarget > 0
              ? Math.round((totalReached / totalTarget) * 100)
              : 0}
            %
          </div>
          <div style={s.kpiLabel}>Achievement</div>
        </div>
      </div>

      <div style={s.body}>
        {/* Filter Panel */}
        <div style={s.filterPanel}>
          <div style={s.fpHeader}>Filter by</div>
          <div style={s.fpSection}>
            <div style={s.fpSectionTitle}>STATUS</div>
            {["All", "Active", "Planned", "Completed", "Paused"].map((st) => (
              <div
                key={st}
                style={{
                  ...s.fpItem,
                  ...(filterStatus === st ? s.fpItemActive : {}),
                }}
                onClick={() => setFilterStatus(st)}
              >
                <input
                  type="checkbox"
                  checked={filterStatus === st}
                  onChange={() => setFilterStatus(st)}
                  style={{ marginRight: 8, cursor: "pointer" }}
                />
                {st !== "All" && (
                  <div style={{ ...s.fpDot, background: getStatusColor(st) }} />
                )}
                <span
                  style={{
                    ...s.fpLabel,
                    ...(filterStatus === st
                      ? { color: "#6366f1", fontWeight: 700 }
                      : {}),
                  }}
                >
                  {st === "All" ? "All Campaigns" : st}
                </span>
                <span style={s.fpCount}>
                  {st === "All"
                    ? campaigns.length
                    : campaigns.filter((c) => c.status === st).length}
                </span>
              </div>
            ))}
          </div>
          <div style={s.fpDivider} />
          <div style={s.fpSection}>
            <div style={s.fpSectionTitle}>BY TYPE</div>
            {["Email", "LinkedIn", "Event"].map((type) => (
              <div key={type} style={s.fpStatRow}>
                <span style={s.fpStatLabel}>{type}</span>
                <span style={s.fpCount}>
                  {campaigns.filter((c) => c.type === type).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={s.mainContent}>
          <div style={s.paginationBar}>
            <span style={s.pgTotal}>{filtered.length} campaigns</span>
          </div>

          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Campaign Name</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Start Date</th>
                <th style={s.th}>End Date</th>
                <th style={s.th}>Progress</th>
                <th style={s.th}>Owner</th>
                <th style={s.thIcon}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={s.emptyCell}>
                    <div style={s.emptyWrap}>
                      <div style={{ fontSize: "40px" }}>📢</div>
                      <div style={s.emptyTitle}>No campaigns found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const sb = getStatusBadge(c.status);
                  const tb = getTypeBadge(c.type);
                  const pct =
                    c.target > 0 ? Math.round((c.reached / c.target) * 100) : 0;
                  return (
                    <tr key={c.id} style={s.trow}>
                      <td style={s.td}>
                        <span style={s.nameText} onClick={() => handleEdit(c)}>
                          {c.name}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: tb.bg,
                            color: tb.color,
                          }}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: sb.bg,
                            color: sb.color,
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td style={s.td}>{c.startDate || "—"}</td>
                      <td style={s.td}>{c.endDate || "—"}</td>
                      <td style={s.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div style={s.progTrack}>
                            <div style={{ ...s.progFill, width: `${pct}%` }} />
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.reached}/{c.target}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>{c.owner}</td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          <button
                            style={s.editBtn}
                            onClick={() => handleEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            style={s.delBtn}
                            onClick={() => handleDelete(c.id)}
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
                  {editItem ? "Edit Campaign" : "Create Campaign"}
                </div>
                <div style={s.modalSub}>Campaign details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Campaign Name *</label>
                <input
                  style={s.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Campaign name"
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
                    <option>Email</option>
                    <option>LinkedIn</option>
                    <option>Event</option>
                    <option>Cold Call</option>
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
                    <option>Planned</option>
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
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
                <div style={s.formGroup}>
                  <label style={s.label}>End Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Target Count</label>
                  <input
                    style={s.input}
                    type="number"
                    value={form.target}
                    onChange={(e) =>
                      setForm({ ...form, target: e.target.value })
                    }
                    placeholder="e.g. 50"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Owner</label>
                  <select
                    style={s.input}
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                  >
                    <option>Admin User</option>
                    <option>Ria Kapoor</option>
                    <option>Sam Pillai</option>
                    <option>Dev Malhotra</option>
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
  abRight: { display: "flex", alignItems: "center", gap: "8px" },
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
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
    padding: "16px 20px 0",
    background: "#f8f9fc",
  },
  kpi: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "18px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  kpiIcon: { fontSize: "24px", marginBottom: "8px" },
  kpiVal: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-0.5px",
  },
  kpiLabel: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "4px",
  },
  body: { display: "flex", flex: 1, overflow: "hidden", marginTop: "16px" },
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
  progTrack: {
    width: "80px",
    height: "6px",
    background: "#f1f3f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progFill: {
    height: "100%",
    background: "linear-gradient(90deg,#6366f1,#10b981)",
    borderRadius: "3px",
    transition: "width 0.3s",
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
    width: "500px",
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

export default Campaigns;
