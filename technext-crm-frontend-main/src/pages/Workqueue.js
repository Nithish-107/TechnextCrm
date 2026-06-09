import React, { useState, useEffect } from "react";
import {
  getLeads,
  getCandidates,
  getTasks,
  getMeetings,
} from "../services/api";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

function Workqueue() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [calls, setCalls] = useState([]);
  const [activeSection, setActiveSection] = useState("tasks");
  const [activeFilter, setActiveFilter] = useState("Today & Overdue");

  useEffect(() => {
    getLeads()
      .then((r) => setLeads(r.data))
      .catch(() => {});
    getCandidates()
      .then((r) => setCandidates(r.data))
      .catch(() => {});
    getTasks()
      .then((r) => setTasks(r.data))
      .catch(() => {});
    getMeetings()
      .then((r) => setMeetings(r.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/calls`)
      .then((r) => setCalls(r.data))
      .catch(() => {});
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === "Pending");
  const upcomingMeetings = meetings.filter((m) => m.status === "Upcoming");

  const getActiveData = () => {
    switch (activeSection) {
      case "tasks":
        return pendingTasks;
      case "meetings":
        return upcomingMeetings;
      case "calls":
        return calls;
      default:
        return [];
    }
  };

  const renderTable = () => {
    const data = getActiveData();
    if (activeSection === "tasks") {
      return (
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Subject</th>
              <th style={s.th}>Due Date</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} style={s.empty}>
                  No tasks found
                </td>
              </tr>
            ) : (
              data.map((t) => (
                <tr key={t.id} style={s.trow}>
                  <td style={s.tdLink}>{t.title}</td>
                  <td style={s.td}>
                    {t.dueDate ? (
                      <span
                        style={{
                          color:
                            new Date(t.dueDate) < new Date()
                              ? "#ef4444"
                              : "#475569",
                        }}
                      >
                        {t.dueDate}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        background: "#fee2e2",
                        color: "#b91c1c",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...getPriBadge(t.priority) }}>
                      {t.priority}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
    if (activeSection === "meetings") {
      return (
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Title</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Time</th>
              <th style={s.th}>Location</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} style={s.empty}>
                  No upcoming meetings
                </td>
              </tr>
            ) : (
              data.map((m) => (
                <tr key={m.id} style={s.trow}>
                  <td style={s.tdLink}>{m.title}</td>
                  <td style={s.td}>{m.meetingDate || "—"}</td>
                  <td style={s.td}>{m.meetingTime || "—"}</td>
                  <td style={s.td}>{m.location || "—"}</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        background: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
    if (activeSection === "calls") {
      return (
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Contact</th>
              <th style={s.th}>Company</th>
              <th style={s.th}>Type</th>
              <th style={s.th}>Duration</th>
              <th style={s.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} style={s.empty}>
                  No calls logged
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr key={c.id} style={s.trow}>
                  <td style={s.tdLink}>{c.contactName}</td>
                  <td style={s.td}>{c.company}</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        ...(c.type === "Inbound"
                          ? { background: "#dbeafe", color: "#1d4ed8" }
                          : { background: "#dcfce7", color: "#15803d" }),
                      }}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td style={s.td}>{c.duration || "—"}</td>
                  <td style={s.td}>
                    {c.notes ? c.notes.substring(0, 40) + "..." : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
  };

  const getPriBadge = (p) => {
    switch (p) {
      case "High":
        return { background: "#fee2e2", color: "#b91c1c" };
      case "Medium":
        return { background: "#fef3c7", color: "#92400e" };
      default:
        return { background: "#dbeafe", color: "#1d4ed8" };
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.title}>Workqueue</span>
      </div>
      <div style={s.body}>
        {/* Left Panel */}
        <div style={s.leftPanel}>
          <div style={s.lpSection}>
            <div style={s.lpTitle}>My Open Activity</div>
            <select
              style={s.lpSelect}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option>Today & Overdue</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>All</option>
            </select>
          </div>

          {[
            {
              id: "tasks",
              label: "Tasks",
              count: pendingTasks.length,
              icon: "✅",
            },
            {
              id: "meetings",
              label: "Meetings",
              count: upcomingMeetings.length,
              icon: "📅",
            },
            { id: "calls", label: "Calls", count: calls.length, icon: "📞" },
          ].map((item) => (
            <div
              key={item.id}
              style={{
                ...s.lpItem,
                ...(activeSection === item.id ? s.lpItemActive : {}),
              }}
              onClick={() => setActiveSection(item.id)}
            >
              <span style={s.lpIcon}>{item.icon}</span>
              <span style={s.lpLabel}>{item.label}</span>
              <span style={s.lpCount}>{item.count}</span>
            </div>
          ))}

          <div style={s.lpDivider} />

          <div style={s.lpSection}>
            <div style={s.lpTitle}>My Workqueue</div>
          </div>

          <div style={s.lpSubSection}>
            <div style={s.lpSubTitle}>Leads</div>
            <div style={{ ...s.lpItem }} onClick={() => {}}>
              <span style={s.lpIcon}>👤</span>
              <span style={s.lpLabel}>My Leads</span>
              <span style={s.lpCount}>{leads.length}</span>
            </div>
            <div style={{ ...s.lpItem }} onClick={() => {}}>
              <span style={s.lpIcon}>🔥</span>
              <span style={s.lpLabel}>Hot Leads</span>
              <span style={s.lpCount}>
                {leads.filter((l) => l.status === "Hot").length}
              </span>
            </div>
          </div>

          <div style={s.lpSubSection}>
            <div style={s.lpSubTitle}>Candidates</div>
            <div style={{ ...s.lpItem }} onClick={() => {}}>
              <span style={s.lpIcon}>🪪</span>
              <span style={s.lpLabel}>My Candidates</span>
              <span style={s.lpCount}>{candidates.length}</span>
            </div>
            <div style={{ ...s.lpItem }} onClick={() => {}}>
              <span style={s.lpIcon}>🎯</span>
              <span style={s.lpLabel}>In Interview</span>
              <span style={s.lpCount}>
                {candidates.filter((c) => c.stage === "Interview").length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={s.rightPanel}>
          <div style={s.rpHeader}>
            <span style={s.rpTitle}>
              {activeSection === "tasks"
                ? "Tasks"
                : activeSection === "meetings"
                  ? "Meetings"
                  : "Calls"}
              <span style={s.rpRefresh}> ↻</span>
            </span>
            <button style={s.filterBtn}>⧩ Filter</button>
          </div>
          <div style={s.rpBody}>{renderTable()}</div>
          <div style={s.rpFooter}>Total Records {getActiveData().length}</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#f4f5f7",
  },
  header: {
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  title: { fontSize: "15px", fontWeight: "700", color: "#1a1f3a" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  leftPanel: {
    width: "240px",
    minWidth: "240px",
    background: "#fff",
    borderRight: "1px solid #e2e8f0",
    overflowY: "auto",
    padding: "12px 0",
  },
  lpSection: { padding: "8px 14px" },
  lpTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1a1f3a",
    marginBottom: "8px",
  },
  lpSelect: {
    width: "100%",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    color: "#475569",
    outline: "none",
    marginBottom: "8px",
  },
  lpItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    borderLeft: "2px solid transparent",
    transition: "all 0.15s",
  },
  lpItemActive: { background: "#eff6ff", borderLeft: "2px solid #3b82f6" },
  lpIcon: { fontSize: "13px", width: "18px" },
  lpLabel: { flex: 1, fontSize: "12.5px", color: "#475569", fontWeight: "500" },
  lpCount: {
    background: "#f1f5f9",
    borderRadius: "10px",
    padding: "1px 8px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
  },
  lpDivider: { height: "1px", background: "#f1f5f9", margin: "10px 0" },
  lpSubSection: { marginBottom: "8px" },
  lpSubTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    padding: "4px 14px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  rpHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  rpTitle: { fontSize: "13px", fontWeight: "700", color: "#1a1f3a" },
  rpRefresh: { color: "#94a3b8", cursor: "pointer", fontSize: "13px" },
  filterBtn: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "12px",
    color: "#475569",
    cursor: "pointer",
  },
  rpBody: { flex: 1, overflowY: "auto" },
  rpFooter: {
    padding: "8px 16px",
    background: "#fff",
    borderTop: "1px solid #e2e8f0",
    fontSize: "12px",
    color: "#475569",
    fontWeight: "500",
  },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "10px 14px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    whiteSpace: "nowrap",
  },
  trow: { borderBottom: "1px solid #f8fafc", cursor: "pointer" },
  td: { padding: "10px 14px", fontSize: "12.5px", color: "#475569" },
  tdLink: {
    padding: "10px 14px",
    fontSize: "12.5px",
    color: "#3b82f6",
    fontWeight: "500",
  },
  badge: {
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

export default Workqueue;
