import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export default function InvoiceGenerator() {
  const [placements, setPlacements] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
  );
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState(
    "Payment due within 30 days. Thank you for your business!",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [gst, setGst] = useState(18);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/placements`)
      .then((r) => setPlacements(r.data))
      .catch(() => {});
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split("T")[0]);
  }, []);

  const commission = selectedPlacement
    ? parseFloat(selectedPlacement.commission) || 0
    : 0;
  const gstAmount = (commission * gst) / 100;
  const totalAmount = commission + gstAmount;

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-print");
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNo}</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Segoe UI',sans-serif; padding:40px; color:#0f1117; }
            .header { display:flex; justify-content:space-between; margin-bottom:40px; }
            .company { font-size:24px; font-weight:800; color:#6366f1; }
            .company-sub { font-size:12px; color:#6b7280; margin-top:4px; }
            .invoice-title { font-size:32px; font-weight:800; color:#0f1117; text-align:right; }
            .invoice-meta { text-align:right; font-size:13px; color:#6b7280; margin-top:8px; }
            .divider { height:2px; background:linear-gradient(90deg,#6366f1,#4f46e5); margin:20px 0; }
            .billing { display:flex; justify-content:space-between; margin:30px 0; }
            .billing-block h4 { font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
            .billing-block p { font-size:14px; font-weight:600; color:#0f1117; }
            .billing-block .sub { font-size:12px; color:#6b7280; }
            table { width:100%; border-collapse:collapse; margin:30px 0; }
            th { background:#f8f9fc; padding:12px 16px; text-align:left; font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.8px; }
            td { padding:14px 16px; border-bottom:1px solid #f1f3f9; font-size:13px; }
            .total-section { display:flex; justify-content:flex-end; }
            .total-box { width:280px; }
            .total-row { display:flex; justify-content:space-between; padding:8px 0; font-size:13px; color:#6b7280; }
            .total-final { display:flex; justify-content:space-between; padding:14px 0; font-size:16px; font-weight:800; color:#0f1117; border-top:2px solid #6366f1; margin-top:8px; }
            .notes { margin-top:40px; padding:16px; background:#f8f9fc; border-radius:8px; font-size:12px; color:#6b7280; }
            .footer { margin-top:40px; text-align:center; font-size:11px; color:#9ca3af; }
            .badge { display:inline-block; background:#eef2ff; color:#6366f1; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.title}>Invoice Generator</div>
          <div style={s.sub}>Create professional invoices for placements</div>
        </div>
        {selectedPlacement && (
          <div style={s.headerRight}>
            <button
              style={s.previewBtn}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "✏️ Edit" : "👁 Preview"}
            </button>
            <button style={s.printBtn} onClick={handlePrint}>
              🖨️ Print / Download
            </button>
          </div>
        )}
      </div>

      <div style={s.body}>
        {/* Form Panel */}
        {!showPreview && (
          <div style={s.formPanel}>
            <div style={s.formCard}>
              <div style={s.cardTitle}>Select Placement</div>
              <select
                style={s.select}
                value={selectedPlacement?.id || ""}
                onChange={(e) => {
                  const p = placements.find(
                    (p) => String(p.id) === e.target.value,
                  );
                  setSelectedPlacement(p || null);
                }}
              >
                <option value="">-- Select a Placement --</option>
                {placements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.candidateName} → {p.clientCompany}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlacement && (
              <>
                <div style={s.formCard}>
                  <div style={s.cardTitle}>Invoice Details</div>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Invoice Number</label>
                      <input
                        style={s.input}
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Invoice Date</label>
                      <input
                        style={s.input}
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={s.formRow}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Due Date</label>
                      <input
                        style={s.input}
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>GST %</label>
                      <input
                        style={s.input}
                        type="number"
                        value={gst}
                        onChange={(e) =>
                          setGst(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Notes</label>
                    <textarea
                      style={{ ...s.input, minHeight: "70px" }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div style={s.formCard}>
                  <div style={s.cardTitle}>Summary</div>
                  <div style={s.summaryRow}>
                    <span>Candidate</span>
                    <strong>{selectedPlacement.candidateName}</strong>
                  </div>
                  <div style={s.summaryRow}>
                    <span>Client Company</span>
                    <strong>{selectedPlacement.clientCompany}</strong>
                  </div>
                  <div style={s.summaryRow}>
                    <span>Job Title</span>
                    <strong>{selectedPlacement.jobTitle}</strong>
                  </div>
                  <div style={s.summaryRow}>
                    <span>Commission</span>
                    <strong>₹{commission.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={s.summaryRow}>
                    <span>GST ({gst}%)</span>
                    <strong>₹{gstAmount.toLocaleString("en-IN")}</strong>
                  </div>
                  <div
                    style={{
                      ...s.summaryRow,
                      borderTop: "2px solid #6366f1",
                      paddingTop: "10px",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontWeight: "700", fontSize: "14px" }}>
                      Total Amount
                    </span>
                    <strong style={{ fontSize: "18px", color: "#6366f1" }}>
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Invoice Preview */}
        {selectedPlacement && (
          <div
            style={{
              ...s.previewPanel,
              ...(!showPreview ? { display: "none" } : {}),
            }}
          >
            <div id="invoice-print" style={s.invoice}>
              {/* Invoice Header */}
              <div style={s.invHeader}>
                <div>
                  <div style={s.invCompany}>TechNext Staffing</div>
                  <div style={s.invCompanySub}>Pvt. Ltd.</div>
                  <div style={s.invCompanyAddr}>
                    Koramangala, Bengaluru - 560034
                  </div>
                  <div style={s.invCompanyAddr}>info@technextstaffing.in</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={s.invTitle}>INVOICE</div>
                  <div style={s.invMeta}>#{invoiceNo}</div>
                  <span style={s.invBadge}>Staffing Services</span>
                </div>
              </div>
              <div style={s.invDivider} />

              {/* Billing Info */}
              <div style={s.invBilling}>
                <div>
                  <div style={s.invBillingLabel}>BILL TO</div>
                  <div style={s.invBillingName}>
                    {selectedPlacement.clientCompany}
                  </div>
                  <div style={s.invBillingMeta}>Recruitment Services</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={s.invBillingLabel}>INVOICE DATE</div>
                  <div style={s.invBillingName}>{invoiceDate}</div>
                  <div style={s.invBillingLabel2}>DUE DATE</div>
                  <div style={s.invBillingName}>{dueDate}</div>
                </div>
              </div>

              {/* Table */}
              <table style={s.invTable}>
                <thead>
                  <tr style={s.invThead}>
                    <th style={s.invTh}>Description</th>
                    <th style={s.invTh}>Candidate</th>
                    <th style={s.invTh}>Position</th>
                    <th style={{ ...s.invTh, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={s.invTd}>Recruitment & Placement Fee</td>
                    <td style={s.invTd}>{selectedPlacement.candidateName}</td>
                    <td style={s.invTd}>{selectedPlacement.jobTitle}</td>
                    <td
                      style={{
                        ...s.invTd,
                        textAlign: "right",
                        fontWeight: "700",
                      }}
                    >
                      ₹{commission.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div style={s.invTotals}>
                <div style={s.invTotalRow}>
                  <span>Subtotal</span>
                  <span>₹{commission.toLocaleString("en-IN")}</span>
                </div>
                <div style={s.invTotalRow}>
                  <span>GST ({gst}%)</span>
                  <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div style={s.invTotalFinal}>
                  <span>Total Amount Due</span>
                  <span style={{ color: "#6366f1" }}>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div style={s.invNotes}>
                <div style={s.invNotesTitle}>Notes</div>
                <div style={s.invNotesText}>{notes}</div>
              </div>

              {/* Footer */}
              <div style={s.invFooter}>
                <div>Thank you for choosing TechNext Staffing!</div>
                <div style={{ marginTop: "4px", color: "#9ca3af" }}>
                  For queries: info@technextstaffing.in
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedPlacement && (
          <div style={s.emptyState}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🧾</div>
            <div style={s.emptyTitle}>Generate Professional Invoices</div>
            <div style={s.emptySub}>
              Select a placement from the left to create an invoice
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
    padding: "20px 24px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {},
  title: { fontSize: "18px", fontWeight: "800", color: "#0f1117" },
  sub: { fontSize: "13px", color: "#9ca3af", marginTop: "3px" },
  headerRight: { display: "flex", gap: "10px" },
  previewBtn: {
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "9px",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#6b7280",
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
  body: { display: "flex", flex: 1, overflow: "hidden", gap: "0" },
  formPanel: {
    width: "360px",
    minWidth: "360px",
    overflowY: "auto",
    padding: "20px",
    borderRight: "1px solid #e5e7f0",
    background: "#fff",
  },
  formCard: {
    background: "#f8f9fc",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "18px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "14px",
  },
  select: {
    width: "100%",
    padding: "10px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e5e7f0",
    fontSize: "13px",
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f1117",
    cursor: "pointer",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  formGroup: {
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
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "13px",
    color: "#6b7280",
    borderBottom: "1px solid #f1f3f9",
  },
  previewPanel: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    background: "#f8f9fc",
  },
  invoice: {
    background: "#fff",
    borderRadius: "16px",
    maxWidth: "720px",
    margin: "0 auto",
    padding: "40px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7f0",
  },
  invHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  invCompany: { fontSize: "22px", fontWeight: "800", color: "#6366f1" },
  invCompanySub: { fontSize: "12px", color: "#6366f1", fontWeight: "600" },
  invCompanyAddr: { fontSize: "11.5px", color: "#6b7280", marginTop: "3px" },
  invTitle: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#0f1117",
    letterSpacing: "-1px",
  },
  invMeta: { fontSize: "13px", color: "#6b7280", marginTop: "4px" },
  invBadge: {
    background: "#eef2ff",
    color: "#6366f1",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    display: "inline-block",
    marginTop: "6px",
  },
  invDivider: {
    height: "3px",
    background: "linear-gradient(90deg,#6366f1,#4f46e5)",
    borderRadius: "2px",
    margin: "20px 0",
  },
  invBilling: {
    display: "flex",
    justifyContent: "space-between",
    margin: "24px 0",
  },
  invBillingLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  invBillingLabel2: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginTop: "12px",
    marginBottom: "4px",
  },
  invBillingName: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  invBillingMeta: { fontSize: "12px", color: "#6b7280", marginTop: "2px" },
  invTable: { width: "100%", borderCollapse: "collapse", margin: "24px 0" },
  invThead: { background: "#f8f9fc" },
  invTh: {
    padding: "12px 14px",
    fontSize: "10.5px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7f0",
  },
  invTd: {
    padding: "14px",
    fontSize: "13px",
    color: "#374151",
    borderBottom: "1px solid #f1f3f9",
  },
  invTotals: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
    marginTop: "16px",
  },
  invTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "260px",
    fontSize: "13px",
    color: "#6b7280",
    padding: "4px 0",
  },
  invTotalFinal: {
    display: "flex",
    justifyContent: "space-between",
    width: "260px",
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f1117",
    borderTop: "2px solid #6366f1",
    paddingTop: "12px",
    marginTop: "4px",
  },
  invNotes: {
    marginTop: "32px",
    padding: "16px",
    background: "#f8f9fc",
    borderRadius: "10px",
    border: "1px solid #e5e7f0",
  },
  invNotesTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  invNotesText: { fontSize: "12.5px", color: "#6b7280", lineHeight: "1.6" },
  invFooter: {
    marginTop: "32px",
    textAlign: "center",
    fontSize: "12px",
    color: "#6b7280",
    paddingTop: "20px",
    borderTop: "1px solid #f1f3f9",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f1117",
    marginBottom: "8px",
  },
  emptySub: { fontSize: "13px", color: "#9ca3af" },
};
