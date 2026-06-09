import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarView() {
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    meetingDate: "",
    meetingTime: "",
    status: "Upcoming",
    duration: "1 hour",
    location: "",
    agenda: "",
  });

  useEffect(() => {
    axios
      .get(`${BASE_URL}/meetings`)
      .then((r) => setMeetings(r.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/tasks`)
      .then((r) => setTasks(r.data))
      .catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getMeetingsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetings.filter((m) => m.meetingDate === dateStr);
  };

  const getTasksForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;
  const isSelected = (day) =>
    selectedDate &&
    selectedDate.day === day &&
    selectedDate.month === month &&
    selectedDate.year === year;

  const handleDayClick = (day) => {
    setSelectedDate({ day, month, year });
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setForm({ ...form, meetingDate: dateStr });
  };

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    await axios.post(`${BASE_URL}/meetings`, form);
    const r = await axios.get(`${BASE_URL}/meetings`);
    setMeetings(r.data);
    setShowAddModal(false);
    setForm({
      title: "",
      meetingDate: "",
      meetingTime: "",
      status: "Upcoming",
      duration: "1 hour",
      location: "",
      agenda: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "#10b981";
      case "Completed":
        return "#6b7280";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6366f1";
    }
  };

  // Selected day events
  const selectedMeetings = selectedDate
    ? getMeetingsForDate(selectedDate.day)
    : [];
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate.day) : [];

  // Build calendar grid
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrevMonth - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.navBtn} onClick={prevMonth}>
            ◀
          </button>
          <div style={s.monthYear}>
            {MONTHS[month]} {year}
          </div>
          <button style={s.navBtn} onClick={nextMonth}>
            ▶
          </button>
          <button style={s.todayBtn} onClick={goToday}>
            Today
          </button>
        </div>
        <div style={s.headerRight}>
          <div style={s.viewToggle}>
            {["month", "week"].map((v) => (
              <button
                key={v}
                style={{
                  ...s.viewBtn,
                  ...(viewMode === v ? s.viewBtnActive : {}),
                }}
                onClick={() => setViewMode(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button style={s.addBtn} onClick={() => setShowAddModal(true)}>
            + Add Meeting
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={s.statsRow}>
        <div style={s.stat}>
          <span style={s.statNum}>
            {meetings.filter((m) => m.status === "Upcoming").length}
          </span>
          <span style={s.statLabel}>Upcoming</span>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statNum}>
            {
              meetings.filter((m) => {
                const d = m.meetingDate;
                const t = today;
                return (
                  d ===
                  `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
                );
              }).length
            }
          </span>
          <span style={s.statLabel}>Today</span>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statNum}>
            {tasks.filter((t) => t.status === "Pending").length}
          </span>
          <span style={s.statLabel}>Pending Tasks</span>
        </div>
        <div style={s.statDiv} />
        <div style={s.stat}>
          <span style={s.statNum}>{meetings.length}</span>
          <span style={s.statLabel}>Total Meetings</span>
        </div>
      </div>

      <div style={s.body}>
        {/* Calendar */}
        <div style={s.calendarWrap}>
          {/* Day headers */}
          <div style={s.dayHeaders}>
            {DAYS.map((d) => (
              <div key={d} style={s.dayHeader}>
                {d}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div style={s.grid}>
            {cells.map((cell, i) => {
              const dayMeetings = cell.current
                ? getMeetingsForDate(cell.day)
                : [];
              const dayTasks = cell.current ? getTasksForDate(cell.day) : [];
              const total = dayMeetings.length + dayTasks.length;
              return (
                <div
                  key={i}
                  style={{
                    ...s.cell,
                    ...(cell.current ? {} : s.cellOtherMonth),
                    ...(cell.current && isToday(cell.day) ? s.cellToday : {}),
                    ...(cell.current && isSelected(cell.day)
                      ? s.cellSelected
                      : {}),
                  }}
                  onClick={() => cell.current && handleDayClick(cell.day)}
                >
                  <div
                    style={{
                      ...s.dayNum,
                      ...(isToday(cell.day) ? s.dayNumToday : {}),
                    }}
                  >
                    {cell.day}
                  </div>
                  <div style={s.eventList}>
                    {dayMeetings.slice(0, 2).map((m, j) => (
                      <div
                        key={j}
                        style={{
                          ...s.eventDot,
                          background: getStatusColor(m.status),
                        }}
                      >
                        <span style={s.eventTitle}>{m.title}</span>
                      </div>
                    ))}
                    {dayTasks.slice(0, 1).map((t, j) => (
                      <div
                        key={j}
                        style={{ ...s.eventDot, background: "#f59e0b" }}
                      >
                        <span style={s.eventTitle}>📌 {t.title}</span>
                      </div>
                    ))}
                    {total > 3 && (
                      <div style={s.moreEvents}>+{total - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div style={s.sidePanel}>
          {selectedDate ? (
            <>
              <div style={s.sidePanelTitle}>
                {
                  DAYS[
                    new Date(
                      selectedDate.year,
                      selectedDate.month,
                      selectedDate.day,
                    ).getDay()
                  ]
                }
                , {MONTHS[selectedDate.month].slice(0, 3)} {selectedDate.day}
              </div>
              {selectedMeetings.length === 0 && selectedTasks.length === 0 ? (
                <div style={s.noEvents}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    📅
                  </div>
                  <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                    No events
                  </div>
                  <button
                    style={s.addEventBtn}
                    onClick={() => setShowAddModal(true)}
                  >
                    + Add Meeting
                  </button>
                </div>
              ) : (
                <>
                  {selectedMeetings.length > 0 && (
                    <>
                      <div style={s.sideSection}>
                        MEETINGS ({selectedMeetings.length})
                      </div>
                      {selectedMeetings.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            ...s.eventCard,
                            borderLeft: `3px solid ${getStatusColor(m.status)}`,
                          }}
                        >
                          <div style={s.eventCardTitle}>{m.title}</div>
                          {m.meetingTime && (
                            <div style={s.eventCardMeta}>
                              🕐 {m.meetingTime} · {m.duration}
                            </div>
                          )}
                          {m.location && (
                            <div style={s.eventCardMeta}>📍 {m.location}</div>
                          )}
                          {m.participants && (
                            <div style={s.eventCardMeta}>
                              👥 {m.participants}
                            </div>
                          )}
                          <span
                            style={{
                              ...s.eventBadge,
                              background: getStatusColor(m.status) + "20",
                              color: getStatusColor(m.status),
                            }}
                          >
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                  {selectedTasks.length > 0 && (
                    <>
                      <div style={s.sideSection}>
                        TASKS DUE ({selectedTasks.length})
                      </div>
                      {selectedTasks.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            ...s.eventCard,
                            borderLeft: "3px solid #f59e0b",
                          }}
                        >
                          <div style={s.eventCardTitle}>{t.title}</div>
                          <span
                            style={{
                              ...s.eventBadge,
                              background: "#fffbeb",
                              color: "#f59e0b",
                            }}
                          >
                            {t.priority || "Normal"}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <div style={s.noEvents}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>👆</div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                Click a date to see events
              </div>
            </div>
          )}

          {/* Upcoming meetings list */}
          <div style={{ marginTop: "20px" }}>
            <div style={s.sideSection}>UPCOMING MEETINGS</div>
            {meetings
              .filter((m) => m.status === "Upcoming")
              .slice(0, 5)
              .map((m) => (
                <div key={m.id} style={s.upcomingItem}>
                  <div
                    style={{
                      ...s.upcomingDot,
                      background: getStatusColor(m.status),
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={s.upcomingTitle}>{m.title}</div>
                    <div style={s.upcomingDate}>
                      {m.meetingDate || "—"} {m.meetingTime || ""}
                    </div>
                  </div>
                </div>
              ))}
            {meetings.filter((m) => m.status === "Upcoming").length === 0 && (
              <div
                style={{ fontSize: "12px", color: "#9ca3af", padding: "8px 0" }}
              >
                No upcoming meetings
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Meeting Modal */}
      {showAddModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>Schedule Meeting</div>
                <div style={s.modalSub}>Add to calendar</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddMeeting} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Title *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Meeting title"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.meetingDate}
                    onChange={(e) =>
                      setForm({ ...form, meetingDate: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Time</label>
                  <input
                    style={s.input}
                    type="time"
                    value={form.meetingTime}
                    onChange={(e) =>
                      setForm({ ...form, meetingTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Duration</label>
                  <select
                    style={s.input}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  >
                    <option>30 min</option>
                    <option>1 hour</option>
                    <option>1.5 hours</option>
                    <option>2 hours</option>
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
                    <option>Upcoming</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Location / Link</label>
                <input
                  style={s.input}
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Google Meet / Office"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Agenda</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px" }}
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  placeholder="What will be discussed?"
                />
              </div>
              <div style={s.modalFoot}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn}>
                  Schedule
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
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  monthYear: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f1117",
    minWidth: "160px",
    textAlign: "center",
  },
  todayBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "12.5px",
    fontWeight: "700",
    cursor: "pointer",
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
  statsRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    gap: "20px",
  },
  stat: { display: "flex", alignItems: "center", gap: "8px" },
  statNum: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  statLabel: { fontSize: "12px", color: "#9ca3af", fontWeight: "500" },
  statDiv: { width: "1px", height: "24px", background: "#e5e7f0" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  calendarWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#fff",
  },
  dayHeaders: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    borderBottom: "1px solid #e5e7f0",
  },
  dayHeader: {
    padding: "10px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    flex: 1,
    overflowY: "auto",
  },
  cell: {
    border: "1px solid #f1f3f9",
    padding: "8px",
    minHeight: "90px",
    cursor: "pointer",
    transition: "background 0.1s",
  },
  cellOtherMonth: { background: "#fafbfc", opacity: 0.5 },
  cellToday: { background: "#eef2ff" },
  cellSelected: { background: "#f0fdf4", border: "1px solid #10b981" },
  dayNum: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "4px",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  dayNumToday: { background: "#6366f1", color: "#fff" },
  eventList: { display: "flex", flexDirection: "column", gap: "2px" },
  eventDot: { borderRadius: "4px", padding: "2px 5px", cursor: "pointer" },
  eventTitle: {
    fontSize: "10px",
    color: "#fff",
    fontWeight: "600",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  moreEvents: {
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    padding: "1px 4px",
  },
  sidePanel: {
    width: "260px",
    minWidth: "260px",
    background: "#fff",
    borderLeft: "1px solid #e5e7f0",
    overflowY: "auto",
    padding: "16px",
  },
  sidePanelTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0f1117",
    marginBottom: "14px",
  },
  sideSection: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
    marginTop: "12px",
  },
  noEvents: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 0",
    gap: "4px",
  },
  addEventBtn: {
    marginTop: "10px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  eventCard: {
    background: "#f8f9fc",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "8px",
  },
  eventCardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "4px",
  },
  eventCardMeta: { fontSize: "11.5px", color: "#6b7280", marginBottom: "2px" },
  eventBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
    display: "inline-block",
    marginTop: "4px",
  },
  upcomingItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 0",
    borderBottom: "1px solid #f8fafc",
  },
  upcomingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "4px",
    flexShrink: 0,
  },
  upcomingTitle: { fontSize: "12.5px", fontWeight: "600", color: "#0f1117" },
  upcomingDate: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
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
