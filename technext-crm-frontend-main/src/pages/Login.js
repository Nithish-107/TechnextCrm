import React, { useState } from "react";
import axios from "axios";
import logo from "../logo.jpg";

const BASE_URL = "http://localhost:8080/api";

export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff",
  });
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/users/login`, loginForm);
      if (res.data.success) {
        // Save JWT token and user
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        setLoginError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    if (registerForm.password.length < 6) {
      setRegisterError("Password must be at least 6 characters");
      return;
    }
    if (registerForm.role === "Admin") {
      setRegisterError(
        "Cannot self-register as Admin. Contact your administrator.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/users`, {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
      });
      if (res.data.success) {
        setRegisterSuccess("Account created successfully! You can now login.");
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "Staff",
        });
        setTimeout(() => setTab("login"), 2000);
      } else {
        setRegisterError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setRegisterError(
        err.response?.data?.message ||
          "Registration failed. Email may already exist.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left Panel */}
      <div style={s.leftPanel}>
        <div style={s.leftContent}>
          <div style={s.brandWrap}>
            <div style={s.logoWrap}>
              <img src={logo} alt="TechNext" style={s.logoImg} />
            </div>
            <div style={s.brandName}>TechNext Staffing</div>
            <div style={s.brandSub}>CRM Portal</div>
          </div>
          <div style={s.tagline}>
            Your complete staffing management platform
          </div>
          <div style={s.features}>
            {[
              { icon: "👤", text: "Manage Leads & Contacts" },
              { icon: "🪪", text: "Track Candidates & Placements" },
              { icon: "📋", text: "Post & Manage Job Orders" },
              { icon: "📊", text: "Real-time Analytics & Reports" },
              { icon: "🏆", text: "Track Placements & Revenue" },
              { icon: "🗓️", text: "Calendar & Invoice Generator" },
              { icon: "🎯", text: "Goals & Team Performance" },
              { icon: "🔐", text: "JWT Secured & Role-based Access" },
            ].map((f, i) => (
              <div key={i} style={s.feature}>
                <span style={s.featureIcon}>{f.icon}</span>
                <span style={s.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.rightPanel}>
        <div style={s.card}>
          {/* Tabs */}
          <div style={s.tabs}>
            <button
              style={{ ...s.tab, ...(tab === "login" ? s.tabActive : {}) }}
              onClick={() => {
                setTab("login");
                setLoginError("");
              }}
            >
              Sign In
            </button>
            <button
              style={{ ...s.tab, ...(tab === "register" ? s.tabActive : {}) }}
              onClick={() => {
                setTab("register");
                setRegisterError("");
                setRegisterSuccess("");
              }}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <div style={s.formWrap}>
              <div style={s.formTitle}>Welcome back! 👋</div>
              <div style={s.formSub}>Sign in to your TechNext CRM account</div>
              {loginError && <div style={s.errorBox}>⚠️ {loginError}</div>}
              <form onSubmit={handleLogin}>
                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Password</label>
                  <input
                    style={s.input}
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" style={s.submitBtn} disabled={loading}>
                  {loading ? "⏳ Signing in..." : "🔐 Sign In Securely"}
                </button>
              </form>
              <div style={s.demoAccounts}>
                <div style={s.demoTitle}>Demo Accounts</div>
                <div style={s.demoGrid}>
                  {[
                    {
                      email: "admin@technext.in",
                      pass: "admin123",
                      role: "Admin",
                      color: "#ef4444",
                    },
                    {
                      email: "ria@technext.in",
                      pass: "ria123",
                      role: "Recruiter",
                      color: "#10b981",
                    },
                    {
                      email: "sam@technext.in",
                      pass: "sam123",
                      role: "Sales",
                      color: "#3b82f6",
                    },
                    {
                      email: "priya@technext.in",
                      pass: "priya123",
                      role: "HR Manager",
                      color: "#8b5cf6",
                    },
                  ].map((acc) => (
                    <div
                      key={acc.email}
                      style={s.demoItem}
                      onClick={() =>
                        setLoginForm({ email: acc.email, password: acc.pass })
                      }
                    >
                      <span style={{ ...s.demoRole, color: acc.color }}>
                        {acc.role}
                      </span>
                      <span style={s.demoEmail}>{acc.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <div style={s.formWrap}>
              <div style={s.formTitle}>Create Account</div>
              <div style={s.formSub}>Join your TechNext CRM team</div>
              {registerError && (
                <div style={s.errorBox}>⚠️ {registerError}</div>
              )}
              {registerSuccess && (
                <div style={s.successBox}>✅ {registerSuccess}</div>
              )}
              <form onSubmit={handleRegister}>
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name</label>
                  <input
                    style={s.input}
                    placeholder="Your full name"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="your@technext.in"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Password</label>
                    <input
                      style={s.input}
                      type="password"
                      placeholder="Min 6 chars"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Confirm Password</label>
                    <input
                      style={s.input}
                      type="password"
                      placeholder="Repeat password"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Role</label>
                  <select
                    style={s.input}
                    value={registerForm.role}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, role: e.target.value })
                    }
                  >
                    <option>Staff</option>
                    <option>Recruiter</option>
                    <option>Sales</option>
                    <option>HR Manager</option>
                  </select>
                  <div style={s.roleNote}>
                    {registerForm.role === "Recruiter"
                      ? "📋 Access: Candidates, Jobs, Placements, Tasks, Meetings"
                      : registerForm.role === "Sales"
                        ? "💼 Access: Leads, Contacts, Accounts, Deals"
                        : registerForm.role === "HR Manager"
                          ? "👥 Access: Candidates, Jobs, Reports, Analytics"
                          : "✅ Access: Tasks and Meetings only"}
                  </div>
                </div>
                <button type="submit" style={s.submitBtn} disabled={loading}>
                  {loading ? "⏳ Creating..." : "✨ Create Account"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div style={s.securityBadge}>
          🔐 Secured with JWT Authentication · Role-based Access Control
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg,#0f1117 0%,#1a1d27 50%,#0f1117 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  },
  leftContent: { maxWidth: "420px", zIndex: 1 },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "28px",
  },
  logoWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#fff",
    padding: "4px",
    overflow: "hidden",
    flexShrink: 0,
  },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  brandName: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  brandSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginTop: "2px",
  },
  tagline: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "28px",
    lineHeight: "1.6",
  },
  features: { display: "flex", flexDirection: "column", gap: "12px" },
  feature: { display: "flex", alignItems: "center", gap: "12px" },
  featureIcon: {
    fontSize: "18px",
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "rgba(99,102,241,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: "13.5px",
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },
  rightPanel: {
    width: "480px",
    minWidth: "480px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#f8f9fc",
    overflowY: "auto",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
    border: "1px solid #e5e7f0",
  },
  tabs: { display: "flex", borderBottom: "1px solid #e5e7f0" },
  tab: {
    flex: 1,
    padding: "16px",
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "#9ca3af",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  tabActive: {
    color: "#6366f1",
    borderBottom: "2px solid #6366f1",
    background: "#fafbff",
  },
  formWrap: { padding: "24px" },
  formTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f1117",
    marginBottom: "4px",
  },
  formSub: { fontSize: "13px", color: "#9ca3af", marginBottom: "20px" },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    marginBottom: "16px",
  },
  successBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    marginBottom: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
  },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
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
  roleNote: {
    fontSize: "11.5px",
    color: "#6b7280",
    marginTop: "5px",
    padding: "6px 10px",
    background: "#f8f9fc",
    borderRadius: "6px",
    border: "1px solid #e5e7f0",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
    marginTop: "4px",
    transition: "all 0.15s",
  },
  demoAccounts: {
    marginTop: "20px",
    padding: "14px",
    background: "#f8f9fc",
    borderRadius: "10px",
    border: "1px solid #e5e7f0",
  },
  demoTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  demoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
  demoItem: {
    padding: "8px 10px",
    background: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    border: "1px solid #e5e7f0",
    transition: "all 0.1s",
  },
  demoRole: {
    fontSize: "11px",
    fontWeight: "700",
    display: "block",
    marginBottom: "2px",
  },
  demoEmail: { fontSize: "10px", color: "#9ca3af" },
  securityBadge: {
    marginTop: "16px",
    fontSize: "11px",
    color: "#9ca3af",
    textAlign: "center",
  },
};
