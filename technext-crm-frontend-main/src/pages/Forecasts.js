import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

function Forecasts() {
  const [deals, setDeals] = useState([]);
  const [period, setPeriod] = useState("This Quarter");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/deals`)
      .then((r) => setDeals(r.data))
      .catch(() => {});
  }, []);

  const totalPipeline = deals.reduce(
    (sum, d) => sum + (parseFloat(d.amount) || 0),
    0,
  );
  const wonValue = deals
    .filter((d) => d.stage === "Closed Won")
    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const target = 1000000;
  const achievement = target > 0 ? Math.round((wonValue / target) * 100) : 0;

  const stageData = [
    { stage: "Prospecting", probability: 10 },
    { stage: "Qualified", probability: 25 },
    { stage: "Proposal", probability: 50 },
    { stage: "Negotiation", probability: 75 },
    { stage: "Closed Won", probability: 100 },
    { stage: "Closed Lost", probability: 0 },
  ];

  const getForecastValue = (stage, probability) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    const total = stageDeals.reduce(
      (sum, d) => sum + (parseFloat(d.amount) || 0),
      0,
    );
    return {
      count: stageDeals.length,
      total,
      weighted: (total * probability) / 100,
    };
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Forecasts</span>
        </div>
        <div style={s.headerRight}>
          <select
            style={s.select}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div style={s.kpiRow}>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Total Pipeline</div>
          <div style={s.kpiVal}>₹{(totalPipeline / 100000).toFixed(1)}L</div>
          <div style={s.kpiSub}>{deals.length} deals</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Won Revenue</div>
          <div style={{ ...s.kpiVal, color: "#10b981" }}>
            ₹{(wonValue / 100000).toFixed(1)}L
          </div>
          <div style={s.kpiSub}>
            {deals.filter((d) => d.stage === "Closed Won").length} deals closed
          </div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Target</div>
          <div style={s.kpiVal}>₹{(target / 100000).toFixed(0)}L</div>
          <div style={s.kpiSub}>{period}</div>
        </div>
        <div style={s.kpi}>
          <div style={s.kpiLabel}>Achievement</div>
          <div
            style={{
              ...s.kpiVal,
              color:
                achievement >= 100
                  ? "#10b981"
                  : achievement >= 50
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          >
            {achievement}%
          </div>
          <div style={s.kpiSub}>of target</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={s.progressCard}>
        <div style={s.progressHeader}>
          <span style={s.progressTitle}>Revenue Target — {period}</span>
          <span style={s.progressPct}>{achievement}%</span>
        </div>
        <div style={s.progressTrack}>
          <div
            style={{
              ...s.progressFill,
              width: `${Math.min(achievement, 100)}%`,
              background: achievement >= 100 ? "#10b981" : "#3b82f6",
            }}
          />
        </div>
        <div style={s.progressLabels}>
          <span>₹0</span>
          <span style={{ color: "#10b981", fontWeight: 700 }}>
            ₹{(wonValue / 100000).toFixed(1)}L Won
          </span>
          <span>Target: ₹{(target / 100000).toFixed(0)}L</span>
        </div>
      </div>

      {/* Stage Forecast Table */}
      <div style={s.card}>
        <div style={s.cardTitle}>Pipeline by Stage — Weighted Forecast</div>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Stage</th>
              <th style={s.th}>Deals</th>
              <th style={s.th}>Total Value</th>
              <th style={s.th}>Probability</th>
              <th style={s.th}>Weighted Value</th>
              <th style={s.th}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {stageData.map(({ stage, probability }) => {
              const { count, total, weighted } = getForecastValue(
                stage,
                probability,
              );
              return (
                <tr key={stage} style={s.trow}>
                  <td style={s.tdLink}>{stage}</td>
                  <td style={s.td}>{count}</td>
                  <td style={s.td}>₹{(total / 100000).toFixed(1)}L</td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                      }}
                    >
                      {probability}%
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#1a1f3a" }}>
                    ₹{(weighted / 100000).toFixed(1)}L
                  </td>
                  <td style={s.td}>
                    <div style={s.miniTrack}>
                      <div
                        style={{
                          ...s.miniFill,
                          width: `${totalPipeline > 0 ? (total / totalPipeline) * 100 : 0}%`,
                          background:
                            stage === "Closed Won"
                              ? "#10b981"
                              : stage === "Closed Lost"
                                ? "#ef4444"
                                : "#3b82f6",
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

      {/* Deal List */}
      <div style={s.card}>
        <div style={s.cardTitle}>All Deals in Pipeline</div>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
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
                <td colSpan={5} style={s.empty}>
                  No deals found. Add deals from the Deals module!
                </td>
              </tr>
            ) : (
              deals.map((d) => (
                <tr key={d.id} style={s.trow}>
                  <td style={s.tdLink}>{d.name}</td>
                  <td style={s.td}>{d.accountName || "—"}</td>
                  <td style={s.td}>
                    {d.amount
                      ? `₹${parseFloat(d.amount).toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...getStageBadge(d.stage) }}>
                      {d.stage}
                    </span>
                  </td>
                  <td style={s.td}>{d.closingDate || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const getStageBadge = (stage) => {
  switch (stage) {
    case "Closed Won":
      return { background: "#dcfce7", color: "#15803d" };
    case "Closed Lost":
      return { background: "#fee2e2", color: "#b91c1c" };
    case "Negotiation":
      return { background: "#fef3c7", color: "#92400e" };
    case "Proposal":
      return { background: "#ede9fe", color: "#5b21b6" };
    case "Qualified":
      return { background: "#dbeafe", color: "#1d4ed8" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
};

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#f4f5f7",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#1a1f3a" },
  headerRight: { display: "flex", gap: "8px" },
  select: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    color: "#475569",
    outline: "none",
    cursor: "pointer",
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "14px",
    padding: "16px 20px",
  },
  kpi: {
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "16px",
    textAlign: "center",
  },
  kpiLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  kpiVal: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1a1f3a",
    letterSpacing: "-1px",
  },
  kpiSub: { fontSize: "11px", color: "#94a3b8", marginTop: "4px" },
  progressCard: {
    margin: "0 20px 16px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "18px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  progressTitle: { fontSize: "13px", fontWeight: "700", color: "#1a1f3a" },
  progressPct: { fontSize: "13px", fontWeight: "700", color: "#3b82f6" },
  progressTrack: {
    height: "12px",
    background: "#f1f5f9",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.5s",
  },
  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#64748b",
  },
  card: {
    margin: "0 20px 16px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "18px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1f3a",
    marginBottom: "14px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "10px 12px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    whiteSpace: "nowrap",
  },
  trow: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "10px 12px", fontSize: "12.5px", color: "#475569" },
  tdLink: {
    padding: "10px 12px",
    fontSize: "12.5px",
    color: "#3b82f6",
    fontWeight: "500",
  },
  badge: {
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  miniTrack: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "3px",
    width: "80px",
    overflow: "hidden",
  },
  miniFill: { height: "100%", borderRadius: "3px", transition: "width 0.3s" },
  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

export default Forecasts;
