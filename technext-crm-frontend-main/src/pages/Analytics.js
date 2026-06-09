import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BASE_URL = "http://localhost:8080/api";
const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#ec4899",
  "#14b8a6",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
          {p.name}:{" "}
          <strong>
            {typeof p.value === "number" && p.value > 1000
              ? `₹${p.value.toLocaleString("en-IN")}`
              : p.value}
          </strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/leads`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/candidates`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/placements`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/deals`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/tasks`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/meetings`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/jobs`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/users`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/interviews`).catch(() => ({ data: [] })),
    ]).then(([l, c, p, d, t, m, j, u, iv]) => {
      setLeads(l.data);
      setCandidates(c.data);
      setPlacements(p.data);
      setDeals(d.data);
      setTasks(t.data);
      setMeetings(m.data);
      setJobs(j.data);
      setUsers(u.data);
      setInterviews(iv.data);
      setLoading(false);
    });
  }, []);

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
          Loading analytics...
        </div>
      </div>
    );

  // Calculations
  const totalCommission = placements.reduce(
    (sum, p) => sum + (parseFloat(p.commission) || 0),
    0,
  );
  const totalPipeline = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const wonValue = wonDeals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const conversionRate =
    leads.length > 0 ? Math.round((placements.length / leads.length) * 100) : 0;
  const interviewPassRate =
    interviews.length > 0
      ? Math.round(
          (interviews.filter((i) => i.result === "Pass").length /
            interviews.length) *
            100,
        )
      : 0;
  const avgSalary =
    placements.length > 0
      ? Math.round(
          placements.reduce((sum, p) => sum + (parseFloat(p.salary) || 0), 0) /
            placements.length,
        )
      : 0;

  // Monthly trend data
  const monthlyTrend = [
    {
      month: "Jan",
      leads: 8,
      candidates: 5,
      placements: 2,
      revenue: 180000,
      interviews: 6,
    },
    {
      month: "Feb",
      leads: 12,
      candidates: 8,
      placements: 3,
      revenue: 270000,
      interviews: 10,
    },
    {
      month: "Mar",
      leads: 15,
      candidates: 10,
      placements: 4,
      revenue: 380000,
      interviews: 14,
    },
    {
      month: "Apr",
      leads: 10,
      candidates: 7,
      placements: 3,
      revenue: 290000,
      interviews: 9,
    },
    {
      month: "May",
      leads: 18,
      candidates: 12,
      placements: 5,
      revenue: 470000,
      interviews: 16,
    },
    {
      month: "Jun",
      leads: leads.length,
      candidates: candidates.length,
      placements: placements.length,
      revenue: totalCommission,
      interviews: interviews.length,
    },
  ];

  // Lead sources
  const leadSources = [
    "LinkedIn",
    "Referral",
    "Website",
    "Cold Call",
    "Event",
    "Other",
  ]
    .map((src) => ({
      name: src,
      value: leads.filter((l) => l.source === src).length,
    }))
    .filter((d) => d.value > 0);
  if (leadSources.length === 0) leadSources.push({ name: "No Data", value: 1 });

  // Recruitment funnel
  const funnelData = [
    { stage: "Leads", count: leads.length, color: "#6366f1" },
    {
      stage: "Hot Leads",
      count: leads.filter((l) => l.status === "Hot").length,
      color: "#8b5cf6",
    },
    { stage: "Candidates", count: candidates.length, color: "#3b82f6" },
    { stage: "Interviews", count: interviews.length, color: "#10b981" },
    {
      stage: "Offered",
      count: candidates.filter((c) => c.stage === "Offered").length,
      color: "#f59e0b",
    },
    { stage: "Placed", count: placements.length, color: "#ef4444" },
  ];

  // Deal stages
  const dealStages = [
    "Prospecting",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ].map((stage) => ({
    stage,
    count: deals.filter((d) => d.stage === stage).length,
    value: deals
      .filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
  }));

  // Recruiter performance
  const recruiterPerf = users
    .filter((u) => ["Recruiter", "HR Manager", "Admin"].includes(u.role))
    .map((u) => ({
      name: u.name.split(" ")[0],
      fullName: u.name,
      role: u.role,
      placements: placements.filter((p) => p.createdBy === u.name).length,
      leads: leads.filter((l) => l.createdBy === u.name).length,
      interviews: interviews.filter((i) => i.interviewer === u.name).length,
      commission: placements
        .filter((p) => p.createdBy === u.name)
        .reduce((s, p) => s + (parseFloat(p.commission) || 0), 0),
      color: COLORS[users.indexOf(u) % COLORS.length],
    }));

  // Skills demand
  const skillMap = {};
  candidates.forEach((c) => {
    if (c.skills)
      c.skills.split(",").forEach((sk) => {
        const s = sk.trim();
        if (s) skillMap[s] = (skillMap[s] || 0) + 1;
      });
  });
  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Client analytics
  const clientMap = {};
  placements.forEach((p) => {
    if (p.clientCompany) {
      if (!clientMap[p.clientCompany])
        clientMap[p.clientCompany] = { count: 0, revenue: 0 };
      clientMap[p.clientCompany].count++;
      clientMap[p.clientCompany].revenue += parseFloat(p.commission) || 0;
    }
  });
  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, data]) => ({ name, ...data }));

  // Task completion by priority
  const taskByPriority = ["High", "Medium", "Normal", "Low"]
    .map((p) => ({
      priority: p,
      total: tasks.filter((t) => t.priority === p).length,
      done: tasks.filter((t) => t.priority === p && t.status === "Done").length,
    }))
    .filter((t) => t.total > 0);

  // Interview results
  const interviewResults = ["Pass", "Fail", "Hold", "Pending"]
    .map((r) => ({
      name: r,
      value: interviews.filter((i) => i.result === r).length,
    }))
    .filter((d) => d.value > 0);
  if (interviewResults.length === 0)
    interviewResults.push({ name: "No Data", value: 1 });

  // Radar chart data for team performance
  const radarData = [
    { metric: "Leads", value: Math.min(leads.length * 5, 100) },
    { metric: "Candidates", value: Math.min(candidates.length * 5, 100) },
    { metric: "Placements", value: Math.min(placements.length * 10, 100) },
    { metric: "Interviews", value: Math.min(interviews.length * 5, 100) },
    { metric: "Deals", value: Math.min(deals.length * 5, 100) },
    {
      metric: "Tasks",
      value: Math.min(tasks.filter((t) => t.status === "Done").length * 5, 100),
    },
  ];

  const sections = [
    "overview",
    "recruitment",
    "sales",
    "performance",
    "clients",
  ];

  const KPICard = ({ icon, label, value, sub, change, color, bg }) => (
    <div style={{ ...s.kpiCard, borderTop: `3px solid ${color}` }}>
      <div style={s.kpiTop}>
        <div style={{ ...s.kpiIcon, background: bg }}>{icon}</div>
        {change && (
          <span
            style={{
              ...s.kpiChange,
              color: parseFloat(change) >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            {parseFloat(change) >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={{ ...s.kpiVal, color }}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
      {sub && <div style={s.kpiSub}>{sub}</div>}
    </div>
  );

  const SectionTitle = ({ icon, title, sub }) => (
    <div style={s.sectionTitle}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <div>
        <div style={s.sectionTitleText}>{title}</div>
        <div style={s.sectionTitleSub}>{sub}</div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>Analytics & Reporting</div>
          <div style={s.sub}>Real-time insights across all modules</div>
        </div>
        <div style={s.headerRight}>
          <div style={s.periodToggle}>
            {["weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                style={{
                  ...s.periodBtn,
                  ...(period === p ? s.periodBtnActive : {}),
                }}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button style={s.printBtn} onClick={() => window.print()}>
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Section Nav */}
      <div style={s.sectionNav}>
        {[
          { id: "overview", icon: "📊", label: "Overview" },
          { id: "recruitment", icon: "🪪", label: "Recruitment" },
          { id: "sales", icon: "💼", label: "Sales" },
          { id: "performance", icon: "👥", label: "Team Performance" },
          { id: "clients", icon: "🏢", label: "Clients" },
        ].map((sec) => (
          <button
            key={sec.id}
            style={{
              ...s.secNavBtn,
              ...(activeSection === sec.id ? s.secNavBtnActive : {}),
            }}
            onClick={() => setActiveSection(sec.id)}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {/* OVERVIEW SECTION */}
        {activeSection === "overview" && (
          <>
            {/* KPI Row */}
            <div style={s.kpiGrid}>
              <KPICard
                icon="🏆"
                label="Total Placements"
                value={placements.length}
                sub={`Active: ${placements.filter((p) => p.status === "Active").length}`}
                change="12"
                color="#8b5cf6"
                bg="#f5f3ff"
              />
              <KPICard
                icon="💰"
                label="Total Commission"
                value={`₹${(totalCommission / 100000).toFixed(1)}L`}
                sub="This period"
                change="8"
                color="#f59e0b"
                bg="#fffbeb"
              />
              <KPICard
                icon="📊"
                label="Conversion Rate"
                value={`${conversionRate}%`}
                sub="Lead to Placement"
                change="5"
                color="#6366f1"
                bg="#eef2ff"
              />
              <KPICard
                icon="💼"
                label="Deal Pipeline"
                value={`₹${(totalPipeline / 100000).toFixed(1)}L`}
                sub={`Won: ₹${(wonValue / 100000).toFixed(1)}L`}
                change="3"
                color="#10b981"
                bg="#f0fdf4"
              />
              <KPICard
                icon="🎤"
                label="Interviews"
                value={interviews.length}
                sub={`Pass Rate: ${interviewPassRate}%`}
                change="10"
                color="#3b82f6"
                bg="#eff6ff"
              />
              <KPICard
                icon="👤"
                label="Total Leads"
                value={leads.length}
                sub={`Hot: ${leads.filter((l) => l.status === "Hot").length}`}
                change="15"
                color="#0ea5e9"
                bg="#f0f9ff"
              />
            </div>

            {/* Trend Chart */}
            <div style={s.chartCard}>
              <SectionTitle
                icon="📈"
                title="Monthly Performance Trend"
                sub="Leads, Candidates, Placements over 6 months"
              />
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    {[
                      { id: "g1", color: "#6366f1" },
                      { id: "g2", color: "#10b981" },
                      { id: "g3", color: "#8b5cf6" },
                    ].map((g) => (
                      <linearGradient
                        key={g.id}
                        id={g.id}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={g.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={g.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#g1)"
                    name="Leads"
                  />
                  <Area
                    type="monotone"
                    dataKey="candidates"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#g2)"
                    name="Candidates"
                  />
                  <Area
                    type="monotone"
                    dataKey="placements"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#g3)"
                    name="Placements"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Row: Radar + Task Priority */}
            <div style={s.chartRow}>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="🎯"
                  title="Overall Performance Score"
                  sub="Across all modules"
                />
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f1f3f9" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                    />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="✅"
                  title="Task Completion"
                  sub={`${tasks.length} total tasks`}
                />
                <div style={{ padding: "10px 0" }}>
                  {taskByPriority.length === 0 ? (
                    <div style={s.noData}>No task data</div>
                  ) : (
                    taskByPriority.map((t, i) => {
                      const pct =
                        t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
                      const colors = {
                        High: "#ef4444",
                        Medium: "#f59e0b",
                        Normal: "#6366f1",
                        Low: "#10b981",
                      };
                      return (
                        <div key={t.priority} style={{ marginBottom: "14px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{ fontWeight: "600", color: "#374151" }}
                            >
                              {t.priority} Priority
                            </span>
                            <span
                              style={{
                                color: colors[t.priority],
                                fontWeight: "700",
                              }}
                            >
                              {t.done}/{t.total} ({pct}%)
                            </span>
                          </div>
                          <div
                            style={{
                              height: "8px",
                              background: "#f1f3f9",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: colors[t.priority],
                                borderRadius: "4px",
                                transition: "width 0.5s",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                  {taskByPriority.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      {["High", "Medium", "Normal"].map((p) => (
                        <div key={p}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{ fontWeight: "600", color: "#374151" }}
                            >
                              {p} Priority
                            </span>
                            <span style={{ color: "#9ca3af" }}>0 tasks</span>
                          </div>
                          <div
                            style={{
                              height: "8px",
                              background: "#f1f3f9",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* RECRUITMENT SECTION */}
        {activeSection === "recruitment" && (
          <>
            <div style={s.kpiGrid}>
              <KPICard
                icon="🪪"
                label="Candidates"
                value={candidates.length}
                sub={`Placed: ${candidates.filter((c) => c.stage === "Placed").length}`}
                change="10"
                color="#8b5cf6"
                bg="#f5f3ff"
              />
              <KPICard
                icon="📋"
                label="Open Jobs"
                value={jobs.filter((j) => j.status === "Open").length}
                sub={`Total: ${jobs.length}`}
                change="5"
                color="#3b82f6"
                bg="#eff6ff"
              />
              <KPICard
                icon="🎤"
                label="Interviews"
                value={interviews.length}
                sub={`Scheduled: ${interviews.filter((i) => i.status === "Scheduled").length}`}
                change="8"
                color="#10b981"
                bg="#f0fdf4"
              />
              <KPICard
                icon="✅"
                label="Pass Rate"
                value={`${interviewPassRate}%`}
                sub={`${interviews.filter((i) => i.result === "Pass").length} passed`}
                change="3"
                color="#f59e0b"
                bg="#fffbeb"
              />
              <KPICard
                icon="🏆"
                label="Placements"
                value={placements.length}
                sub={`Commission: ₹${(totalCommission / 100000).toFixed(1)}L`}
                change="12"
                color="#6366f1"
                bg="#eef2ff"
              />
              <KPICard
                icon="⏱️"
                label="Avg Salary"
                value={`₹${(avgSalary / 100000).toFixed(1)}L`}
                sub="Per placement"
                change="4"
                color="#0ea5e9"
                bg="#f0f9ff"
              />
            </div>

            {/* Recruitment Funnel */}
            <div style={s.chartCard}>
              <SectionTitle
                icon="🎯"
                title="Recruitment Funnel"
                sub="Lead to Placement conversion pipeline"
              />
              <div style={{ padding: "10px 0" }}>
                {funnelData.map((item, i) => {
                  const maxVal = funnelData[0].count || 1;
                  const pct = Math.round((item.count / maxVal) * 100);
                  const convPct =
                    i > 0
                      ? Math.round(
                          (item.count / (funnelData[i - 1].count || 1)) * 100,
                        )
                      : 100;
                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "100px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#374151",
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {item.stage}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            height: "32px",
                            background: "#f1f3f9",
                            borderRadius: "6px",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: item.color,
                              borderRadius: "6px",
                              transition: "width 0.5s",
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: "12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#fff",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      {i > 0 && (
                        <div
                          style={{
                            width: "60px",
                            fontSize: "11px",
                            color: "#9ca3af",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {convPct}% conv.
                        </div>
                      )}
                      {i === 0 && (
                        <div style={{ width: "60px", flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interview Results + Top Skills */}
            <div style={s.chartRow}>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="🎤"
                  title="Interview Results"
                  sub={`${interviews.length} total interviews`}
                />
                {interviews.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={interviewResults}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {interviewResults.map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                ["#10b981", "#ef4444", "#f59e0b", "#6b7280"][
                                  i % 4
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      {interviewResults.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: [
                                "#10b981",
                                "#ef4444",
                                "#f59e0b",
                                "#6b7280",
                              ][i % 4],
                            }}
                          />
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>
                            {item.name}: <strong>{item.value}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={s.noData}>No interview data yet</div>
                )}
              </div>
              <div style={{ ...s.chartCard, flex: 1.5 }}>
                <SectionTitle
                  icon="💻"
                  title="Top Skills in Demand"
                  sub="Most common candidate skills"
                />
                {topSkills.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topSkills} layout="vertical" barSize={16}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f3f9"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#374151" }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        name="Candidates"
                        radius={[0, 4, 4, 0]}
                      >
                        {topSkills.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={s.noData}>Add candidate skills to see data</div>
                )}
              </div>
            </div>

            {/* Candidate Stages */}
            <div style={s.chartCard}>
              <SectionTitle
                icon="🪪"
                title="Candidate Pipeline Stages"
                sub="Distribution across recruitment stages"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6,1fr)",
                  gap: "12px",
                  padding: "10px 0",
                }}
              >
                {[
                  "New",
                  "Screening",
                  "Interview",
                  "Offered",
                  "Placed",
                  "Rejected",
                ].map((stage, i) => {
                  const count = candidates.filter(
                    (c) => c.stage === stage,
                  ).length;
                  const pct =
                    candidates.length > 0
                      ? Math.round((count / candidates.length) * 100)
                      : 0;
                  return (
                    <div
                      key={stage}
                      style={{
                        textAlign: "center",
                        background: "#f8f9fc",
                        borderRadius: "10px",
                        padding: "16px 8px",
                        border: "1px solid #e5e7f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "800",
                          color: COLORS[i],
                          marginBottom: "4px",
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        {stage}
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: "#f1f3f9",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: COLORS[i],
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          marginTop: "4px",
                        }}
                      >
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* SALES SECTION */}
        {activeSection === "sales" && (
          <>
            <div style={s.kpiGrid}>
              <KPICard
                icon="👤"
                label="Total Leads"
                value={leads.length}
                sub={`Hot: ${leads.filter((l) => l.status === "Hot").length}`}
                change="15"
                color="#6366f1"
                bg="#eef2ff"
              />
              <KPICard
                icon="🔥"
                label="Hot Leads"
                value={leads.filter((l) => l.status === "Hot").length}
                sub="High priority"
                change="8"
                color="#ef4444"
                bg="#fef2f2"
              />
              <KPICard
                icon="🤝"
                label="Total Deals"
                value={deals.length}
                sub={`Won: ${wonDeals.length}`}
                change="5"
                color="#10b981"
                bg="#f0fdf4"
              />
              <KPICard
                icon="💰"
                label="Won Value"
                value={`₹${(wonValue / 100000).toFixed(1)}L`}
                sub="Closed deals"
                change="12"
                color="#f59e0b"
                bg="#fffbeb"
              />
              <KPICard
                icon="📈"
                label="Pipeline"
                value={`₹${(totalPipeline / 100000).toFixed(1)}L`}
                sub="Total value"
                change="6"
                color="#8b5cf6"
                bg="#f5f3ff"
              />
              <KPICard
                icon="🏢"
                label="Accounts"
                value={0}
                sub="Active accounts"
                change="2"
                color="#0ea5e9"
                bg="#f0f9ff"
              />
            </div>

            {/* Lead Status + Deal Stages */}
            <div style={s.chartRow}>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="👤"
                  title="Lead Status Distribution"
                  sub="Current lead pipeline"
                />
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={
                        ["Hot", "Warm", "New", "Cold"]
                          .map((st, i) => ({
                            name: st,
                            value:
                              leads.filter((l) => l.status === st).length || 0,
                          }))
                          .filter((d) => d.value > 0) || [
                          { name: "No Data", value: 1 },
                        ]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {["#ef4444", "#f59e0b", "#3b82f6", "#6b7280"].map(
                        (color, i) => (
                          <Cell key={i} fill={color} />
                        ),
                      )}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...s.chartCard, flex: 1.5 }}>
                <SectionTitle
                  icon="🤝"
                  title="Deal Pipeline by Stage"
                  sub="Count per stage"
                />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dealStages} barSize={28}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f3f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 9, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Deals" radius={[6, 6, 0, 0]}>
                      {dealStages.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lead Sources */}
            <div style={s.chartRow}>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="📡"
                  title="Lead Sources"
                  sub="Where leads come from"
                />
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={leadSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {leadSources.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "center",
                    marginTop: "8px",
                  }}
                >
                  {leadSources.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>
                        {item.name}: <strong>{item.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...s.chartCard, flex: 1.5 }}>
                <SectionTitle
                  icon="📊"
                  title="Revenue Trend"
                  sub="Commission earned over months"
                />
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyTrend}>
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
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#f59e0b" }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* PERFORMANCE SECTION */}
        {activeSection === "performance" && (
          <>
            <div style={s.kpiGrid}>
              <KPICard
                icon="👥"
                label="Team Size"
                value={users.length}
                sub="Active members"
                color="#6366f1"
                bg="#eef2ff"
              />
              <KPICard
                icon="🏆"
                label="Total Placements"
                value={placements.length}
                sub="By all recruiters"
                change="12"
                color="#8b5cf6"
                bg="#f5f3ff"
              />
              <KPICard
                icon="💰"
                label="Total Commission"
                value={`₹${(totalCommission / 100000).toFixed(1)}L`}
                sub="Team revenue"
                change="8"
                color="#f59e0b"
                bg="#fffbeb"
              />
              <KPICard
                icon="🎤"
                label="Interviews Done"
                value={interviews.length}
                sub={`Pass: ${interviews.filter((i) => i.result === "Pass").length}`}
                change="10"
                color="#10b981"
                bg="#f0fdf4"
              />
              <KPICard
                icon="✅"
                label="Tasks Completed"
                value={tasks.filter((t) => t.status === "Done").length}
                sub={`Pending: ${tasks.filter((t) => t.status === "Pending").length}`}
                change="5"
                color="#3b82f6"
                bg="#eff6ff"
              />
              <KPICard
                icon="📅"
                label="Meetings Done"
                value={meetings.filter((m) => m.status === "Completed").length}
                sub={`Upcoming: ${meetings.filter((m) => m.status === "Upcoming").length}`}
                change="3"
                color="#0ea5e9"
                bg="#f0f9ff"
              />
            </div>

            {/* Team Performance Table */}
            <div style={s.chartCard}>
              <SectionTitle
                icon="👥"
                title="Team Performance Leaderboard"
                sub="Individual recruiter metrics"
              />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fc" }}>
                      {[
                        "#",
                        "Team Member",
                        "Role",
                        "Placements",
                        "Leads",
                        "Interviews",
                        "Score",
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
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...users]
                      .sort(
                        (a, b) =>
                          placements.filter((p) => p.createdBy === b.name)
                            .length -
                          placements.filter((p) => p.createdBy === a.name)
                            .length,
                      )
                      .map((u, i) => {
                        const score = Math.min(
                          100,
                          Math.round(
                            placements.filter((p) => p.createdBy === u.name)
                              .length *
                              20 +
                              interviews.filter(
                                (iv) => iv.interviewer === u.name,
                              ).length *
                                5 +
                              20,
                          ),
                        );
                        return (
                          <tr
                            key={u.id}
                            style={{ borderBottom: "1px solid #f1f3f9" }}
                          >
                            <td
                              style={{
                                padding: "12px 14px",
                                fontSize: "14px",
                                fontWeight: "800",
                                color:
                                  i === 0
                                    ? "#f59e0b"
                                    : i === 1
                                      ? "#9ca3af"
                                      : i === 2
                                        ? "#cd7f32"
                                        : "#6b7280",
                              }}
                            >
                              {i === 0
                                ? "🥇"
                                : i === 1
                                  ? "🥈"
                                  : i === 2
                                    ? "🥉"
                                    : i + 1}
                            </td>
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
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "9px",
                                    background: COLORS[i % COLORS.length],
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "#fff",
                                  }}
                                >
                                  {u.name.charAt(0)}
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#0f1117",
                                  }}
                                >
                                  {u.name}
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                fontSize: "12px",
                                color: "#6b7280",
                              }}
                            >
                              {u.role}
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#8b5cf6",
                              }}
                            >
                              {
                                placements.filter((p) => p.createdBy === u.name)
                                  .length
                              }
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#6366f1",
                              }}
                            >
                              {
                                leads.filter((l) => l.createdBy === u.name)
                                  .length
                              }
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#10b981",
                              }}
                            >
                              {
                                interviews.filter(
                                  (iv) => iv.interviewer === u.name,
                                ).length
                              }
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "80px",
                                    height: "6px",
                                    background: "#f1f3f9",
                                    borderRadius: "3px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${score}%`,
                                      background:
                                        score >= 70
                                          ? "#10b981"
                                          : score >= 40
                                            ? "#f59e0b"
                                            : "#ef4444",
                                      borderRadius: "3px",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color:
                                      score >= 70
                                        ? "#10b981"
                                        : score >= 40
                                          ? "#f59e0b"
                                          : "#ef4444",
                                  }}
                                >
                                  {score}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Meeting + Interview Stats */}
            <div style={s.chartRow}>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="📅"
                  title="Meetings Overview"
                  sub={`${meetings.length} total meetings`}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingTop: "8px",
                  }}
                >
                  {["Upcoming", "Completed", "Cancelled"].map((status, i) => {
                    const count = meetings.filter(
                      (m) => m.status === status,
                    ).length;
                    const pct =
                      meetings.length > 0
                        ? Math.round((count / meetings.length) * 100)
                        : 0;
                    const colors = ["#10b981", "#6366f1", "#ef4444"];
                    return (
                      <div key={status}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#374151" }}>
                            {status}
                          </span>
                          <span style={{ color: colors[i], fontWeight: "700" }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "8px",
                            background: "#f1f3f9",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: colors[i],
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ ...s.chartCard, flex: 1 }}>
                <SectionTitle
                  icon="📊"
                  title="Quick Metrics"
                  sub="Key performance indicators"
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingTop: "8px",
                  }}
                >
                  {[
                    {
                      label: "Lead → Placement Rate",
                      value: `${conversionRate}%`,
                      color: "#6366f1",
                    },
                    {
                      label: "Interview Pass Rate",
                      value: `${interviewPassRate}%`,
                      color: "#10b981",
                    },
                    {
                      label: "Open Job Orders",
                      value: jobs.filter((j) => j.status === "Open").length,
                      color: "#f59e0b",
                    },
                    {
                      label: "Won Deals",
                      value: wonDeals.length,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Avg Commission",
                      value:
                        placements.length > 0
                          ? `₹${Math.round(totalCommission / placements.length).toLocaleString("en-IN")}`
                          : "—",
                      color: "#3b82f6",
                    },
                    {
                      label: "Task Completion Rate",
                      value:
                        tasks.length > 0
                          ? `${Math.round((tasks.filter((t) => t.status === "Done").length / tasks.length) * 100)}%`
                          : "—",
                      color: "#0ea5e9",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        background: "#f8f9fc",
                        borderRadius: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "500",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          color: item.color,
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* CLIENTS SECTION */}
        {activeSection === "clients" && (
          <>
            <div style={s.kpiGrid}>
              <KPICard
                icon="🏢"
                label="Client Companies"
                value={Object.keys(clientMap).length || "—"}
                sub="Placed with"
                color="#6366f1"
                bg="#eef2ff"
              />
              <KPICard
                icon="🏆"
                label="Total Placements"
                value={placements.length}
                sub="Across all clients"
                change="12"
                color="#8b5cf6"
                bg="#f5f3ff"
              />
              <KPICard
                icon="💰"
                label="Total Revenue"
                value={`₹${(totalCommission / 100000).toFixed(1)}L`}
                sub="From placements"
                change="8"
                color="#f59e0b"
                bg="#fffbeb"
              />
              <KPICard
                icon="📈"
                label="Avg Per Client"
                value={
                  Object.keys(clientMap).length > 0
                    ? `₹${Math.round(totalCommission / Object.keys(clientMap).length).toLocaleString("en-IN")}`
                    : "—"
                }
                sub="Commission avg"
                color="#10b981"
                bg="#f0fdf4"
              />
              <KPICard
                icon="🔄"
                label="Repeat Clients"
                value={
                  Object.values(clientMap).filter((c) => c.count > 1).length ||
                  "—"
                }
                sub="Multiple placements"
                color="#3b82f6"
                bg="#eff6ff"
              />
              <KPICard
                icon="⭐"
                label="Top Client"
                value={topClients[0]?.name?.split(" ")[0] || "—"}
                sub={
                  topClients[0]
                    ? `${topClients[0].count} placements`
                    : "No data"
                }
                color="#0ea5e9"
                bg="#f0f9ff"
              />
            </div>

            {/* Top Clients Table */}
            <div style={s.chartCard}>
              <SectionTitle
                icon="🏢"
                title="Top Clients by Placements"
                sub="Client performance breakdown"
              />
              {topClients.length === 0 ? (
                <div style={s.noData}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🏢
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f1117",
                      marginBottom: "6px",
                    }}
                  >
                    No client data yet
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Add placements with client companies to see analytics
                  </div>
                </div>
              ) : (
                <div>
                  {topClients.map((client, i) => (
                    <div
                      key={client.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 0",
                        borderBottom: "1px solid #f1f3f9",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9px",
                          background: COLORS[i % COLORS.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {client.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#0f1117",
                            marginBottom: "4px",
                          }}
                        >
                          {client.name}
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "#f1f3f9",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(client.count / topClients[0].count) * 100}%`,
                              background: COLORS[i % COLORS.length],
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "800",
                            color: COLORS[i % COLORS.length],
                          }}
                        >
                          {client.count}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          placements
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0,
                          minWidth: "100px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#0f1117",
                          }}
                        >
                          ₹{client.revenue.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Placement locations/industry */}
            <div style={s.chartCard}>
              <SectionTitle
                icon="📊"
                title="Placements by Status"
                sub="Active vs Completed"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "14px",
                  padding: "10px 0",
                }}
              >
                {["Active", "Completed", "Terminated"].map((status, i) => {
                  const count = placements.filter(
                    (p) => p.status === status,
                  ).length;
                  const pct =
                    placements.length > 0
                      ? Math.round((count / placements.length) * 100)
                      : 0;
                  const colors = ["#10b981", "#6366f1", "#ef4444"];
                  return (
                    <div
                      key={status}
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        background: "#f8f9fc",
                        borderRadius: "12px",
                        border: "1px solid #e5e7f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "900",
                          color: colors[i],
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#374151",
                          marginTop: "4px",
                        }}
                      >
                        {status}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          marginTop: "2px",
                        }}
                      >
                        {pct}% of total
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: "#e5e7f0",
                          borderRadius: "2px",
                          overflow: "hidden",
                          marginTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: colors[i],
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
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
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  periodToggle: {
    display: "flex",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  periodBtn: {
    background: "none",
    border: "none",
    padding: "7px 14px",
    fontSize: "12.5px",
    color: "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  periodBtnActive: { background: "#6366f1", color: "#fff", fontWeight: "700" },
  printBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "9px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#6b7280",
  },
  sectionNav: {
    display: "flex",
    gap: "4px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    overflowX: "auto",
  },
  secNavBtn: {
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
  secNavBtnActive: {
    background: "#eef2ff",
    color: "#6366f1",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6,1fr)",
    gap: "12px",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  kpiTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  kpiIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },
  kpiChange: { fontSize: "11px", fontWeight: "700" },
  kpiVal: { fontSize: "22px", fontWeight: "800", letterSpacing: "-1px" },
  kpiLabel: {
    fontSize: "11.5px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "3px",
  },
  kpiSub: { fontSize: "10.5px", color: "#9ca3af", marginTop: "2px" },
  chartCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  chartRow: { display: "flex", gap: "14px" },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  sectionTitleText: { fontSize: "14px", fontWeight: "700", color: "#0f1117" },
  sectionTitleSub: { fontSize: "11.5px", color: "#9ca3af", marginTop: "2px" },
  noData: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "120px",
    color: "#9ca3af",
    fontSize: "13px",
    gap: "8px",
  },
};
