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

// ✅ FIX 1: Unified salary calculation matching EXACT company format
// Basic + HRA + Fixed Allowance (combined) → matches TechNext payslip
const calcSalary = (basicPay, adj = {}) => {
  const basic = parseFloat(basicPay) || 0;
  const lopDays = parseInt(adj.lopDays) || 0;
  const workingDays = parseInt(adj.workingDays) || 26;

  // LOP deduction
  const lopDeduction =
    lopDays > 0 ? Math.round((basic / workingDays) * lopDays) : 0;
  const effBasic = basic - lopDeduction;

  // Earnings — matching company format
  const hra = Math.round(effBasic * 0.4);
  const fixedAllowance = Math.round(effBasic * 0.175) + 2000 + 1250; // Special(17.5%) + Transport + Medical combined

  const bonusAmt = parseFloat(adj.bonusAmount) || 0;
  const grossSalary = Math.round(effBasic) + hra + fixedAllowance + bonusAmt;

  // Deductions
  const epf = Math.round(effBasic * 0.12);
  const esi = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
  const profTax = basic <= 10000 ? 0 : basic <= 15000 ? 150 : 200;
  const tds = basic > 50000 ? Math.round(grossSalary * 0.1) : 0;
  const extraDed = parseFloat(adj.extraDeduction) || 0;
  const totalDeductions = epf + esi + profTax + tds + extraDed;

  return {
    basic: Math.round(effBasic),
    hra,
    fixedAllowance,
    bonus: bonusAmt,
    lopDeduction,
    grossSalary,
    epf,
    esi,
    profTax,
    tds,
    extraDed,
    totalDeductions,
    netSalary: grossSalary - totalDeductions,
  };
};

