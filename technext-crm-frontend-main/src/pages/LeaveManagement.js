import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";
const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Annual Leave",
  "Loss of Pay",
  "Maternity Leave",
  "Paternity Leave",
];

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [activeTab, setActiveTab] = useState("apply");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    leaveType: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
    days: 1,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["Admin", "HR Manager"].includes(currentUser.role);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [l, u, b, h] = await Promise.all([
        axios.get(`${BASE_URL}/leaves`),
        axios.get(`${BASE_URL}/users`),
        axios.get(`${BASE_URL}/leave-balance`),
        axios.get(`${BASE_URL}/holidays`),
      ]);
      setLeaves(l.data);
      setUsers(u.data);
      setBalances(b.data);
      setHolidays(h.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const d1 = new Date(from);
    const d2 = new Date(to);
    let count = 0;
    const cur = new Date(d1);
    while (cur <= d2) {
      const day = cur.getDay();
      const dateStr = cur.toISOString().split("T")[0];
      const isWeekend = day === 0 || day === 6;
      const isHoliday = holidays.some((h) => h.date === dateStr);
      if (!isWeekend && !isHoliday) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const days = calcDays(form.fromDate, form.toDate);
    const payload = {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      leaveType: form.leaveType,
      fromDate: form.fromDate,
      toDate: form.toDate,
      days: days || form.days,
      reason: form.reason,
    };
    await axios.post(`${BASE_URL}/leaves`, payload);
    setShowModal(false);
    setForm({
      leaveType: "Casual Leave",
      fromDate: "",
      toDate: "",
      reason: "",
      days: 1,
    });
    fetchAll();
  };

  const handleApprove = async (id) => {
    await axios.put(`${BASE_URL}/leaves/${id}/approve`, {
      approvedBy: currentUser.name,
    });
    fetchAll();
  };

  const handleReject = async (id) => {
    await axios.put(`${BASE_URL}/leaves/${id}/reject`, {
      rejectedBy: currentUser.name,
    });
    fetchAll();
  };

  const handleCancel = async (id) => {
    if (window.confirm("Cancel this leave?")) {
      await axios.put(`${BASE_URL}/leaves/${id}/cancel`);
      fetchAll();
    }
  };

  const handleInitBalance = async (emp) => {
    await axios.post(`${BASE_URL}/leave-balance/initialize`, {
      employeeId: emp.id,
      employeeName: emp.name,
    });
    fetchAll();
  };

  const getBalance = (empId) => balances.find((b) => b.employeeId === empId);

  const myLeaves = leaves.filter((l) => l.employeeId === currentUser.id);
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const myBalance = getBalance(currentUser.id);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Rejected":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "Pending":
        return { bg: "#fffbeb", color: "#f59e0b" };
      case "Cancelled":
        return { bg: "#f9fafb", color: "#6b7280" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Casual Leave":
        return "#6366f1";
      case "Sick Leave":
        return "#ef4444";
      case "Annual Leave":
        return "#10b981";
      case "Loss of Pay":
        return "#f59e0b";
      case "Maternity Leave":
        return "#ec4899";
      case "Paternity Leave":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Casual Leave":
        return "🌴";
      case "Sick Leave":
        return "🏥";
      case "Annual Leave":
        return "✈️";
      case "Loss of Pay":
        return "💸";
      case "Maternity Leave":
        return "👶";
      case "Paternity Leave":
        return "👨‍👶";
      default:
        return "📅";
    }
  };

  const getHolidayTypeStyle = (type) => {
    switch (type) {
      case "National Holiday":
        return { bg: "#eff6ff", color: "#3b82f6" };
      case "Festival Holiday":
        return { bg: "#fef3c7", color: "#d97706" };
      case "State Holiday":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Optional Holiday":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
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
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>Loading...</div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Leave Management</div>
          <div style={s.sub}>Apply, track and manage employee leaves</div>
        </div>
        <div style={s.headerRight}>
          {isAdmin && pendingLeaves.length > 0 && (
            <div style={s.pendingBadge}>
              ⚠️ {pendingLeaves.length} Pending Approval
            </div>
          )}
          <button style={s.applyBtn} onClick={() => setShowModal(true)}>
            + Apply Leave
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      {myBalance ? (
        <div style={s.balanceRow}>
          {[
            {
              label: "Casual Leave",
              total: myBalance.casualLeaveTotal,
              used: myBalance.casualLeaveUsed,
              icon: "🌴",
              color: "#6366f1",
            },
            {
              label: "Sick Leave",
              total: myBalance.sickLeaveTotal,
              used: myBalance.sickLeaveUsed,
              icon: "🏥",
              color: "#ef4444",
            },
            {
              label: "Annual Leave",
              total: myBalance.annualLeaveTotal,
              used: myBalance.annualLeaveUsed,
              icon: "✈️",
              color: "#10b981",
            },
            {
              label: "Loss of Pay",
              total: "—",
              used: myLeaves
                .filter(
                  (l) =>
                    l.leaveType === "Loss of Pay" && l.status === "Approved",
                )
                .reduce((s, l) => s + l.days, 0),
              icon: "💸",
              color: "#f59e0b",
            },
          ].map((bal) => (
            <div
              key={bal.label}
              style={{ ...s.balCard, borderTop: `3px solid ${bal.color}` }}
            >
              <div style={s.balTop}>
                <span style={{ fontSize: "24px" }}>{bal.icon}</span>
                <div style={{ textAlign: "right" }}>
                  {bal.total !== "—" && (
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {bal.used}/{bal.total} used
                    </div>
                  )}
                </div>
              </div>
              <div style={{ ...s.balRemaining, color: bal.color }}>
                {bal.total === "—" ? bal.used : bal.total - bal.used}
              </div>
              <div style={s.balLabel}>
                {bal.total === "—" ? "Days Used" : " Days Remaining"}
              </div>
              <div style={s.balType}>{bal.label}</div>
              {bal.total !== "—" && (
                <div style={s.balProgress}>
                  <div
                    style={{
                      height: "4px",
                      background: "#f1f3f9",
                      borderRadius: "2px",
                      overflow: "hidden",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min((bal.used / bal.total) * 100, 100)}%`,
                        background: bal.color,
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "14px 20px",
            background: "#fffbeb",
            borderBottom: "1px solid #fde68a",
          }}
        >
          <span style={{ fontSize: "13px", color: "#92400e" }}>
            ⚠️ Leave balance not initialized.{" "}
          </span>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
            }}
            onClick={() => handleInitBalance(currentUser)}
          >
            Click to initialize →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { id: "apply", label: "My Leaves", icon: "📋" },
          ...(isAdmin
            ? [
                {
                  id: "pending",
                  label: `Pending (${pendingLeaves.length})`,
                  icon: "⏳",
                },
                { id: "all", label: "All Leaves", icon: "👥" },
              ]
            : []),
          { id: "holidays", label: "Holiday Calendar", icon: "🗓️" },
          ...(isAdmin
            ? [{ id: "balances", label: "Leave Balances", icon: "⚖️" }]
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
        {/* My Leaves */}
        {activeTab === "apply" && (
          <div>
            {myLeaves.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🌴</div>
                <div style={s.emptyTitle}>No leave applications yet</div>
                <div style={s.emptySub}>Apply for your first leave</div>
                <button style={s.applyBtn} onClick={() => setShowModal(true)}>
                  + Apply Leave
                </button>
              </div>
            ) : (
              <div style={s.leaveGrid}>
                {myLeaves.map((leave) => {
                  const sc = getStatusStyle(leave.status);
                  return (
                    <div
                      key={leave.id}
                      style={{
                        ...s.leaveCard,
                        borderLeft: `4px solid ${getTypeColor(leave.leaveType)}`,
                      }}
                    >
                      <div style={s.leaveCardTop}>
                        <div style={s.leaveTypeWrap}>
                          <span style={{ fontSize: "20px" }}>
                            {getTypeIcon(leave.leaveType)}
                          </span>
                          <div>
                            <div
                              style={{
                                ...s.leaveType,
                                color: getTypeColor(leave.leaveType),
                              }}
                            >
                              {leave.leaveType}
                            </div>
                            <div style={s.leaveDays}>
                              {leave.days} day{leave.days > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            ...s.statusBadge,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <div style={s.leaveDates}>
                        📅 {leave.fromDate} → {leave.toDate}
                      </div>
                      {leave.reason && (
                        <div style={s.leaveReason}>"{leave.reason}"</div>
                      )}
                      {leave.approvedBy && (
                        <div style={s.leaveApproved}>
                          {leave.status === "Approved" ? "✅" : "❌"}{" "}
                          {leave.status} by {leave.approvedBy}
                        </div>
                      )}
                      {leave.status === "Pending" && (
                        <button
                          style={s.cancelBtn}
                          onClick={() => handleCancel(leave.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pending Approvals - Admin only */}
        {activeTab === "pending" && isAdmin && (
          <div>
            {pendingLeaves.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={s.emptyTitle}>No pending approvals</div>
                <div style={s.emptySub}>
                  All leave requests have been processed
                </div>
              </div>
            ) : (
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
                      <th style={s.th}>Leave Type</th>
                      <th style={s.th}>From</th>
                      <th style={s.th}>To</th>
                      <th style={s.th}>Days</th>
                      <th style={s.th}>Reason</th>
                      <th style={s.th}>Applied On</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.map((leave) => (
                      <tr key={leave.id} style={s.trow}>
                        <td style={s.td}>
                          <div style={{ fontWeight: "600", color: "#0f1117" }}>
                            {leave.employeeName}
                          </div>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              color: getTypeColor(leave.leaveType),
                              fontWeight: "600",
                            }}
                          >
                            {getTypeIcon(leave.leaveType)} {leave.leaveType}
                          </span>
                        </td>
                        <td style={s.td}>{leave.fromDate}</td>
                        <td style={s.td}>{leave.toDate}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "700",
                            color: "#6366f1",
                          }}
                        >
                          {leave.days}
                        </td>
                        <td style={s.td}>{leave.reason || "—"}</td>
                        <td style={s.td}>
                          {leave.createdAt?.split("T")[0] || "—"}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              style={s.approveBtn}
                              onClick={() => handleApprove(leave.id)}
                            >
                              ✅ Approve
                            </button>
                            <button
                              style={s.rejectBtn}
                              onClick={() => handleReject(leave.id)}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Leaves - Admin */}
        {activeTab === "all" && isAdmin && (
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
                  <th style={s.th}>Type</th>
                  <th style={s.th}>From</th>
                  <th style={s.th}>To</th>
                  <th style={s.th}>Days</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Approved By</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => {
                  const sc = getStatusStyle(leave.status);
                  return (
                    <tr key={leave.id} style={s.trow}>
                      <td style={s.td}>
                        <div style={{ fontWeight: "600" }}>
                          {leave.employeeName}
                        </div>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            color: getTypeColor(leave.leaveType),
                            fontWeight: "600",
                          }}
                        >
                          {getTypeIcon(leave.leaveType)} {leave.leaveType}
                        </span>
                      </td>
                      <td style={s.td}>{leave.fromDate}</td>
                      <td style={s.td}>{leave.toDate}</td>
                      <td
                        style={{ ...s.td, fontWeight: "700", color: "#6366f1" }}
                      >
                        {leave.days}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.statusBadge,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td style={s.td}>{leave.approvedBy || "—"}</td>
                      <td style={s.td}>
                        {leave.status === "Pending" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              style={s.approveBtn}
                              onClick={() => handleApprove(leave.id)}
                            >
                              ✅
                            </button>
                            <button
                              style={s.rejectBtn}
                              onClick={() => handleReject(leave.id)}
                            >
                              ❌
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Holiday Calendar */}
        {activeTab === "holidays" && (
          <div>
            <div style={s.holidayHeader}>
              <div style={s.holidayTitle}>
                🗓️ 2026 Holiday Calendar — Karnataka
              </div>
              <div style={s.holidayLegend}>
                {[
                  "National Holiday",
                  "Festival Holiday",
                  "State Holiday",
                  "Optional Holiday",
                ].map((type) => {
                  const st = getHolidayTypeStyle(type);
                  return (
                    <span
                      key={type}
                      style={{
                        ...s.legendItem,
                        background: st.bg,
                        color: st.color,
                      }}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={s.holidayGrid}>
              {holidays
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((h) => {
                  const st = getHolidayTypeStyle(h.type);
                  const date = new Date(h.date);
                  const dayName = date.toLocaleDateString("en-IN", {
                    weekday: "short",
                  });
                  const isUpcoming = new Date(h.date) >= new Date();
                  return (
                    <div
                      key={h.id}
                      style={{
                        ...s.holidayCard,
                        ...(!isUpcoming ? { opacity: 0.6 } : {}),
                      }}
                    >
                      <div style={{ ...s.holidayDateBox, background: st.bg }}>
                        <div
                          style={{
                            fontSize: "22px",
                            fontWeight: "900",
                            color: st.color,
                          }}
                        >
                          {date.getDate()}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: st.color,
                            fontWeight: "700",
                          }}
                        >
                          {date.toLocaleDateString("en-IN", { month: "short" })}
                        </div>
                        <div style={{ fontSize: "9px", color: st.color }}>
                          {dayName}
                        </div>
                      </div>
                      <div style={s.holidayInfo}>
                        <div style={s.holidayName}>{h.name}</div>
                        <div style={s.holidayDesc}>{h.description}</div>
                        <span
                          style={{
                            ...s.holidayType,
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {h.type}
                        </span>
                      </div>
                      {isUpcoming && <div style={s.upcomingDot} />}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Leave Balances - Admin */}
        {activeTab === "balances" && isAdmin && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f1117",
                }}
              >
                Employee Leave Balances
              </div>
              <button
                style={s.applyBtn}
                onClick={async () => {
                  for (const u of users) {
                    if (!getBalance(u.id)) await handleInitBalance(u);
                  }
                  fetchAll();
                }}
              >
                ⚡ Initialize All
              </button>
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
                    <th style={s.th}>🌴 Casual Leave</th>
                    <th style={s.th}>🏥 Sick Leave</th>
                    <th style={s.th}>✈️ Annual Leave</th>
                    <th style={s.th}>Total Used</th>
                    <th style={s.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const bal = getBalance(u.id);
                    return (
                      <tr key={u.id} style={s.trow}>
                        <td style={s.td}>
                          <div style={{ fontWeight: "600", color: "#0f1117" }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {u.role}
                          </div>
                        </td>
                        {bal ? (
                          <>
                            <td style={s.td}>
                              <span
                                style={{ fontWeight: "700", color: "#6366f1" }}
                              >
                                {bal.casualLeaveTotal - bal.casualLeaveUsed}
                              </span>
                              <span
                                style={{ color: "#9ca3af", fontSize: "11px" }}
                              >
                                {" "}
                                / {bal.casualLeaveTotal}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span
                                style={{ fontWeight: "700", color: "#ef4444" }}
                              >
                                {bal.sickLeaveTotal - bal.sickLeaveUsed}
                              </span>
                              <span
                                style={{ color: "#9ca3af", fontSize: "11px" }}
                              >
                                {" "}
                                / {bal.sickLeaveTotal}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span
                                style={{ fontWeight: "700", color: "#10b981" }}
                              >
                                {bal.annualLeaveTotal - bal.annualLeaveUsed}
                              </span>
                              <span
                                style={{ color: "#9ca3af", fontSize: "11px" }}
                              >
                                {" "}
                                / {bal.annualLeaveTotal}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span
                                style={{ fontWeight: "700", color: "#f59e0b" }}
                              >
                                {bal.casualLeaveUsed +
                                  bal.sickLeaveUsed +
                                  bal.annualLeaveUsed}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td colSpan={4} style={s.td}>
                            <button
                              style={s.initBtn}
                              onClick={() => handleInitBalance(u)}
                            >
                              Initialize Balance
                            </button>
                          </td>
                        )}
                        <td style={s.td}>
                          {bal && (
                            <button
                              style={s.editBalBtn}
                              onClick={async () => {
                                const cl = prompt(
                                  "Casual Leave Total:",
                                  bal.casualLeaveTotal,
                                );
                                const sl = prompt(
                                  "Sick Leave Total:",
                                  bal.sickLeaveTotal,
                                );
                                const al = prompt(
                                  "Annual Leave Total:",
                                  bal.annualLeaveTotal,
                                );
                                if (cl && sl && al) {
                                  await axios.put(
                                    `${BASE_URL}/leave-balance/${bal.id}`,
                                    {
                                      ...bal,
                                      casualLeaveTotal: parseInt(cl),
                                      sickLeaveTotal: parseInt(sl),
                                      annualLeaveTotal: parseInt(al),
                                    },
                                  );
                                  fetchAll();
                                }
                              }}
                            >
                              Edit
                            </button>
                          )}
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

      {/* Apply Leave Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>Apply for Leave</div>
                <div style={s.modalSub}>Submit your leave request</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleApply} style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Leave Type</label>
                <select
                  style={s.input}
                  value={form.leaveType}
                  onChange={(e) =>
                    setForm({ ...form, leaveType: e.target.value })
                  }
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Balance info */}
              {myBalance && form.leaveType !== "Loss of Pay" && (
                <div style={s.balanceInfo}>
                  {form.leaveType === "Casual Leave" && (
                    <span>
                      🌴 Available:{" "}
                      <strong>
                        {myBalance.casualLeaveTotal - myBalance.casualLeaveUsed}{" "}
                        days
                      </strong>
                    </span>
                  )}
                  {form.leaveType === "Sick Leave" && (
                    <span>
                      🏥 Available:{" "}
                      <strong>
                        {myBalance.sickLeaveTotal - myBalance.sickLeaveUsed}{" "}
                        days
                      </strong>
                    </span>
                  )}
                  {form.leaveType === "Annual Leave" && (
                    <span>
                      ✈️ Available:{" "}
                      <strong>
                        {myBalance.annualLeaveTotal - myBalance.annualLeaveUsed}{" "}
                        days
                      </strong>
                    </span>
                  )}
                </div>
              )}

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>From Date *</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.fromDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fromDate: e.target.value,
                        days: calcDays(e.target.value, form.toDate) || 1,
                      })
                    }
                    required
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>To Date *</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.toDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        toDate: e.target.value,
                        days: calcDays(form.fromDate, e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {form.fromDate && form.toDate && (
                <div style={s.daysCalc}>
                  📊 Working days:{" "}
                  <strong style={{ color: "#6366f1", fontSize: "16px" }}>
                    {calcDays(form.fromDate, form.toDate)}
                  </strong>
                  <span style={{ color: "#9ca3af", fontSize: "11px" }}>
                    {" "}
                    (excluding weekends & holidays)
                  </span>
                </div>
              )}

              <div style={s.formGroup}>
                <label style={s.label}>Reason</label>
                <textarea
                  style={{ ...s.input, minHeight: "80px" }}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Reason for leave..."
                />
              </div>

              <div style={s.modalFoot}>
                <button
                  type="button"
                  style={s.cancelBtn2}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={s.submitBtn}>
                  Submit Application
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
    padding: "16px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  pendingBadge: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#d97706",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12.5px",
    fontWeight: "700",
  },
  applyBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  balanceRow: {
    display: "flex",
    gap: "12px",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
  },
  balCard: {
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    minWidth: "160px",
    flex: 1,
  },
  balTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  balRemaining: { fontSize: "28px", fontWeight: "900", letterSpacing: "-1px" },
  balLabel: { fontSize: "11px", color: "#6b7280", fontWeight: "500" },
  balType: {
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#0f1117",
    marginTop: "3px",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
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
    whiteSpace: "nowrap",
  },
  tabActive: { background: "#eef2ff", color: "#6366f1", fontWeight: "700" },
  content: { flex: 1, overflowY: "auto", padding: "20px" },
  leaveGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: "14px",
  },
  leaveCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  leaveCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  leaveTypeWrap: { display: "flex", alignItems: "center", gap: "10px" },
  leaveType: { fontSize: "13px", fontWeight: "700" },
  leaveDays: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "20px",
  },
  leaveDates: { fontSize: "12.5px", color: "#6b7280", marginBottom: "6px" },
  leaveReason: {
    fontSize: "12px",
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: "8px",
  },
  leaveApproved: { fontSize: "11.5px", color: "#6b7280", marginBottom: "8px" },
  cancelBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
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
  trow: { borderBottom: "1px solid #f1f3f9" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#374151" },
  approveBtn: {
    background: "#f0fdf4",
    color: "#10b981",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  rejectBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  initBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "7px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  editBalBtn: {
    background: "#f8f9fc",
    color: "#6b7280",
    border: "1px solid #e5e7f0",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  holidayHeader: { marginBottom: "16px" },
  holidayTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "10px",
  },
  holidayLegend: { display: "flex", gap: "8px", flexWrap: "wrap" },
  legendItem: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "20px",
  },
  holidayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: "10px",
  },
  holidayCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    position: "relative",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  holidayDateBox: {
    width: "56px",
    height: "64px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  holidayInfo: { flex: 1 },
  holidayName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "3px",
  },
  holidayDesc: { fontSize: "11.5px", color: "#6b7280", marginBottom: "6px" },
  holidayType: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  upcomingDot: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
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
  balanceInfo: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#6366f1",
    marginBottom: "14px",
  },
  daysCalc: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#374151",
    marginBottom: "14px",
  },
  modalFoot: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7f0",
    marginTop: "8px",
  },
  cancelBtn2: {
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
  submitBtn: {
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
