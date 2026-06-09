import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (data, filename, sheetName = "Sheet1") => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Auto column widths
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length),
      ) + 2,
  }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
};

export const formatLeadsForExport = (leads) =>
  leads.map((l) => ({
    Name: l.name || "",
    Company: l.company || "",
    Email: l.email || "",
    Phone: l.phone || "",
    Source: l.source || "",
    Status: l.status || "",
    Notes: l.notes || "",
  }));

export const formatCandidatesForExport = (candidates) =>
  candidates.map((c) => ({
    Name: c.name || "",
    "Current Role": c.currentRole || "",
    Email: c.email || "",
    Phone: c.phone || "",
    Skills: c.skills || "",
    Experience: c.experience || "",
    Location: c.location || "",
    Stage: c.stage || "",
  }));

export const formatPlacementsForExport = (placements) =>
  placements.map((p) => ({
    "Candidate Name": p.candidateName || "",
    "Job Title": p.jobTitle || "",
    "Client Company": p.clientCompany || "",
    "Start Date": p.startDate || "",
    "Salary (₹)": p.salary || "",
    "Commission (₹)": p.commission || "",
    Status: p.status || "",
    Notes: p.notes || "",
  }));

export const formatJobsForExport = (jobs) =>
  jobs.map((j) => ({
    "Job Title": j.title || "",
    Location: j.location || "",
    Type: j.type || "",
    Openings: j.openings || "",
    Priority: j.priority || "",
    Status: j.status || "",
    Description: j.description || "",
  }));

export const formatContactsForExport = (contacts) =>
  contacts.map((c) => ({
    Name: c.name || "",
    "Job Title": c.title || "",
    Company: c.company || "",
    Email: c.email || "",
    Phone: c.phone || "",
    Type: c.type || "",
  }));

export const formatDealsForExport = (deals) =>
  deals.map((d) => ({
    "Deal Name": d.name || "",
    Account: d.accountName || "",
    "Amount (₹)": d.amount || "",
    Stage: d.stage || "",
    "Closing Date": d.closingDate || "",
    Description: d.description || "",
  }));

export const formatTasksForExport = (tasks) =>
  tasks.map((t) => ({
    Title: t.title || "",
    "Due Date": t.dueDate || "",
    Priority: t.priority || "",
    Status: t.status || "",
  }));

export const formatMeetingsForExport = (meetings) =>
  meetings.map((m) => ({
    Title: m.title || "",
    Date: m.meetingDate || "",
    Time: m.meetingTime || "",
    Duration: m.duration || "",
    Location: m.location || "",
    Participants: m.participants || "",
    Status: m.status || "",
    Agenda: m.agenda || "",
  }));

export const formatCallsForExport = (calls) =>
  calls.map((c) => ({
    "Contact Name": c.contactName || "",
    Company: c.company || "",
    Type: c.type || "",
    Duration: c.duration || "",
    Date: c.callDate || "",
    Participants: c.participants || "",
    Notes: c.notes || "",
  }));
