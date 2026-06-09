import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const ROUNDS = [
  "Round 1",
  "Round 2",
  "Round 3",
  "HR Round",
  "Final Round",
  "Technical Round",
];
const TYPES = ["Video", "Phone", "In-Person", "Technical", "HR Round"];
const STATUSES = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "No Show",
  "Rescheduled",
];
const RESULTS = ["Pending", "Pass", "Fail", "Hold"];

export default function InterviewScheduler() {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterResult, setFilterResult] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [showFeedback, setShowFeedback] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    candidateName: "",
    candidateId: "",
    jobTitle: "",
    jobId: "",
    clientCompany: "",
    interviewer: "",
    interviewDate: "",
    interviewTime: "",
    interviewType: "Video",
    round: "Round 1",
    status: "Scheduled",
    result: "Pending",
    location: "",
    meetingLink: "",
    notes: "",
    feedback: "",
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/interviews`),
      axios.get(`${BASE_URL}/candidates`),
      axios.get(`${BASE_URL}/jobs`),
      axios.get(`${BASE_URL}/users`),
    ])
      .then(([iv, c, j, u]) => {
        setInterviews(iv.data);
        setCandidates(c.data);
        setJobs(j.data);
        setUsers(u.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchInterviews = () =>
    axios.get(`${BASE_URL}/interviews`).then((r) => setInterviews(r.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem)
      await axios.put(`${BASE_URL}/interviews/${editItem.id}`, payload);
    else await axios.post(`${BASE_URL}/interviews`, payload);
    setShowModal(false);
    setEditItem(null);
    resetForm();
    fetchInterviews();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      candidateName: item.candidateName || "",
      candidateId: item.candidateId || "",
      jobTitle: item.jobTitle || "",
      jobId: item.jobId || "",
      clientCompany: item.clientCompany || "",
      interviewer: item.interviewer || "",
      interviewDate: item.interviewDate || "",
      interviewTime: item.interviewTime || "",
      interviewType: item.interviewType || "Video",
      round: item.round || "Round 1",
      status: item.status || "Scheduled",
      result: item.result || "Pending",
      location: item.location || "",
      meetingLink: item.meetingLink || "",
      notes: item.notes || "",
      feedback: item.feedback || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this interview?")) {
      await axios.delete(`${BASE_URL}/interviews/${id}`);
      fetchInterviews();
    }
  };

  const handleQuickUpdate = async (id, field, value) => {
    const item = interviews.find((i) => i.id === id);
    if (!item) return;
    await axios.put(`${BASE_URL}/interviews/${id}`, {
      ...item,
      [field]: value,
    });
    fetchInterviews();
  };

  const resetForm = () =>
    setForm({
      candidateName: "",
      candidateId: "",
      jobTitle: "",
      jobId: "",
      clientCompany: "",
      interviewer: "",
      interviewDate: "",
      interviewTime: "",
      interviewType: "Video",
      round: "Round 1",
      status: "Scheduled",
      result: "Pending",
      location: "",
      meetingLink: "",
      notes: "",
      feedback: "",
    });

  const filtered = interviews.filter((i) => {
    const matchStatus = filterStatus === "All" || i.status === filterStatus;
    const matchResult = filterResult === "All" || i.result === filterResult;
    return matchStatus && matchResult;
  });

  const today = new Date().toISOString().split("T")[0];
  const todayInterviews = interviews.filter((i) => i.interviewDate === today);
  const upcoming = interviews.filter(
    (i) => i.status === "Scheduled" && i.interviewDate >= today,
  );
  const passed = interviews.filter((i) => i.result === "Pass").length;
  const failed = interviews.filter((i) => i.result === "Fail").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Completed":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Cancelled":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "No Show":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Rescheduled":
        return { bg: "#fffbeb", color: "#f59e0b" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case "Pass":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Fail":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Hold":
        return { bg: "#fffbeb", color: "#f59e0b" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Video":
        return "📹";
      case "Phone":
        return "📞";
      case "In-Person":
        return "🏢";
      case "Technical":
        return "💻";
      case "HR Round":
        return "👥";
      default:
        return "📅";
    }
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
          Loading interviews...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Interview Scheduler</span>
          <span style={s.count}>{interviews.length}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.viewToggle}>
            {["list", "kanban"].map((v) => (
              <button
                key={v}
                style={{
                  ...s.viewBtn,
                  ...(viewMode === v ? s.viewBtnActive : {}),
                }}
                onClick={() => setViewMode(v)}
              >
                {v === "list" ? "☰ List" : "⊞ Board"}
              </button>
            ))}
          </div>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              resetForm();
              setShowModal(true);
            }}
          >
            + Schedule Interview
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiRow}>
        {[
          {
            label: "Today's Interviews",
            value: todayInterviews.length,
            icon: "📅",
            color: "#6366f1",
            bg: "#eef2ff",
          },
          {
            label: "Upcoming",
            value: upcoming.length,
            icon: "🗓️",
            color: "#3b82f6",
            bg: "#eff6ff",
          },
          {
            label: "Passed",
            value: passed,
            icon: "✅",
            color: "#10b981",
            bg: "#f0fdf4",
          },
          {
            label: "Failed",
            value: failed,
            icon: "❌",
            color: "#ef4444",
            bg: "#fef2f2",
          },
          {
            label: "Total",
            value: interviews.length,
            icon: "📊",
            color: "#8b5cf6",
            bg: "#f5f3ff",
          },
        ].map((k) => (
          <div key={k.label} style={s.kpiCard}>
            <div style={{ ...s.kpiIcon, background: k.bg }}>{k.icon}</div>
            <div style={{ ...s.kpiVal, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filterBar}>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Status:</span>
          {["All", ...STATUSES].map((st) => (
            <button
              key={st}
              style={{
                ...s.filterBtn,
                ...(filterStatus === st ? s.filterBtnActive : {}),
              }}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Result:</span>
          {["All", ...RESULTS].map((r) => (
            <button
              key={r}
              style={{
                ...s.filterBtn,
                ...(filterResult === r
                  ? {
                      ...s.filterBtnActive,
                      background:
                        r === "Pass"
                          ? "#f0fdf4"
                          : r === "Fail"
                            ? "#fef2f2"
                            : r === "Hold"
                              ? "#fffbeb"
                              : "#eef2ff",
                      color:
                        r === "Pass"
                          ? "#10b981"
                          : r === "Fail"
                            ? "#ef4444"
                            : r === "Hold"
                              ? "#f59e0b"
                              : "#6366f1",
                    }
                  : {}),
              }}
              onClick={() => setFilterResult(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div style={s.content}>
          {filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📅</div>
              <div style={s.emptyTitle}>No interviews found</div>
              <div style={s.emptySub}>Schedule your first interview</div>
              <button
                style={s.addBtn}
                onClick={() => {
                  setEditItem(null);
                  resetForm();
                  setShowModal(true);
                }}
              >
                + Schedule Interview
              </button>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Candidate</th>
                    <th style={s.th}>Job / Company</th>
                    <th style={s.th}>Date & Time</th>
                    <th style={s.th}>Type / Round</th>
                    <th style={s.th}>Interviewer</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Result</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((iv) => {
                    const sc = getStatusColor(iv.status);
                    const rc = getResultColor(iv.result);
                    const isToday = iv.interviewDate === today;
                    return (
                      <tr
                        key={iv.id}
                        style={{
                          ...s.trow,
                          ...(isToday ? { background: "#fafbff" } : {}),
                        }}
                      >
                        <td style={s.td}>
                          <div style={s.candidateCell}>
                            <div style={s.candidateAvatar}>
                              {iv.candidateName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div style={s.candidateName}>
                                {iv.candidateName || "—"}
                              </div>
                              {isToday && (
                                <span style={s.todayBadge}>Today</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#0f1117",
                            }}
                          >
                            {iv.jobTitle || "—"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {iv.clientCompany || "—"}
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>
                            {iv.interviewDate || "—"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>
                            {iv.interviewTime || "—"}
                          </div>
                        </td>
                        <td style={s.td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span style={{ fontSize: "16px" }}>
                              {getTypeIcon(iv.interviewType)}
                            </span>
                            <div>
                              <div
                                style={{
                                  fontSize: "12.5px",
                                  fontWeight: "600",
                                }}
                              >
                                {iv.interviewType}
                              </div>
                              <div
                                style={{ fontSize: "11px", color: "#9ca3af" }}
                              >
                                {iv.round}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={s.td}>{iv.interviewer || "—"}</td>
                        <td style={s.td}>
                          <select
                            style={{
                              ...s.quickSelect,
                              background: sc.bg,
                              color: sc.color,
                            }}
                            value={iv.status}
                            onChange={(e) =>
                              handleQuickUpdate(iv.id, "status", e.target.value)
                            }
                          >
                            {STATUSES.map((st) => (
                              <option key={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td style={s.td}>
                          <select
                            style={{
                              ...s.quickSelect,
                              background: rc.bg,
                              color: rc.color,
                            }}
                            value={iv.result}
                            onChange={(e) =>
                              handleQuickUpdate(iv.id, "result", e.target.value)
                            }
                          >
                            {RESULTS.map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td style={s.td}>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              style={s.editBtn}
                              onClick={() => handleEdit(iv)}
                            >
                              Edit
                            </button>
                            {iv.meetingLink && (
                              <a
                                href={iv.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                style={s.linkBtn}
                              >
                                Join
                              </a>
                            )}
                            <button
                              style={s.feedbackBtn}
                              onClick={() => setShowFeedback(iv)}
                            >
                              💬
                            </button>
                            <button
                              style={s.delBtn}
                              onClick={() => handleDelete(iv.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <div style={s.kanban}>
          {STATUSES.map((status) => {
            const statusItems = interviews.filter((i) => i.status === status);
            const sc = getStatusColor(status);
            return (
              <div key={status} style={s.kanbanCol}>
                <div style={{ ...s.kanbanHeader, background: sc.bg }}>
                  <span style={{ ...s.kanbanTitle, color: sc.color }}>
                    {status}
                  </span>
                  <span
                    style={{
                      ...s.kanbanCount,
                      background: sc.color,
                      color: "#fff",
                    }}
                  >
                    {statusItems.length}
                  </span>
                </div>
                <div style={s.kanbanCards}>
                  {statusItems.map((iv) => {
                    const rc = getResultColor(iv.result);
                    return (
                      <div key={iv.id} style={s.kanbanCard}>
                        <div style={s.kanbanCardTop}>
                          <div style={s.kanbanAvatar}>
                            {iv.candidateName?.charAt(0) || "?"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={s.kanbanCandName}>
                              {iv.candidateName}
                            </div>
                            <div style={s.kanbanJobTitle}>{iv.jobTitle}</div>
                          </div>
                          <button
                            style={s.kanbanEdit}
                            onClick={() => handleEdit(iv)}
                          >
                            ✏️
                          </button>
                        </div>
                        <div style={s.kanbanMeta}>
                          <span>
                            {getTypeIcon(iv.interviewType)} {iv.interviewType}
                          </span>
                          <span>📅 {iv.interviewDate}</span>
                        </div>
                        <div style={s.kanbanMeta}>
                          <span>🕐 {iv.interviewTime || "—"}</span>
                          <span>👤 {iv.interviewer || "—"}</span>
                        </div>
                        <div style={s.kanbanFooter}>
                          <span style={s.kanbanRound}>{iv.round}</span>
                          <span
                            style={{
                              ...s.kanbanResult,
                              background: rc.bg,
                              color: rc.color,
                            }}
                          >
                            {iv.result}
                          </span>
                        </div>
                        {iv.meetingLink && (
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            style={s.joinBtn}
                          >
                            📹 Join Meeting
                          </a>
                        )}
                      </div>
                    );
                  })}
                  {statusItems.length === 0 && (
                    <div style={s.kanbanEmpty}>No interviews</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: "500px" }}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>💬 Interview Feedback</div>
                <div style={s.modalSub}>
                  {showFeedback.candidateName} — {showFeedback.round}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowFeedback(null)}>
                ✕
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Result</label>
                <select
                  style={s.input}
                  value={showFeedback.result}
                  onChange={(e) =>
                    setShowFeedback({ ...showFeedback, result: e.target.value })
                  }
                >
                  {RESULTS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Feedback / Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "120px", resize: "vertical" }}
                  value={showFeedback.feedback || ""}
                  onChange={(e) =>
                    setShowFeedback({
                      ...showFeedback,
                      feedback: e.target.value,
                    })
                  }
                  placeholder="Write interview feedback here..."
                />
              </div>
              <div style={s.modalFoot}>
                <button
                  style={s.cancelBtn}
                  onClick={() => setShowFeedback(null)}
                >
                  Cancel
                </button>
                <button
                  style={s.saveBtn}
                  onClick={async () => {
                    await axios.put(
                      `${BASE_URL}/interviews/${showFeedback.id}`,
                      showFeedback,
                    );
                    fetchInterviews();
                    setShowFeedback(null);
                  }}
                >
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Interview" : "Schedule Interview"}
                </div>
                <div style={s.modalSub}>Fill in interview details</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalBody}>
              {/* Candidate */}
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Candidate Name *</label>
                  <input
                    style={s.input}
                    value={form.candidateName}
                    onChange={(e) =>
                      setForm({ ...form, candidateName: e.target.value })
                    }
                    list="candidates-list"
                    placeholder="Select or type"
                    required
                  />
                  <datalist id="candidates-list">
                    {candidates.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Job Title</label>
                  <input
                    style={s.input}
                    value={form.jobTitle}
                    onChange={(e) =>
                      setForm({ ...form, jobTitle: e.target.value })
                    }
                    list="jobs-list"
                    placeholder="Select or type"
                  />
                  <datalist id="jobs-list">
                    {jobs.map((j) => (
                      <option key={j.id} value={j.title || j.jobTitle} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Client Company</label>
                  <input
                    style={s.input}
                    value={form.clientCompany}
                    onChange={(e) =>
                      setForm({ ...form, clientCompany: e.target.value })
                    }
                    placeholder="Company name"
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Interviewer *</label>
                  <input
                    style={s.input}
                    value={form.interviewer}
                    onChange={(e) =>
                      setForm({ ...form, interviewer: e.target.value })
                    }
                    list="users-list"
                    placeholder="Select interviewer"
                    required
                  />
                  <datalist id="users-list">
                    {users.map((u) => (
                      <option key={u.id} value={u.name} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Date *</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.interviewDate}
                    onChange={(e) =>
                      setForm({ ...form, interviewDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Time</label>
                  <input
                    style={s.input}
                    type="time"
                    value={form.interviewTime}
                    onChange={(e) =>
                      setForm({ ...form, interviewTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Interview Type</label>
                  <select
                    style={s.input}
                    value={form.interviewType}
                    onChange={(e) =>
                      setForm({ ...form, interviewType: e.target.value })
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Round</label>
                  <select
                    style={s.input}
                    value={form.round}
                    onChange={(e) =>
                      setForm({ ...form, round: e.target.value })
                    }
                  >
                    {ROUNDS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {STATUSES.map((st) => (
                      <option key={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Result</label>
                  <select
                    style={s.input}
                    value={form.result}
                    onChange={(e) =>
                      setForm({ ...form, result: e.target.value })
                    }
                  >
                    {RESULTS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Meeting Link (Google Meet / Zoom)</label>
                <input
                  style={s.input}
                  value={form.meetingLink}
                  onChange={(e) =>
                    setForm({ ...form, meetingLink: e.target.value })
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Location (for In-Person)</label>
                <input
                  style={s.input}
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Office address or room"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
              {editItem && (
                <div style={s.formGroup}>
                  <label style={s.label}>Feedback</label>
                  <textarea
                    style={{ ...s.input, minHeight: "70px" }}
                    value={form.feedback}
                    onChange={(e) =>
                      setForm({ ...form, feedback: e.target.value })
                    }
                    placeholder="Interview feedback..."
                  />
                </div>
              )}
              <div style={s.modalFoot}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  {editItem ? "Update" : "Schedule"}
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
    gap: "12px",
    flexWrap: "wrap",
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
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
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
  kpiRow: {
    display: "flex",
    gap: "12px",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
  },
  kpiCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    background: "#f8f9fc",
    borderRadius: "10px",
    border: "1px solid #e5e7f0",
    minWidth: "140px",
  },
  kpiIcon: {
    fontSize: "20px",
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiVal: { fontSize: "22px", fontWeight: "800", letterSpacing: "-1px" },
  kpiLabel: { fontSize: "11px", color: "#6b7280", fontWeight: "500" },
  filterBar: {
    display: "flex",
    gap: "16px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginRight: "4px",
  },
  filterBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "12px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  filterBtnActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
    fontWeight: "700",
  },
  content: { flex: 1, overflowY: "auto", padding: "16px" },
  tableWrap: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    overflow: "hidden",
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
  trow: { borderBottom: "1px solid #f1f3f9", transition: "background 0.1s" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  candidateCell: { display: "flex", alignItems: "center", gap: "10px" },
  candidateAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  candidateName: { fontSize: "13px", fontWeight: "600", color: "#0f1117" },
  todayBadge: {
    background: "#fef3c7",
    color: "#d97706",
    fontSize: "10px",
    fontWeight: "700",
    padding: "1px 7px",
    borderRadius: "20px",
    display: "inline-block",
    marginTop: "2px",
  },
  quickSelect: {
    border: "none",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    outline: "none",
  },
  editBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  linkBtn: {
    background: "#f0fdf4",
    color: "#10b981",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  feedbackBtn: {
    background: "#fffbeb",
    color: "#f59e0b",
    border: "none",
    borderRadius: "6px",
    padding: "5px 8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "6px",
    padding: "5px 8px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "50vh",
    gap: "8px",
  },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#0f1117" },
  emptySub: { fontSize: "13px", color: "#9ca3af", marginBottom: "12px" },
  // Kanban
  kanban: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    overflowX: "auto",
    flex: 1,
  },
  kanbanCol: {
    minWidth: "240px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  kanbanHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: "10px",
  },
  kanbanTitle: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  kanbanCount: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  kanbanCards: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
  },
  kanbanCard: {
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  kanbanCardTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px",
  },
  kanbanAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  kanbanCandName: { fontSize: "12.5px", fontWeight: "700", color: "#0f1117" },
  kanbanJobTitle: { fontSize: "11px", color: "#6b7280", marginTop: "1px" },
  kanbanEdit: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0",
    marginLeft: "auto",
  },
  kanbanMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  kanbanFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
  },
  kanbanRound: { fontSize: "10.5px", color: "#6b7280", fontWeight: "600" },
  kanbanResult: {
    fontSize: "10.5px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  joinBtn: {
    display: "block",
    textAlign: "center",
    marginTop: "8px",
    padding: "6px",
    background: "#eef2ff",
    color: "#6366f1",
    borderRadius: "7px",
    fontSize: "11.5px",
    fontWeight: "700",
    textDecoration: "none",
  },
  kanbanEmpty: {
    textAlign: "center",
    padding: "20px",
    fontSize: "12px",
    color: "#9ca3af",
  },
  // Modal
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
