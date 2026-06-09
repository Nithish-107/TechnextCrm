import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const BASE_URL = "http://localhost:8080/api";

export default function Dashboard({ user, onNavigate }) {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [deals, setDeals] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/leads`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/candidates`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/tasks`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/meetings`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/deals`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/placements`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/jobs`).catch(() => ({ data: [] })),
    ]).then(([l, c, t, m, d, p, j]) => {
      setLeads(l.data);
      setCandidates(c.data);
      setTasks(t.data);
      setMeetings(m.data);
      setDeals(d.data);
      setPlacements(p.data);
      setJobs(j.data);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = user.name.split(" ")[0];

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "#ef4444";
      case "Recruiter":
        return "#10b981";
      case "Sales":
        return "#3b82f6";
      case "HR Manager":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  // KPI Data
  const totalPipeline = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonDeals = deals.filter((d) => d.stage === "Closed Won").length;
  const openJobs = jobs.filter((j) => j.status === "Open").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const activePlacements = placements.filter(
    (p) => p.status === "Active",
  ).length;
  const totalCommission = placements.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );
  const hotLeads = leads.filter((l) => l.status === "Hot").length;

  // Lead Status Chart
  const leadStatusData = [
    {
      name: "Hot",
      value: leads.filter((l) => l.status === "Hot").length,
      color: "#ef4444",
    },
    {
      name: "Warm",
      value: leads.filter((l) => l.status === "Warm").length,
      color: "#f59e0b",
    },
    {
      name: "New",
      value: leads.filter((l) => l.status === "New").length,
      color: "#3b82f6",
    },
    {
      name: "Cold",
      value: leads.filter((l) => l.status === "Cold").length,
      color: "#6b7280",
    },
  ].filter((d) => d.value > 0);

  // Candidate Stage Chart
  const candidateStageData = [
    {
      name: "Available",
      value: candidates.filter((c) => c.stage === "Available").length,
    },
    {
      name: "Screened",
      value: candidates.filter((c) => c.stage === "Screened").length,
    },
    {
      name: "Interview",
      value: candidates.filter((c) => c.stage === "Interview").length,
    },
    {
      name: "Shortlisted",
      value: candidates.filter((c) => c.stage === "Shortlisted").length,
    },
    {
      name: "Offered",
      value: candidates.filter((c) => c.stage === "Offered").length,
    },
    {
      name: "Placed",
      value: candidates.filter((c) => c.stage === "Placed").length,
    },
  ].filter((d) => d.value > 0);

  // Deal Pipeline Chart
  const dealPipelineData = [
    {
      name: "Prospecting",
      deals: deals.filter((d) => d.stage === "Prospecting").length,
    },
    {
      name: "Qualified",
      deals: deals.filter((d) => d.stage === "Qualified").length,
    },
    {
      name: "Proposal",
      deals: deals.filter((d) => d.stage === "Proposal").length,
    },
    {
      name: "Negotiation",
      deals: deals.filter((d) => d.stage === "Negotiation").length,
    },
    {
      name: "Won",
      deals: deals.filter((d) => d.stage === "Closed Won").length,
    },
  ];

  // Monthly Placements (simulated trend)
  const monthlyData = [
    { month: "Jan", placements: 2, commission: 180000 },
    { month: "Feb", placements: 3, commission: 270000 },
    { month: "Mar", placements: 4, commission: 380000 },
    { month: "Apr", placements: 3, commission: 290000 },
    { month: "May", placements: 5, commission: 470000 },
    {
      month: "Jun",
      placements: activePlacements + 2,
      commission: totalCommission > 0 ? totalCommission : 420000,
    },
  ];

  // Placement Status
  const placementStatusData = [
    {
      name: "Active",
      value: placements.filter((p) => p.status === "Active").length,
      color: "#10b981",
    },
    {
      name: "Completed",
      value: placements.filter((p) => p.status === "Completed").length,
      color: "#3b82f6",
    },
    {
      name: "Terminated",
      value: placements.filter((p) => p.status === "Terminated").length,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0);

  // Recent activity
  const recentLeads = leads.slice(-3).reverse();
  const recentPlacements = placements.slice(-3).reverse();
  const todayTasks = tasks.filter((t) => t.status === "Pending").slice(0, 4);
  const upcomingMeetings = meetings
    .filter((m) => m.status === "Upcoming")
    .slice(0, 3);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#0ea5e9",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7f0",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#0f1117",
              marginBottom: "4px",
            }}
          >
            {label}
          </p>
          {payload.map((p, i) => (
            <p
              key={i}
              style={{ fontSize: "12px", color: p.color, margin: "2px 0" }}
            >
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "4px solid #eef2ff",
            borderTop: "4px solid #6366f1",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: "13px", color: "#9ca3af" }}>
          Loading dashboard...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.greeting}>
            {greeting}, {firstName}! 👋
          </div>
          <div style={s.greetingSub}>
            Here's what's happening at TechNext Staffing today
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.dateBadge}>
            <span style={{ fontSize: "14px" }}>📅</span>
            <span>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div style={s.content}>
        {/* KPI Cards */}
        <div style={s.kpiGrid}>
          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("leads")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#eef2ff" }}>
                <span style={s.kpiIcon}>👤</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#10b981" }}>
                +{hotLeads} Hot
              </span>
            </div>
            <div style={s.kpiVal}>{leads.length}</div>
            <div style={s.kpiLabel}>Total Leads</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((leads.length / 50) * 100, 100)}%`,
                  background: "#6366f1",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("candidates")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#f0fdf4" }}>
                <span style={s.kpiIcon}>🪪</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#10b981" }}>
                +{candidates.filter((c) => c.stage === "Interview").length}{" "}
                Interview
              </span>
            </div>
            <div style={s.kpiVal}>{candidates.length}</div>
            <div style={s.kpiLabel}>Candidates</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((candidates.length / 50) * 100, 100)}%`,
                  background: "#10b981",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("placements")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#f5f3ff" }}>
                <span style={s.kpiIcon}>🏆</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#8b5cf6" }}>
                {activePlacements} Active
              </span>
            </div>
            <div style={s.kpiVal}>{placements.length}</div>
            <div style={s.kpiLabel}>Placements</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((placements.length / 20) * 100, 100)}%`,
                  background: "#8b5cf6",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("deals")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#fffbeb" }}>
                <span style={s.kpiIcon}>🤝</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#f59e0b" }}>
                {wonDeals} Won
              </span>
            </div>
            <div style={s.kpiVal}>₹{(totalPipeline / 100000).toFixed(1)}L</div>
            <div style={s.kpiLabel}>Deal Pipeline</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((totalPipeline / 5000000) * 100, 100)}%`,
                  background: "#f59e0b",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("jobs")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#eff6ff" }}>
                <span style={s.kpiIcon}>📋</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#3b82f6" }}>
                {openJobs} Open
              </span>
            </div>
            <div style={s.kpiVal}>{jobs.length}</div>
            <div style={s.kpiLabel}>Job Orders</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((jobs.length / 20) * 100, 100)}%`,
                  background: "#3b82f6",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("placements")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#fef2f2" }}>
                <span style={s.kpiIcon}>💰</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#ef4444" }}>
                This month
              </span>
            </div>
            <div style={s.kpiVal}>
              ₹{(totalCommission / 100000).toFixed(1)}L
            </div>
            <div style={s.kpiLabel}>Commission</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((totalCommission / 1000000) * 100, 100)}%`,
                  background: "#ef4444",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("tasks")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#f0fdf4" }}>
                <span style={s.kpiIcon}>✅</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#10b981" }}>
                {tasks.filter((t) => t.status === "Done").length} Done
              </span>
            </div>
            <div style={s.kpiVal}>{pendingTasks}</div>
            <div style={s.kpiLabel}>Pending Tasks</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((pendingTasks / 20) * 100, 100)}%`,
                  background: "#10b981",
                }}
              />
            </div>
          </div>

          <div
            style={{ ...s.kpiCard, cursor: "pointer" }}
            onClick={() => onNavigate("meetings")}
          >
            <div style={s.kpiTop}>
              <div style={{ ...s.kpiIconWrap, background: "#eff6ff" }}>
                <span style={s.kpiIcon}>📅</span>
              </div>
              <span style={{ ...s.kpiChange, color: "#3b82f6" }}>
                {meetings.filter((m) => m.status === "Upcoming").length}{" "}
                upcoming
              </span>
            </div>
            <div style={s.kpiVal}>{meetings.length}</div>
            <div style={s.kpiLabel}>Total Meetings</div>
            <div style={s.kpiBar}>
              <div
                style={{
                  ...s.kpiBarFill,
                  width: `${Math.min((meetings.length / 20) * 100, 100)}%`,
                  background: "#0ea5e9",
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div style={s.chartRow}>
          {/* Monthly Placements Line Chart */}
          <div style={{ ...s.chartCard, flex: 2 }}>
            <div style={s.chartTitle}>📈 Monthly Placements & Commission</div>
            <div style={s.chartSub}>Last 6 months performance</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="placGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="placements"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#placGrad)"
                  name="Placements"
                  dot={{ fill: "#6366f1", r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Status Pie Chart */}
          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>👤 Lead Status</div>
            <div style={s.chartSub}>{leads.length} total leads</div>
            {leadStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={leadStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {leadStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={s.legend}>
                  {leadStatusData.map((item, i) => (
                    <div key={i} style={s.legendItem}>
                      <div style={{ ...s.legendDot, background: item.color }} />
                      <span style={s.legendLabel}>{item.name}</span>
                      <span style={s.legendVal}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={s.noData}>No lead data yet</div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={s.chartRow}>
          {/* Deal Pipeline Bar Chart */}
          <div style={{ ...s.chartCard, flex: 1.5 }}>
            <div style={s.chartTitle}>🤝 Deal Pipeline</div>
            <div style={s.chartSub}>Deals by stage</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dealPipelineData} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f3f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="deals" name="Deals" radius={[6, 6, 0, 0]}>
                  {dealPipelineData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Candidate Pipeline */}
          <div style={{ ...s.chartCard, flex: 1.5 }}>
            <div style={s.chartTitle}>🪪 Candidate Pipeline</div>
            <div style={s.chartSub}>{candidates.length} total candidates</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={candidateStageData} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f3f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Candidates" radius={[6, 6, 0, 0]}>
                  {candidateStageData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Placement Status Pie */}
          <div style={{ ...s.chartCard, flex: 1 }}>
            <div style={s.chartTitle}>🏆 Placements</div>
            <div style={s.chartSub}>{placements.length} total</div>
            {placementStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={placementStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {placementStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={s.legend}>
                  {placementStatusData.map((item, i) => (
                    <div key={i} style={s.legendItem}>
                      <div style={{ ...s.legendDot, background: item.color }} />
                      <span style={s.legendLabel}>{item.name}</span>
                      <span style={s.legendVal}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={s.noData}>No placement data yet</div>
            )}
          </div>
        </div>

        {/* Bottom Row - Recent Activity */}
        <div style={s.bottomRow}>
          {/* Recent Leads */}
          <div style={s.actCard}>
            <div style={s.actHeader}>
              <div style={s.actTitle}>👤 Recent Leads</div>
              <span style={s.actLink} onClick={() => onNavigate("leads")}>
                View All →
              </span>
            </div>
            {recentLeads.length === 0 ? (
              <div style={s.noData}>No leads yet</div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} style={s.actItem}>
                  <div
                    style={{
                      ...s.actAvatar,
                      background: "#eef2ff",
                      color: "#6366f1",
                    }}
                  >
                    {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div style={s.actInfo}>
                    <div style={s.actName}>{lead.name}</div>
                    <div style={s.actSub}>{lead.company || "—"}</div>
                  </div>
                  <span
                    style={{
                      ...s.actBadge,
                      background:
                        lead.status === "Hot"
                          ? "#fef2f2"
                          : lead.status === "Warm"
                            ? "#fffbeb"
                            : "#eff6ff",
                      color:
                        lead.status === "Hot"
                          ? "#ef4444"
                          : lead.status === "Warm"
                            ? "#f59e0b"
                            : "#3b82f6",
                    }}
                  >
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recent Placements */}
          <div style={s.actCard}>
            <div style={s.actHeader}>
              <div style={s.actTitle}>🏆 Recent Placements</div>
              <span style={s.actLink} onClick={() => onNavigate("placements")}>
                View All →
              </span>
            </div>
            {recentPlacements.length === 0 ? (
              <div style={s.noData}>No placements yet</div>
            ) : (
              recentPlacements.map((p) => (
                <div key={p.id} style={s.actItem}>
                  <div
                    style={{
                      ...s.actAvatar,
                      background: "#f5f3ff",
                      color: "#8b5cf6",
                    }}
                  >
                    {p.candidateName
                      ? p.candidateName.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div style={s.actInfo}>
                    <div style={s.actName}>{p.candidateName}</div>
                    <div style={s.actSub}>{p.clientCompany || "—"}</div>
                  </div>
                  <span
                    style={{
                      ...s.actBadge,
                      background: p.status === "Active" ? "#f0fdf4" : "#eff6ff",
                      color: p.status === "Active" ? "#10b981" : "#3b82f6",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Today's Tasks */}
          <div style={s.actCard}>
            <div style={s.actHeader}>
              <div style={s.actTitle}>✅ Pending Tasks</div>
              <span style={s.actLink} onClick={() => onNavigate("tasks")}>
                View All →
              </span>
            </div>
            {todayTasks.length === 0 ? (
              <div style={s.noData}>All tasks done! 🎉</div>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} style={s.actItem}>
                  <div
                    style={{
                      ...s.taskCheck,
                      background:
                        task.status === "Done" ? "#10b981" : "transparent",
                      border: `2px solid ${task.status === "Done" ? "#10b981" : "#d1d5db"}`,
                    }}
                  >
                    {task.status === "Done" && (
                      <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>
                    )}
                  </div>
                  <div style={s.actInfo}>
                    <div
                      style={{
                        ...s.actName,
                        ...(task.status === "Done"
                          ? { textDecoration: "line-through", color: "#9ca3af" }
                          : {}),
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={s.actSub}>{task.dueDate || "No due date"}</div>
                  </div>
                  <span
                    style={{
                      ...s.actBadge,
                      background:
                        task.priority === "High" ? "#fef2f2" : "#fffbeb",
                      color: task.priority === "High" ? "#ef4444" : "#f59e0b",
                    }}
                  >
                    {task.priority || "Normal"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Meetings */}
          <div style={s.actCard}>
            <div style={s.actHeader}>
              <div style={s.actTitle}>📅 Upcoming Meetings</div>
              <span style={s.actLink} onClick={() => onNavigate("meetings")}>
                View All →
              </span>
            </div>
            {upcomingMeetings.length === 0 ? (
              <div style={s.noData}>No upcoming meetings</div>
            ) : (
              upcomingMeetings.map((m) => (
                <div key={m.id} style={s.actItem}>
                  <div
                    style={{
                      ...s.actAvatar,
                      background: "#eff6ff",
                      color: "#3b82f6",
                    }}
                  >
                    📅
                  </div>
                  <div style={s.actInfo}>
                    <div style={s.actName}>{m.title}</div>
                    <div style={s.actSub}>
                      {m.meetingDate || "—"} {m.meetingTime || ""}
                    </div>
                  </div>
                  <span
                    style={{
                      ...s.actBadge,
                      background: "#f0fdf4",
                      color: "#10b981",
                    }}
                  >
                    Soon
                  </span>
                </div>
              ))
            )}
          </div>
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
    overflowY: "auto",
  },
  header: {
    background: "linear-gradient(135deg,#0f1117 0%,#1e2030 100%)",
    padding: "24px 24px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {},
  greeting: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  greetingSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.5)",
    marginTop: "4px",
  },
  headerRight: {},
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "8px 14px",
    fontSize: "12.5px",
    color: "rgba(255,255,255,0.7)",
  },
  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "12px",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "transform 0.15s,box-shadow 0.15s",
  },
  kpiTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  kpiIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiIcon: { fontSize: "18px" },
  kpiChange: { fontSize: "11px", fontWeight: "700" },
  kpiVal: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  kpiLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "3px",
    marginBottom: "10px",
  },
  kpiBar: {
    height: "4px",
    background: "#f1f3f9",
    borderRadius: "2px",
    overflow: "hidden",
  },
  kpiBarFill: { height: "100%", borderRadius: "2px", transition: "width 0.5s" },
  chartRow: { display: "flex", gap: "14px" },
  chartCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  chartTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "3px",
  },
  chartSub: { fontSize: "11.5px", color: "#9ca3af", marginBottom: "14px" },
  legend: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" },
  legendItem: { display: "flex", alignItems: "center", gap: "5px" },
  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: { fontSize: "11px", color: "#6b7280" },
  legendVal: { fontSize: "11px", fontWeight: "700", color: "#0f1117" },
  noData: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
    color: "#9ca3af",
    fontSize: "13px",
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
  },
  actCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  actHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  actTitle: { fontSize: "13px", fontWeight: "700", color: "#0f1117" },
  actLink: {
    fontSize: "11.5px",
    color: "#6366f1",
    cursor: "pointer",
    fontWeight: "600",
  },
  actItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #f8fafc",
  },
  actAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    flexShrink: 0,
  },
  actInfo: { flex: 1, minWidth: 0 },
  actName: {
    fontSize: "12.5px",
    fontWeight: "600",
    color: "#0f1117",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actSub: { fontSize: "11px", color: "#9ca3af", marginTop: "1px" },
  actBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 7px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  taskCheck: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
