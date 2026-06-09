import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const SALARY_GRADES = [
  { label: "Entry Level (₹25K - ₹40K)", min: 25000, max: 40000 },
  { label: "Junior (₹40K - ₹60K)", min: 40000, max: 60000 },
  { label: "Mid Level (₹60K - ₹90K)", min: 60000, max: 90000 },
  { label: "Senior (₹90K - ₹1.5L)", min: 90000, max: 150000 },
  { label: "Lead (₹1.5L - ₹2.5L)", min: 150000, max: 250000 },
  { label: "Manager (₹2.5L+)", min: 250000, max: 500000 },
];

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [profilePic, setProfilePic] = useState(
    currentUser.profilePicture || "",
  );
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    department: currentUser.department || "",
    employeeId: currentUser.employeeId || "",
  });
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
  });
  const [isDark] = useState(() => localStorage.getItem("theme") === "dark");
  const fileInputRef = useRef(null);
  const isAdmin = ["Admin", "HR Manager"].includes(currentUser.role);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get(`${BASE_URL}/users`)
      .then((r) => setUsers(r.data))
      .catch(() => {});
  };

  const showMsg = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showMsg("⚠️ Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = { ...currentUser, ...form, profilePicture: profilePic };
      await axios.put(`${BASE_URL}/users/${currentUser.id}`, updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setCurrentUser(updated);
      showMsg("✅ Profile saved successfully!");
    } catch (e) {
      showMsg("⚠️ Failed to save.");
    }
    setSaving(false);
  };

  const handleOpenEdit = (user) => {
    setEditEmployee(user);
    setEditForm({
      name: user.name || "",
      role: user.role || "Staff",
      department: user.department || "",
      employeeId: user.employeeId || user.employee_id || "",
      joiningDate: user.joiningDate || "",
      basicSalary: user.basicSalary || user.basic_salary || 0,
    });
  };

  const handleSaveEmployee = async () => {
    if (!editEmployee) return;
    setSaving(true);
    try {
      // Update salary and details
      await axios.put(`${BASE_URL}/users/${editEmployee.id}/salary`, {
        basicSalary: parseFloat(editForm.basicSalary) || 0,
        department: editForm.department,
        employeeId: editForm.employeeId,
        role: editForm.role,
        joiningDate: editForm.joiningDate || null,
      });
      // Update name
      const fullUser = { ...editEmployee, name: editForm.name };
      await axios.put(`${BASE_URL}/users/${editEmployee.id}`, fullUser);
      showMsg(`✅ ${editEmployee.name}'s details updated!`);
      setEditEmployee(null);
      fetchUsers();
    } catch (e) {
      showMsg("⚠️ Failed to update.");
    }
    setSaving(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/users`, inviteForm);
      showMsg("✅ Team member added!");
      setInviteForm({ name: "", email: "", password: "", role: "Staff" });
      fetchUsers();
    } catch (e) {
      showMsg("⚠️ Email may already exist.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    await axios.delete(`${BASE_URL}/users/${id}`);
    fetchUsers();
    showMsg("✅ Team member removed.");
  };

  const getRoleColor = (role) =>
    ({
      Admin: "#ef4444",
      Recruiter: "#10b981",
      Sales: "#3b82f6",
      "HR Manager": "#8b5cf6",
      Staff: "#6b7280",
    })[role] || "#6b7280";

  const calcNetSalary = (basic) => {
    const b = parseFloat(basic) || 0;
    const hra = Math.round(b * 0.4);
    const transport = 2000;
    const medical = 1250;
    const special = Math.round(b * 0.15);
    const gross = b + hra + transport + medical + special;
    const pf = Math.round(b * 0.12);
    const profTax = b <= 10000 ? 0 : b <= 15000 ? 150 : 200;
    const tds = b > 50000 ? Math.round(gross * 0.1) : 0;
    return {
      gross: Math.round(gross),
      pf,
      profTax,
      tds,
      totalDed: pf + profTax + tds,
      net: Math.round(gross) - pf - profTax - tds,
    };
  };

  const tabs = [
    { id: "profile", icon: "👤", label: "My Profile" },
    ...(isAdmin
      ? [
          { id: "team", icon: "👥", label: "Team Members" },
          { id: "salary", icon: "💰", label: "Salary Management" },
          { id: "invite", icon: "➕", label: "Add Member" },
        ]
      : []),
    { id: "security", icon: "🔐", label: "Security" },
    { id: "about", icon: "ℹ️", label: "About" },
  ];

  const totalPayroll = users.reduce((sum, u) => {
    const b = parseFloat(u.basicSalary || u.basic_salary || 0);
    const sal = calcNetSalary(b);
    return sum + sal.net;
  }, 0);

  return (
    <div style={s.page}>
      {/* Edit Employee Modal */}
      {editEmployee && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  ✏️ Edit Employee — {editEmployee.name}
                </div>
                <div style={s.modalSub}>Update salary, role and department</div>
              </div>
              <button style={s.closeBtn} onClick={() => setEditEmployee(null)}>
                ✕
              </button>
            </div>
            <div style={s.modalBody}>
              {/* Salary Preview */}
              {editForm.basicSalary > 0 && (
                <div style={s.salaryPreview}>
                  <div style={s.salaryPreviewTitle}>💰 Salary Preview</div>
                  <div style={s.salaryPreviewGrid}>
                    {(() => {
                      const sal = calcNetSalary(editForm.basicSalary);
                      return [
                        {
                          label: "Basic",
                          value: `₹${parseFloat(editForm.basicSalary).toLocaleString("en-IN")}`,
                          color: "#6366f1",
                        },
                        {
                          label: "Gross",
                          value: `₹${sal.gross.toLocaleString("en-IN")}`,
                          color: "#10b981",
                        },
                        {
                          label: "Deductions",
                          value: `₹${sal.totalDed.toLocaleString("en-IN")}`,
                          color: "#ef4444",
                        },
                        {
                          label: "Net Salary",
                          value: `₹${sal.net.toLocaleString("en-IN")}`,
                          color: "#f59e0b",
                        },
                      ].map((item) => (
                        <div key={item.label} style={s.salaryPreviewItem}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              fontWeight: "600",
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: "800",
                              color: item.color,
                            }}
                          >
                            {item.value}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name</label>
                  <input
                    style={s.input}
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Role</label>
                  <select
                    style={s.input}
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                  >
                    <option>Admin</option>
                    <option>HR Manager</option>
                    <option>Recruiter</option>
                    <option>Sales</option>
                    <option>Staff</option>
                  </select>
                </div>
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Department</label>
                  <select
                    style={s.input}
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                  >
                    <option value="">Select Department</option>
                    <option>Management</option>
                    <option>Recruitment</option>
                    <option>Sales</option>
                    <option>HR</option>
                    <option>Operations</option>
                    <option>Finance</option>
                    <option>Technology</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Employee ID</label>
                  <input
                    style={s.input}
                    value={editForm.employeeId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, employeeId: e.target.value })
                    }
                    placeholder="e.g. TN001"
                  />
                </div>
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Joining Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={editForm.joiningDate || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, joiningDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Salary Section */}
              <div style={s.salarySectionBox}>
                <div style={s.salarySectionTitle}>💰 Salary Details</div>
                <div style={s.formGroup}>
                  <label style={s.label}>Basic Salary (₹ per month)</label>
                  <input
                    style={{
                      ...s.input,
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#6366f1",
                    }}
                    type="number"
                    min="0"
                    value={editForm.basicSalary}
                    onChange={(e) =>
                      setEditForm({ ...editForm, basicSalary: e.target.value })
                    }
                    placeholder="e.g. 65000"
                  />
                </div>
                <div style={s.salaryGradeTitle}>Quick Salary Grades:</div>
                <div style={s.salaryGrades}>
                  {SALARY_GRADES.map((grade) => (
                    <button
                      key={grade.label}
                      style={{
                        ...s.gradeBtn,
                        ...(parseFloat(editForm.basicSalary) >= grade.min &&
                        parseFloat(editForm.basicSalary) <= grade.max
                          ? s.gradeBtnActive
                          : {}),
                      }}
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          basicSalary: Math.round((grade.min + grade.max) / 2),
                        })
                      }
                    >
                      {grade.label}
                    </button>
                  ))}
                </div>

                {/* Auto calculation breakdown */}
                {editForm.basicSalary > 0 && (
                  <div style={s.calcBreakdown}>
                    <div style={s.calcTitle}>Auto-calculated breakdown:</div>
                    {(() => {
                      const b = parseFloat(editForm.basicSalary) || 0;
                      const sal = calcNetSalary(b);
                      return (
                        <div style={s.calcGrid}>
                          <div style={s.calcSection}>
                            <div style={s.calcSectionTitle}>📈 Earnings</div>
                            {[
                              { label: "Basic Salary", val: b },
                              { label: "HRA (40%)", val: Math.round(b * 0.4) },
                              { label: "Transport Allowance", val: 2000 },
                              { label: "Medical Allowance", val: 1250 },
                              {
                                label: "Special Allowance (15%)",
                                val: Math.round(b * 0.15),
                              },
                              {
                                label: "Gross Total",
                                val: sal.gross,
                                bold: true,
                                color: "#10b981",
                              },
                            ].map((row) => (
                              <div key={row.label} style={s.calcRow}>
                                <span
                                  style={{
                                    ...s.calcLabel,
                                    ...(row.bold
                                      ? { fontWeight: "700", color: row.color }
                                      : {}),
                                  }}
                                >
                                  {row.label}
                                </span>
                                <span
                                  style={{
                                    ...s.calcVal,
                                    ...(row.bold
                                      ? { fontWeight: "800", color: row.color }
                                      : {}),
                                  }}
                                >
                                  ₹{row.val.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div style={s.calcSection}>
                            <div style={s.calcSectionTitle}>📉 Deductions</div>
                            {[
                              { label: "PF (12%)", val: sal.pf },
                              { label: "Professional Tax", val: sal.profTax },
                              ...(sal.tds > 0
                                ? [{ label: "TDS (10%)", val: sal.tds }]
                                : []),
                              {
                                label: "Total Deductions",
                                val: sal.totalDed,
                                bold: true,
                                color: "#ef4444",
                              },
                            ].map((row) => (
                              <div key={row.label} style={s.calcRow}>
                                <span
                                  style={{
                                    ...s.calcLabel,
                                    ...(row.bold
                                      ? { fontWeight: "700", color: row.color }
                                      : {}),
                                  }}
                                >
                                  {row.label}
                                </span>
                                <span
                                  style={{
                                    ...s.calcVal,
                                    ...(row.bold
                                      ? { fontWeight: "800", color: row.color }
                                      : {}),
                                    ...(!row.bold ? { color: "#ef4444" } : {}),
                                  }}
                                >
                                  ₹{row.val.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                            <div
                              style={{
                                ...s.calcRow,
                                marginTop: "8px",
                                paddingTop: "8px",
                                borderTop: "2px solid #6366f1",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "800",
                                  color: "#6366f1",
                                }}
                              >
                                NET SALARY
                              </span>
                              <span
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "900",
                                  color: "#6366f1",
                                }}
                              >
                                ₹{sal.net.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div style={s.modalFoot}>
                <button
                  style={s.cancelBtn}
                  onClick={() => setEditEmployee(null)}
                >
                  Cancel
                </button>
                <button
                  style={s.saveBtn}
                  onClick={handleSaveEmployee}
                  disabled={saving}
                >
                  {saving ? "⏳ Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={s.header}>
        <div style={s.title}>Settings</div>
        <div style={s.sub}>Manage your account and team</div>
        {savedMsg && (
          <span
            style={{
              fontSize: "13px",
              color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
              fontWeight: "600",
              marginLeft: "auto",
            }}
          >
            {savedMsg}
          </span>
        )}
      </div>

      <div style={s.body}>
        <div style={s.tabPanel}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...s.tabBtn,
                ...(activeTab === tab.id ? s.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ fontSize: "16px" }}>{tab.icon}</span>
              <span style={s.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={s.contentPanel}>
          {/* MY PROFILE */}
          {activeTab === "profile" && (
            <div style={s.card}>
              <div style={s.cardTitle}>👤 My Profile</div>
              <div style={s.profileSection}>
                <div style={s.picSection}>
                  <div
                    style={s.picWrap}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profile"
                        style={s.profileImg}
                      />
                    ) : (
                      <div
                        style={{
                          ...s.picPlaceholder,
                          background: getRoleColor(currentUser.role),
                        }}
                      >
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleProfilePicChange}
                  />
                  <button
                    style={s.uploadBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📷 Upload Photo
                  </button>
                  {profilePic && (
                    <button
                      style={s.removePicBtn}
                      onClick={() => setProfilePic("")}
                    >
                      Remove
                    </button>
                  )}
                  <div style={s.picHint}>Max 2MB · JPG, PNG</div>
                </div>
                <div style={s.profileForm}>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Full Name</label>
                      <input
                        style={s.input}
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Email</label>
                      <input
                        style={{ ...s.input, color: "#9ca3af" }}
                        value={form.email}
                        disabled
                      />
                    </div>
                  </div>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Department</label>
                      <input
                        style={s.input}
                        value={form.department}
                        onChange={(e) =>
                          setForm({ ...form, department: e.target.value })
                        }
                        placeholder="e.g. Recruitment"
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Employee ID</label>
                      <input
                        style={s.input}
                        value={form.employeeId}
                        onChange={(e) =>
                          setForm({ ...form, employeeId: e.target.value })
                        }
                        placeholder="e.g. TN001"
                      />
                    </div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Role</label>
                    <div
                      style={{
                        ...s.roleDisplay,
                        background: getRoleColor(currentUser.role) + "20",
                        color: getRoleColor(currentUser.role),
                      }}
                    >
                      {currentUser.role}
                    </div>
                  </div>
                  {/* Show own salary info (read only) */}
                  <div style={{ ...s.salarySectionBox, marginBottom: "14px" }}>
                    <div style={s.salarySectionTitle}>
                      💰 My Salary Info (View Only)
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "10px",
                      }}
                    >
                      {(() => {
                        const basic = parseFloat(
                          currentUser.basicSalary ||
                            currentUser.basic_salary ||
                            0,
                        );
                        const sal = calcNetSalary(basic);
                        return [
                          {
                            label: "Basic Salary",
                            val: basic,
                            color: "#6366f1",
                          },
                          {
                            label: "Gross Salary",
                            val: sal.gross,
                            color: "#10b981",
                          },
                          {
                            label: "Net Salary",
                            val: sal.net,
                            color: "#f59e0b",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              background: "#f8f9fc",
                              borderRadius: "9px",
                              padding: "12px",
                              border: "1px solid #e5e7f0",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#9ca3af",
                                fontWeight: "600",
                                marginBottom: "4px",
                              }}
                            >
                              {item.label}
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: item.color,
                              }}
                            >
                              ₹{item.val.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginTop: "8px",
                      }}
                    >
                      Contact Admin or HR Manager to update your salary.
                    </div>
                  </div>
                  <button
                    style={s.saveBtn}
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? "⏳ Saving..." : "💾 Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TEAM MEMBERS */}
          {activeTab === "team" && isAdmin && (
            <div style={s.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={s.cardTitle}>👥 Team Members ({users.length})</div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Total Payroll:{" "}
                  <strong style={{ color: "#6366f1" }}>
                    ₹{(totalPayroll / 100000).toFixed(1)}L/month
                  </strong>
                </div>
              </div>
              <div style={s.teamList}>
                {users.map((u) => {
                  const basic = parseFloat(
                    u.basicSalary || u.basic_salary || 0,
                  );
                  const sal = calcNetSalary(basic);
                  return (
                    <div key={u.id} style={s.teamRow}>
                      <div style={s.teamLeft}>
                        {u.profilePicture ? (
                          <img
                            src={u.profilePicture}
                            alt={u.name}
                            style={s.teamAvatarImg}
                          />
                        ) : (
                          <div
                            style={{
                              ...s.teamAvatar,
                              background: getRoleColor(u.role),
                            }}
                          >
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={s.teamInfo}>
                          <div style={s.teamName}>{u.name}</div>
                          <div style={s.teamMeta}>
                            <span
                              style={{
                                ...s.teamRoleBadge,
                                background: getRoleColor(u.role) + "20",
                                color: getRoleColor(u.role),
                              }}
                            >
                              {u.role}
                            </span>
                            <span style={s.teamDept}>
                              {u.department || "—"}
                            </span>
                            <span style={s.teamId}>
                              ID: {u.employeeId || u.employee_id || "—"}
                            </span>
                          </div>
                          <div style={s.teamEmail}>{u.email}</div>
                        </div>
                      </div>
                      <div style={s.teamSalaryInfo}>
                        <div style={s.teamSalaryItem}>
                          <div style={s.teamSalaryLabel}>Basic</div>
                          <div style={{ ...s.teamSalaryVal, color: "#6366f1" }}>
                            ₹{basic.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={s.teamSalaryItem}>
                          <div style={s.teamSalaryLabel}>Gross</div>
                          <div style={{ ...s.teamSalaryVal, color: "#10b981" }}>
                            ₹{sal.gross.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div style={s.teamSalaryItem}>
                          <div style={s.teamSalaryLabel}>Net</div>
                          <div
                            style={{
                              ...s.teamSalaryVal,
                              color: "#f59e0b",
                              fontSize: "15px",
                            }}
                          >
                            ₹{sal.net.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div style={s.teamActions}>
                        <button
                          style={s.editBtn}
                          onClick={() => handleOpenEdit(u)}
                        >
                          ✏️ Edit
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            style={s.removeBtn}
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SALARY MANAGEMENT */}
          {activeTab === "salary" && isAdmin && (
            <div style={s.card}>
              <div style={s.cardTitle}>💰 Salary Management</div>

              {/* Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                {[
                  {
                    label: "Total Employees",
                    val: users.length,
                    icon: "👥",
                    color: "#6366f1",
                    bg: "#eef2ff",
                  },
                  {
                    label: "Total Net Payroll",
                    val: `₹${(totalPayroll / 100000).toFixed(1)}L`,
                    icon: "💰",
                    color: "#10b981",
                    bg: "#f0fdf4",
                  },
                  {
                    label: "Avg Salary",
                    val:
                      users.length > 0
                        ? `₹${Math.round(totalPayroll / users.length).toLocaleString("en-IN")}`
                        : "—",
                    icon: "📊",
                    color: "#f59e0b",
                    bg: "#fffbeb",
                  },
                  {
                    label: "Total Deductions",
                    val: `₹${(
                      users.reduce((sum, u) => {
                        const b = parseFloat(
                          u.basicSalary || u.basic_salary || 0,
                        );
                        return sum + calcNetSalary(b).totalDed;
                      }, 0) / 100000
                    ).toFixed(1)}L`,
                    icon: "📉",
                    color: "#ef4444",
                    bg: "#fef2f2",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7f0",
                      padding: "16px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "9px",
                        background: card.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        marginBottom: "10px",
                      }}
                    >
                      {card.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: card.color,
                      }}
                    >
                      {card.val}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "3px",
                      }}
                    >
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Salary Table */}
              <div
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7f0",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fc" }}>
                      {[
                        "Employee",
                        "Role",
                        "Department",
                        "Basic Salary",
                        "HRA",
                        "Transport",
                        "Medical",
                        "Special",
                        "Gross",
                        "Deductions",
                        "Net Salary",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "11px 14px",
                            fontSize: "10px",
                            color: "#9ca3af",
                            fontWeight: "700",
                            textAlign: "left",
                            borderBottom: "1px solid #e5e7f0",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const basic = parseFloat(
                        u.basicSalary || u.basic_salary || 0,
                      );
                      const sal = calcNetSalary(basic);
                      const hra = Math.round(basic * 0.4);
                      const special = Math.round(basic * 0.15);
                      return (
                        <tr
                          key={u.id}
                          style={{ borderBottom: "1px solid #f1f3f9" }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {u.profilePicture ? (
                                <img
                                  src={u.profilePicture}
                                  alt={u.name}
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    background: getRoleColor(u.role),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "#fff",
                                  }}
                                >
                                  {u.name?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#0f1117",
                                  }}
                                >
                                  {u.name}
                                </div>
                                <div
                                  style={{ fontSize: "10px", color: "#9ca3af" }}
                                >
                                  {u.employeeId || u.employee_id || "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "3px 8px",
                                borderRadius: "20px",
                                background: getRoleColor(u.role) + "20",
                                color: getRoleColor(u.role),
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            {u.department || "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#6366f1",
                            }}
                          >
                            ₹{basic.toLocaleString("en-IN")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            ₹{hra.toLocaleString("en-IN")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            ₹2,000
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            ₹1,250
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            ₹{special.toLocaleString("en-IN")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#10b981",
                            }}
                          >
                            ₹{sal.gross.toLocaleString("en-IN")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "12px",
                              color: "#ef4444",
                            }}
                          >
                            ₹{sal.totalDed.toLocaleString("en-IN")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "14px",
                              fontWeight: "800",
                              color: "#f59e0b",
                            }}
                          >
                            ₹{sal.net.toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              style={s.editBtn}
                              onClick={() => handleOpenEdit(u)}
                            >
                              ✏️ Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INVITE */}
          {activeTab === "invite" && isAdmin && (
            <div style={s.card}>
              <div style={s.cardTitle}>➕ Add Team Member</div>
              <form onSubmit={handleInvite}>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Full Name *</label>
                    <input
                      style={s.input}
                      value={inviteForm.name}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, name: e.target.value })
                      }
                      required
                      placeholder="Full name"
                    />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Email *</label>
                    <input
                      style={s.input}
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, email: e.target.value })
                      }
                      required
                      placeholder="email@technext.in"
                    />
                  </div>
                </div>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Password *</label>
                    <input
                      style={s.input}
                      type="password"
                      value={inviteForm.password}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          password: e.target.value,
                        })
                      }
                      required
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Role *</label>
                    <select
                      style={s.input}
                      value={inviteForm.role}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, role: e.target.value })
                      }
                    >
                      <option>Staff</option>
                      <option>Recruiter</option>
                      <option>Sales</option>
                      <option>HR Manager</option>
                      <option>Admin</option>
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8f9fc",
                    border: "1px solid #e5e7f0",
                    borderRadius: "10px",
                    padding: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    📋 Role Permissions:
                  </div>
                  {[
                    {
                      role: "Staff",
                      color: "#6b7280",
                      access: "Tasks, Meetings, Calendar, Chat, Payslips (own)",
                    },
                    {
                      role: "Recruiter",
                      color: "#10b981",
                      access:
                        "Candidates, Jobs, Placements, Interviews, Reports",
                    },
                    {
                      role: "Sales",
                      color: "#3b82f6",
                      access: "Leads, Contacts, Accounts, Deals, Reports",
                    },
                    {
                      role: "HR Manager",
                      color: "#8b5cf6",
                      access:
                        "All HR + Payslips for all employees + Salary view",
                    },
                    {
                      role: "Admin",
                      color: "#ef4444",
                      access:
                        "Full access to everything including salary management",
                    },
                  ].map((r) => (
                    <div
                      key={r.role}
                      style={{
                        display: "flex",
                        gap: "8px",
                        padding: "4px 0",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          color: r.color,
                          minWidth: "90px",
                        }}
                      >
                        {r.role}:
                      </span>
                      <span style={{ color: "#6b7280" }}>{r.access}</span>
                    </div>
                  ))}
                </div>
                <button type="submit" style={s.saveBtn}>
                  ✅ Add Team Member
                </button>
              </form>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div style={s.card}>
              <div style={s.cardTitle}>🔐 Security</div>
              {[
                {
                  icon: "🔐",
                  label: "JWT Authentication",
                  desc: "Protected with JWT tokens, expires every 24 hours",
                  status: "✅ Active",
                },
                {
                  icon: "🛡️",
                  label: "Role-based Access",
                  desc: `Your role: ${currentUser.role} — set by Admin`,
                  status: "✅ Active",
                },
                {
                  icon: "🔑",
                  label: "Password",
                  desc: "Contact Admin to reset your password",
                  status: "Admin only",
                },
              ].map((item) => (
                <div key={item.label} style={s.securityItem}>
                  <div style={{ fontSize: "24px" }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#0f1117",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "3px",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#10b981",
                      fontWeight: "700",
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
              <button
                style={{
                  ...s.saveBtn,
                  background: "#fef2f2",
                  color: "#ef4444",
                  boxShadow: "none",
                  border: "1px solid #fecaca",
                  marginTop: "16px",
                }}
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
              >
                ↩ Sign Out
              </button>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <div style={s.card}>
              <div style={s.cardTitle}>ℹ️ About TechNext CRM</div>
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  borderBottom: "1px solid #e5e7f0",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: "900",
                    color: "#fff",
                    margin: "0 auto 12px",
                  }}
                >
                  TN
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#0f1117",
                  }}
                >
                  TechNext Staffing CRM
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  Version 2.0.0 · Built with React + Spring Boot
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                {[
                  { icon: "⚛️", label: "Frontend", value: "React.js" },
                  { icon: "☕", label: "Backend", value: "Spring Boot" },
                  { icon: "🗄️", label: "Database", value: "MySQL 8.0" },
                  { icon: "🔐", label: "Security", value: "JWT Auth" },
                  { icon: "📊", label: "Charts", value: "Recharts" },
                  { icon: "🚀", label: "Features", value: "40+" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#f8f9fc",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center",
                      border: "1px solid #e5e7f0",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      {item.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#0f1117",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    background: "#f8f9fc",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  header: {
    padding: "20px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  tabPanel: {
    width: "220px",
    minWidth: "220px",
    background: "#fff",
    borderRight: "1px solid #e5e7f0",
    padding: "12px 8px",
    overflowY: "auto",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: "2px",
    textAlign: "left",
  },
  tabBtnActive: { background: "#eef2ff" },
  tabLabel: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  contentPanel: { flex: 1, overflowY: "auto", padding: "20px" },
  card: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7f0",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "20px",
  },
  profileSection: { display: "flex", gap: "32px" },
  picSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  picWrap: {
    width: "100px",
    height: "100px",
    borderRadius: "20px",
    overflow: "hidden",
    cursor: "pointer",
    border: "2px solid #e5e7f0",
  },
  profileImg: { width: "100%", height: "100%", objectFit: "cover" },
  picPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff",
  },
  uploadBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "1px solid #c7d2fe",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  removePicBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    padding: "5px 12px",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  picHint: { fontSize: "11px", color: "#9ca3af" },
  profileForm: { flex: 1 },
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
  roleDisplay: {
    display: "inline-flex",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
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
  salarySectionBox: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "14px",
  },
  salarySectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "14px",
  },
  salaryGradeTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  salaryGrades: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "14px",
  },
  gradeBtn: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "11.5px",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#6b7280",
    fontWeight: "500",
  },
  gradeBtnActive: {
    background: "#eef2ff",
    borderColor: "#6366f1",
    color: "#6366f1",
    fontWeight: "700",
  },
  calcBreakdown: {
    background: "#fff",
    border: "1px solid #e5e7f0",
    borderRadius: "10px",
    padding: "14px",
  },
  calcTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "12px",
  },
  calcGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  calcSection: {},
  calcSectionTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: "8px",
  },
  calcRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
    borderBottom: "1px solid #f8fafc",
  },
  calcLabel: { fontSize: "12px", color: "#6b7280" },
  calcVal: { fontSize: "12px", fontWeight: "600", color: "#0f1117" },
  salaryPreview: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "16px",
  },
  salaryPreviewTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: "10px",
  },
  salaryPreviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px",
  },
  salaryPreviewItem: { textAlign: "center" },
  teamList: { display: "flex", flexDirection: "column", gap: "10px" },
  teamRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
  },
  teamLeft: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
  teamAvatarImg: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    objectFit: "cover",
    flexShrink: 0,
  },
  teamAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    flexShrink: 0,
  },
  teamInfo: { flex: 1 },
  teamName: { fontSize: "14px", fontWeight: "700", color: "#0f1117" },
  teamMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
    flexWrap: "wrap",
  },
  teamRoleBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  teamDept: { fontSize: "11px", color: "#6b7280" },
  teamId: { fontSize: "11px", color: "#9ca3af" },
  teamEmail: { fontSize: "11.5px", color: "#9ca3af", marginTop: "2px" },
  teamSalaryInfo: { display: "flex", gap: "16px", flexShrink: 0 },
  teamSalaryItem: { textAlign: "center", minWidth: "80px" },
  teamSalaryLabel: {
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600",
    marginBottom: "3px",
  },
  teamSalaryVal: { fontSize: "13px", fontWeight: "700" },
  teamActions: { display: "flex", gap: "8px", flexShrink: 0 },
  editBtn: {
    background: "#eef2ff",
    color: "#6366f1",
    border: "none",
    borderRadius: "7px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  removeBtn: {
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  securityItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "#f8f9fc",
    borderRadius: "10px",
    marginBottom: "10px",
    border: "1px solid #e5e7f0",
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
    width: "700px",
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
};