// ✅ FIX 2: Number to words
const numberToWords = (num) => {
  num = Math.round(num);
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (num === 0) return "Zero";
  if (num < 20) return a[num];
  if (num < 100)
    return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
  if (num < 1000)
    return (
      a[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " " + numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );
  if (num < 10000000)
    return (
      numberToWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 ? " " + numberToWords(num % 100000) : "")
    );
  return (
    numberToWords(Math.floor(num / 10000000)) +
    " Crore" +
    (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
  );
};

// ✅ FIX 3: Get last day of month as pay date
const getPayDate = (m, y) => {
  const lastDay = new Date(y, m, 0).getDate();
  return `${String(lastDay).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

// ✅ FIX 4: Print payslip matching EXACT company format
const printPayslip = (emp, sal, pMonth, pYear, adj, empInfo) => {
  const name = emp.employeeName || emp.name || empInfo?.name || "—";
  const empId =
    emp.employeeId || empInfo?.employeeId || empInfo?.employee_id || "—";
  const designation = emp.role || empInfo?.role || "—";
  const department = emp.department || empInfo?.department || "—";
  const joiningDate =
    empInfo?.joiningDate || empInfo?.joining_date || emp.joiningDate || "—";
  const pan = empInfo?.panNumber || empInfo?.pan_number || emp.panNumber || "—";
  const bankAcc =
    empInfo?.bankAccount || empInfo?.bank_account || emp.bankAccount || "—";
  const workLoc =
    empInfo?.workLocation ||
    empInfo?.work_location ||
    emp.workLocation ||
    "Bangalore";
  const lopDays = adj?.lopDays || emp.lopDays || 0;
  const workingDays = adj?.workingDays || emp.workingDays || 26;
  const paidDays = workingDays - lopDays;
  const payDate = getPayDate(pMonth, pYear);
  const ytd = sal; // For now YTD = current month

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Payslip - ${name} - ${MONTHS[pMonth - 1]} ${pYear}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background:#fff; color:#333; font-size:12px; }
    .page { width:794px; min-height:1123px; margin:0 auto; padding:32px 36px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:14px; border-bottom:1px solid #ccc; margin-bottom:18px; }
    .company-name { font-size:17px; font-weight:bold; color:#000; }
    .company-addr { font-size:11px; color:#666; margin-top:3px; }
    .payslip-month { font-size:13px; font-weight:bold; color:#333; margin-bottom:14px; }
    .pay-summary-label { font-size:13px; font-weight:bold; margin-bottom:10px; }
    .summary-layout { display:flex; gap:20px; margin-bottom:22px; }
    .summary-left { flex:1; }
    .info-row { display:flex; margin-bottom:7px; }
    .info-label { width:130px; font-size:11px; color:#888; flex-shrink:0; }
    .info-value { font-size:11px; color:#000; font-weight:600; }
    .net-pay-box { width:220px; border:1px solid #ccc; border-radius:4px; padding:16px; text-align:center; flex-shrink:0; }
    .net-pay-label { font-size:11px; color:#888; margin-bottom:8px; }
    .net-pay-amt { font-size:24px; font-weight:900; color:#000; margin-bottom:8px; }
    .net-pay-days { font-size:11px; color:#666; }
    .salary-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:16px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#f5f5f5; padding:8px 10px; text-align:left; font-size:11px; font-weight:bold; border-bottom:1px solid #ddd; }
    th:not(:first-child) { text-align:right; }
    td { padding:8px 10px; font-size:11.5px; border-bottom:1px solid #f0f0f0; }
    td:not(:first-child) { text-align:right; }
    .total-row td { font-weight:bold; background:#fafafa; border-top:1px solid #ccc; padding:9px 10px; }
    .net-bar { background:#f0fff4; border-left:4px solid #22c55e; padding:12px 14px; margin-bottom:12px; border-radius:0 4px 4px 0; }
    .net-bar-text { font-size:13px; font-weight:bold; }
    .net-bar-text span { color:#16a34a; }
    .net-note { font-size:10.5px; color:#666; margin-bottom:6px; }
    .footer-note { text-align:center; font-size:11px; color:#aaa; margin-top:40px; padding-top:14px; border-top:1px solid #eee; }
    @media print { body{margin:0} .page{padding:20px 24px} @page{size:A4;margin:0} }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">TechNext Staffing Pvt. Ltd.</div>
      <div class="company-addr">MSR Novel Office, Koramangala, Bengaluru, Karnataka 560034, India</div>
    </div>
  </div>

  <div class="payslip-month">Payslip for the month of ${MONTHS[pMonth - 1]} ${pYear}</div>
  <div class="pay-summary-label">Pay Summary</div>

  <div class="summary-layout">
    <div class="summary-left">
      <div class="info-row"><span class="info-label">Employee Name</span><span class="info-value">${name}, ${empId}</span></div>
      <div class="info-row"><span class="info-label">Designation</span><span class="info-value">${designation}</span></div>
      <div class="info-row"><span class="info-label">Department</span><span class="info-value">${department}</span></div>
      <div class="info-row"><span class="info-label">Date of Joining</span><span class="info-value">${joiningDate}</span></div>
      <div class="info-row"><span class="info-label">Pay Period</span><span class="info-value">${MONTHS[pMonth - 1]} ${pYear}</span></div>
      <div class="info-row"><span class="info-label">Pay Date</span><span class="info-value">${payDate}</span></div>
      <div class="info-row"><span class="info-label">PAN</span><span class="info-value">${pan}</span></div>
      <div class="info-row"><span class="info-label">Bank Account No</span><span class="info-value">${bankAcc}</span></div>
      <div class="info-row"><span class="info-label">Work Location</span><span class="info-value">${workLoc}</span></div>
    </div>
    <div class="net-pay-box">
      <div class="net-pay-label">Total Net Pay</div>
      <div class="net-pay-amt">₹${Number(sal.netSalary).toLocaleString("en-IN")}.00</div>
      <div class="net-pay-days">Paid Days : ${paidDays} | LOP Days : ${lopDays}</div>
    </div>
  </div>

  <div class="salary-grid">
    <table>
      <thead><tr><th>Earnings</th><th>Amount</th><th>YTD</th></tr></thead>
      <tbody>
        <tr><td>Basic</td><td>₹${Number(sal.basic).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.basic).toLocaleString("en-IN")}.00</td></tr>
        <tr><td>House Rent Allowance</td><td>₹${Number(sal.hra).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.hra).toLocaleString("en-IN")}.00</td></tr>
        <tr><td>Fixed Allowance</td><td>₹${Number(sal.fixedAllowance).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.fixedAllowance).toLocaleString("en-IN")}.00</td></tr>
        ${sal.bonus > 0 ? `<tr><td>${adj?.bonusReason || "Bonus"}</td><td>₹${Number(sal.bonus).toLocaleString("en-IN")}.00</td><td>₹${Number(sal.bonus).toLocaleString("en-IN")}.00</td></tr>` : ""}
        ${sal.lopDeduction > 0 ? `<tr><td>LOP Deduction (${lopDays} days)</td><td style="color:red">-₹${Number(sal.lopDeduction).toLocaleString("en-IN")}.00</td><td>-₹${Number(sal.lopDeduction).toLocaleString("en-IN")}.00</td></tr>` : ""}
        <tr class="total-row"><td>Gross Earnings</td><td>₹${Number(sal.grossSalary).toLocaleString("en-IN")}.00</td><td></td></tr>
      </tbody>
    </table>
    <table>
      <thead><tr><th>Deductions</th><th>Amount</th><th>YTD</th></tr></thead>
      <tbody>
        <tr><td>EPF Contribution</td><td>₹${Number(sal.epf).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.epf).toLocaleString("en-IN")}.00</td></tr>
        ${sal.esi > 0 ? `<tr><td>ESI Contribution</td><td>₹${Number(sal.esi).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.esi).toLocaleString("en-IN")}.00</td></tr>` : ""}
        ${sal.profTax > 0 ? `<tr><td>Professional Tax</td><td>₹${Number(sal.profTax).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.profTax).toLocaleString("en-IN")}.00</td></tr>` : ""}
        ${sal.tds > 0 ? `<tr><td>TDS</td><td>₹${Number(sal.tds).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.tds).toLocaleString("en-IN")}.00</td></tr>` : ""}
        ${sal.extraDed > 0 ? `<tr><td>${adj?.extraDeductionReason || "Other Deduction"}</td><td>₹${Number(sal.extraDed).toLocaleString("en-IN")}.00</td><td>₹${Number(ytd.extraDed).toLocaleString("en-IN")}.00</td></tr>` : ""}
        <tr class="total-row"><td>Total Deductions</td><td>₹${Number(sal.totalDeductions).toLocaleString("en-IN")}.00</td><td></td></tr>
      </tbody>
    </table>
  </div>

  <div class="net-bar">
    <div class="net-bar-text">| Total Net Payable <span>₹${Number(sal.netSalary).toLocaleString("en-IN")}.00</span> (${numberToWords(Math.round(sal.netSalary))} Only)</div>
  </div>
  <div class="net-note">**Total Net Payable = Gross Earnings - Total Deductions</div>
  <div class="footer-note">-- This is a system-generated document. --</div>
</div>
</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 600);
};

export default function Payslips() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [payslipHistory, setPayslipHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [lopLoading, setLopLoading] = useState(false);
  const [adjustments, setAdjustments] = useState({
    bonusAmount: 0,
    bonusReason: "",
    extraDeduction: 0,
    extraDeductionReason: "",
    workingDays: 26,
    presentDays: 26,
    lopDays: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["Admin", "HR Manager"].includes(currentUser.role);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`)
      .then((r) => {
        setEmployees(r.data);
        if (!isAdmin) {
          const own = r.data.find((e) => e.email === currentUser.email);
          if (own) {
            setSelectedEmp(own);
            fetchEmployeeHistory(own.id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchAllHistory();
  }, [activeTab, month, year]);

  // ✅ FIX 5: Auto-fetch LOP from attendance when employee selected
  useEffect(() => {
    if (selectedEmp && isAdmin) {
      autoFetchLOP(selectedEmp.id, month, year);
    }
  }, [selectedEmp, month, year]);

  const autoFetchLOP = async (empId, m, y) => {
    setLopLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/attendance/lop/${empId}/month/${m}/year/${y}`,
      );
      const data = res.data;
      setAdjustments((prev) => ({
        ...prev,
        workingDays: data.workingDays || 26,
        presentDays: data.presentDays || 26,
        lopDays: data.totalLop || 0,
      }));
    } catch (e) {
      // No attendance data yet — use defaults
      setAdjustments((prev) => ({
        ...prev,
        workingDays: 26,
        presentDays: 26,
        lopDays: 0,
      }));
    }
    setLopLoading(false);
  };

  const fetchAllHistory = () => {
    setHistoryLoading(true);
    axios
      .get(`${BASE_URL}/payslips/month/${month}/year/${year}`)
      .then((r) => {
        setPayslipHistory(r.data);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  };

  const fetchEmployeeHistory = (empId) => {
    axios
      .get(`${BASE_URL}/payslips/employee/${empId}`)
      .then((r) => setPayslipHistory(r.data))
      .catch(() => {});
  };

  const handleSavePayslip = async () => {
    if (!selectedEmp) return;
    setSaving(true);
    setSavedMsg("");
    const sal = calcSalary(
      selectedEmp.basicSalary || selectedEmp.basic_salary,
      adjustments,
    );
    const payload = {
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      month,
      year,
      basicSalary: sal.basic,
      hra: sal.hra,
      transport: 0,
      medical: 0,
      specialAllowance: sal.fixedAllowance,
      bonus: sal.bonus,
      bonusReason: adjustments.bonusReason,
      grossSalary: sal.grossSalary,
      pf: sal.epf,
      esi: sal.esi,
      professionalTax: sal.profTax,
      tds: sal.tds,
      lopDays: adjustments.lopDays,
      lopDeduction: sal.lopDeduction,
      extraDeduction: sal.extraDed,
      extraDeductionReason: adjustments.extraDeductionReason,
      totalDeductions: sal.totalDeductions,
      netSalary: sal.netSalary,
      workingDays: adjustments.workingDays,
      presentDays: adjustments.presentDays,
      status: "Generated",
      generatedBy: currentUser.name,
    };
    try {
      await axios.post(`${BASE_URL}/payslips`, payload);
      setSavedMsg("✅ Saved successfully!");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (e) {
      setSavedMsg("⚠️ Save failed. Try again.");
    }
    setSaving(false);
  };

  const handleAutoGenerate = async () => {
    if (
      !window.confirm(
        `Auto-generate payslips for ALL employees for ${MONTHS[month - 1]} ${year}?`,
      )
    )
      return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/payslips/auto-generate`);
      setSavedMsg("✅ Auto-generated for all employees!");
      fetchAllHistory();
      setTimeout(() => setSavedMsg(""), 4000);
    } catch (e) {
      setSavedMsg("⚠️ Failed.");
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (id, status) => {
    await axios.put(`${BASE_URL}/payslips/${id}/status`, { status });
    fetchAllHistory();
  };

  const handleExportExcel = () => {
    const data = employees.map((emp) => {
      const sal = calcSalary(emp.basicSalary || emp.basic_salary, {
        workingDays: 26,
        presentDays: 26,
        lopDays: 0,
      });
      return {
        "Employee ID": emp.employeeId || emp.employee_id || "—",
        Name: emp.name,
        Department: emp.department || "—",
        Role: emp.role,
        Month: `${MONTHS[month - 1]} ${year}`,
        Basic: sal.basic,
        HRA: sal.hra,
        "Fixed Allowance": sal.fixedAllowance,
        Gross: sal.grossSalary,
        EPF: sal.epf,
        "Prof Tax": sal.profTax,
        TDS: sal.tds,
        "Total Deductions": sal.totalDeductions,
        "Net Salary": sal.netSalary,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `TechNext_Payroll_${MONTHS[month - 1]}_${year}.xlsx`,
    );
  };

  const getStatusStyle = (status) =>
    ({
      Paid: { bg: "#f0fdf4", color: "#10b981" },
      Generated: { bg: "#eff6ff", color: "#3b82f6" },
      Pending: { bg: "#fffbeb", color: "#f59e0b" },
    })[status] || { bg: "#f9fafb", color: "#6b7280" };

  const avatarColors = {
    Admin: "#ef4444",
    Recruiter: "#10b981",
    Sales: "#3b82f6",
    "HR Manager": "#8b5cf6",
    Staff: "#6b7280",
  };
  const totalPayroll = employees.reduce(
    (sum, emp) =>
      sum +
      calcSalary(emp.basicSalary || emp.basic_salary, {
        workingDays: 26,
        presentDays: 26,
        lopDays: 0,
      }).netSalary,
    0,
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
          Loading payslips...
        </div>
      </div>
    );

  // Employee self view
  if (!isAdmin) {
    const own = employees.find((e) => e.email === currentUser.email);
    if (!own)
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          Profile not found.
        </div>
      );
    const sal = calcSalary(own.basicSalary || own.basic_salary, {
      workingDays: 26,
      presentDays: 26,
      lopDays: 0,
      bonusAmount: 0,
      extraDeduction: 0,
    });
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <div style={s.title}>My Payslip 💵</div>
            <div style={s.sub}>Your monthly salary statement</div>
          </div>
          <div style={s.headerRight}>
            <div style={s.periodWrap}>
              <select
                style={s.periodSelect}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                style={s.periodSelect}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              style={s.printBtn}
              onClick={() =>
                printPayslip(
                  own,
                  sal,
                  month,
                  year,
                  { workingDays: 26, presentDays: 26, lopDays: 0 },
                  own,
                )
              }
            >
              🖨️ Download PDF
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Employee Info */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7f0",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: avatarColors[own.role] || "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "800",
                color: "#fff",
              }}
            >
              {own.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#0f1117",
                }}
              >
                {own.name}
              </div>
              <div
                style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}
              >
                {own.role} · {own.department || "—"} ·{" "}
                {own.employeeId || own.employee_id || "—"}
              </div>
              <div
                style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}
              >
                PAN: {own.panNumber || own.pan_number || "—"} | Bank:{" "}
                {own.bankAccount || own.bank_account || "—"}
              </div>
            </div>
            <div
              style={{
                background: "#eef2ff",
                color: "#6366f1",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {MONTHS[month - 1]} {year}
            </div>
          </div>

          {/* Net Pay Banner */}
          <div
            style={{
              background: "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "#fff",
              borderRadius: "14px",
              padding: "24px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  opacity: 0.8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                NET SALARY — {MONTHS[month - 1]} {year}
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  letterSpacing: "-2px",
                  marginTop: "4px",
                }}
              >
                ₹{sal.netSalary.toLocaleString("en-IN")}.00
              </div>
              <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
                {numberToWords(sal.netSalary)} Only
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>
                Paid Days: 26 | LOP: 0
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  marginTop: "4px",
                }}
              >
                Bank Transfer
              </div>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>
                Pay Date: {getPayDate(month, year)}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#10b981",
                  padding: "14px 16px",
                  borderBottom: "1px solid #e5e7f0",
                }}
              >
                💰 Earnings
              </div>
              {[
                { l: "Basic Salary", v: sal.basic },
                { l: "House Rent Allowance", v: sal.hra },
                { l: "Fixed Allowance", v: sal.fixedAllowance },
              ].map((r) => (
                <div
                  key={r.l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    borderBottom: "1px solid #f8fafc",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {r.l}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
                    ₹{r.v.toLocaleString("en-IN")}.00
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8f9fc",
                  borderTop: "2px solid #e5e7f0",
                  fontSize: "14px",
                  fontWeight: "800",
                }}
              >
                <span>Gross Earnings</span>
                <span style={{ color: "#10b981" }}>
                  ₹{sal.grossSalary.toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#ef4444",
                  padding: "14px 16px",
                  borderBottom: "1px solid #e5e7f0",
                }}
              >
                📉 Deductions
              </div>
              {[
                { l: "EPF Contribution", v: sal.epf },
                ...(sal.esi > 0 ? [{ l: "ESI Contribution", v: sal.esi }] : []),
                ...(sal.profTax > 0
                  ? [{ l: "Professional Tax", v: sal.profTax }]
                  : []),
                ...(sal.tds > 0 ? [{ l: "TDS", v: sal.tds }] : []),
              ].map((r) => (
                <div
                  key={r.l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    borderBottom: "1px solid #f8fafc",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {r.l}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ef4444",
                    }}
                  >
                    ₹{r.v.toLocaleString("en-IN")}.00
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#f8f9fc",
                  borderTop: "2px solid #e5e7f0",
                  fontSize: "14px",
                  fontWeight: "800",
                }}
              >
                <span>Total Deductions</span>
                <span style={{ color: "#ef4444" }}>
                  ₹{sal.totalDeductions.toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
          </div>

          {/* History */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7f0",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#0f1117",
                marginBottom: "14px",
              }}
            >
              📅 Payslip History
            </div>
            {payslipHistory.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                No saved payslips yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
                  gap: "10px",
                }}
              >
                {payslipHistory.map((ps) => (
                  <div
                    key={ps.id}
                    style={{
                      background: "#f8f9fc",
                      borderRadius: "10px",
                      padding: "14px",
                      textAlign: "center",
                      cursor: "pointer",
                      border: "1px solid #e5e7f0",
                    }}
                    onClick={() => {
                      const hSal = {
                        basic: parseFloat(ps.basicSalary || 0),
                        hra: parseFloat(ps.hra || 0),
                        fixedAllowance: parseFloat(ps.specialAllowance || 0),
                        bonus: parseFloat(ps.bonus || 0),
                        lopDeduction: parseFloat(ps.lopDeduction || 0),
                        grossSalary: parseFloat(ps.grossSalary || 0),
                        epf: parseFloat(ps.pf || 0),
                        esi: parseFloat(ps.esi || 0),
                        profTax: parseFloat(ps.professionalTax || 0),
                        tds: parseFloat(ps.tds || 0),
                        extraDed: parseFloat(ps.extraDeduction || 0),
                        totalDeductions: parseFloat(ps.totalDeductions || 0),
                        netSalary: parseFloat(ps.netSalary || 0),
                      };
                      const empInfo =
                        employees.find((e) => e.id === ps.employeeId) || own;
                      printPayslip(ps, hSal, ps.month, ps.year, ps, empInfo);
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      {MONTHS[(ps.month || 1) - 1]} {ps.year}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#0f1117",
                        marginBottom: "6px",
                      }}
                    >
                      ₹{Number(ps.netSalary || 0).toLocaleString("en-IN")}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        display: "inline-block",
                        background: getStatusStyle(ps.status).bg,
                        color: getStatusStyle(ps.status).color,
                      }}
                    >
                      {ps.status}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      🖨️ Print
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  const sal = selectedEmp
    ? calcSalary(
        selectedEmp.basicSalary || selectedEmp.basic_salary,
        adjustments,
      )
    : null;

  return (
    <div style={s.page}>
      {/* Edit Modal */}
      {editModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>
                  ✏️ Edit Payslip — {editModal.employeeName}
                </div>
                <div style={s.modalSub}>
                  {MONTHS[(editModal.month || 1) - 1]} {editModal.year}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setEditModal(null)}>
                ✕
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Working Days</label>
                  <input
                    style={s.input}
                    type="number"
                    value={editModal.workingDays || 26}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        workingDays: parseInt(e.target.value) || 26,
                      })
                    }
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>LOP Days</label>
                  <input
                    style={s.input}
                    type="number"
                    min="0"
                    value={editModal.lopDays || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        lopDays: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.fg}>
                  <label style={s.label}>Net Salary</label>
                  <input
                    style={{ ...s.input, fontWeight: "700", color: "#10b981" }}
                    type="number"
                    value={editModal.netSalary || 0}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        netSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.input}
                    value={editModal.status || "Generated"}
                    onChange={(e) =>
                      setEditModal({ ...editModal, status: e.target.value })
                    }
                  >
                    <option>Generated</option>
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7f0",
                }}
              >
                <button style={s.cancelBtn} onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button
                  style={s.saveBtn}
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await axios.post(`${BASE_URL}/payslips`, editModal);
                      setEditModal(null);
                      fetchAllHistory();
                      setSavedMsg("✅ Updated!");
                      setTimeout(() => setSavedMsg(""), 3000);
                    } catch (e) {
                      setSavedMsg("⚠️ Failed.");
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={s.header}>
        <div>
          <div style={s.title}>Payslip Generator 💵</div>
          <div style={s.sub}>
            Exact company format · Auto-fetch from Attendance
          </div>
        </div>
        <div style={s.headerRight}>
          {savedMsg && (
            <span
              style={{
                fontSize: "13px",
                color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                fontWeight: "600",
              }}
            >
              {savedMsg}
            </span>
          )}
          <button
            style={s.autoBtn}
            onClick={handleAutoGenerate}
            disabled={saving}
          >
            {saving ? "⏳..." : "⚡ Auto-Generate All"}
          </button>
          <button style={s.excelBtn} onClick={handleExportExcel}>
            📊 Export Excel
          </button>
          {selectedEmp && (
            <>
              <button
                style={s.saveDbBtn}
                onClick={handleSavePayslip}
                disabled={saving}
              >
                {saving ? "⏳..." : "💾 Save to DB"}
              </button>
              <button
                style={s.printBtn}
                onClick={() =>
                  printPayslip(
                    selectedEmp,
                    sal,
                    month,
                    year,
                    adjustments,
                    selectedEmp,
                  )
                }
              >
                🖨️ Print PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div style={s.tabs}>
        {[
          { id: "generate", label: "Generate", icon: "📄" },
          { id: "history", label: "Saved History", icon: "💾" },
          { id: "all", label: "All Employees", icon: "👥" },
          { id: "summary", label: "Summary", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={s.body}>
        {activeTab === "generate" && (
          <div style={s.generateLayout}>
            {/* Left Panel */}
            <div style={s.formPanel}>
              <div style={s.formCard}>
                <div style={s.cardTitle}>📅 Pay Period</div>
                <div style={s.formRow}>
                  <div style={s.fg}>
                    <label style={s.label}>Month</label>
                    <select
                      style={s.input}
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>Year</label>
                    <select
                      style={s.input}
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={s.formCard}>
                <div style={s.cardTitle}>👤 Select Employee</div>
                {employees.map((emp) => {
                  const es = calcSalary(emp.basicSalary || emp.basic_salary, {
                    workingDays: 26,
                    presentDays: 26,
                    lopDays: 0,
                  });
                  return (
                    <div
                      key={emp.id}
                      style={{
                        ...s.empItem,
                        ...(selectedEmp?.id === emp.id ? s.empItemActive : {}),
                      }}
                      onClick={() => setSelectedEmp(emp)}
                    >
                      <div
                        style={{
                          ...s.empAvatar,
                          background: avatarColors[emp.role] || "#6366f1",
                        }}
                      >
                        {emp.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={s.empName}>{emp.name}</div>
                        <div style={s.empRole}>
                          {emp.role} · {emp.department || "—"}
                        </div>
                      </div>
                      <div style={s.empSalary}>
                        ₹{es.netSalary.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedEmp && (
                <div style={s.formCard}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={s.cardTitle}>⚙️ Adjustments</div>
                    {lopLoading && (
                      <span style={{ fontSize: "11px", color: "#6366f1" }}>
                        ⏳ Auto-fetching attendance...
                      </span>
                    )}
                    {!lopLoading && (
                      <button
                        style={{
                          background: "#eef2ff",
                          color: "#6366f1",
                          border: "none",
                          borderRadius: "7px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          autoFetchLOP(selectedEmp.id, month, year)
                        }
                      >
                        🔄 Refresh from Attendance
                      </button>
                    )}
                  </div>
                  <div style={s.formRow}>
                    <div style={s.fg}>
                      <label style={s.label}>Working Days</label>
                      <input
                        style={s.input}
                        type="number"
                        value={adjustments.workingDays}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            workingDays: parseInt(e.target.value) || 26,
                          })
                        }
                      />
                    </div>
                    <div style={s.fg}>
                      <label style={s.label}>Present Days</label>
                      <input
                        style={s.input}
                        type="number"
                        value={adjustments.presentDays}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            presentDays: parseInt(e.target.value) || 26,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>
                      LOP Days{" "}
                      {adjustments.lopDays > 0 && (
                        <span style={{ color: "#ef4444", fontWeight: "700" }}>
                          ⚠️ Salary will be deducted!
                        </span>
                      )}
                    </label>
                    <input
                      style={{
                        ...s.input,
                        ...(adjustments.lopDays > 0
                          ? { borderColor: "#ef4444", background: "#fef2f2" }
                          : {}),
                      }}
                      type="number"
                      min="0"
                      value={adjustments.lopDays}
                      onChange={(e) =>
                        setAdjustments({
                          ...adjustments,
                          lopDays: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  {adjustments.lopDays > 0 && sal && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "9px",
                        padding: "10px 14px",
                        marginBottom: "12px",
                        fontSize: "12.5px",
                        color: "#ef4444",
                        fontWeight: "600",
                      }}
                    >
                      LOP Deduction: ₹{sal.lopDeduction.toLocaleString("en-IN")}{" "}
                      ({adjustments.lopDays} days × ₹
                      {Math.round(
                        parseFloat(
                          selectedEmp.basicSalary ||
                            selectedEmp.basic_salary ||
                            0,
                        ) / adjustments.workingDays,
                      ).toLocaleString("en-IN")}
                      /day)
                    </div>
                  )}
                  <div style={s.formRow}>
                    <div style={s.fg}>
                      <label style={s.label}>Bonus (₹)</label>
                      <input
                        style={s.input}
                        type="number"
                        min="0"
                        value={adjustments.bonusAmount}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            bonusAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div style={s.fg}>
                      <label style={s.label}>Bonus Reason</label>
                      <input
                        style={s.input}
                        value={adjustments.bonusReason}
                        onChange={(e) =>
                          setAdjustments({
                            ...adjustments,
                            bonusReason: e.target.value,
                          })
                        }
                        placeholder="e.g. Performance"
                      />
                    </div>
                  </div>
                  <button
                    style={{ ...s.saveDbBtn, width: "100%", marginTop: "4px" }}
                    onClick={handleSavePayslip}
                    disabled={saving}
                  >
                    {saving ? "⏳ Saving..." : "💾 Save to Database"}
                  </button>
                  {savedMsg && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12.5px",
                        color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {savedMsg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div style={s.previewPanel}>
              {!selectedEmp ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize: "60px", marginBottom: "16px" }}>
                    📄
                  </div>
                  <div style={s.emptyTitle}>Select an Employee</div>
                  <div style={s.emptySub}>
                    Preview payslip in exact company format
                  </div>
                </div>
              ) : (
                sal && (
                  <div style={s.payslipPreview}>
                    {/* Preview matching exact format */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        paddingBottom: "14px",
                        borderBottom: "1px solid #ccc",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#000",
                          }}
                        >
                          TechNext Staffing Pvt. Ltd.
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#888",
                            marginTop: "3px",
                          }}
                        >
                          MSR Novel Office, Koramangala, Bengaluru 560034
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "10px",
                      }}
                    >
                      Payslip for the month of {MONTHS[month - 1]} {year}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        marginBottom: "10px",
                      }}
                    >
                      Pay Summary
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {[
                          {
                            l: "Employee Name",
                            v: `${selectedEmp.name}, ${selectedEmp.employeeId || selectedEmp.employee_id || "—"}`,
                          },
                          { l: "Designation", v: selectedEmp.role || "—" },
                          { l: "Department", v: selectedEmp.department || "—" },
                          {
                            l: "Date of Joining",
                            v:
                              selectedEmp.joiningDate ||
                              selectedEmp.joining_date ||
                              "—",
                          },
                          {
                            l: "Pay Period",
                            v: `${MONTHS[month - 1]} ${year}`,
                          },
                          { l: "Pay Date", v: getPayDate(month, year) },
                          {
                            l: "PAN",
                            v:
                              selectedEmp.panNumber ||
                              selectedEmp.pan_number ||
                              "—",
                          },
                          {
                            l: "Bank Account No",
                            v:
                              selectedEmp.bankAccount ||
                              selectedEmp.bank_account ||
                              "—",
                          },
                          {
                            l: "Work Location",
                            v:
                              selectedEmp.workLocation ||
                              selectedEmp.work_location ||
                              "Bangalore",
                          },
                        ].map((row) => (
                          <div
                            key={row.l}
                            style={{ display: "flex", marginBottom: "6px" }}
                          >
                            <span
                              style={{
                                width: "130px",
                                fontSize: "11px",
                                color: "#888",
                                flexShrink: 0,
                              }}
                            >
                              {row.l}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#000",
                                fontWeight: "600",
                              }}
                            >
                              {row.v}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          width: "200px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "14px",
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#888",
                            marginBottom: "6px",
                          }}
                        >
                          Total Net Pay
                        </div>
                        <div
                          style={{
                            fontSize: "22px",
                            fontWeight: "900",
                            color: "#000",
                            marginBottom: "6px",
                          }}
                        >
                          ₹{sal.netSalary.toLocaleString("en-IN")}.00
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#666" }}>
                          Paid Days :{" "}
                          {adjustments.workingDays - adjustments.lopDays} | LOP
                          Days : {adjustments.lopDays}
                        </div>
                      </div>
                    </div>

                    {/* Earnings & Deductions side by side */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        marginBottom: "14px",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#f5f5f5" }}>
                            <th
                              style={{
                                padding: "8px 10px",
                                textAlign: "left",
                                fontSize: "11px",
                                fontWeight: "700",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Earnings
                            </th>
                            <th
                              style={{
                                padding: "8px 10px",
                                textAlign: "right",
                                fontSize: "11px",
                                fontWeight: "700",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Amount
                            </th>
                            <th
                              style={{
                                padding: "8px 10px",
                                textAlign: "right",
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#aaa",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              YTD
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { l: "Basic", v: sal.basic },
                            { l: "House Rent Allowance", v: sal.hra },
                            { l: "Fixed Allowance", v: sal.fixedAllowance },
                            ...(sal.bonus > 0
                              ? [
                                  {
                                    l: adjustments.bonusReason || "Bonus",
                                    v: sal.bonus,
                                  },
                                ]
                              : []),
                          ].map((r) => (
                            <tr key={r.l}>
                              <td
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "11.5px",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                {r.l}
                              </td>
                              <td
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "11.5px",
                                  textAlign: "right",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                ₹{r.v.toLocaleString("en-IN")}.00
                              </td>
                              <td
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "11.5px",
                                  textAlign: "right",
                                  color: "#aaa",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                ₹{r.v.toLocaleString("en-IN")}.00
                              </td>
                            </tr>
                          ))}
                          <tr
                            style={{ background: "#fafafa", fontWeight: "700" }}
                          >
                            <td
                              style={{
                                padding: "9px 10px",
                                fontSize: "11.5px",
                                borderTop: "1px solid #ccc",
                              }}
                            >
                              Gross Earnings
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                fontSize: "11.5px",
                                textAlign: "right",
                                borderTop: "1px solid #ccc",
                              }}
                            >
                              ₹{sal.grossSalary.toLocaleString("en-IN")}.00
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                borderTop: "1px solid #ccc",
                              }}
                            ></td>
                          </tr>
                        </tbody>
                      </table>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#f5f5f5" }}>
                            <th
                              style={{
                                padding: "8px 10px",
                                textAlign: "left",
                                fontSize: "11px",
                                fontWeight: "700",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Deductions
                            </th>
                            <th
                              style={{
                                padding: "8px 10px",
                                textAlign: "right",
                                fontSize: "11px",
                                fontWeight: "700",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Amount
                            </th>
                            <th
                              style={{
                                padding: "8px 10px",
                                textAlign: "right",
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#aaa",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              YTD
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { l: "EPF Contribution", v: sal.epf },
                            ...(sal.esi > 0 ? [{ l: "ESI", v: sal.esi }] : []),
                            ...(sal.profTax > 0
                              ? [{ l: "Professional Tax", v: sal.profTax }]
                              : []),
                            ...(sal.tds > 0 ? [{ l: "TDS", v: sal.tds }] : []),
                          ].map((r) => (
                            <tr key={r.l}>
                              <td
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "11.5px",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                {r.l}
                              </td>
                              <td
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "11.5px",
                                  textAlign: "right",
                                  color: "#ef4444",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                ₹{r.v.toLocaleString("en-IN")}.00
                              </td>
                              <td
                                style={{
                                  padding: "7px 10px",
                                  fontSize: "11.5px",
                                  textAlign: "right",
                                  color: "#aaa",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                ₹{r.v.toLocaleString("en-IN")}.00
                              </td>
                            </tr>
                          ))}
                          <tr
                            style={{ background: "#fafafa", fontWeight: "700" }}
                          >
                            <td
                              style={{
                                padding: "9px 10px",
                                fontSize: "11.5px",
                                borderTop: "1px solid #ccc",
                              }}
                            >
                              Total Deductions
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                fontSize: "11.5px",
                                textAlign: "right",
                                color: "#ef4444",
                                borderTop: "1px solid #ccc",
                              }}
                            >
                              ₹{sal.totalDeductions.toLocaleString("en-IN")}.00
                            </td>
                            <td
                              style={{
                                padding: "9px 10px",
                                borderTop: "1px solid #ccc",
                              }}
                            ></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Net payable bar */}
                    <div
                      style={{
                        background: "#f0fff4",
                        borderLeft: "4px solid #22c55e",
                        padding: "12px 14px",
                        borderRadius: "0 4px 4px 0",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "700" }}>
                        | Total Net Payable{" "}
                        <span style={{ color: "#16a34a" }}>
                          ₹{sal.netSalary.toLocaleString("en-IN")}.00
                        </span>{" "}
                        ({numberToWords(sal.netSalary)} Only)
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "10.5px",
                        color: "#888",
                        marginBottom: "10px",
                      }}
                    >
                      **Total Net Payable = Gross Earnings - Total Deductions
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#aaa",
                        paddingTop: "10px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      -- This is a system-generated document. --
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <select
                style={s.periodSelect}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                style={s.periodSelect}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <button style={s.excelBtn} onClick={fetchAllHistory}>
                🔍 Load
              </button>
              <button
                style={s.autoBtn}
                onClick={handleAutoGenerate}
                disabled={saving}
              >
                ⚡ Auto-Generate All
              </button>
              {savedMsg && (
                <span
                  style={{
                    fontSize: "13px",
                    color: savedMsg.includes("✅") ? "#10b981" : "#ef4444",
                    fontWeight: "600",
                  }}
                >
                  {savedMsg}
                </span>
              )}
            </div>
            {historyLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#9ca3af",
                }}
              >
                Loading...
              </div>
            ) : payslipHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💾</div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f1117",
                    marginBottom: "8px",
                  }}
                >
                  No saved payslips for {MONTHS[month - 1]} {year}
                </div>
                <button style={s.autoBtn} onClick={handleAutoGenerate}>
                  ⚡ Auto-Generate All
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
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
                        "Period",
                        "Gross",
                        "Deductions",
                        "Net Salary",
                        "LOP Days",
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
                    {payslipHistory.map((ps) => {
                      const empInfo =
                        employees.find((e) => e.id === ps.employeeId) || {};
                      const hSal = {
                        basic: parseFloat(ps.basicSalary || 0),
                        hra: parseFloat(ps.hra || 0),
                        fixedAllowance: parseFloat(ps.specialAllowance || 0),
                        bonus: parseFloat(ps.bonus || 0),
                        lopDeduction: parseFloat(ps.lopDeduction || 0),
                        grossSalary: parseFloat(ps.grossSalary || 0),
                        epf: parseFloat(ps.pf || 0),
                        esi: parseFloat(ps.esi || 0),
                        profTax: parseFloat(ps.professionalTax || 0),
                        tds: parseFloat(ps.tds || 0),
                        extraDed: parseFloat(ps.extraDeduction || 0),
                        totalDeductions: parseFloat(ps.totalDeductions || 0),
                        netSalary: parseFloat(ps.netSalary || 0),
                      };
                      return (
                        <tr
                          key={ps.id}
                          style={{ borderBottom: "1px solid #f1f3f9" }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div
                              style={{ fontWeight: "600", color: "#0f1117" }}
                            >
                              {ps.employeeName}
                            </div>
                          </td>
                          <td
                            style={{ padding: "12px 14px", fontSize: "13px" }}
                          >
                            {MONTHS[(ps.month || 1) - 1]} {ps.year}
                          </td>
                          <td
                            style={{ padding: "12px 14px", fontSize: "13px" }}
                          >
                            ₹
                            {Number(ps.grossSalary || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              color: "#ef4444",
                            }}
                          >
                            ₹
                            {Number(ps.totalDeductions || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontWeight: "800",
                              color: "#10b981",
                              fontSize: "14px",
                            }}
                          >
                            ₹{Number(ps.netSalary || 0).toLocaleString("en-IN")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: "13px",
                              color: ps.lopDays > 0 ? "#ef4444" : "#6b7280",
                              fontWeight: ps.lopDays > 0 ? "700" : "400",
                            }}
                          >
                            {ps.lopDays || 0} days
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <select
                              style={{
                                background: getStatusStyle(ps.status).bg,
                                color: getStatusStyle(ps.status).color,
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                outline: "none",
                              }}
                              value={ps.status}
                              onChange={(e) =>
                                handleUpdateStatus(ps.id, e.target.value)
                              }
                            >
                              <option>Generated</option>
                              <option>Paid</option>
                              <option>Pending</option>
                            </select>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                style={{
                                  background: "#eef2ff",
                                  color: "#6366f1",
                                  border: "none",
                                  borderRadius: "7px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                }}
                                onClick={() => setEditModal({ ...ps })}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                style={{
                                  background: "#f0fdf4",
                                  color: "#10b981",
                                  border: "none",
                                  borderRadius: "7px",
                                  padding: "5px 10px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  printPayslip(
                                    { ...ps, ...empInfo },
                                    hSal,
                                    ps.month,
                                    ps.year,
                                    ps,
                                    empInfo,
                                  )
                                }
                              >
                                🖨️ Print
                              </button>
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
        )}

        {activeTab === "all" && (
          <div
            style={{
              background: "#fff",
              margin: "16px",
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
                    "ID",
                    "Dept",
                    "Basic",
                    "HRA",
                    "Fixed Allowance",
                    "Gross",
                    "Deductions",
                    "Net Salary",
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
                {employees.map((emp) => {
                  const es = calcSalary(emp.basicSalary || emp.basic_salary, {
                    workingDays: 26,
                    presentDays: 26,
                    lopDays: 0,
                  });
                  return (
                    <tr
                      key={emp.id}
                      style={{ borderBottom: "1px solid #f1f3f9" }}
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
                              width: "32px",
                              height: "32px",
                              borderRadius: "9px",
                              background: avatarColors[emp.role] || "#6366f1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#fff",
                            }}
                          >
                            {emp.name?.charAt(0)}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#0f1117",
                                fontSize: "13px",
                              }}
                            >
                              {emp.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                              {emp.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        {emp.employeeId || emp.employee_id || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        {emp.department || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#6366f1",
                        }}
                      >
                        ₹{es.basic.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        ₹{es.hra.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        ₹{es.fixedAllowance.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px" }}>
                        ₹{es.grossSalary.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#ef4444",
                        }}
                      >
                        ₹{es.totalDeductions.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontWeight: "800",
                          color: "#10b981",
                          fontSize: "14px",
                        }}
                      >
                        ₹{es.netSalary.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={{
                              background: "#eef2ff",
                              color: "#6366f1",
                              border: "none",
                              borderRadius: "7px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveTab("generate");
                            }}
                          >
                            Generate
                          </button>
                          <button
                            style={{
                              background: "#f0fdf4",
                              color: "#10b981",
                              border: "none",
                              borderRadius: "7px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              printPayslip(
                                emp,
                                calcSalary(
                                  emp.basicSalary || emp.basic_salary,
                                  {
                                    workingDays: 26,
                                    presentDays: 26,
                                    lopDays: 0,
                                  },
                                ),
                                month,
                                year,
                                {
                                  workingDays: 26,
                                  presentDays: 26,
                                  lopDays: 0,
                                },
                                emp,
                              )
                            }
                          >
                            🖨️ Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "summary" && (
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "14px",
              }}
            >
              {[
                {
                  icon: "👥",
                  label: "Total Employees",
                  val: employees.length,
                  color: "#6366f1",
                },
                {
                  icon: "💰",
                  label: "Total Net Payroll",
                  val: `₹${(totalPayroll / 100000).toFixed(1)}L`,
                  color: "#10b981",
                },
                {
                  icon: "📊",
                  label: "Average Salary",
                  val:
                    employees.length > 0
                      ? `₹${Math.round(totalPayroll / employees.length).toLocaleString("en-IN")}`
                      : "0",
                  color: "#f59e0b",
                },
                {
                  icon: "📉",
                  label: "Total Deductions",
                  val: `₹${(
                    employees.reduce((s, e) => {
                      const sal = calcSalary(e.basicSalary || e.basic_salary, {
                        workingDays: 26,
                        presentDays: 26,
                        lopDays: 0,
                      });
                      return s + sal.totalDeductions;
                    }, 0) / 100000
                  ).toFixed(1)}L`,
                  color: "#ef4444",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7f0",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                    {c.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: c.color,
                      letterSpacing: "-1px",
                    }}
                  >
                    {c.val}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    {c.label}
                  </div>
                </div>
              ))}
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
    padding: "16px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  periodWrap: { display: "flex", gap: "8px" },
  periodSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7f0",
    fontSize: "13px",
    background: "#f8f9fc",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  autoBtn: {
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  excelBtn: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#10b981",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveDbBtn: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#6366f1",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  printBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "10px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
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
  },
  tabActive: { background: "#eef2ff", color: "#6366f1", fontWeight: "700" },
  body: { flex: 1, overflowY: "auto" },
  generateLayout: { display: "flex", height: "100%" },
  formPanel: {
    width: "320px",
    minWidth: "320px",
    overflowY: "auto",
    padding: "14px",
    borderRight: "1px solid #e5e7f0",
    background: "#fff",
  },
  formCard: {
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "14px",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "12px",
  },
  empItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 10px",
    borderRadius: "9px",
    cursor: "pointer",
    border: "1.5px solid #e5e7f0",
    background: "#fff",
    marginBottom: "4px",
  },
  empItemActive: { border: "1.5px solid #6366f1", background: "#eef2ff" },
  empAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  empName: { fontSize: "12.5px", fontWeight: "700", color: "#0f1117" },
  empRole: { fontSize: "10.5px", color: "#9ca3af", marginTop: "1px" },
  empSalary: { fontSize: "12px", fontWeight: "800", color: "#10b981" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  fg: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "12px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "#0f1117",
  },
  previewPanel: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    background: "#f0f0f0",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "8px",
  },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#0f1117" },
  emptySub: { fontSize: "13px", color: "#9ca3af", textAlign: "center" },
  payslipPreview: {
    background: "#fff",
    maxWidth: "720px",
    margin: "0 auto",
    padding: "28px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    fontFamily: "Arial,sans-serif",
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
    width: "520px",
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
  },
};
