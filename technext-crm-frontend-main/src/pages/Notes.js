import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const TEAM = [
  { id: 1, name: "Admin User", role: "Admin", color: "#ef4444" },
  { id: 2, name: "Ria Kapoor", role: "Recruiter", color: "#10b981" },
  { id: 3, name: "Sam Pillai", role: "Sales", color: "#3b82f6" },
  { id: 4, name: "Dev Malhotra", role: "Recruiter", color: "#8b5cf6" },
  { id: 5, name: "Priya Nair", role: "HR Manager", color: "#f59e0b" },
  { id: 6, name: "Ravi Kumar", role: "Staff", color: "#6b7280" },
  { id: 7, name: "Meena Raj", role: "Staff", color: "#0ea5e9" },
];

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("technext_notes");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            module: "leads",
            recordName: "Arjun Mehta",
            content:
              "Called today — interested in 3 positions. Follow up next week.",
            author: "Ria Kapoor",
            authorColor: "#10b981",
            time: "2026-06-05 10:30",
            pinned: true,
            tags: ["follow-up"],
          },
          {
            id: 2,
            module: "candidates",
            recordName: "Sneha Rao",
            content:
              "Strong React skills. Shortlisted for Infosys. Interview scheduled.",
            author: "Dev Malhotra",
            authorColor: "#8b5cf6",
            time: "2026-06-04 14:00",
            pinned: false,
            tags: ["interview"],
          },
          {
            id: 3,
            module: "placements",
            recordName: "Rohan Das",
            content: "Client confirmed joining. Onboarding documents sent.",
            author: "Admin User",
            authorColor: "#ef4444",
            time: "2026-06-03 09:15",
            pinned: true,
            tags: ["confirmed"],
          },
        ];
  });
  const [showModal, setShowModal] = useState(false);
  const [filterModule, setFilterModule] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [form, setForm] = useState({
    module: "leads",
    recordName: "",
    content: "",
    tags: "",
    author: "Admin User",
  });
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/leads`)
      .then((r) => setLeads(r.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/candidates`)
      .then((r) => setCandidates(r.data))
      .catch(() => {});
    axios
      .get(`${BASE_URL}/placements`)
      .then((r) => setPlacements(r.data))
      .catch(() => {});
  }, []);

  const saveNotes = (updated) => {
    setNotes(updated);
    localStorage.setItem("technext_notes", JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!form.content.trim()) return;
    const newNote = {
      id: Date.now(),
      module: form.module,
      recordName: form.recordName,
      content: form.content,
      author: currentUser.name || "Admin User",
      authorColor:
        TEAM.find((t) => t.name === (currentUser.name || "Admin User"))
          ?.color || "#6366f1",
      time: new Date().toISOString().replace("T", " ").slice(0, 16),
      pinned: false,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    saveNotes([newNote, ...notes]);
    setShowModal(false);
    setForm({
      module: "leads",
      recordName: "",
      content: "",
      tags: "",
      author: "Admin User",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this note?"))
      saveNotes(notes.filter((n) => n.id !== id));
  };

  const handlePin = (id) => {
    saveNotes(
      notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    );
  };

  const modules = [
    "All",
    "leads",
    "candidates",
    "placements",
    "deals",
    "accounts",
  ];
  const allTags = [...new Set(notes.flatMap((n) => n.tags))];

  const filtered = notes
    .filter((n) => {
      const matchModule = filterModule === "All" || n.module === filterModule;
      const matchTag = filterTag === "All" || n.tags.includes(filterTag);
      const matchSearch =
        !search ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.recordName.toLowerCase().includes(search.toLowerCase());
      return matchModule && matchTag && matchSearch;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.time) - new Date(a.time);
    });

  const getModuleIcon = (m) =>
    ({
      leads: "👤",
      candidates: "🪪",
      placements: "🏆",
      deals: "🤝",
      accounts: "🏢",
      meetings: "📅",
      tasks: "✅",
    })[m] || "📝";
  const getModuleColor = (m) =>
    ({
      leads: "#6366f1",
      candidates: "#8b5cf6",
      placements: "#10b981",
      deals: "#f59e0b",
      accounts: "#3b82f6",
    })[m] || "#6b7280";

  const getRecordOptions = () => {
    switch (form.module) {
      case "leads":
        return leads.map((l) => l.name);
      case "candidates":
        return candidates.map((c) => c.name);
      case "placements":
        return placements.map((p) => p.candidateName);
      default:
        return [];
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.title}>Internal Notes</span>
          <span style={s.count}>{notes.length}</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.searchBox}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button style={s.addBtn} onClick={() => setShowModal(true)}>
            + Add Note
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Filter Panel */}
        <div style={s.filterPanel}>
          <div style={s.fpTitle}>Filter Notes</div>
          <div style={s.fpSection}>
            <div style={s.fpSectionTitle}>BY MODULE</div>
            {modules.map((m) => (
              <div
                key={m}
                style={{
                  ...s.fpItem,
                  ...(filterModule === m ? s.fpItemActive : {}),
                }}
                onClick={() => setFilterModule(m)}
              >
                <span style={{ marginRight: 6 }}>
                  {m === "All" ? "📋" : getModuleIcon(m)}
                </span>
                <span
                  style={{
                    ...s.fpLabel,
                    ...(filterModule === m
                      ? { color: "#6366f1", fontWeight: 700 }
                      : {}),
                  }}
                >
                  {m === "All"
                    ? "All Notes"
                    : m.charAt(0).toUpperCase() + m.slice(1)}
                </span>
                <span style={s.fpCount}>
                  {m === "All"
                    ? notes.length
                    : notes.filter((n) => n.module === m).length}
                </span>
              </div>
            ))}
          </div>
          {allTags.length > 0 && (
            <div style={s.fpSection}>
              <div style={s.fpSectionTitle}>BY TAG</div>
              <div
                key="all-tags"
                style={{
                  ...s.fpItem,
                  ...(filterTag === "All" ? s.fpItemActive : {}),
                }}
                onClick={() => setFilterTag("All")}
              >
                <span
                  style={{
                    ...s.fpLabel,
                    ...(filterTag === "All"
                      ? { color: "#6366f1", fontWeight: 700 }
                      : {}),
                  }}
                >
                  All Tags
                </span>
              </div>
              {allTags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    ...s.fpItem,
                    ...(filterTag === tag ? s.fpItemActive : {}),
                  }}
                  onClick={() => setFilterTag(tag)}
                >
                  <span style={s.tag}>{tag}</span>
                  <span style={s.fpCount}>
                    {notes.filter((n) => n.tags.includes(tag)).length}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={s.fpSection}>
            <div style={s.fpSectionTitle}>QUICK STATS</div>
            <div style={s.fpStat}>
              <span>Total</span>
              <strong>{notes.length}</strong>
            </div>
            <div style={s.fpStat}>
              <span>📌 Pinned</span>
              <strong>{notes.filter((n) => n.pinned).length}</strong>
            </div>
            <div style={s.fpStat}>
              <span>Today</span>
              <strong>
                {
                  notes.filter((n) =>
                    n.time.startsWith(new Date().toISOString().split("T")[0]),
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div style={s.notesArea}>
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📝</div>
              <div style={s.emptyTitle}>No notes found</div>
              <div style={s.emptySub}>
                Add internal notes for leads, candidates and placements
              </div>
              <button style={s.addBtn} onClick={() => setShowModal(true)}>
                + Add First Note
              </button>
            </div>
          ) : (
            <div style={s.notesGrid}>
              {filtered.map((note) => (
                <div
                  key={note.id}
                  style={{
                    ...s.noteCard,
                    ...(note.pinned ? s.noteCardPinned : {}),
                  }}
                >
                  <div style={s.noteTop}>
                    <div style={s.noteModule}>
                      <span
                        style={{
                          ...s.moduleBadge,
                          background: getModuleColor(note.module) + "20",
                          color: getModuleColor(note.module),
                        }}
                      >
                        {getModuleIcon(note.module)} {note.module}
                      </span>
                      {note.recordName && (
                        <span style={s.recordName}>{note.recordName}</span>
                      )}
                    </div>
                    <div style={s.noteActions}>
                      <button
                        style={s.pinBtn}
                        onClick={() => handlePin(note.id)}
                        title={note.pinned ? "Unpin" : "Pin"}
                      >
                        {note.pinned ? "📌" : "📍"}
                      </button>
                      <button
                        style={s.delBtn}
                        onClick={() => handleDelete(note.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div style={s.noteContent}>{note.content}</div>
                  {note.tags.length > 0 && (
                    <div style={s.noteTags}>
                      {note.tags.map((tag, i) => (
                        <span key={i} style={s.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={s.noteFoot}>
                    <div style={s.noteAuthor}>
                      <div
                        style={{
                          ...s.authorAvatar,
                          background: note.authorColor,
                        }}
                      >
                        {note.author.charAt(0)}
                      </div>
                      <span style={s.authorName}>{note.author}</span>
                    </div>
                    <span style={s.noteTime}>{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>Add Internal Note</div>
                <div style={s.modalSub}>Add a note for any record</div>
              </div>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Module</label>
                  <select
                    style={s.input}
                    value={form.module}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        module: e.target.value,
                        recordName: "",
                      })
                    }
                  >
                    <option value="leads">Leads</option>
                    <option value="candidates">Candidates</option>
                    <option value="placements">Placements</option>
                    <option value="deals">Deals</option>
                    <option value="accounts">Accounts</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Record Name</label>
                  <input
                    style={s.input}
                    value={form.recordName}
                    onChange={(e) =>
                      setForm({ ...form, recordName: e.target.value })
                    }
                    placeholder="Person/Company name"
                    list="record-options"
                  />
                  <datalist id="record-options">
                    {getRecordOptions().map((r, i) => (
                      <option key={i} value={r} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Note *</label>
                <textarea
                  style={{ ...s.input, minHeight: "100px", resize: "vertical" }}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="Write your internal note here..."
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Tags (comma separated)</label>
                <input
                  style={s.input}
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. follow-up, urgent, confirmed"
                />
              </div>
              <div style={s.modalFoot}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button style={s.saveBtn} onClick={handleAdd}>
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
    padding: "12px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7f0",
    gap: "8px",
    flexWrap: "wrap",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#0f1117" },
  count: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 9px",
    borderRadius: "20px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8f9fc",
    border: "1px solid #e5e7f0",
    borderRadius: "8px",
    padding: "7px 12px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#0f1117",
    width: "200px",
    fontFamily: "inherit",
  },
  addBtn: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  filterPanel: {
    width: "220px",
    minWidth: "220px",
    background: "#fff",
    borderRight: "1px solid #e5e7f0",
    overflowY: "auto",
    padding: "16px 0",
  },
  fpTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "0 14px 12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fpSection: { marginBottom: "8px", padding: "0 8px" },
  fpSectionTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "6px 8px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  fpItem: {
    display: "flex",
    alignItems: "center",
    padding: "7px 8px",
    cursor: "pointer",
    borderRadius: "8px",
    userSelect: "none",
    gap: "6px",
  },
  fpItemActive: { background: "#eef2ff" },
  fpLabel: { flex: 1, fontSize: "13px", color: "#374151", fontWeight: "500" },
  fpCount: {
    fontSize: "11px",
    color: "#9ca3af",
    background: "#f1f3f9",
    padding: "1px 8px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  fpStat: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 8px",
    fontSize: "12.5px",
    color: "#6b7280",
  },
  notesArea: { flex: 1, overflowY: "auto", padding: "16px" },
  notesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
    gap: "14px",
  },
  noteCard: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7f0",
    padding: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.15s",
  },
  noteCardPinned: {
    border: "1.5px solid #6366f1",
    boxShadow: "0 2px 12px rgba(99,102,241,0.1)",
  },
  noteTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  noteModule: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  moduleBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "20px",
  },
  recordName: { fontSize: "12px", fontWeight: "600", color: "#0f1117" },
  noteActions: { display: "flex", gap: "4px", flexShrink: 0 },
  pinBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px",
  },
  delBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    color: "#9ca3af",
    padding: "2px",
  },
  noteContent: {
    fontSize: "13px",
    color: "#374151",
    lineHeight: "1.6",
    marginBottom: "10px",
  },
  noteTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "10px",
  },
  tag: {
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  noteFoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "10px",
    borderTop: "1px solid #f1f3f9",
  },
  noteAuthor: { display: "flex", alignItems: "center", gap: "6px" },
  authorAvatar: {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "700",
    color: "#fff",
  },
  authorName: { fontSize: "11.5px", color: "#6b7280", fontWeight: "600" },
  noteTime: { fontSize: "11px", color: "#9ca3af" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "8px",
  },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#0f1117" },
  emptySub: { fontSize: "13px", color: "#9ca3af", marginBottom: "12px" },
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
    width: "540px",
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
  modalBody: { padding: "24px" },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "14px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
  },
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
  modalFoot: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7f0",
    marginTop: "8px",
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
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
};
