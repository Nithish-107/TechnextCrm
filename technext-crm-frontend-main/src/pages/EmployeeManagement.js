import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const DEPARTMENTS = [
  "Management",
  "Recruitment",
  "Sales",
  "HR",
  "Operations",
  "Technology",
  "Finance",
  "Marketing",
];
const ROLES = ["Admin", "HR Manager", "Recruiter", "Sales", "Staff"];
const LOCATIONS = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Remote",
];
const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank",
  "Yes Bank",
  "IndusInd Bank",
  "Federal Bank",
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchVal, setSearchVal] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === "Admin";
  const isHR = ["Admin", "HR Manager"].includes(currentUser.role);

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "Staff",
    employeeId: "",
    department: "Recruitment",
    joiningDate: "",
    workLocation: "Bangalore",
    basicSalary: "",
    phone: "",
    dateOfBirth: "",
    panNumber: "",
    bankAccount: "",
    bankName: "",
    ifscCode: "",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios
      .get(`${BASE_URL}/users`)
      .then((r) => {
        setEmployees(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const generateEmployeeId = (empList) => {
    const maxId = empList.reduce((max, emp) => {
      const num =
        parseInt(
          (emp.employeeId || emp.employee_id || "TN000").replace("TN", ""),
        ) || 0;
      return num > max ? num : max;
    }, 0);
    return `TN${String(maxId + 1).padStart(3, "0")}`;
  };

  const handleAdd = () => {
    setEditItem(null);
    setForm({
      ...emptyForm,
      employeeId: generateEmployeeId(employees),
      joiningDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
    setSavedMsg("");
  };

  const handleEdit = (emp) => {
    setEditItem(emp);
    setForm({
      name: emp.name || "",
      email: emp.email || "",
      password: "",
      role: emp.role || "Staff",
      employeeId: emp.employeeId || emp.employee_id || "",
      department: emp.department || "Recruitment",
      joiningDate: emp.joiningDate || emp.joining_date || "",
      workLocation: emp.workLocation || emp.work_location || "Bangalore",
      basicSalary: emp.basicSalary || emp.basic_salary || "",
      phone: emp.phone || "",
      dateOfBirth: emp.dateOfBirth || emp.date_of_birth || "",
      panNumber: emp.panNumber || emp.pan_number || "",
      bankAccount: emp.bankAccount || emp.bank_account || "",
      bankName: emp.bankName || emp.bank_name || "",
      ifscCode: emp.ifscCode || emp.ifsc_code || "",
      isActive: emp.isActive !== undefined ? emp.isActive : true,
    });
    setShowModal(true);
    setSavedMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editItem) {
        await axios.put(`${BASE_URL}/users/${editItem.id}`, payload);
        setSavedMsg("✅ Employee updated successfully!");
      } else {
        const res = await axios.post(`${BASE_URL}/users`, payload);
        // Auto-initialize leave balance
        try {
          const newId = res.data?.user?.id || res.data?.id;
          if (newId) {
            await axios.post(`${BASE_URL}/leave-balance/initialize`, {
              employeeId: newId,
              employeeName: form.name,
            });
          }
        } catch (e) {}
        setSavedMsg("✅ Employee added! They can login now.");
      }
      fetchEmployees();
      setTimeout(() => {
        setShowModal(false);
        setSavedMsg("");
      }, 1500);
    } catch (err) {
      setSavedMsg(
        "⚠️ " + (err.response?.data?.message || "Error saving. Try again."),
      );
    }
    setSaving(false);
  };

  const handleDeactivate = async (emp) => {
    if (
      window.confirm(
        `${emp.isActive !== false ? "Deactivate" : "Activate"} ${emp.name}?`,
      )
    ) {
      await axios.put(`${BASE_URL}/users/${emp.id}`, {
        ...emp,
        isActive: emp.isActive === false,
      });
      fetchEmployees();
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "Admin":
        return { bg: "#fef2f2", color: "#ef4444" };
      case "HR Manager":
        return { bg: "#f5f3ff", color: "#8b5cf6" };
      case "Recruiter":
        return { bg: "#f0fdf4", color: "#10b981" };
      case "Sales":
        return { bg: "#eff6ff", color: "#3b82f6" };
      default:
        return { bg: "#f9fafb", color: "#6b7280" };
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
      "#ec4899",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const calcNetSalary = (basic) => {
    if (!basic) return 0;
    const b = parseFloat(basic);
    const gross = Math.round(b + b * 0.4 + 2000 + 1250 + b * 0.15);
    const deductions = Math.round(
      b * 0.12 + (b <= 15000 ? 150 : 200) + (b > 50000 ? gross * 0.1 : 0),
    );
    return gross - deductions;
  };

  const filtered = employees.filter((emp) => {
    const matchSearch =
      !searchVal ||
      emp.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchVal.toLowerCase()) ||
      (emp.employeeId || emp.employee_id)
        ?.toLowerCase()
        .includes(searchVal.toLowerCase());
    const matchDept = filterDept === "All" || emp.department === filterDept;
    const matchRole = filterRole === "All" || emp.role === filterRole;
    const matchActive =
      activeTab === "all"
        ? true
        : activeTab === "active"
          ? emp.isActive !== false
          : emp.isActive === false;
    return matchSearch && matchDept && matchRole && matchActive;
  });

  if (!isHR)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "48px" }}>🔒</div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f1117" }}>
          Access Restricted
        </div>
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>
          Only Admin and HR Manager can manage employees
        </div>
      </div>
    );

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
          Loading employees...
        </div>
      </div>
    );

  // Select style with full browser native dropdown
  const selectStyle = {
    padding: "10px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    color: "#0f1117",
    cursor: "pointer",
    appearance: "auto",
    WebkitAppearance: "menulist",
    MozAppearance: "menulist",
  };

  const inputStyle = {
    padding: "10px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    color: "#0f1117",
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>👥 Employee Management</div>
          <div style={s.sub}>Add, edit and manage all team members</div>
        </div>
        <div style={s.headerRight}>
          <button style={s.addBtn} onClick={handleAdd}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          {
            label: "Total",
            value: employees.length,
            icon: "👥",
            color: "#6366f1",
            bg: "#eef2ff",
          },
          {
            label: "Active",
            value: employees.filter((e) => e.isActive !== false).length,
            icon: "✅",
            color: "#10b981",
            bg: "#f0fdf4",
          },
          {
            label: "Inactive",
            value: employees.filter((e) => e.isActive === false).length,
            icon: "⛔",
            color: "#ef4444",
            bg: "#fef2f2",
          },
          {
            label: "Departments",
            value: new Set(employees.map((e) => e.department).filter(Boolean))
              .size,
            icon: "🏢",
            color: "#8b5cf6",
            bg: "#f5f3ff",
          },
          {
            label: "Avg Salary",
            value: `₹${employees.length > 0 ? Math.round(employees.reduce((s, e) => s + parseFloat(e.basicSalary || e.basic_salary || 0), 0) / employees.length).toLocaleString("en-IN") : "0"}`,
            icon: "💰",
            color: "#f59e0b",
            bg: "#fffbeb",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{ ...s.statCard, borderTop: `3px solid ${stat.color}` }}
          >
            <div style={{ ...s.statIcon, background: stat.bg }}>
              {stat.icon}
            </div>
            <div style={{ ...s.statVal, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filterBar}>
        <div style={s.searchWrap}>
          <span style={{ fontSize: "13px" }}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search by name, email, ID..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          {searchVal && (
            <span
              style={{ cursor: "pointer", color: "#9ca3af", fontSize: "12px" }}
              onClick={() => setSearchVal("")}
            >
              ✕
            </span>
          )}
        </div>
        <select
          style={s.filterSel}
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          style={s.filterSel}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <div style={s.tabGrp}>
          {["all", "active", "inactive"].map((tab) => (
            <button
              key={tab}
              style={{
                ...s.tabBtn,
                ...(activeTab === tab ? s.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={s.content}>
        {filtered.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>👥</div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#0f1117",
                marginBottom: "6px",
              }}
            >
              No employees found
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            >
              Add your first team member
            </div>
            <button style={s.addBtn} onClick={handleAdd}>
              + Add Employee
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7f0",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fc" }}>
                  {[
                    "Employee",
                    "ID",
                    "Department",
                    "Role",
                    "Joining Date",
                    "Phone",
                    "Basic Salary",
                    "Net Salary",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 14px",
                        fontSize: "10.5px",
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
                {filtered.map((emp) => {
                  const rc = getRoleStyle(emp.role);
                  const isActive = emp.isActive !== false;
                  const basic = parseFloat(
                    emp.basicSalary || emp.basic_salary || 0,
                  );
                  return (
                    <tr
                      key={emp.id}
                      style={{
                        borderBottom: "1px solid #f1f3f9",
                        opacity: isActive ? 1 : 0.6,
                      }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: getAvatarColor(emp.name),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {emp.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#0f1117",
                                cursor: "pointer",
                              }}
                              onClick={() => setViewItem(emp)}
                            >
                              {emp.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            background: "#eef2ff",
                            color: "#6366f1",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "3px 9px",
                            borderRadius: "20px",
                          }}
                        >
                          {emp.employeeId || emp.employee_id || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {emp.department || "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            ...rc,
                            fontSize: "11.5px",
                            fontWeight: "700",
                            padding: "3px 9px",
                            borderRadius: "20px",
                          }}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {emp.joiningDate || emp.joining_date || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {emp.phone || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontWeight: "700",
                          color: "#6366f1",
                          fontSize: "13px",
                        }}
                      >
                        {basic > 0 ? `₹${basic.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontWeight: "700",
                          color: "#10b981",
                          fontSize: "13px",
                        }}
                      >
                        {basic > 0
                          ? `₹${calcNetSalary(basic).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: "700",
                            padding: "3px 9px",
                            borderRadius: "20px",
                            background: isActive ? "#f0fdf4" : "#fef2f2",
                            color: isActive ? "#10b981" : "#ef4444",
                          }}
                        >
                          {isActive ? "🟢 Active" : "🔴 Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            style={{
                              background: "#eef2ff",
                              color: "#6366f1",
                              border: "none",
                              borderRadius: "7px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                            onClick={() => handleEdit(emp)}
                          >
                            ✏️ Edit
                          </button>
                          {isAdmin && (
                            <button
                              style={{
                                background: isActive ? "#fef2f2" : "#f0fdf4",
                                color: isActive ? "#ef4444" : "#10b981",
                                border: "none",
                                borderRadius: "7px",
                                padding: "5px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                              onClick={() => handleDeactivate(emp)}
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
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

      {/* View Employee Modal */}
      {viewItem && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: "500px" }}>
            <div style={s.modalHead}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: getAvatarColor(viewItem.name),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {viewItem.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#0f1117",
                    }}
                  >
                    {viewItem.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {viewItem.employeeId || viewItem.employee_id} ·{" "}
                    {viewItem.role}
                  </div>
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setViewItem(null)}>
                ✕
              </button>
            </div>
            <div
              style={{
                padding: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              {[
                { label: "Email", value: viewItem.email },
                { label: "Phone", value: viewItem.phone || "—" },
                { label: "Department", value: viewItem.department || "—" },
                {
                  label: "Work Location",
                  value: viewItem.workLocation || viewItem.work_location || "—",
                },
                {
                  label: "Joining Date",
                  value: viewItem.joiningDate || viewItem.joining_date || "—",
                },
                {
                  label: "Date of Birth",
                  value: viewItem.dateOfBirth || viewItem.date_of_birth || "—",
                },
                {
                  label: "Basic Salary",
                  value:
                    viewItem.basicSalary || viewItem.basic_salary
                      ? `₹${parseFloat(viewItem.basicSalary || viewItem.basic_salary).toLocaleString("en-IN")}`
                      : "—",
                },
                {
                  label: "Net Salary",
                  value:
                    viewItem.basicSalary || viewItem.basic_salary
                      ? `₹${calcNetSalary(viewItem.basicSalary || viewItem.basic_salary).toLocaleString("en-IN")}`
                      : "—",
                },
                {
                  label: "PAN Number",
                  value: viewItem.panNumber || viewItem.pan_number || "—",
                },
                {
                  label: "Bank Account",
                  value: viewItem.bankAccount || viewItem.bank_account || "—",
                },
                {
                  label: "Bank Name",
                  value: viewItem.bankName || viewItem.bank_name || "—",
                },
                {
                  label: "IFSC Code",
                  value: viewItem.ifscCode || viewItem.ifsc_code || "—",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    background: "#f8f9fc",
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: "4px",
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f1117",
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}
            >
              <button
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "9px",
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setViewItem(null);
                  handleEdit(viewItem);
                }}
              >
                ✏️ Edit Employee
              </button>
              <button
                style={{
                  background: "#f8f9fc",
                  border: "1px solid #e5e7f0",
                  color: "#6b7280",
                  borderRadius: "9px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={() => setViewItem(null)}
              >
                Close
              </button>
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
                  {editItem ? "✏️ Edit Employee" : "➕ Add New Employee"}
                </div>
                <div style={s.modalSub}>
                  {editItem
                    ? `Editing ${editItem.name}`
                    : "Fill in all employee details"}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              {/* PERSONAL DETAILS */}
              <div style={s.sectionHead}>👤 Personal Details</div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Full Name *</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Phone Number</label>
                  <input
                    style={inputStyle}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Email Address *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@technext.in"
                    required
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Date of Birth</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      setForm({ ...form, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>
                    {editItem
                      ? "New Password (blank = keep current)"
                      : "Password *"}
                  </label>
                  <input
                    style={inputStyle}
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    {...(!editItem ? { required: true } : {})}
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Work Location</label>
                  <select
                    style={selectStyle}
                    value={form.workLocation}
                    onChange={(e) =>
                      setForm({ ...form, workLocation: e.target.value })
                    }
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* JOB DETAILS */}
              <div style={s.sectionHead}>💼 Job Details</div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Employee ID (Auto-generated)</label>
                  <input
                    style={{
                      ...inputStyle,
                      background: "#f0fdf4",
                      fontWeight: "700",
                      color: "#10b981",
                      border: "1.5px solid #bbf7d0",
                    }}
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm({ ...form, employeeId: e.target.value })
                    }
                    placeholder="e.g. TN008"
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Role / Designation *</label>
                  <select
                    style={selectStyle}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Department *</label>
                  <select
                    style={selectStyle}
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Joining Date *</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      setForm({ ...form, joiningDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* SALARY DETAILS */}
              <div style={s.sectionHead}>💰 Salary Details</div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Basic Salary (₹) *</label>
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.basicSalary}
                    onChange={(e) =>
                      setForm({ ...form, basicSalary: e.target.value })
                    }
                    placeholder="e.g. 65000"
                    required
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Estimated Net Salary</label>
                  <div
                    style={{
                      ...inputStyle,
                      background: "#f0fdf4",
                      color: "#10b981",
                      fontWeight: "800",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      border: "1.5px solid #bbf7d0",
                    }}
                  >
                    {form.basicSalary
                      ? `₹${calcNetSalary(form.basicSalary).toLocaleString("en-IN")}`
                      : "Enter basic salary →"}
                  </div>
                </div>
              </div>

              {/* Salary Breakdown */}
              {form.basicSalary && (
                <div
                  style={{
                    background: "#f8f9fc",
                    borderRadius: "10px",
                    border: "1px solid #e5e7f0",
                    padding: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: "10px",
                    }}
                  >
                    Auto-calculated breakdown:
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                    }}
                  >
                    {[
                      {
                        label: "Basic",
                        val: parseFloat(form.basicSalary),
                        type: "earn",
                      },
                      {
                        label: "HRA (40%)",
                        val: Math.round(parseFloat(form.basicSalary) * 0.4),
                        type: "earn",
                      },
                      { label: "Transport", val: 2000, type: "earn" },
                      { label: "Medical", val: 1250, type: "earn" },
                      {
                        label: "Special (15%)",
                        val: Math.round(parseFloat(form.basicSalary) * 0.15),
                        type: "earn",
                      },
                      {
                        label: "PF (12%)",
                        val: Math.round(parseFloat(form.basicSalary) * 0.12),
                        type: "deduct",
                      },
                      {
                        label: "Professional Tax",
                        val: parseFloat(form.basicSalary) <= 15000 ? 150 : 200,
                        type: "deduct",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          padding: "5px 8px",
                          background: "#fff",
                          borderRadius: "6px",
                          border: "1px solid #f1f3f9",
                        }}
                      >
                        <span style={{ color: "#6b7280" }}>{item.label}</span>
                        <span
                          style={{
                            fontWeight: "700",
                            color: item.type === "earn" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {item.type === "earn" ? "+" : "-"}₹
                          {item.val.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BANK & COMPLIANCE */}
              <div style={s.sectionHead}>🏦 Bank & Compliance</div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>PAN Number</label>
                  <input
                    style={inputStyle}
                    value={form.panNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        panNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Bank Account Number</label>
                  <input
                    style={inputStyle}
                    value={form.bankAccount}
                    onChange={(e) =>
                      setForm({ ...form, bankAccount: e.target.value })
                    }
                    placeholder="Account number"
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Bank Name</label>
                  <select
                    style={selectStyle}
                    value={form.bankName}
                    onChange={(e) =>
                      setForm({ ...form, bankName: e.target.value })
                    }
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>IFSC Code</label>
                  <input
                    style={inputStyle}
                    value={form.ifscCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                </div>
              </div>

              {/* Status message */}
              {savedMsg && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "9px",
                    background: savedMsg.includes("✅") ? "#f0fdf4" : "#fef2f2",
                    color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "14px",
                  }}
                >
                  {savedMsg}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "14px",
                  borderTop: "1px solid #e5e7f0",
                }}
              >
                <button
                  type="button"
                  style={{
                    background: "#fff",
                    color: "#6b7280",
                    border: "1.5px solid #e5e7f0",
                    borderRadius: "9px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
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
                  }}
                  disabled={saving}
                >
                  {saving
                    ? "⏳ Saving..."
                    : editItem
                      ? "💾 Update Employee"
                      : "✅ Add Employee"}
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
  addBtn: {
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
  statsRow: {
    display: "flex",
    gap: "12px",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 20px",
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    flex: 1,
    minWidth: "100px",
    textAlign: "center",
  },
  statIcon: {
    fontSize: "20px",
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
  },
  statVal: { fontSize: "22px", fontWeight: "800", letterSpacing: "-1px" },
  statLabel: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "3px",
  },
  filterBar: {
    display: "flex",
    gap: "10px",
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "9px",
    padding: "8px 12px",
    flex: 1,
    minWidth: "200px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#0f1117",
    width: "100%",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  filterSel: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    cursor: "pointer",
    color: "#374151",
  },
  tabGrp: {
    display: "flex",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  tabBtn: {
    background: "none",
    border: "none",
    padding: "7px 14px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  tabBtnActive: { background: "#6366f1", color: "#fff", fontWeight: "700" },
  content: { flex: 1, overflowY: "auto", padding: "16px" },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "50vh",
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
    width: "640px",
    maxHeight: "94vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalHead: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  sectionHead: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "14px",
    marginTop: "4px",
    paddingBottom: "8px",
    borderBottom: "2px solid #eef2ff",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  fg: { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
};
