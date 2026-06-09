import React from "react";

// Reusable Pagination Component
// Usage: <Pagination total={100} page={1} perPage={10} onPageChange={setPage} onPerPageChange={setPerPage}/>

export default function Pagination({
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}) {
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  if (total === 0) return null;

  // Generate page numbers to show
  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <span style={s.info}>
          Showing{" "}
          <strong>
            {start}–{end}
          </strong>{" "}
          of <strong>{total}</strong> records
        </span>
        <select
          style={s.perPage}
          value={perPage}
          onChange={(e) => {
            onPerPageChange(parseInt(e.target.value));
            onPageChange(1);
          }}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>
      <div style={s.right}>
        <button
          style={{ ...s.btn, ...(page === 1 ? s.btnDisabled : {}) }}
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          «
        </button>
        <button
          style={{ ...s.btn, ...(page === 1 ? s.btnDisabled : {}) }}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          ‹
        </button>
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} style={s.dots}>
              …
            </span>
          ) : (
            <button
              key={p}
              style={{ ...s.btn, ...(p === page ? s.btnActive : {}) }}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          style={{ ...s.btn, ...(page === totalPages ? s.btnDisabled : {}) }}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          ›
        </button>
        <button
          style={{ ...s.btn, ...(page === totalPages ? s.btnDisabled : {}) }}
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          »
        </button>
      </div>
    </div>
  );
}

// Hook for pagination logic
export function usePagination(items, defaultPerPage = 10) {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(defaultPerPage);

  const totalPages = Math.ceil(items.length / perPage);
  const paginated = items.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when items change
  React.useEffect(() => {
    setPage(1);
  }, [items.length]);

  return { page, setPage, perPage, setPerPage, paginated, totalPages };
}

const s = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #e5e7f0",
    background: "#f8f9fc",
    flexWrap: "wrap",
    gap: "10px",
  },
  left: { display: "flex", alignItems: "center", gap: "12px" },
  info: { fontSize: "13px", color: "#6b7280" },
  perPage: {
    padding: "5px 10px",
    borderRadius: "7px",
    border: "1px solid #e5e7f0",
    fontSize: "12.5px",
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    color: "#374151",
  },
  right: { display: "flex", alignItems: "center", gap: "4px" },
  btn: {
    width: "32px",
    height: "32px",
    borderRadius: "7px",
    border: "1px solid #e5e7f0",
    background: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
  },
  btnActive: {
    background: "#6366f1",
    color: "#fff",
    border: "1px solid #6366f1",
    fontWeight: "700",
  },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed", background: "#f8f9fc" },
  dots: { fontSize: "13px", color: "#9ca3af", padding: "0 4px" },
};
