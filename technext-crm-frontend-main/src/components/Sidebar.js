import React, { useState } from "react";
import logo from "../logo.jpg";

function Sidebar({ user, activePage, onNavigate, onLogout }) {
  const [salesOpen, setSalesOpen] = useState(true);
  const [recruitOpen, setRecruitOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const role = user.role;

  const canAccess = (module) => {
    switch (role) {
      case "Admin":
        return true;
      case "Recruiter":
        return [
          "home",
          "candidates",
          "jobs",
          "placements",
          "tasks",
          "meetings",
          "calls",
          "reports",
          "calendar",
          "invoice",
          "goals",
          "notes",
          "analytics",
          "payslips",
          "interviews",
          "chat",
          "leaves",
          "attendance",
        ].includes(module);
      case "Sales":
        return [
          "home",
          "leads",
          "contacts",
          "accounts",
          "deals",
          "tasks",
          "meetings",
          "calls",
          "reports",
          "calendar",
          "goals",
          "notes",
          "payslips",
          "chat",
          "leaves",
          "attendance",
        ].includes(module);
      case "HR Manager":
        return [
          "home",
          "candidates",
          "jobs",
          "placements",
          "meetings",
          "tasks",
          "reports",
          "analytics",
          "calendar",
          "invoice",
          "goals",
          "notes",
          "payslips",
          "interviews",
          "chat",
          "leaves",
          "attendance",
          "employees",
        ].includes(module);
      case "Staff":
        return [
          "home",
          "tasks",
          "meetings",
          "calendar",
          "notes",
          "payslips",
          "chat",
          "leaves",
          "attendance",
        ].includes(module);
      default:
        return false;
    }
  };

  const allModules = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "leads", label: "Leads", icon: "👤" },
    { id: "contacts", label: "Contacts", icon: "📇" },
    { id: "accounts", label: "Accounts", icon: "🏢" },
    { id: "deals", label: "Deals", icon: "🤝" },
    { id: "jobs", label: "Job Orders", icon: "📋" },
    { id: "candidates", label: "Candidates", icon: "🪪" },
    { id: "placements", label: "Placements", icon: "🏆" },
    { id: "interviews", label: "Interviews", icon: "🎤" },
    { id: "tasks", label: "Tasks", icon: "✅" },
    { id: "meetings", label: "Meetings", icon: "📅" },
    { id: "calls", label: "Calls", icon: "📞" },
    { id: "reports", label: "Reports", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "calendar", label: "Calendar", icon: "🗓️" },
    { id: "invoice", label: "Invoice", icon: "🧾" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "payslips", label: "Payslips", icon: "💵" },
    { id: "leaves", label: "Leave Management", icon: "🌴" },
    { id: "attendance", label: "Attendance", icon: "⏰" },
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "employees", label: "Employees", icon: "👥" },
  ].filter((m) => canAccess(m.id));

  const suggestions = searchVal.trim()
    ? allModules.filter((m) =>
        m.label.toLowerCase().includes(searchVal.toLowerCase()),
      )
    : [];

  const getIcon = (id) => {
    const icons = {
      home: "🏠",
      leads: "👤",
      contacts: "📇",
      accounts: "🏢",
      deals: "🤝",
      forecasts: "🎯",
      documents: "📄",
      campaigns: "📢",
      jobs: "📋",
      candidates: "🪪",
      placements: "🏆",
      tasks: "✅",
      meetings: "📅",
      calls: "📞",
      reports: "📊",
      analytics: "📈",
      workqueue: "⚡",
      settings: "⚙️",
      calendar: "🗓️",
      invoice: "🧾",
      goals: "🎯",
      notes: "📝",
      payslips: "💵",
      interviews: "🎤",
      chat: "💬",
      leaves: "🌴",
      attendance: "⏰",
    };
    return icons[id] || "📌";
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "Admin":
        return { bg: "rgba(239,68,68,0.15)", color: "#fca5a5", dot: "#ef4444" };
      case "Recruiter":
        return {
          bg: "rgba(16,185,129,0.15)",
          color: "#6ee7b7",
          dot: "#10b981",
        };
      case "Sales":
        return {
          bg: "rgba(59,130,246,0.15)",
          color: "#93c5fd",
          dot: "#3b82f6",
        };
      case "HR Manager":
        return {
          bg: "rgba(139,92,246,0.15)",
          color: "#c4b5fd",
          dot: "#8b5cf6",
        };
      default:
        return {
          bg: "rgba(107,114,128,0.15)",
          color: "#d1d5db",
          dot: "#6b7280",
        };
    }
  };

  const roleStyle = getRoleStyle(role);

  const MenuItem = ({ id, label }) => {
    if (!canAccess(id)) return null;
    const active = activePage === id;
    return (
      <div
        onClick={() => onNavigate(id)}
        style={{ ...s.menuItem, ...(active ? s.menuItemActive : {}) }}
      >
        <span style={s.menuIcon}>{getIcon(id)}</span>
        <span
          style={{
            ...s.menuLabel,
            ...(active ? { color: "#fff", fontWeight: 600 } : {}),
          }}
        >
          {label}
        </span>
        {active && <div style={s.activeIndicator} />}
      </div>
    );
  };

  const SectionHeader = ({ label, isOpen, onToggle }) => (
    <div style={s.sectionHeader} onClick={onToggle}>
      <span style={s.sectionLabel}>{label}</span>
      <span
        style={{
          ...s.sectionChev,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        ▾
      </span>
    </div>
  );

  return (
    <div style={s.sidebar}>
      <div style={s.top}>
        <div style={s.logoWrap}>
          <div style={s.logoImgWrap}>
            <img src={logo} alt="TechNext" style={s.logoImg} />
          </div>
          <div>
            <div style={s.logoName}>TechNext</div>
            <div style={s.logoSub}>CRM Portal</div>
          </div>
        </div>
      </div>

      <div style={s.searchContainer}>
        <div style={{ position: "relative", margin: "0 12px" }}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions.length > 0) {
                  onNavigate(suggestions[0].id);
                  setSearchVal("");
                  setShowSuggestions(false);
                }
                if (e.key === "Escape") {
                  setSearchVal("");
                  setShowSuggestions(false);
                }
              }}
            />
            {searchVal && (
              <span
                style={s.searchClear}
                onClick={() => {
                  setSearchVal("");
                  setShowSuggestions(false);
                }}
              >
                ✕
              </span>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div style={s.suggestions}>
              {suggestions.map((m) => (
                <div
                  key={m.id}
                  style={s.suggItem}
                  onMouseDown={() => {
                    onNavigate(m.id);
                    setSearchVal("");
                    setShowSuggestions(false);
                  }}
                >
                  <span style={{ marginRight: 8, fontSize: "14px" }}>
                    {getIcon(m.id)}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#0f1117",
                      fontWeight: "500",
                    }}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={s.scroll}>
        <div style={s.navSection}>
          <MenuItem id="home" label="Home" />
          {canAccess("chat") && <MenuItem id="chat" label="Team Chat" />}
        </div>

        {["leads", "contacts", "accounts", "deals"].some((m) =>
          canAccess(m),
        ) && (
          <div style={s.navSection}>
            <SectionHeader
              label="SALES"
              isOpen={salesOpen}
              onToggle={() => setSalesOpen(!salesOpen)}
            />
            {salesOpen && (
              <div style={s.sectionItems}>
                <MenuItem id="leads" label="Leads" />
                <MenuItem id="contacts" label="Contacts" />
                <MenuItem id="accounts" label="Accounts" />
                <MenuItem id="deals" label="Deals" />
              </div>
            )}
          </div>
        )}

        {[
          "jobs",
          "candidates",
          "placements",
          "interviews",
          "tasks",
          "meetings",
          "calls",
        ].some((m) => canAccess(m)) && (
          <div style={s.navSection}>
            <SectionHeader
              label="RECRUITMENT"
              isOpen={recruitOpen}
              onToggle={() => setRecruitOpen(!recruitOpen)}
            />
            {recruitOpen && (
              <div style={s.sectionItems}>
                {canAccess("jobs") && <MenuItem id="jobs" label="Job Orders" />}
                {canAccess("candidates") && (
                  <MenuItem id="candidates" label="Candidates" />
                )}
                {canAccess("placements") && (
                  <MenuItem id="placements" label="Placements" />
                )}
                {canAccess("interviews") && (
                  <MenuItem id="interviews" label="Interviews" />
                )}
                <MenuItem id="tasks" label="Tasks" />
                <MenuItem id="meetings" label="Meetings" />
                {canAccess("calls") && <MenuItem id="calls" label="Calls" />}
              </div>
            )}
          </div>
        )}

        {["leaves", "attendance", "payslips", "employees"].some((m) =>
          canAccess(m),
        ) && (
          <div style={s.navSection}>
            <SectionHeader
              label="HR"
              isOpen={hrOpen}
              onToggle={() => setHrOpen(!hrOpen)}
            />
            {hrOpen && (
              <div style={s.sectionItems}>
                {canAccess("leaves") && (
                  <MenuItem id="leaves" label="Leave Management" />
                )}
                {canAccess("attendance") && (
                  <MenuItem id="attendance" label="Attendance" />
                )}
                {canAccess("payslips") && (
                  <MenuItem id="payslips" label="Payslips" />
                )}
                {canAccess("employees") && (
                  <MenuItem id="employees" label="Employees" />
                )}
              </div>
            )}
          </div>
        )}

        {["reports", "analytics"].some((m) => canAccess(m)) && (
          <div style={s.navSection}>
            <SectionHeader
              label="INSIGHTS"
              isOpen={insightsOpen}
              onToggle={() => setInsightsOpen(!insightsOpen)}
            />
            {insightsOpen && (
              <div style={s.sectionItems}>
                {canAccess("reports") && (
                  <MenuItem id="reports" label="Reports" />
                )}
                {canAccess("analytics") && (
                  <MenuItem id="analytics" label="Analytics" />
                )}
              </div>
            )}
          </div>
        )}

        {["calendar", "invoice", "goals", "notes"].some((m) =>
          canAccess(m),
        ) && (
          <div style={s.navSection}>
            <SectionHeader
              label="TOOLS"
              isOpen={toolsOpen}
              onToggle={() => setToolsOpen(!toolsOpen)}
            />
            {toolsOpen && (
              <div style={s.sectionItems}>
                {canAccess("calendar") && (
                  <MenuItem id="calendar" label="Calendar" />
                )}
                {canAccess("invoice") && (
                  <MenuItem id="invoice" label="Invoice Generator" />
                )}
                {canAccess("goals") && (
                  <MenuItem id="goals" label="Targets & Goals" />
                )}
                {canAccess("notes") && (
                  <MenuItem id="notes" label="Internal Notes" />
                )}
              </div>
            )}
          </div>
        )}

        <div style={s.navSection}>
          <MenuItem id="settings" label="Settings" />
        </div>
      </div>

      <div style={s.bottom}>
        <div style={s.userCard}>
          <div style={s.userAvatarWrap}>
            <div style={s.userAvatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div style={{ ...s.userDot, background: roleStyle.dot }} />
          </div>
          <div style={s.userDetails}>
            <div style={s.userName}>{user.name}</div>
            <div style={{ ...s.userRolePill, background: roleStyle.bg }}>
              <span style={{ ...s.userRoleText, color: roleStyle.color }}>
                {role}
              </span>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={onLogout} title="Sign Out">
            <span style={{ fontSize: "14px" }}>↩</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  sidebar: {
    width: "234px",
    minWidth: "234px",
    background: "#0f1117",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  top: {
    padding: "18px 16px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "11px" },
  logoImgWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#fff",
    padding: "3px",
    flexShrink: 0,
    overflow: "hidden",
  },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  logoName: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginTop: "1px",
  },
  searchContainer: { padding: "12px 0 8px" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "9px",
    padding: "8px 11px",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  searchIcon: { fontSize: "12px", opacity: 0.5, flexShrink: 0 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "rgba(255,255,255,0.8)",
    fontSize: "12.5px",
    width: "100%",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  searchClear: {
    color: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    fontSize: "11px",
    flexShrink: 0,
  },
  suggestions: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    zIndex: 999,
    overflow: "hidden",
  },
  suggItem: {
    padding: "10px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  scroll: { flex: 1, overflowY: "auto", padding: "4px 0" },
  navSection: { padding: "4px 8px", marginBottom: "2px" },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 8px",
    cursor: "pointer",
    marginBottom: "2px",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "1.2px",
  },
  sectionChev: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    transition: "transform 0.2s",
  },
  sectionItems: { paddingLeft: "4px" },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "7px 9px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.15s",
    position: "relative",
    marginBottom: "1px",
  },
  menuItemActive: { background: "rgba(99,102,241,0.15)" },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "18px",
    background: "#6366f1",
    borderRadius: "0 3px 3px 0",
  },
  menuIcon: {
    fontSize: "14px",
    width: "18px",
    flexShrink: 0,
    textAlign: "center",
  },
  menuLabel: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
    flex: 1,
  },
  bottom: { padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "11px",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  userAvatarWrap: { position: "relative", flexShrink: 0 },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
  },
  userDot: {
    position: "absolute",
    bottom: "-1px",
    right: "-1px",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    border: "2px solid #0f1117",
  },
  userDetails: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: "12.5px",
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRolePill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "1px 7px",
    borderRadius: "20px",
    marginTop: "2px",
  },
  userRoleText: { fontSize: "10px", fontWeight: "700" },
  logoutBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.4)",
    flexShrink: 0,
  },
};

export default Sidebar;
// Sidebar already has employees in HR section via canAccess
