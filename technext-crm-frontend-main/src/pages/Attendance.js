import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";
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

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [checkInDone, setCheckInDone] = useState(false);
  const [checkOutDone, setCheckOutDone] = useState(false);
  const [activeTab, setActiveTab] = useState("my");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["Admin", "HR Manager"].includes(currentUser.role);

  useEffect(() => {
    axios.get(`${BASE_URL}/users`).then((r) => setUsers(r.data));
    axios.get(`${BASE_URL}/holidays`).then((r) => setHolidays(r.data));
    fetchMyAttendance();
  }, []);

  useEffect(() => {
    if (selectedEmp || currentUser.id) {
      fetchAttendance(selectedEmp?.id || currentUser.id);
      fetchSummary(selectedEmp?.id || currentUser.id);
    }
  }, [month, year, selectedEmp]);

  const fetchMyAttendance = () => {
    fetchAttendance(currentUser.id);
    fetchSummary(currentUser.id);
    setLoading(false);
  };

  const fetchAttendance = (empId) => {
    axios
      .get(
        `${BASE_URL}/attendance/employee/${empId}/month/${month}/year/${year}`,
      )
      .then((r) => setAttendance(r.data))
      .catch(() => {});
  };

  const fetchSummary = (empId) => {
    axios
      .get(
        `${BASE_URL}/attendance/summary/${empId}/month/${month}/year/${year}`,
      )
      .then((r) => setSummary(r.data))
      .catch(() => {});
  };

  const handleCheckIn = async () => {
    await axios.post(`${BASE_URL}/attendance/checkin`, {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
    });
    setCheckInDone(true);
    fetchMyAttendance();
  };

  const handleCheckOut = async () => {
    await axios.put(`${BASE_URL}/attendance/checkout/${currentUser.id}`);
    setCheckOutDone(true);
    fetchMyAttendance();
  };

  const handleMarkAttendance = async (empId, empName, date, status) => {
    await axios.post(`${BASE_URL}/attendance/mark`, {
      employeeId: empId,
      employeeName: empName,
      date,
      status,
    });
    fetchAttendance(selectedEmp?.id || currentUser.id);
    fetchSummary(selectedEmp?.id || currentUser.id);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return { bg: "#f0fdf4", color: "#10b981", icon: "✅" };
      case "Absent":
        return { bg: "#fef2f2", color: "#ef4444", icon: "❌" };
      case "Half Day":
        return { bg: "#fffbeb", color: "#f59e0b", icon: "🌓" };
      case "On Leave":
        return { bg: "#eff6ff", color: "#3b82f6", icon: "🌴" };
      case "Holiday":
        return { bg: "#f5f3ff", color: "#8b5cf6", icon: "🎉" };
      case "Weekend":
        return { bg: "#f9fafb", color: "#6b7280", icon: "😴" };
      default:
        return { bg: "#f9fafb", color: "#6b7280", icon: "—" };
    }
  };

  const isHoliday = (dateStr) => holidays.some((h) => h.date === dateStr);
  const getHolidayName = (dateStr) =>
    holidays.find((h) => h.date === dateStr)?.name || "";

  // Generate calendar for the month
  const generateCalendar = () => {
    const days = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay();

    // Previous month padding
    for (let i = 0; i < startDay; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = isHoliday(dateStr);
      const attRecord = attendance.find((a) => a.date === dateStr);
      days.push({ date: d, dateStr, isWeekend, isHoliday: holiday, attRecord });
    }
    return days;
  };

  const calendarDays = generateCalendar();
  const today = new Date().toLocaleDateString("en-CA");
  const todayRecord = attendance.find((a) => a.date === today);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Attendance Tracker</div>
          <div style={s.sub}>Track daily attendance and work hours</div>
        </div>
        <div style={s.headerRight}>
          <select
            style={s.periodSelect}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            style={s.periodSelect}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Check-in/Check-out Bar */}
      <div style={s.checkBar}>
        <div style={s.checkBarLeft}>
          <div style={s.todayInfo}>
            <div style={s.todayDate}>
              📅 Today:{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
            {todayRecord ? (
              <div style={s.todayStatus}>
                <span style={{ color: "#10b981", fontWeight: "700" }}>
                  ✅ Checked In: {todayRecord.checkIn || "—"}
                </span>
                {todayRecord.checkOut && (
                  <span
                    style={{
                      color: "#6366f1",
                      fontWeight: "700",
                      marginLeft: "16px",
                    }}
                  >
                    🏁 Checked Out: {todayRecord.checkOut}
                  </span>
                )}
                {todayRecord.workHours && (
                  <span
                    style={{
                      color: "#f59e0b",
                      fontWeight: "700",
                      marginLeft: "16px",
                    }}
                  >
                    ⏱️ {todayRecord.workHours}h worked
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                Not checked in yet
              </div>
            )}
          </div>
        </div>
        <div style={s.checkBarRight}>
          {!todayRecord ? (
            <button style={s.checkInBtn} onClick={handleCheckIn}>
              🟢 Check In
            </button>
          ) : !todayRecord.checkOut ? (
            <button style={s.checkOutBtn} onClick={handleCheckOut}>
              🔴 Check Out
            </button>
          ) : (
            <div style={s.doneMsg}>✅ Attendance marked for today</div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={s.summaryRow}>
          {[
            {
              label: "Working Days",
              value: summary.workingDays,
              icon: "📋",
              color: "#6366f1",
            },
            {
              label: "Present",
              value: summary.present,
              icon: "✅",
              color: "#10b981",
            },
            {
              label: "Absent",
              value: summary.absent,
              icon: "❌",
              color: "#ef4444",
            },
            {
              label: "Half Day",
              value: summary.halfDay,
              icon: "🌓",
              color: "#f59e0b",
            },
            {
              label: "On Leave",
              value: summary.onLeave,
              icon: "🌴",
              color: "#3b82f6",
            },
            {
              label: "Holidays",
              value: summary.holidays,
              icon: "🎉",
              color: "#8b5cf6",
            },
            {
              label: "LOP Days",
              value: summary.lopDays,
              icon: "💸",
              color: "#ef4444",
            },
            {
              label: "Paid Days",
              value: summary.paidDays,
              icon: "💰",
              color: "#10b981",
            },
          ].map((stat) => (
            <div key={stat.label} style={s.summaryCard}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                {stat.icon}
              </div>
              <div style={{ ...s.summaryVal, color: stat.color }}>
                {stat.value}
              </div>
              <div style={s.summaryLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { id: "my", label: "My Attendance", icon: "👤" },
          ...(isAdmin
            ? [
                { id: "team", label: "Team Attendance", icon: "👥" },
                { id: "mark", label: "Mark Attendance", icon: "✏️" },
              ]
            : []),
        ].map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {/* My Attendance Calendar */}
        {activeTab === "my" && (
          <div style={s.calendarWrap}>
            <div style={s.calendarHeader}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} style={s.calendarDayHeader}>
                  {d}
                </div>
              ))}
            </div>
            <div style={s.calendarGrid}>
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={idx} style={s.calendarEmpty} />;
                const st = day.attRecord
                  ? getStatusStyle(day.attRecord.status)
                  : day.isHoliday
                    ? getStatusStyle("Holiday")
                    : day.isWeekend
                      ? getStatusStyle("Weekend")
                      : day.dateStr > today
                        ? { bg: "#f9fafb", color: "#9ca3af", icon: "—" }
                        : { bg: "#fef2f2", color: "#ef4444", icon: "❌" };
                const isToday = day.dateStr === today;
                return (
                  <div
                    key={idx}
                    style={{
                      ...s.calendarDay,
                      ...(isToday ? s.calendarDayToday : {}),
                      ...{ background: st.bg },
                    }}
                  >
                    <div
                      style={{
                        ...s.calDayNum,
                        ...(isToday
                          ? {
                              background: "#6366f1",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }
                          : {}),
                      }}
                    >
                      {day.date}
                    </div>
                    <div style={{ fontSize: "16px", margin: "2px 0" }}>
                      {st.icon}
                    </div>
                    {day.isHoliday && (
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#8b5cf6",
                          fontWeight: "600",
                          textAlign: "center",
                          lineHeight: "1.2",
                        }}
                      >
                        {getHolidayName(day.dateStr)}
                      </div>
                    )}
                    {day.attRecord?.checkIn && (
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#10b981",
                          fontWeight: "600",
                        }}
                      >
                        {day.attRecord.checkIn}
                      </div>
                    )}
                    {day.attRecord?.workHours && (
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#6366f1",
                          fontWeight: "600",
                        }}
                      >
                        {day.attRecord.workHours}h
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={s.legend}>
              {[
                "Present",
                "Absent",
                "Half Day",
                "On Leave",
                "Holiday",
                "Weekend",
              ].map((st) => {
                const style = getStatusStyle(st);
                return (
                  <div key={st} style={s.legendItem}>
                    <span
                      style={{
                        ...s.legendDot,
                        background: style.bg,
                        border: `1px solid ${style.color}`,
                      }}
                    >
                      {style.icon}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Attendance - Admin */}
        {activeTab === "team" && isAdmin && (
          <div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {users.map((u) => (
                <button
                  key={u.id}
                  style={{
                    ...s.empBtn,
                    ...(selectedEmp?.id === u.id ? s.empBtnActive : {}),
                  }}
                  onClick={() => setSelectedEmp(u)}
                >
                  {u.name.split(" ")[0]}
                </button>
              ))}
            </div>
            {selectedEmp && (
              <div style={s.calendarWrap}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0f1117",
                    marginBottom: "12px",
                  }}
                >
                  📊 {selectedEmp.name} — {MONTHS[month - 1]} {year}
                </div>
                <div style={s.calendarHeader}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div key={d} style={s.calendarDayHeader}>
                        {d}
                      </div>
                    ),
                  )}
                </div>
                <div style={s.calendarGrid}>
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx} style={s.calendarEmpty} />;
                    const st = day.attRecord
                      ? getStatusStyle(day.attRecord.status)
                      : day.isHoliday
                        ? getStatusStyle("Holiday")
                        : day.isWeekend
                          ? getStatusStyle("Weekend")
                          : day.dateStr > today
                            ? { bg: "#f9fafb", color: "#9ca3af", icon: "—" }
                            : { bg: "#fef2f2", color: "#ef4444", icon: "❌" };
                    return (
                      <div
                        key={idx}
                        style={{ ...s.calendarDay, background: st.bg }}
                      >
                        <div style={s.calDayNum}>{day.date}</div>
                        <div style={{ fontSize: "16px" }}>{st.icon}</div>
                        {day.isHoliday && (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#8b5cf6",
                              fontWeight: "600",
                              textAlign: "center",
                              lineHeight: "1.2",
                            }}
                          >
                            {getHolidayName(day.dateStr)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mark Attendance - Admin */}
        {activeTab === "mark" && isAdmin && (
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#0f1117",
                marginBottom: "16px",
              }}
            >
              ✏️ Mark Attendance for{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7f0",
                overflow: "hidden",
              }}
            >
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Employee</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const todayAtt = attendance.find(
                      (a) => a.employeeId === u.id && a.date === today,
                    );
                    const st = todayAtt
                      ? getStatusStyle(todayAtt.status)
                      : { bg: "#f9fafb", color: "#9ca3af", icon: "—" };
                    return (
                      <tr key={u.id} style={s.trow}>
                        <td style={s.td}>
                          <div style={{ fontWeight: "600", color: "#0f1117" }}>
                            {u.name}
                          </div>
                        </td>
                        <td style={s.td}>{u.role}</td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.statusBadge,
                              background: st.bg,
                              color: st.color,
                            }}
                          >
                            {st.icon} {todayAtt?.status || "Not Marked"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            {["Present", "Absent", "Half Day", "On Leave"].map(
                              (status) => (
                                <button
                                  key={status}
                                  style={{
                                    background: getStatusStyle(status).bg,
                                    color: getStatusStyle(status).color,
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                  }}
                                  onClick={() =>
                                    handleMarkAttendance(
                                      u.id,
                                      u.name,
                                      today,
                                      status,
                                    )
                                  }
                                >
                                  {getStatusStyle(status).icon} {status}
                                </button>
                              ),
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
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
    padding: "16px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: { display: "flex", gap: "10px", alignItems: "center" },
  periodSelect: {
    padding: "7px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  checkBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "12px",
  },
  checkBarLeft: { flex: 1 },
  checkBarRight: { flexShrink: 0 },
  todayInfo: {},
  todayDate: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f1117",
    marginBottom: "4px",
  },
  todayStatus: {
    fontSize: "13px",
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  checkInBtn: {
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
  checkOutBtn: {
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
  },
  doneMsg: { fontSize: "13px", color: "#10b981", fontWeight: "700" },
  summaryRow: {
    display: "flex",
    gap: "8px",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
  },
  summaryCard: {
    background: "#f8f9fc",
    borderRadius: "10px",
    border: "1px solid #e5e7f0",
    padding: "10px 14px",
    textAlign: "center",
    minWidth: "80px",
    flexShrink: 0,
  },
  summaryVal: { fontSize: "20px", fontWeight: "800", letterSpacing: "-1px" },
  summaryLabel: {
    fontSize: "10px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "2px",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
  },
  tab: {
    background: "none",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  tabActive: { background: "#eef2ff", color: "#6366f1", fontWeight: "700" },
  content: { flex: 1, overflowY: "auto", padding: "20px" },
  calendarWrap: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  calendarHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: "4px",
    marginBottom: "4px",
  },
  calendarDayHeader: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: "4px",
  },
  calendarDay: {
    borderRadius: "8px",
    padding: "6px",
    minHeight: "70px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid transparent",
  },
  calendarDayToday: { border: "2px solid #6366f1" },
  calendarEmpty: { minHeight: "70px" },
  calDayNum: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "2px",
  },
  legend: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "14px",
    paddingTop: "14px",
    borderTop: "1px solid #f1f3f9",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "5px" },
  legendDot: {
    width: "20px",
    height: "20px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
  },
  empBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  empBtnActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
    fontWeight: "700",
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
  },
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  statusBadge: {
    fontSize: "11.5px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "20px",
  },
};
