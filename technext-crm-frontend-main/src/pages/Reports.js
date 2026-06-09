import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = "http://localhost:8080/api";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Reports() {
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/leads`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/candidates`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/placements`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/deals`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/tasks`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/meetings`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/jobs`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/interviews`).catch(() => ({ data: [] })),
      axios.get(`${BASE_URL}/users`).catch(() => ({ data: [] })),
    ]).then(([l, c, p, d, t, m, j, iv, u]) => {
      setLeads(l.data);
      setCandidates(c.data);
      setPlacements(p.data);
      setDeals(d.data);
      setTasks(t.data);
      setMeetings(m.data);
      setJobs(j.data);
      setInterviews(iv.data);
      setUsers(u.data);
      setLoading(false);
    });
  }, []);

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

  const exportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `TechNext_${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const handlePrint = (reportType) => {
    const date = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    let content = "";
    let title = "";

    switch (reportType) {
      case "overview":
        title = "Overall CRM Summary Report";
        content = `
          <h2 style="color:#6366f1;margin-bottom:20px">📊 ${title}</h2>
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#f8f9fc;font-weight:bold"><th>Module</th><th>Total</th><th>Key Metrics</th><th>Status</th></tr>
            <tr><td>Leads</td><td>${leads.length}</td><td>Hot: ${leads.filter((l) => l.status === "Hot").length} | Warm: ${leads.filter((l) => l.status === "Warm").length} | New: ${leads.filter((l) => l.status === "New").length}</td><td>Active</td></tr>
            <tr style="background:#f8f9fc"><td>Candidates</td><td>${candidates.length}</td><td>Placed: ${candidates.filter((c) => c.stage === "Placed").length} | Interview: ${candidates.filter((c) => c.stage === "Interview").length}</td><td>Active</td></tr>
            <tr><td>Interviews</td><td>${interviews.length}</td><td>Pass: ${interviews.filter((i) => i.result === "Pass").length} | Fail: ${interviews.filter((i) => i.result === "Fail").length} | Pending: ${interviews.filter((i) => i.result === "Pending").length}</td><td>Active</td></tr>
            <tr style="background:#f8f9fc"><td>Placements</td><td>${placements.length}</td><td>Active: ${placements.filter((p) => p.status === "Active").length} | Commission: ₹${totalCommission.toLocaleString("en-IN")}</td><td>Active</td></tr>
            <tr><td>Deals</td><td>${deals.length}</td><td>Pipeline: ₹${totalPipeline.toLocaleString("en-IN")} | Won: ₹${wonValue.toLocaleString("en-IN")}</td><td>Active</td></tr>
            <tr style="background:#f8f9fc"><td>Job Orders</td><td>${jobs.length}</td><td>Open: ${jobs.filter((j) => j.status === "Open").length} | Closed: ${jobs.filter((j) => j.status === "Closed").length}</td><td>Active</td></tr>
            <tr><td>Tasks</td><td>${tasks.length}</td><td>Done: ${tasks.filter((t) => t.status === "Done").length} | Pending: ${tasks.filter((t) => t.status === "Pending").length}</td><td>Active</td></tr>
            <tr style="background:#f8f9fc"><td>Meetings</td><td>${meetings.length}</td><td>Upcoming: ${meetings.filter((m) => m.status === "Upcoming").length} | Completed: ${meetings.filter((m) => m.status === "Completed").length}</td><td>Active</td></tr>
          </table>
          <br>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
            <div style="background:#f0fdf4;padding:16px;border-radius:8px;border:1px solid #bbf7d0">
              <h3 style="color:#10b981;margin-bottom:8px">💰 Revenue Summary</h3>
              <p>Total Commission: <strong>₹${totalCommission.toLocaleString("en-IN")}</strong></p>
              <p>Deal Pipeline: <strong>₹${totalPipeline.toLocaleString("en-IN")}</strong></p>
              <p>Won Deals Value: <strong>₹${wonValue.toLocaleString("en-IN")}</strong></p>
            </div>
            <div style="background:#eef2ff;padding:16px;border-radius:8px;border:1px solid #c7d2fe">
              <h3 style="color:#6366f1;margin-bottom:8px">📈 Conversion Metrics</h3>
              <p>Lead → Placement: <strong>${leads.length > 0 ? Math.round((placements.length / leads.length) * 100) : 0}%</strong></p>
              <p>Interview Pass Rate: <strong>${interviews.length > 0 ? Math.round((interviews.filter((i) => i.result === "Pass").length / interviews.length) * 100) : 0}%</strong></p>
              <p>Task Completion: <strong>${tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "Done").length / tasks.length) * 100) : 0}%</strong></p>
            </div>
          </div>
        `;
        break;
      case "placements":
        title = "Placements Report";
        content = `
          <h2 style="color:#6366f1;margin-bottom:20px">🏆 ${title}</h2>
          <p style="color:#6b7280;margin-bottom:16px">Total Commission: <strong style="color:#8b5cf6">₹${totalCommission.toLocaleString("en-IN")}</strong></p>
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#f8f9fc"><th>#</th><th>Candidate</th><th>Job Title</th><th>Client</th><th>Start Date</th><th>Salary</th><th>Commission</th><th>Status</th></tr>
            ${placements.map((p, i) => `<tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}"><td>${i + 1}</td><td><strong>${p.candidateName || "—"}</strong></td><td>${p.jobTitle || "—"}</td><td>${p.clientCompany || "—"}</td><td>${p.startDate || "—"}</td><td>₹${parseFloat(p.salary || 0).toLocaleString("en-IN")}</td><td><strong>₹${parseFloat(p.commission || 0).toLocaleString("en-IN")}</strong></td><td>${p.status || "—"}</td></tr>`).join("")}
            <tr style="background:#eef2ff;font-weight:bold"><td colspan="6">TOTAL</td><td>₹${totalCommission.toLocaleString("en-IN")}</td><td></td></tr>
          </table>
        `;
        break;
      case "interviews":
        title = "Interview Report";
        content = `
          <h2 style="color:#6366f1;margin-bottom:20px">🎤 ${title}</h2>
          <p style="color:#6b7280;margin-bottom:16px">Total: ${interviews.length} | Pass: ${interviews.filter((i) => i.result === "Pass").length} | Fail: ${interviews.filter((i) => i.result === "Fail").length}</p>
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#f8f9fc"><th>#</th><th>Candidate</th><th>Job</th><th>Company</th><th>Date</th><th>Type</th><th>Round</th><th>Interviewer</th><th>Status</th><th>Result</th></tr>
            ${interviews.map((iv, i) => `<tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}"><td>${i + 1}</td><td><strong>${iv.candidateName || "—"}</strong></td><td>${iv.jobTitle || "—"}</td><td>${iv.clientCompany || "—"}</td><td>${iv.interviewDate || "—"}</td><td>${iv.interviewType || "—"}</td><td>${iv.round || "—"}</td><td>${iv.interviewer || "—"}</td><td>${iv.status || "—"}</td><td><strong style="color:${iv.result === "Pass" ? "#10b981" : iv.result === "Fail" ? "#ef4444" : "#f59e0b"}">${iv.result || "—"}</strong></td></tr>`).join("")}
          </table>
        `;
        break;
      case "leads":
        title = "Leads Report";
        content = `
          <h2 style="color:#6366f1;margin-bottom:20px">👤 ${title}</h2>
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#f8f9fc"><th>#</th><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Source</th><th>Status</th></tr>
            ${leads.map((l, i) => `<tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}"><td>${i + 1}</td><td><strong>${l.name || "—"}</strong></td><td>${l.company || "—"}</td><td>${l.email || "—"}</td><td>${l.phone || "—"}</td><td>${l.source || "—"}</td><td>${l.status || "—"}</td></tr>`).join("")}
          </table>
        `;
        break;
      case "candidates":
        title = "Candidates Report";
        content = `
          <h2 style="color:#6366f1;margin-bottom:20px">🪪 ${title}</h2>
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#f8f9fc"><th>#</th><th>Name</th><th>Current Role</th><th>Skills</th><th>Experience</th><th>Location</th><th>Stage</th></tr>
            ${candidates.map((c, i) => `<tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}"><td>${i + 1}</td><td><strong>${c.name || "—"}</strong></td><td>${c.currentRole || "—"}</td><td>${c.skills || "—"}</td><td>${c.experience || "—"}</td><td>${c.location || "—"}</td><td>${c.stage || "—"}</td></tr>`).join("")}
          </table>
        `;
        break;
      case "deals":
        title = "Deals Report";
        content = `
          <h2 style="color:#6366f1;margin-bottom:20px">🤝 ${title}</h2>
          <p style="color:#6b7280;margin-bottom:16px">Pipeline: <strong>₹${totalPipeline.toLocaleString("en-IN")}</strong> | Won: <strong style="color:#10b981">₹${wonValue.toLocaleString("en-IN")}</strong></p>
          <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:13px">
            <tr style="background:#f8f9fc"><th>#</th><th>Deal Name</th><th>Account</th><th>Amount</th><th>Stage</th><th>Closing Date</th></tr>
            ${deals.map((d, i) => `<tr style="${i % 2 === 0 ? "" : "background:#f8f9fc"}"><td>${i + 1}</td><td><strong>${d.name || "—"}</strong></td><td>${d.accountName || "—"}</td><td>₹${parseFloat(d.amount || 0).toLocaleString("en-IN")}</td><td>${d.stage || "—"}</td><td>${d.closingDate || "—"}</td></tr>`).join("")}
            <tr style="background:#eef2ff;font-weight:bold"><td colspan="3">TOTAL PIPELINE</td><td>₹${totalPipeline.toLocaleString("en-IN")}</td><td colspan="2"></td></tr>
          </table>
        `;
        break;
      default:
        title = "Report";
        content = "<p>Report data</p>";
    }

    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>TechNext Report - ${title}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;color:#0f1117}
      .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #6366f1}
      .company{font-size:22px;font-weight:800;color:#6366f1}.company-sub{font-size:11px;color:#6b7280;margin-top:4px}
      table{border-color:#e5e7f0}th{background:#f8f9fc;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
      td,th{border-color:#e5e7f0!important}
      .footer{margin-top:40px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7f0;padding-top:16px}
      @media print{body{padding:20px}}</style></head><body>
      <div class="header">
        <div><div class="company">TechNext Staffing Pvt. Ltd.</div><div class="company-sub">Koramangala, Bengaluru - 560034 | info@technextstaffing.in</div></div>
        <div style="text-align:right"><div style="font-size:14px;font-weight:700">Generated: ${date}</div><div style="font-size:12px;color:#6b7280;margin-top:4px">TechNext CRM Report</div></div>
      </div>
      ${content}
      <div class="footer">This report was generated from TechNext CRM Portal · Confidential · ${date}</div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "placements", label: "Placements", icon: "🏆" },
    { id: "interviews", label: "Interviews", icon: "🎤" },
    { id: "leads", label: "Leads", icon: "👤" },
    { id: "candidates", label: "Candidates", icon: "🪪" },
    { id: "deals", label: "Deals", icon: "🤝" },
    { id: "activities", label: "Activities", icon: "📅" },
  ];

  const StatCard = ({ icon, label, value, sub, color }) => (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: color + "20" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
      </div>
      <div style={{ ...s.statVal, color }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
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
          Loading reports...
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.title}>Reports</div>
          <div style={s.sub}>Detailed data reports across all modules</div>
        </div>
        <div style={s.headerRight}>
          <button
            style={s.exportBtn}
            onClick={() =>
              exportToExcel(
                activeTab === "placements"
                  ? placements.map((p) => ({
                      Candidate: p.candidateName,
                      Job: p.jobTitle,
                      Client: p.clientCompany,
                      Salary: p.salary,
                      Commission: p.commission,
                      Status: p.status,
                    }))
                  : activeTab === "leads"
                    ? leads.map((l) => ({
                        Name: l.name,
                        Company: l.company,
                        Email: l.email,
                        Phone: l.phone,
                        Source: l.source,
                        Status: l.status,
                      }))
                    : activeTab === "candidates"
                      ? candidates.map((c) => ({
                          Name: c.name,
                          Role: c.currentRole,
                          Skills: c.skills,
                          Experience: c.experience,
                          Location: c.location,
                          Stage: c.stage,
                        }))
                      : activeTab === "interviews"
                        ? interviews.map((iv) => ({
                            Candidate: iv.candidateName,
                            Job: iv.jobTitle,
                            Company: iv.clientCompany,
                            Date: iv.interviewDate,
                            Type: iv.interviewType,
                            Round: iv.round,
                            Interviewer: iv.interviewer,
                            Status: iv.status,
                            Result: iv.result,
                          }))
                        : activeTab === "deals"
                          ? deals.map((d) => ({
                              Name: d.name,
                              Account: d.accountName,
                              Amount: d.amount,
                              Stage: d.stage,
                              ClosingDate: d.closingDate,
                            }))
                          : [],
                `TechNext_${activeTab}`,
              )
            }
          >
            ⬇ Export Excel
          </button>
          <button
            style={s.printBtn}
            onClick={() =>
              handlePrint(activeTab === "activities" ? "overview" : activeTab)
            }
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      <div style={s.tabs}>
        {tabs.map((tab) => (
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
        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div style={s.statsGrid}>
              <StatCard
                icon="👤"
                label="Total Leads"
                value={leads.length}
                sub={`Hot: ${leads.filter((l) => l.status === "Hot").length}`}
                color="#6366f1"
              />
              <StatCard
                icon="🪪"
                label="Candidates"
                value={candidates.length}
                sub={`Placed: ${candidates.filter((c) => c.stage === "Placed").length}`}
                color="#10b981"
              />
              <StatCard
                icon="🎤"
                label="Interviews"
                value={interviews.length}
                sub={`Pass: ${interviews.filter((i) => i.result === "Pass").length}`}
                color="#3b82f6"
              />
              <StatCard
                icon="🏆"
                label="Placements"
                value={placements.length}
                sub={`Active: ${placements.filter((p) => p.status === "Active").length}`}
                color="#8b5cf6"
              />
              <StatCard
                icon="💰"
                label="Commission"
                value={`₹${(totalCommission / 100000).toFixed(1)}L`}
                sub="Total earned"
                color="#f59e0b"
              />
              <StatCard
                icon="🤝"
                label="Deal Pipeline"
                value={`₹${(totalPipeline / 100000).toFixed(1)}L`}
                sub={`Won: ₹${(wonValue / 100000).toFixed(1)}L`}
                color="#0ea5e9"
              />
              <StatCard
                icon="📋"
                label="Job Orders"
                value={jobs.length}
                sub={`Open: ${jobs.filter((j) => j.status === "Open").length}`}
                color="#ef4444"
              />
              <StatCard
                icon="✅"
                label="Tasks"
                value={tasks.length}
                sub={`Done: ${tasks.filter((t) => t.status === "Done").length}`}
                color="#10b981"
              />
            </div>
            <div style={s.tableCard}>
              <div style={s.tableTitle}>Lead Status Breakdown</div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Count</th>
                    <th style={s.th}>Percentage</th>
                    <th style={s.th}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {["Hot", "Warm", "New", "Cold"].map((st) => {
                    const count = leads.filter((l) => l.status === st).length;
                    const pct =
                      leads.length > 0
                        ? Math.round((count / leads.length) * 100)
                        : 0;
                    const colors = {
                      Hot: "#ef4444",
                      Warm: "#f59e0b",
                      New: "#3b82f6",
                      Cold: "#6b7280",
                    };
                    return (
                      <tr key={st} style={s.trow}>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: colors[st] + "20",
                              color: colors[st],
                            }}
                          >
                            {st}
                          </span>
                        </td>
                        <td style={s.td}>
                          <strong>{count}</strong>
                        </td>
                        <td style={s.td}>{pct}%</td>
                        <td style={s.td}>
                          <div style={s.progTrack}>
                            <div
                              style={{
                                ...s.progFill,
                                width: `${pct}%`,
                                background: colors[st],
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Placements */}
        {activeTab === "placements" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>
                All Placements ({placements.length})
              </div>
              <div style={s.tableSub}>
                Total Commission:{" "}
                <strong style={{ color: "#8b5cf6" }}>
                  ₹{totalCommission.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Candidate</th>
                  <th style={s.th}>Job Title</th>
                  <th style={s.th}>Client</th>
                  <th style={s.th}>Start Date</th>
                  <th style={s.th}>Salary</th>
                  <th style={s.th}>Commission</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {placements.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={s.empty}>
                      No placements yet
                    </td>
                  </tr>
                ) : (
                  placements.map((p, i) => (
                    <tr key={p.id} style={s.trow}>
                      <td style={s.td}>{i + 1}</td>
                      <td
                        style={{ ...s.td, fontWeight: "600", color: "#6366f1" }}
                      >
                        {p.candidateName || "—"}
                      </td>
                      <td style={s.td}>{p.jobTitle || "—"}</td>
                      <td style={s.td}>{p.clientCompany || "—"}</td>
                      <td style={s.td}>{p.startDate || "—"}</td>
                      <td style={{ ...s.td, fontWeight: "700" }}>
                        ₹{parseFloat(p.salary || 0).toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{ ...s.td, fontWeight: "700", color: "#8b5cf6" }}
                      >
                        ₹{parseFloat(p.commission || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              p.status === "Active"
                                ? "#f0fdf4"
                                : p.status === "Completed"
                                  ? "#eff6ff"
                                  : "#fef2f2",
                            color:
                              p.status === "Active"
                                ? "#10b981"
                                : p.status === "Completed"
                                  ? "#3b82f6"
                                  : "#ef4444",
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Interviews */}
        {activeTab === "interviews" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>
                All Interviews ({interviews.length})
              </div>
              <div style={s.tableSub}>
                Pass:{" "}
                <strong style={{ color: "#10b981" }}>
                  {interviews.filter((i) => i.result === "Pass").length}
                </strong>{" "}
                | Fail:{" "}
                <strong style={{ color: "#ef4444" }}>
                  {interviews.filter((i) => i.result === "Fail").length}
                </strong>{" "}
                | Pending:{" "}
                <strong style={{ color: "#f59e0b" }}>
                  {interviews.filter((i) => i.result === "Pending").length}
                </strong>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Candidate</th>
                  <th style={s.th}>Job</th>
                  <th style={s.th}>Company</th>
                  <th style={s.th}>Date & Time</th>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Round</th>
                  <th style={s.th}>Interviewer</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Result</th>
                </tr>
              </thead>
              <tbody>
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={s.empty}>
                      No interviews yet
                    </td>
                  </tr>
                ) : (
                  interviews.map((iv, i) => {
                    const rc = {
                      Pass: { bg: "#f0fdf4", color: "#10b981" },
                      Fail: { bg: "#fef2f2", color: "#ef4444" },
                      Hold: { bg: "#fffbeb", color: "#f59e0b" },
                      Pending: { bg: "#f9fafb", color: "#6b7280" },
                    }[iv.result] || { bg: "#f9fafb", color: "#6b7280" };
                    const sc = {
                      Scheduled: { bg: "#eff6ff", color: "#3b82f6" },
                      Completed: { bg: "#f0fdf4", color: "#10b981" },
                      Cancelled: { bg: "#fef2f2", color: "#ef4444" },
                    }[iv.status] || { bg: "#f9fafb", color: "#6b7280" };
                    return (
                      <tr key={iv.id} style={s.trow}>
                        <td style={s.td}>{i + 1}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "600",
                            color: "#6366f1",
                          }}
                        >
                          {iv.candidateName || "—"}
                        </td>
                        <td style={s.td}>{iv.jobTitle || "—"}</td>
                        <td style={s.td}>{iv.clientCompany || "—"}</td>
                        <td style={s.td}>
                          <div style={{ fontWeight: "600" }}>
                            {iv.interviewDate || "—"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {iv.interviewTime || ""}
                          </div>
                        </td>
                        <td style={s.td}>{iv.interviewType || "—"}</td>
                        <td style={s.td}>{iv.round || "—"}</td>
                        <td style={s.td}>{iv.interviewer || "—"}</td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            {iv.status}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: rc.bg,
                              color: rc.color,
                              fontWeight: "700",
                            }}
                          >
                            {iv.result}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Leads */}
        {activeTab === "leads" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>All Leads ({leads.length})</div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Company</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>Source</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={s.empty}>
                      No leads yet
                    </td>
                  </tr>
                ) : (
                  leads.map((l, i) => {
                    const colors = {
                      Hot: "#ef4444",
                      Warm: "#f59e0b",
                      New: "#3b82f6",
                      Cold: "#6b7280",
                    };
                    return (
                      <tr key={l.id} style={s.trow}>
                        <td style={s.td}>{i + 1}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "600",
                            color: "#6366f1",
                          }}
                        >
                          {l.name || "—"}
                        </td>
                        <td style={s.td}>{l.company || "—"}</td>
                        <td style={s.td}>{l.email || "—"}</td>
                        <td style={s.td}>{l.phone || "—"}</td>
                        <td style={s.td}>
                          <span style={s.sourceChip}>{l.source || "—"}</span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background:
                                (colors[l.status] || "#6b7280") + "20",
                              color: colors[l.status] || "#6b7280",
                            }}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Candidates */}
        {activeTab === "candidates" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>
                All Candidates ({candidates.length})
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Skills</th>
                  <th style={s.th}>Experience</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={s.empty}>
                      No candidates yet
                    </td>
                  </tr>
                ) : (
                  candidates.map((c, i) => (
                    <tr key={c.id} style={s.trow}>
                      <td style={s.td}>{i + 1}</td>
                      <td
                        style={{ ...s.td, fontWeight: "600", color: "#6366f1" }}
                      >
                        {c.name || "—"}
                      </td>
                      <td style={s.td}>{c.currentRole || "—"}</td>
                      <td style={s.td}>
                        {c.skills
                          ? c.skills.split(",").slice(0, 3).join(", ")
                          : "—"}
                      </td>
                      <td style={s.td}>{c.experience || "—"}</td>
                      <td style={s.td}>{c.location || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background: "#f5f3ff",
                            color: "#8b5cf6",
                          }}
                        >
                          {c.stage}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Deals */}
        {activeTab === "deals" && (
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <div style={s.tableTitle}>All Deals ({deals.length})</div>
              <div style={s.tableSub}>
                Pipeline:{" "}
                <strong style={{ color: "#f59e0b" }}>
                  ₹{totalPipeline.toLocaleString("en-IN")}
                </strong>{" "}
                · Won:{" "}
                <strong style={{ color: "#10b981" }}>
                  ₹{wonValue.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Deal Name</th>
                  <th style={s.th}>Account</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Stage</th>
                  <th style={s.th}>Closing Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={s.empty}>
                      No deals yet
                    </td>
                  </tr>
                ) : (
                  deals.map((d, i) => {
                    const sc = {
                      Won: { bg: "#f0fdf4", color: "#10b981" },
                      Lost: { bg: "#fef2f2", color: "#ef4444" },
                    }[
                      d.stage?.includes("Won")
                        ? "Won"
                        : d.stage?.includes("Lost")
                          ? "Lost"
                          : ""
                    ] || { bg: "#eff6ff", color: "#3b82f6" };
                    return (
                      <tr key={d.id} style={s.trow}>
                        <td style={s.td}>{i + 1}</td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: "600",
                            color: "#6366f1",
                          }}
                        >
                          {d.name || "—"}
                        </td>
                        <td style={s.td}>{d.accountName || "—"}</td>
                        <td style={{ ...s.td, fontWeight: "700" }}>
                          ₹{parseFloat(d.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td style={s.td}>
                          <span
                            style={{
                              ...s.badge,
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            {d.stage}
                          </span>
                        </td>
                        <td style={s.td}>{d.closingDate || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Activities */}
        {activeTab === "activities" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div style={s.tableCard}>
              <div style={s.tableTitle}>Recent Tasks ({tasks.length})</div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Task</th>
                    <th style={s.th}>Due Date</th>
                    <th style={s.th}>Priority</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 10).map((t) => (
                    <tr key={t.id} style={s.trow}>
                      <td style={s.td}>{t.title || "—"}</td>
                      <td style={s.td}>{t.dueDate || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              t.priority === "High" ? "#fef2f2" : "#fffbeb",
                            color:
                              t.priority === "High" ? "#ef4444" : "#f59e0b",
                          }}
                        >
                          {t.priority || "Normal"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              t.status === "Done" ? "#f0fdf4" : "#fef2f2",
                            color: t.status === "Done" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={s.tableCard}>
              <div style={s.tableTitle}>
                Recent Meetings ({meetings.length})
              </div>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Title</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Duration</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.slice(0, 10).map((m) => (
                    <tr key={m.id} style={s.trow}>
                      <td style={s.td}>{m.title || "—"}</td>
                      <td style={s.td}>{m.meetingDate || "—"}</td>
                      <td style={s.td}>{m.duration || "—"}</td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.badge,
                            background:
                              m.status === "Upcoming" ? "#f0fdf4" : "#f9fafb",
                            color:
                              m.status === "Upcoming" ? "#10b981" : "#6b7280",
                          }}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    padding: "18px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: { display: "flex", gap: "10px" },
  exportBtn: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#10b981",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  printBtn: {
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
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "12px 20px",
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
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  tabActive: { background: "#eef2ff", color: "#6366f1", fontWeight: "700" },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "12px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  statVal: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "3px",
  },
  statSub: { fontSize: "11px", color: "#9ca3af", marginTop: "2px" },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  tableHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f3f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f1117",
    padding: "16px 20px 12px",
  },
  tableSub: { fontSize: "12.5px", color: "#6b7280", padding: "0 20px 12px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8f9fc" },
  th: {
    padding: "10px 16px",
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
  td: { padding: "11px 16px", fontSize: "13px", color: "#374151" },
  badge: {
    padding: "3px 9px",
    borderRadius: "20px",
    fontSize: "11.5px",
    fontWeight: "700",
  },
  sourceChip: {
    background: "#f1f3f9",
    color: "#6b7280",
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  progTrack: {
    width: "120px",
    height: "6px",
    background: "#f1f3f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progFill: { height: "100%", borderRadius: "3px", transition: "width 0.3s" },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
  },
};
