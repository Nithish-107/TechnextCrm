import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// Global Email Composer Component
// Can be used from any page
export default function EmailComposer({
  onClose,
  prefillTo,
  prefillSubject,
  prefillMessage,
}) {
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState(prefillTo || "");
  const [subject, setSubject] = useState(prefillSubject || "");
  const [message, setMessage] = useState(prefillMessage || "");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [customEmail, setCustomEmail] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`)
      .then((r) => setUsers(r.data))
      .catch(() => {});
  }, []);

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const buildToList = () => {
    const emails = [];
    selectedUsers.forEach((u) => {
      if (u.email) emails.push(u.email);
    });
    if (customEmail.trim())
      emails.push(
        ...customEmail
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      );
    if (to && !emails.includes(to)) emails.push(to);
    return [...new Set(emails)]; // remove duplicates
  };

  const handleSend = async () => {
    const toList = buildToList();
    if (toList.length === 0) {
      setResult({
        success: false,
        msg: "Please select at least one recipient!",
      });
      return;
    }
    if (!subject.trim()) {
      setResult({ success: false, msg: "Please enter a subject!" });
      return;
    }
    if (!message.trim()) {
      setResult({ success: false, msg: "Please enter a message!" });
      return;
    }

    setSending(true);
    setResult(null);
    let successCount = 0;
    let failCount = 0;

    for (const email of toList) {
      try {
        await axios.post(`${BASE_URL}/email/send`, {
          to: email,
          subject,
          message,
          senderName: currentUser.name,
        });
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    setSending(false);
    if (failCount === 0) {
      setResult({
        success: true,
        msg: `✅ Email sent to ${successCount} recipient(s) successfully!`,
      });
      setTimeout(() => onClose && onClose(), 2000);
    } else {
      setResult({
        success: false,
        msg: `⚠️ Sent: ${successCount}, Failed: ${failCount}`,
      });
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#0ea5e9",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHead}>
          <div>
            <div style={s.modalTitle}>📧 Compose Email</div>
            <div style={s.modalSub}>Send email from noreply@technnext.com</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={s.modalBody}>
          {/* To field */}
          <div style={s.fg}>
            <label style={s.label}>To — Select Recipients *</label>
            <div
              style={{
                border: "1.5px solid #e5e7f0",
                borderRadius: "9px",
                overflow: "hidden",
              }}
            >
              {/* Selected users chips */}
              {selectedUsers.length > 0 && (
                <div
                  style={{
                    padding: "8px 12px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    borderBottom: "1px solid #e5e7f0",
                  }}
                >
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      style={{
                        background: "#eef2ff",
                        color: "#6366f1",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {u.name}
                      <span
                        style={{ cursor: "pointer", fontWeight: "800" }}
                        onClick={() => toggleUser(u)}
                      >
                        ✕
                      </span>
                    </span>
                  ))}
                </div>
              )}
              {/* User picker */}
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  background: "#f8f9fc",
                  fontSize: "12.5px",
                  color: "#6b7280",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => setShowUserPicker(!showUserPicker)}
              >
                <span>
                  👥 Select team members... ({selectedUsers.length} selected)
                </span>
                <span>{showUserPicker ? "▲" : "▼"}</span>
              </div>
              {showUserPicker && (
                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    borderTop: "1px solid #e5e7f0",
                  }}
                >
                  {users.map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        background: selectedUsers.find((s) => s.id === u.id)
                          ? "#eef2ff"
                          : "#fff",
                        borderBottom: "1px solid #f8fafc",
                      }}
                      onClick={() => toggleUser(u)}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: getAvatarColor(u.name),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {u.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#0f1117",
                          }}
                        >
                          {u.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {u.email} · {u.role}
                        </div>
                      </div>
                      {selectedUsers.find((s) => s.id === u.id) && (
                        <span style={{ color: "#6366f1", fontWeight: "800" }}>
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom email */}
          <div style={s.fg}>
            <label style={s.label}>Or Add Custom Email(s)</label>
            <input
              style={s.input}
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="email1@example.com, email2@example.com (comma separated)"
            />
          </div>

          {/* Subject */}
          <div style={s.fg}>
            <label style={s.label}>Subject *</label>
            <input
              style={s.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Message */}
          <div style={s.fg}>
            <label style={s.label}>Message *</label>
            <textarea
              style={{ ...s.input, minHeight: "150px", resize: "vertical" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>

          {/* Quick templates */}
          <div style={s.fg}>
            <label style={s.label}>Quick Templates</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                {
                  label: "Meeting Reminder",
                  subject: "Reminder: Upcoming Meeting",
                  msg: "This is a reminder about our scheduled meeting. Please be on time and prepared.",
                },
                {
                  label: "Holiday Notice",
                  subject: "Office Holiday Notice",
                  msg: "This is to inform you that the office will be closed on account of the holiday. Wishing you a pleasant day!",
                },
                {
                  label: "General Update",
                  subject: "Important Update from TechNext",
                  msg: "Please be informed of the following update from TechNext Staffing management.",
                },
              ].map((t) => (
                <button
                  key={t.label}
                  style={s.templateBtn}
                  onClick={() => {
                    setSubject(t.subject);
                    setMessage(t.msg);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview of recipients */}
          {buildToList().length > 0 && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "9px",
                padding: "10px 14px",
                fontSize: "12.5px",
                color: "#10b981",
                fontWeight: "600",
              }}
            >
              📧 Will send to: {buildToList().join(", ")}
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              style={{
                background: result.success ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: "9px",
                padding: "10px 14px",
                fontSize: "13px",
                color: result.success ? "#10b981" : "#ef4444",
                fontWeight: "600",
              }}
            >
              {result.msg}
            </div>
          )}
        </div>

        <div style={s.modalFoot}>
          <button style={s.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...s.sendBtn, ...(sending ? { opacity: 0.7 } : {}) }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "⏳ Sending..." : "📧 Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,17,23,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "600px",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexShrink: 0,
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
  modalBody: { padding: "24px", overflowY: "auto", flex: 1 },
  modalFoot: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexShrink: 0,
  },
  fg: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
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
  templateBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "7px",
    padding: "6px 12px",
    fontSize: "12px",
    color: "#6b7280",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "500",
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
  sendBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "10px 24px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
};
