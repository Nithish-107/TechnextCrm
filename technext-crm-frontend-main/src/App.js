import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Candidates from "./pages/Candidates";
import Jobs from "./pages/Jobs";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Calls from "./pages/Calls";
import Contacts from "./pages/Contacts";
import Accounts from "./pages/Accounts";
import Deals from "./pages/Deals";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Workqueue from "./pages/Workqueue";
import Forecasts from "./pages/Forecasts";
import Documents from "./pages/Documents";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import Placements from "./pages/Placements";
import CalendarView from "./pages/CalendarView";
import InvoiceGenerator from "./pages/InvoiceGenerator";
import Goals from "./pages/Goals";
import Notes from "./pages/Notes";
import Payslips from "./pages/Payslips";
import InterviewScheduler from "./pages/InterviewScheduler";
import InternalChat from "./pages/InternalChat";
import LeaveManagement from "./pages/LeaveManagement";
import Attendance from "./pages/Attendance";
import EmployeeManagement from "./pages/EmployeeManagement";
import Sidebar from "./components/Sidebar";
import useNotifications from "./hooks/Notifications";
import useRecentlyViewed from "./hooks/useRecentlyViewed";
import useFavourites from "./hooks/useFavourites";

const PAGE_TITLES = {
  home: "Home",
  leads: "Leads",
  contacts: "Contacts",
  accounts: "Accounts",
  deals: "Deals",
  forecasts: "Forecasts",
  documents: "Documents",
  campaigns: "Campaigns",
  jobs: "Job Orders",
  candidates: "Candidates",
  tasks: "Tasks",
  meetings: "Meetings",
  calls: "Calls",
  reports: "Reports",
  analytics: "Analytics",
  workqueue: "Workqueue",
  settings: "Settings",
  placements: "Placements",
  calendar: "Calendar",
  invoice: "Invoice Generator",
  goals: "Targets & Goals",
  notes: "Internal Notes",
  payslips: "Payslips",
  interviews: "Interview Scheduler",
  chat: "Internal Chat",
  leaves: "Leave Management",
  attendance: "Attendance",
  employees: "Employee Management",
};

