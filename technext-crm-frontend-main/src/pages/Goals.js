import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export default function Goals() {
  const [placements, setPlacements] = useState([]);
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [deals, setDeals] = useState([]);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("technext_goals");
    return saved
      ? JSON.parse(saved)
      : {
          monthlyPlacements: 10,
          monthlyLeads: 50,
          monthlyRevenue: 1000000,
          monthlyCandidates: 30,
          monthlyDeals: 20,
          monthlyMeetings: 40,
        };
  });
  const [editGoals, setEditGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState(goals);
  const [activeMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  );

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/placements`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/leads`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/candidates`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/deals`).catch(() => ({ data: [] })),
    ]).then(([p, l, c, d]) => {
      setPlacements(p.data);
      setLeads(l.data);
      setCandidates(c.data);
      setDeals(d.data);
    });
  }, []);

  const saveGoals = () => {
    setGoals(tempGoals);
    localStorage.setItem("technext_goals", JSON.stringify(tempGoals));
    setEditGoals(false);
  };

  const totalCommission = placements.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );
  const activePlacements = placements.filter(
    (p) => p.status === "Active",
  ).length;
  const wonDeals = deals.filter((d) => d.stage === "Closed Won").length;

  const metrics = [
    {
      key: "monthlyPlacements",
      label: "Monthly Placements",
      icon: "🏆",
      current: placements.length,
      target: goals.monthlyPlacements,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      sub: `${activePlacements} active`,
    },
    {
      key: "monthlyLeads",
      label: "Monthly Leads",
      icon: "👤",
      current: leads.length,
      target: goals.monthlyLeads,
      color: "#6366f1",
      bg: "#eef2ff",
      sub: `${leads.filter((l) => l.status === "Hot").length} hot leads`,
    },
    {
      key: "monthlyRevenue",
      label: "Revenue Target (₹)",
      icon: "💰",
      current: totalCommission,
      target: goals.monthlyRevenue,
      color: "#f59e0b",
      bg: "#fffbeb",
      sub: `₹${(totalCommission / 100000).toFixed(1)}L earned`,
      isCurrency: true,
    },
    {
      key: "monthlyCandidates",
      label: "New Candidates",
      icon: "🪪",
      current: candidates.length,
      target: goals.monthlyCandidates,
      color: "#10b981",
      bg: "#f0fdf4",
      sub: `${candidates.filter((c) => c.stage === "Placed").length} placed`,
    },
    {
      key: "monthlyDeals",
      label: "Deals Closed",
      icon: "🤝",
      current: wonDeals,
      target: goals.monthlyDeals,
      color: "#3b82f6",
      bg: "#eff6ff",
      sub: `${deals.length} total deals`,
    },
  ];

  const overallProgress = Math.round(
    metrics.reduce(
      (sum, m) => sum + Math.min((m.current / m.target) * 100, 100),
      0,
    ) / metrics.length,
  );

  // Team performance (simulated per user)
  const teamPerf = [
    {
      name: "Ria Kapoor",
      role: "Recruiter",
      placements: 3,
      leads: 12,
      avatar: "R",
      color: "#10b981",
    },
    {
      name: "Sam Pillai",
      role: "Sales",
      placements: 2,
      leads: 18,
      avatar: "S",
      color: "#3b82f6",
    },
    {
      name: "Dev Malhotra",
      role: "Recruiter",
      placements: 2,
      leads: 8,
      avatar: "D",
      color: "#8b5cf6",
    },
    {
      name: "Priya Nair",
      role: "HR Manager",
      placements: 1,
      leads: 5,
      avatar: "P",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Targets & Goals</div>
          <div style={s.sub}>{activeMonth} Performance Tracker</div>
        </div>
        <div style={s.headerRight}>
          <div style={s.overallBadge}>
            <div style={s.overallCircle}>
              <svg
                viewBox="0 0 36 36"
                style={{ width: "60px", height: "60px" }}
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f3f9"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeDasharray={`${overallProgress}, 100`}
                  strokeLinecap="round"
                />
                <text
                  x="18"
                  y="20.35"
                  style={{
                    fontSize: "8px",
                    fontWeight: "800",
                    fill: "#0f1117",
                    textAnchor: "middle",
                  }}
                >
                  {overallProgress}%
                </text>
              </svg>
            </div>
            <div style={{ marginLeft: "10px" }}>
              <div style={s.overallLabel}>Overall Progress</div>
              <div style={s.overallSub}>This month</div>
            </div>
          </div>
          <button
            style={s.editBtn}
            onClick={() => {
              setTempGoals(goals);
              setEditGoals(true);
            }}
          >
            ✏️ Set Goals
          </button>
        </div>
      </div>

      <div style={s.content}>
        {/* Goal Cards */}
        <div style={s.goalsGrid}>
          {metrics.map((m) => {
            const pct = Math.min(Math.round((m.current / m.target) * 100), 100);
            const status =
              pct >= 100 ? "achieved" : pct >= 70 ? "ontrack" : "behind";
            const statusColor = {
              achieved: "#10b981",
              ontrack: "#f59e0b",
              behind: "#ef4444",
            }[status];
            const statusLabel = {
              achieved: "✅ Achieved!",
              ontrack: "🎯 On Track",
              behind: "⚠️ Behind",
            }[status];
            return (
              <div
                key={m.key}
                style={{ ...s.goalCard, borderTop: `3px solid ${m.color}` }}
              >
                <div style={s.goalTop}>
                  <div style={{ ...s.goalIcon, background: m.bg }}>
                    {m.icon}
                  </div>
                  <span
                    style={{
                      ...s.statusBadge,
                      background: statusColor + "20",
                      color: statusColor,
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div style={s.goalLabel}>{m.label}</div>
                <div style={s.goalNumbers}>
                  <span style={{ ...s.goalCurrent, color: m.color }}>
                    {m.isCurrency
                      ? `₹${(m.current / 100000).toFixed(1)}L`
                      : m.current}
                  </span>
                  <span style={s.goalSep}>/</span>
                  <span style={s.goalTarget}>
                    {m.isCurrency
                      ? `₹${(m.target / 100000).toFixed(1)}L`
                      : m.target}
                  </span>
                </div>
                <div style={s.goalSub}>{m.sub}</div>
                <div style={s.progTrack}>
                  <div
                    style={{
                      ...s.progFill,
                      width: `${pct}%`,
                      background: m.color,
                    }}
                  />
                </div>
                <div style={s.progLabel}>{pct}% complete</div>
              </div>
            );
          })}
        </div>

        {/* Team Performance */}
        <div style={s.section}>
          <div style={s.sectionTitle}>👥 Team Performance</div>
          <div style={s.teamGrid}>
            {teamPerf.map((member) => (
              <div key={member.name} style={s.memberCard}>
                <div style={s.memberTop}>
                  <div style={{ ...s.memberAvatar, background: member.color }}>
                    {member.avatar}
                  </div>
                  <div>
                    <div style={s.memberName}>{member.name}</div>
                    <div style={s.memberRole}>{member.role}</div>
                  </div>
                </div>
                <div style={s.memberStats}>
                  <div style={s.memberStat}>
                    <div style={s.memberStatVal}>{member.placements}</div>
                    <div style={s.memberStatLabel}>Placements</div>
                  </div>
                  <div style={s.memberStatDiv} />
                  <div style={s.memberStat}>
                    <div style={s.memberStatVal}>{member.leads}</div>
                    <div style={s.memberStatLabel}>Leads</div>
                  </div>
                  <div style={s.memberStatDiv} />
                  <div style={s.memberStat}>
                    <div style={{ ...s.memberStatVal, color: "#8b5cf6" }}>
                      {Math.round(
                        ((member.placements * 2 + member.leads) / 50) * 100,
                      )}
                      %
                    </div>
                    <div style={s.memberStatLabel}>Score</div>
                  </div>
                </div>
                <div style={s.memberProgTrack}>
                  <div
                    style={{
                      ...s.memberProgFill,
                      width: `${Math.min(Math.round(((member.placements * 2 + member.leads) / 50) * 100), 100)}%`,
                      background: member.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Timeline */}
        <div style={s.section}>
          <div style={s.sectionTitle}>📅 Monthly Progress Timeline</div>
          <div style={s.timeline}>
            {[
              { week: "Week 1", pl: 1, ld: 8, color: "#6366f1" },
              { week: "Week 2", pl: 2, ld: 15, color: "#10b981" },
              { week: "Week 3", pl: 3, ld: 20, color: "#f59e0b" },
              {
                week: "Week 4 (Current)",
                pl: placements.length,
                ld: leads.length,
                color: "#8b5cf6",
              },
            ].map((w, i) => (
              <div key={i} style={s.timelineItem}>
                <div style={{ ...s.timelineDot, background: w.color }} />
                <div style={s.timelineContent}>
                  <div style={s.timelineWeek}>{w.week}</div>
                  <div style={s.timelineStats}>
                    <span
                      style={{
                        ...s.timelineBadge,
                        background: "#f5f3ff",
                        color: "#8b5cf6",
                      }}
                    >
                      🏆 {w.pl} placements
                    </span>
                    <span
                      style={{
                        ...s.timelineBadge,
                        background: "#eef2ff",
                        color: "#6366f1",
                      }}
                    >
                      👤 {w.ld} leads
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Goals Modal */}
      {editGoals && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>Set Monthly Goals</div>
                <div style={s.modalSub}>
                  Define your team targets for this month
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setEditGoals(false)}>
                ✕
              </button>
            </div>
            <div style={s.modalBody}>
              {metrics.map((m) => (
                <div key={m.key} style={s.formGroup}>
                  <label style={s.label}>
                    {m.icon} {m.label}
                  </label>
                  <input
                    style={s.input}
                    type="number"
                    value={tempGoals[m.key]}
                    onChange={(e) =>
                      setTempGoals({
                        ...tempGoals,
                        [m.key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder={`Target for ${m.label}`}
                  />
                </div>
              ))}
              <div style={s.modalFoot}>
                <button style={s.cancelBtn} onClick={() => setEditGoals(false)}>
                  Cancel
                </button>
                <button style={s.saveBtn} onClick={saveGoals}>
                  Save Goals
                </button>
              </div>
            </div>
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
    padding: "20px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  overallBadge: {
    display: "flex",
    alignItems: "center",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "12px",
    padding: "10px 16px",
  },
  overallCircle: {},
  overallLabel: { fontSize: "13px", fontWeight: "700", color: "#0f1117" },
  overallSub: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
  editBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  goalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: "14px",
  },
  goalCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  goalTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  goalIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "20px",
  },
  goalLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "8px",
  },
  goalNumbers: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
    marginBottom: "4px",
  },
  goalCurrent: { fontSize: "26px", fontWeight: "800", letterSpacing: "-1px" },
  goalSep: { fontSize: "16px", color: "#9ca3af" },
  goalTarget: { fontSize: "16px", color: "#9ca3af", fontWeight: "600" },
  goalSub: { fontSize: "11px", color: "#9ca3af", marginBottom: "10px" },
  progTrack: {
    height: "6px",
    background: "#f1f3f9",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "4px",
  },
  progFill: { height: "100%", borderRadius: "3px", transition: "width 0.5s" },
  progLabel: { fontSize: "10px", color: "#9ca3af", fontWeight: "600" },
  section: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "16px",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
  },
  memberCard: {
    background: "#f8f9fc",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #e5e7f0",
  },
  memberTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  memberAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  memberName: { fontSize: "13px", fontWeight: "700", color: "#0f1117" },
  memberRole: { fontSize: "11px", color: "#9ca3af", marginTop: "1px" },
  memberStats: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  memberStat: { textAlign: "center" },
  memberStatVal: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  memberStatLabel: { fontSize: "10px", color: "#9ca3af", marginTop: "2px" },
  memberStatDiv: { width: "1px", height: "30px", background: "#e5e7f0" },
  memberProgTrack: {
    height: "5px",
    background: "#e5e7f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  memberProgFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s",
  },
  timeline: { display: "flex", flexDirection: "column", gap: "0" },
  timelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "14px 0",
    borderBottom: "1px solid #f1f3f9",
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "4px",
  },
  timelineContent: { flex: 1 },
  timelineWeek: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "6px",
  },
  timelineStats: { display: "flex", gap: "8px", flexWrap: "wrap" },
  timelineBadge: {
    fontSize: "11.5px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
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
    width: "480px",
    maxHeight: "90vh",
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
  modalBody: { padding: "24px" },
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
