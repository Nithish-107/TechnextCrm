import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination, { usePagination } from "../components/Pagination";
import EmailComposer from "../components/EmailComposer";

const BASE_URL = "http://localhost:8080/api";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailPrefill, setEmailPrefill] = useState({});
  const [emailSending, setEmailSending] = useState(null);
  const [emailResult, setEmailResult] = useState({});
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const emptyForm = {
    title: "",
    agenda: "",
    meetingDate: "",
    duration: "",
    location: "",
    status: "Upcoming",
    participants: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/meetings`)
      .then((r) => {
        setMeetings(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = meetings.filter((m) => {
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    const matchSearch =
      !searchVal ||
      m.title?.toLowerCase().includes(searchVal.toLowerCase()) ||
      m.participants?.toLowerCase().includes(searchVal.toLowerCase()) ||
      m.location?.toLowerCase().includes(searchVal.toLowerCase());
    return matchStatus && matchSearch;
  });

  const { page, setPage, perPage, setPerPage, paginated } = usePagination(
    filtered,
    10,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, createdBy: currentUser.name };
    if (editItem) {
      await axios.put(`${BASE_URL}/meetings/${editItem.id}`, payload);
    } else {
      await axios.post(`${BASE_URL}/meetings`, payload);
    }
    setShowModal(false);
    setEditItem(null);
    setForm(emptyForm);
    fetchAll();
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this meeting?")) {
      await axios.delete(`${BASE_URL}/meetings/${id}`);
      fetchAll();
    }
  };

  // ✅ Send meeting notification emails
  const sendMeetingEmail = async (meeting, type) => {
    if (!meeting.participants) {
      alert("No attendees added to this meeting!");
      return;
    }

    const attendeeList = meeting.participants
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (attendeeList.length === 0) {
      alert("No attendees found!");
      return;
    }

    setEmailSending(meeting.id + type);
    let successCount = 0;
    let failCount = 0;

    for (const attendee of attendeeList) {
      // Check if attendee is an email or a name
      const isEmail = attendee.includes("@");
      const to = isEmail ? attendee : null;
      if (!to) {
        failCount++;
        continue;
      } // skip if no email

      try {
        await axios.post(`${BASE_URL}/email/meeting`, {
          type,
          to,
          name: attendee.split("@")[0],
          title: meeting.title,
          date: meeting.meetingDate,
          duration: meeting.duration || "—",
          location: meeting.location || "TBD",
          agenda: meeting.agenda || meeting.notes || "—",
        });
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    setEmailSending(null);
    setEmailResult((prev) => ({
      ...prev,
      [meeting.id + type]:
        successCount > 0
          ? `✅ Sent to ${successCount} attendee(s)`
          : `⚠️ Failed — add email addresses in attendees field`,
    }));
    setTimeout(
      () =>
        setEmailResult((prev) => {
          const n = { ...prev };
          delete n[meeting.id + type];
          return n;
        }),
      4000,
    );
  };

  // ✅ Open email composer with meeting prefill
  const openEmailComposer = (meeting) => {
    setEmailPrefill({
      subject: `Meeting: ${meeting.title} — ${meeting.meetingDate || ""}`,
      message: `Dear Team,\n\nThis is regarding the meeting: ${meeting.title}\nDate: ${meeting.meetingDate || "TBD"}\nLocation: ${meeting.location || "TBD"}\nAgenda: ${meeting.agenda || "—"}\n\nPlease ensure your attendance.\n\nRegards,\n${currentUser.name}\nTechNext Staffing`,
    });
    setShowEmailComposer(true);
  };

  const getStatusStyle = (status) =>
    ({
      Upcoming: { bg: "#f0fdf4", color: "#10b981" },
      Completed: { bg: "#eff6ff", color: "#3b82f6" },
      Cancelled: { bg: "#fef2f2", color: "#ef4444" },
    })[status] || { bg: "#f9fafb", color: "#6b7280" };

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
          Loading meetings...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Email Composer */}
      {showEmailComposer && (
        <EmailComposer
          prefillSubject={emailPrefill.subject}
          prefillMessage={emailPrefill.message}
          onClose={() => setShowEmailComposer(false)}
        />
      )}

      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Meetings</span>
          <span style={s.count}>{filtered.length}</span>
          <span
            style={{
              background: "#f0fdf4",
              color: "#10b981",
              fontSize: "11px",
              fontWeight: "700",
              padding: "2px 9px",
              borderRadius: "20px",
            }}
          >
            {meetings.filter((m) => m.status === "Upcoming").length} Upcoming
          </span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search meetings..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
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
          <select
            style={s.filterSel}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option>Upcoming</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <button
            style={s.emailBtn}
            onClick={() => {
              setEmailPrefill({});
              setShowEmailComposer(true);
            }}
          >
            📧 Compose Email
          </button>
          <button
            style={s.addBtn}
            onClick={() => {
              setEditItem(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
          >
            + Schedule Meeting
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          margin: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7f0",
          overflow: "hidden",
        }}
      >
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {[
                "Title",
                "Date",
                "Duration",
                "Location",
                "Attendees",
                "Status",
                "Email",
                "Actions",
              ].map((h) => (
                <th key={h} style={s.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: "60px", textAlign: "center" }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                    📅
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#0f1117",
                      marginBottom: "6px",
                    }}
                  >
                    No meetings found
                  </div>
                  <button
                    style={s.addBtn}
                    onClick={() => {
                      setEditItem(null);
                      setForm(emptyForm);
                      setShowModal(true);
                    }}
                  >
                    + Schedule Meeting
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((m) => {
                const ss = getStatusStyle(m.status);
                return (
                  <tr key={m.id} style={s.trow}>
                    <td style={s.td}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#6366f1",
                          cursor: "pointer",
                        }}
                        onClick={() => handleEdit(m)}
                      >
                        {m.title}
                      </div>
                      {m.agenda && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            marginTop: "2px",
                          }}
                        >
                          {m.agenda?.slice(0, 40)}
                          {m.agenda?.length > 40 ? "..." : ""}
                        </div>
                      )}
                    </td>
                    <td style={s.td}>{m.meetingDate || "—"}</td>
                    <td style={s.td}>{m.duration || "—"}</td>
                    <td style={s.td}>{m.location || "—"}</td>
                    <td style={s.td}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          maxWidth: "150px",
                        }}
                      >
                        {m.participants
                          ? m.participants.split(",").slice(0, 2).join(", ") +
                          (m.participants.split(",").length > 2
                            ? ` +${m.participants.split(",").length - 2}`
                            : "")
                          : "—"}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          background: ss.bg,
                          color: ss.color,
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            style={s.emailActionBtn}
                            title="Send meeting notification"
                            onClick={() => sendMeetingEmail(m, "scheduled")}
                            disabled={emailSending === m.id + "scheduled"}
                          >
                            {emailSending === m.id + "scheduled" ? "⏳" : "📧"}{" "}
                            Notify
                          </button>
                          <button
                            style={{
                              ...s.emailActionBtn,
                              background: "#fffbeb",
                              color: "#f59e0b",
                            }}
                            title="Send update notification"
                            onClick={() => sendMeetingEmail(m, "updated")}
                            disabled={emailSending === m.id + "updated"}
                          >
                            {emailSending === m.id + "updated" ? "⏳" : "📝"}{" "}
                            Update
                          </button>
                          <button
                            style={{
                              ...s.emailActionBtn,
                              background: "#fef2f2",
                              color: "#ef4444",
                            }}
                            title="Send cancellation"
                            onClick={() => sendMeetingEmail(m, "cancelled")}
                            disabled={emailSending === m.id + "cancelled"}
                          >
                            {emailSending === m.id + "cancelled" ? "⏳" : "❌"}{" "}
                            Cancel
                          </button>
                        </div>
                        <button
                          style={{
                            ...s.emailActionBtn,
                            background: "#eef2ff",
                            color: "#6366f1",
                            width: "100%",
                          }}
                          onClick={() => openEmailComposer(m)}
                        >
                          ✏️ Custom Email
                        </button>
                        {Object.entries(emailResult).map(
                          ([key, val]) =>
                            key.startsWith(m.id.toString()) && (
                              <div
                                key={key}
                                style={{
                                  fontSize: "10px",
                                  color: val.includes("✅")
                                    ? "#10b981"
                                    : "#ef4444",
                                  fontWeight: "600",
                                }}
                              >
                                {val}
                              </div>
                            ),
                        )}
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={s.editBtn} onClick={() => handleEdit(m)}>
                          ✏️
                        </button>
                        <button
                          style={s.delBtn}
                          onClick={() => handleDelete(m.id)}
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
        <Pagination
          total={filtered.length}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  {editItem ? "Edit Meeting" : "Schedule Meeting"}
                </div>
                <div style={s.modalSub}>
                  Add attendee emails to enable email notifications
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={s.fg}>
                <label style={s.label}>Meeting Title *</label>
                <input
                  style={s.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Project Review"
                />
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
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
                <div style={s.fg}>
                  <label style={s.label}>Duration</label>
                  <input
                    style={s.input}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    placeholder="e.g. 1 hour"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Location</label>
                  <input
                    style={s.input}
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Conference Room / Zoom link"
                  />
                </div>
                <div style={s.fg}>
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
              <div style={s.fg}>
                <label style={s.label}>
                  Attendees — Add Email Addresses for notifications
                </label>
                <input
                  style={s.input}
                  value={form.participants}
                  onChange={(e) =>
                    setForm({ ...form, participants: e.target.value })
                  }
                  placeholder="ria@technnext.com, sam@technnext.com (comma separated emails)"
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  💡 Add email addresses to send meeting notifications
                  automatically
                </div>
              </div>
              <div style={s.fg}>
                <label style={s.label}>Agenda / Notes</label>
                <textarea
                  style={{ ...s.input, minHeight: "70px", resize: "vertical" }}
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  placeholder="Meeting agenda..."
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7f0",
                }}
              >
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
    minHeight: "100%",
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
    flexWrap: "wrap",
    gap: "10px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  title: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  count: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    width: "140px",
  },
  filterSel: {
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "12.5px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    color: "#374151",
  },
  emailBtn: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#6366f1",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
  },
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
  td: {
    padding: "12px 14px",
    fontSize: "13px",
    color: "#374151",
    verticalAlign: "top",
  },
  badge: {
    fontSize: "11.5px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "20px",
  },
  emailActionBtn: {
    background: "#f0fdf4",
    color: "#10b981",
    border: "none",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  editBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "7px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  delBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    padding: "5px 8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
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
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  fg: {
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