const PAGE_ICONS = {
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
  tasks: "✅",
  meetings: "📅",
  calls: "📞",
  reports: "📊",
  analytics: "📈",
  workqueue: "⚡",
  settings: "⚙️",
  placements: "🏆",
  calendar: "🗓️",
  invoice: "🧾",
  goals: "🎯",
  notes: "📝",
  payslips: "💵",
  interviews: "🎤",
  chat: "💬",
  leaves: "🌴",
  attendance: "⏰",
  employees: "👥",
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [activePage, setActivePage] = useState("home");
  const [searchVal, setSearchVal] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [toast, setToast] = useState(null);

  const { notifications, unreadCount, markAllRead, markRead } =
    useNotifications();
  const { recentItems, addRecentItem, clearRecent } = useRecentlyViewed();
  const { favourites, toggleFavourite, isFavourite } = useFavourites();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;
      if (e.ctrlKey || e.metaKey) return;
      switch (e.key) {
        case "?":
          setShowShortcuts(true);
          break;
        case "Escape":
          closeAll();
          setShowShortcuts(false);
          break;
        case "h":
        case "H":
          navigate("home");
          break;
        case "l":
        case "L":
          navigate("leads");
          break;
        case "c":
        case "C":
          navigate("candidates");
          break;
        case "j":
        case "J":
          navigate("jobs");
          break;
        case "t":
        case "T":
          navigate("tasks");
          break;
        case "m":
        case "M":
          navigate("meetings");
          break;
        case "p":
        case "P":
          navigate("placements");
          break;
        case "d":
        case "D":
          navigate("deals");
          break;
        case "r":
        case "R":
          navigate("reports");
          break;
        case "a":
        case "A":
          navigate("analytics");
          break;
        case "g":
        case "G":
          navigate("goals");
          break;
        case "n":
        case "N":
          navigate("notes");
          break;
        case "k":
        case "K":
          navigate("calendar");
          break;
        case "i":
        case "I":
          navigate("interviews");
          break;
        case "x":
        case "X":
          navigate("chat");
          break;
        case "y":
        case "Y":
          navigate("payslips");
          break;
        case "v":
        case "V":
          navigate("leaves");
          break;
        case "z":
        case "Z":
          navigate("attendance");
          break;
        case "e":
        case "E":
          navigate("employees");
          break;
        case "s":
        case "S":
          navigate("settings");
          break;
        case "/":
          e.preventDefault();
          document.querySelector(".search-input")?.focus();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const showToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };
  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    showToast(next ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };
  const navigate = (page) => {
    setActivePage(page);
    addRecentItem(page, PAGE_TITLES[page] || page, PAGE_ICONS[page] || "📌");
    if (isMobile) setSidebarOpen(false);
    closeAll();
  };
  const handleToggleFav = (page) => {
    const wasAdded = !isFavourite(page);
    toggleFavourite(page, PAGE_TITLES[page] || page, PAGE_ICONS[page] || "📌");
    showToast(
      wasAdded
        ? `⭐ ${PAGE_TITLES[page]} added to favourites`
        : `${PAGE_TITLES[page]} removed from favourites`,
    );
  };
  const handleLogin = (u) => {
    setUser(u);
    setActivePage("home");
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };
  const closeAll = () => {
    setShowNotif(false);
    setShowProfile(false);
    setShowQuickAdd(false);
    setShowRecent(false);
    setShowFavs(false);
    if (isMobile) setSidebarOpen(false);
  };

  const t = {
    bg: isDark ? "#0f1117" : "#f8f9fc",
    bgCard: isDark ? "#1a1d27" : "#ffffff",
    bgInput: isDark ? "#252836" : "#f8f9fc",
    border: isDark ? "rgba(255,255,255,0.08)" : "#e5e7f0",
    borderLight: isDark ? "rgba(255,255,255,0.05)" : "#f1f3f9",
    text: isDark ? "#e5e7eb" : "#0f1117",
    textSub: isDark ? "#9ca3af" : "#6b7280",
    topbar: isDark ? "#1a1d27" : "#ffffff",
    hover: isDark ? "rgba(255,255,255,0.05)" : "#f8f9fc",
  };

  const getRoleColor = (role) =>
    ({
      Admin: "#ef4444",
      Recruiter: "#10b981",
      Sales: "#3b82f6",
      "HR Manager": "#8b5cf6",
    })[role] || "#6b7280";

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <Dashboard user={user} onNavigate={navigate} />;
      case "leads":
        return <Leads />;
      case "contacts":
        return <Contacts />;
      case "accounts":
        return <Accounts />;
      case "deals":
        return <Deals />;
      case "forecasts":
        return <Forecasts />;
      case "documents":
        return <Documents />;
      case "campaigns":
        return <Campaigns />;
      case "candidates":
        return <Candidates />;
      case "jobs":
        return <Jobs />;
      case "tasks":
        return <Tasks />;
      case "meetings":
        return <Meetings />;
      case "calls":
        return <Calls />;
      case "reports":
        return <Reports />;
      case "analytics":
        return <Analytics />;
      case "workqueue":
        return <Workqueue />;
      case "settings":
        return <Settings />;
      case "placements":
        return <Placements />;
      case "calendar":
        return <CalendarView />;
      case "invoice":
        return <InvoiceGenerator />;
      case "goals":
        return <Goals />;
      case "notes":
        return <Notes />;
      case "payslips":
        return <Payslips />;
      case "interviews":
        return <InterviewScheduler />;
      case "chat":
        return <InternalChat />;
      case "leaves":
        return <LeaveManagement />;
      case "attendance":
        return <Attendance />;
      case "employees":
        return <EmployeeManagement />;
      default:
        return <Dashboard user={user} onNavigate={navigate} />;
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const quickAddItems = [
    { label: "Add Employee", icon: "👥", page: "employees" },
    { label: "New Lead", icon: "👤", page: "leads" },
    { label: "New Candidate", icon: "🪪", page: "candidates" },
    { label: "New Job", icon: "📋", page: "jobs" },
    { label: "New Deal", icon: "🤝", page: "deals" },
    { label: "Schedule Interview", icon: "🎤", page: "interviews" },
    { label: "Apply Leave", icon: "🌴", page: "leaves" },
    { label: "Mark Attendance", icon: "⏰", page: "attendance" },
    { label: "Invoice", icon: "🧾", page: "invoice" },
    { label: "Note", icon: "📝", page: "notes" },
  ];

  const shortcuts = [
    { key: "H", label: "Home" },
    { key: "L", label: "Leads" },
    { key: "C", label: "Candidates" },
    { key: "J", label: "Job Orders" },
    { key: "T", label: "Tasks" },
    { key: "M", label: "Meetings" },
    { key: "P", label: "Placements" },
    { key: "D", label: "Deals" },
    { key: "R", label: "Reports" },
    { key: "A", label: "Analytics" },
    { key: "G", label: "Goals" },
    { key: "N", label: "Notes" },
    { key: "K", label: "Calendar" },
    { key: "I", label: "Interviews" },
    { key: "X", label: "Chat" },
    { key: "Y", label: "Payslips" },
    { key: "V", label: "Leave Management" },
    { key: "Z", label: "Attendance" },
    { key: "E", label: "Employees" },
    { key: "S", label: "Settings" },
    { key: "/", label: "Search" },
    { key: "?", label: "Shortcuts" },
  ];

  const bottomNav = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "leads", icon: "👤", label: "Leads" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "leaves", icon: "🌴", label: "Leaves" },
    { id: "settings", icon: "⚙️", label: "More" },
  ];

  return (
    <div
      style={{
        ...st.app,
        background: t.bg,
        color: t.text,
        flexDirection: isMobile ? "column" : "row",
      }}
      onClick={closeAll}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{ ...st.toast, background: isDark ? "#1a1d27" : "#0f1117" }}
        >
          {toast.message}
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          style={st.shortcutsOverlay}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            style={{
              ...st.shortcutsModal,
              background: t.bgCard,
              border: `1px solid ${t.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ fontSize: "16px", fontWeight: "800", color: t.text }}
              >
                ⌨️ Keyboard Shortcuts
              </div>
              <button
                style={{
                  background: t.bgInput,
                  border: `1px solid ${t.border}`,
                  borderRadius: "8px",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  color: t.text,
                  fontSize: "14px",
                }}
                onClick={() => setShowShortcuts(false)}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {shortcuts.map((sh) => (
                <div
                  key={sh.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: t.bg,
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: t.textSub }}>
                    {sh.label}
                  </span>
                  <kbd
                    style={{
                      background: t.bgInput,
                      border: `1px solid ${t.border}`,
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: t.text,
                      fontFamily: "monospace",
                    }}
                  >
                    {sh.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMobile && sidebarOpen && (
        <div style={st.mobileOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div
        style={{
          ...st.sidebarWrap,
          ...(isMobile
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s ease",
                zIndex: 999,
                boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
              }
            : {}),
        }}
      >
        <Sidebar
          user={user}
          activePage={activePage}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      </div>

      <div
        style={{
          ...st.main,
          background: t.bg,
          ...(isMobile ? { width: "100%", paddingBottom: "64px" } : {}),
        }}
      >
        {/* Topbar */}
        <div
          style={{
            ...st.topbar,
            background: t.topbar,
            borderBottom: `1px solid ${t.border}`,
            padding: isMobile ? "0 12px" : "0 20px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isMobile && (
            <button
              style={st.hamburger}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <div style={{ ...st.hamLine, background: t.text }} />
              <div style={{ ...st.hamLine, background: t.text }} />
              <div style={{ ...st.hamLine, background: t.text }} />
            </button>
          )}

          <div style={st.tbLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>{PAGE_ICONS[activePage]}</span>
              <span
                style={{
                  fontSize: isMobile ? "14px" : "15px",
                  fontWeight: "700",
                  color: t.text,
                }}
              >
                {PAGE_TITLES[activePage]}
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  opacity: 0.7,
                  padding: "2px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFav(activePage);
                }}
              >
                {isFavourite(activePage) ? "⭐" : "☆"}
              </button>
            </div>
          </div>

          {!isMobile && (
            <div style={st.tbCenter}>
              <div
                style={{
                  ...st.searchBox,
                  background: t.bgInput,
                  border: `1.5px solid ${t.border}`,
                }}
              >
                <span style={{ fontSize: "13px" }}>🔍</span>
                <input
                  className="search-input"
                  style={{ ...st.searchInput, color: t.text }}
                  placeholder="Search... (press / to focus)"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchVal.trim()) {
                      const q = searchVal.toLowerCase();
                      const found = Object.keys(PAGE_TITLES).find(
                        (p) =>
                          PAGE_TITLES[p].toLowerCase().includes(q) ||
                          p.includes(q),
                      );
                      if (found) navigate(found);
                      setSearchVal("");
                    }
                  }}
                />
                {searchVal && (
                  <span
                    style={{
                      color: t.textSub,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                    onClick={() => setSearchVal("")}
                  >
                    ✕
                  </span>
                )}
                <kbd
                  style={{
                    background: t.bgInput,
                    border: `1px solid ${t.border}`,
                    borderRadius: "4px",
                    padding: "1px 5px",
                    fontSize: "10px",
                    color: t.textSub,
                    fontFamily: "monospace",
                    marginLeft: "4px",
                  }}
                >
                  /
                </kbd>
              </div>
            </div>
          )}

          <div style={{ ...st.tbRight, gap: isMobile ? "2px" : "4px" }}>
            {/* Quick Add */}
            <div style={{ position: "relative" }}>
              <button
                style={st.quickAdd}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowQuickAdd(!showQuickAdd);
                }}
              >
                +
              </button>
              {showQuickAdd && (
                <div
                  style={{
                    ...st.dropdown,
                    background: t.bgCard,
                    border: `1px solid ${t.border}`,
                    right: isMobile ? "-60px" : 0,
                    width: "280px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      ...st.dropHeader,
                      color: t.textSub,
                      borderBottom: `1px solid ${t.borderLight}`,
                    }}
                  >
                    Quick Add
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2px",
                      padding: "8px",
                    }}
                  >
                    {quickAddItems.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(item.page)}
                      >
                        <span style={{ fontSize: "16px" }}>{item.icon}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: t.text,
                            fontWeight: "500",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favourites */}
            {!isMobile && (
              <div style={{ position: "relative" }}>
                <button
                  style={st.iconBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAll();
                    setShowFavs(!showFavs);
                  }}
                >
                  <span style={{ fontSize: "16px" }}>⭐</span>
                </button>
                {showFavs && (
                  <div
                    style={{
                      ...st.dropdown,
                      background: t.bgCard,
                      border: `1px solid ${t.border}`,
                      width: "220px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        ...st.dropHeader,
                        color: t.textSub,
                        borderBottom: `1px solid ${t.borderLight}`,
                      }}
                    >
                      ⭐ Favourites
                    </div>
                    {favourites.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: t.textSub,
                          fontSize: "12.5px",
                        }}
                      >
                        Click ☆ next to page title to add
                      </div>
                    ) : (
                      favourites.map((f) => (
                        <div
                          key={f.page}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            color: t.text,
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                          onClick={() => navigate(f.page)}
                        >
                          <span style={{ fontSize: "16px" }}>{f.icon}</span>
                          {f.label}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recently Viewed */}
            {!isMobile && (
              <div style={{ position: "relative" }}>
                <button
                  style={st.iconBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAll();
                    setShowRecent(!showRecent);
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🕐</span>
                </button>
                {showRecent && (
                  <div
                    style={{
                      ...st.dropdown,
                      background: t.bgCard,
                      border: `1px solid ${t.border}`,
                      width: "240px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        ...st.dropHeader,
                        color: t.textSub,
                        borderBottom: `1px solid ${t.borderLight}`,
                      }}
                    >
                      🕐 Recently Viewed
                      {recentItems.length > 0 && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#6366f1",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                          onClick={clearRecent}
                        >
                          Clear
                        </span>
                      )}
                    </div>
                    {recentItems.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: t.textSub,
                          fontSize: "12.5px",
                        }}
                      >
                        No recent pages yet
                      </div>
                    ) : (
                      recentItems.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "9px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            color: t.text,
                            fontSize: "13px",
                          }}
                          onClick={() => navigate(item.page)}
                        >
                          <span style={{ fontSize: "16px" }}>{item.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "12.5px",
                                fontWeight: "600",
                                color: t.text,
                              }}
                            >
                              {item.label}
                            </div>
                            <div
                              style={{ fontSize: "10.5px", color: t.textSub }}
                            >
                              {new Date(item.time).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                style={st.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowNotif(!showNotif);
                }}
              >
                <span style={{ fontSize: "16px" }}>🔔</span>
                {unreadCount > 0 && <span style={st.badge}>{unreadCount}</span>}
              </button>
              {showNotif && (
                <div
                  style={{
                    ...st.dropdown,
                    width: "340px",
                    background: t.bgCard,
                    border: `1px solid ${t.border}`,
                    right: isMobile ? "-80px" : 0,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      ...st.dropHeader,
                      color: t.textSub,
                      borderBottom: `1px solid ${t.borderLight}`,
                    }}
                  >
                    Notifications
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6366f1",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                      onClick={markAllRead}
                    >
                      Mark all read
                    </span>
                  </div>
                  <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                    {notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          background: n.read
                            ? "transparent"
                            : isDark
                              ? "rgba(99,102,241,0.08)"
                              : "#fafbff",
                          borderBottom: `1px solid ${t.borderLight}`,
                        }}
                        onClick={() => {
                          markRead(n.id);
                          navigate(n.page);
                        }}
                      >
                        <span style={{ fontSize: "18px", marginTop: "1px" }}>
                          {n.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "12.5px",
                              fontWeight: "600",
                              color: t.text,
                            }}
                          >
                            {n.title}
                          </div>
                          <div
                            style={{
                              fontSize: "11.5px",
                              color: t.textSub,
                              marginTop: "2px",
                            }}
                          >
                            {n.message}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              color: t.textSub,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {n.time}
                          </span>
                          {!n.read && (
                            <div
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#6366f1",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      padding: "10px 16px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#6366f1",
                      cursor: "pointer",
                      fontWeight: "600",
                      borderTop: `1px solid ${t.borderLight}`,
                    }}
                    onClick={() => navigate("reports")}
                  >
                    View All →
                  </div>
                </div>
              )}
            </div>

            {/* Chat */}
            <button
              style={st.iconBtn}
              title="Chat (X)"
              onClick={(e) => {
                e.stopPropagation();
                navigate("chat");
              }}
            >
              <span style={{ fontSize: "16px" }}>💬</span>
            </button>

            {/* Leave */}
            <button
              style={st.iconBtn}
              title="Leave (V)"
              onClick={(e) => {
                e.stopPropagation();
                navigate("leaves");
              }}
            >
              <span style={{ fontSize: "16px" }}>🌴</span>
            </button>

            {/* Dark Mode */}
            <button
              style={st.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                toggleDark();
              }}
            >
              <span style={{ fontSize: "16px" }}>{isDark ? "☀️" : "🌙"}</span>
            </button>

            {/* Shortcuts */}
            {!isMobile && (
              <button
                style={st.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShortcuts(true);
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: t.textSub,
                  }}
                >
                  ?
                </span>
              </button>
            )}

            {!isMobile && (
              <div
                style={{
                  width: "1px",
                  height: "22px",
                  background: t.border,
                  margin: "0 6px",
                }}
              />
            )}

            {/* User Profile */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  ...st.userChip,
                  background: t.bgInput,
                  border: `1px solid ${t.border}`,
                  padding: isMobile ? "4px" : "4px 10px 4px 4px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                  setShowProfile(!showProfile);
                }}
              >
                <div
                  style={{
                    ...st.userAvatar,
                    background: `linear-gradient(135deg,${getRoleColor(user.role)},${getRoleColor(user.role)}aa)`,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {!isMobile && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: t.text,
                          lineHeight: "1.2",
                        }}
                      >
                        {user.name.split(" ")[0]}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: getRoleColor(user.role),
                          lineHeight: "1.2",
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", color: t.textSub }}>
                      ▾
                    </span>
                  </>
                )}
              </div>
              {showProfile && (
                <div
                  style={{
                    ...st.dropdown,
                    width: "240px",
                    right: 0,
                    left: "auto",
                    background: t.bgCard,
                    border: `1px solid ${t.border}`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      borderBottom: `1px solid ${t.borderLight}`,
                    }}
                  >
                    <div
                      style={{
                        ...st.userAvatar,
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        fontSize: "16px",
                        background: `linear-gradient(135deg,${getRoleColor(user.role)},${getRoleColor(user.role)}aa)`,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: t.text,
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: getRoleColor(user.role),
                        }}
                      >
                        {user.role}
                      </div>
                      <div style={{ fontSize: "11px", color: t.textSub }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  {[
                    { icon: "🏠", label: "Home", page: "home" },
                    { icon: "👥", label: "Employees", page: "employees" },
                    { icon: "💬", label: "Team Chat", page: "chat" },
                    { icon: "🎤", label: "Interviews", page: "interviews" },
                    { icon: "🌴", label: "My Leaves", page: "leaves" },
                    { icon: "⏰", label: "Attendance", page: "attendance" },
                    { icon: "💵", label: "Payslips", page: "payslips" },
                    { icon: "🎯", label: "Goals", page: "goals" },
                    { icon: "⚙️", label: "Settings", page: "settings" },
                  ].map((item) => (
                    <div
                      key={item.page}
                      style={{
                        padding: "9px 16px",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: t.text,
                      }}
                      onClick={() => navigate(item.page)}
                    >
                      {item.icon} {item.label}
                    </div>
                  ))}
                  <div
                    style={{
                      padding: "9px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: t.text,
                    }}
                    onClick={toggleDark}
                  >
                    {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </div>
                  <div
                    style={{
                      padding: "9px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: t.text,
                    }}
                    onClick={() => setShowShortcuts(true)}
                  >
                    ⌨️ Keyboard Shortcuts
                  </div>
                  <div style={{ height: "1px", background: t.borderLight }} />
                  <div
                    style={{
                      padding: "9px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#ef4444",
                    }}
                    onClick={handleLogout}
                  >
                    ↩ Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favourites Bar */}
        {!isMobile && favourites.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 20px",
              background: t.bgCard,
              borderBottom: `1px solid ${t.border}`,
              overflowX: "auto",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: t.textSub,
                fontWeight: "600",
                marginRight: "4px",
                flexShrink: 0,
              }}
            >
              ⭐
            </span>
            {favourites.map((f) => (
              <button
                key={f.page}
                onClick={() => navigate(f.page)}
                style={{
                  background: activePage === f.page ? "#eef2ff" : t.bgInput,
                  border: `1px solid ${activePage === f.page ? "#6366f1" : t.border}`,
                  borderRadius: "7px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  color: activePage === f.page ? "#6366f1" : t.text,
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "12px" }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Page Content */}
        <div
          style={{ flex: 1, overflowY: "auto", background: t.bg }}
          onClick={closeAll}
        >
          {renderPage()}
        </div>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: isDark ? "#1a1d27" : "#fff",
              borderTop: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              height: "64px",
              zIndex: 900,
              boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {bottomNav.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 0",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: activePage === item.id ? "#6366f1" : t.textSub,
                  }}
                >
                  {item.label}
                </span>
                {activePage === item.id && (
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "#6366f1",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const st = {
  app: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  sidebarWrap: { flexShrink: 0 },
  mobileOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 998,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    height: "56px",
    minHeight: "56px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    position: "relative",
    zIndex: 200,
  },
  hamburger: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  hamLine: { width: "20px", height: "2px", borderRadius: "2px" },
  tbLeft: { display: "flex", alignItems: "center", flex: 1 },
  tbCenter: { flex: 1, display: "flex", justifyContent: "center" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "10px",
    padding: "7px 12px",
    width: "100%",
    maxWidth: "440px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    width: "100%",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
  },
  tbRight: { display: "flex", alignItems: "center" },
  quickAdd: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "300",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  iconBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: "3px",
    right: "3px",
    width: "15px",
    height: "15px",
    background: "#ef4444",
    borderRadius: "50%",
    fontSize: "8px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    border: "2px solid #fff",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    zIndex: 999,
    overflow: "hidden",
    minWidth: "200px",
  },
  dropHeader: {
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toast: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    zIndex: 9999,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  shortcutsOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9998,
    backdropFilter: "blur(4px)",
  },
  shortcutsModal: {
    borderRadius: "16px",
    padding: "24px",
    width: "500px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
  },
};

export default App;
