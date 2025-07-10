import React from "react";
import PropTypes from "prop-types";
import "../App.css";

// PUBLIC_INTERFACE
export default function MetricTable({
  data,
  page,
  pageSize,
  totalPages,
  setPage,
  onSort,
  sortBy,
  sortOrder,
  loading,
  error,
}) {
  const columns = [
    { label: "Project", key: "project_name" },
    { label: "User", key: "user_email" },
    { label: "Type", key: "project_type" },
    { label: "Status", key: "status" },
    { label: "Started", key: "created_at" },
    { label: "Duration (s)", key: "duration_seconds" },
    { label: "Cost ($)", key: "cost_usd" },
    { label: "Link", key: "details_url" },
  ];

  // For mobile, stack columns or hide some - here, render a scrollable table
  return (
    <div className="metrics-table-container" style={{
      margin: "1.5rem auto",
      maxWidth: 1180,
      padding: "0 0.5rem",
      background: "var(--bg-primary)",
      borderRadius: 16,
      boxShadow: "0 2px 8px #0001"
    }}>
      <div className="table-wrapper" style={{overflowX: "auto"}}>
        <table className="metrics-table" style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 680,
        }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    background: "var(--bg-secondary)",
                    borderBottom: "2px solid var(--border-color)",
                    padding: "0.65em 0.8em",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span style={{ marginLeft: 4 }}>
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} style={{ color: "crimson", textAlign: "center" }}>{error}</td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>No results</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>{row.project_name}</td>
                  <td>{row.user_email}</td>
                  <td>{row.project_type}</td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <td>
                    {row.created_at ? (
                      <span title={row.created_at}>
                        {new Date(row.created_at).toLocaleString()}
                      </span>
                    ) : "-"}
                  </td>
                  <td>{row.duration_seconds ?? "-"}</td>
                  <td>{row.cost_usd != null ? row.cost_usd.toFixed(2) : "-"}</td>
                  <td>
                    {row.details_url ?
                      <a
                        href={row.details_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        style={{
                          color: "var(--text-secondary)",
                          textDecoration: "underline"
                        }}
                      >
                        View
                      </a>
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        setPage={setPage}
        loading={loading}
        />
    </div>
  );
}

function StatusPill({ status }) {
  let bg = "#afb4b4", color = "#222", text = status;
  if (status === "SUCCESS") { bg = "#34a85322"; color = "#188a38"; text = "✔ Success"; }
  else if (status === "FAILED") { bg = "#fbbc0538"; color = "#ad7e11"; text = "✖ Failed"; }
  else if (status === "RUNNING") { bg = "#1a73e822"; color = "#195dbe"; text = "⏳ Running"; }
  return (
    <span style={{
      background: bg,
      color,
      fontWeight: 600,
      fontSize: "0.95em",
      padding: "3px 10px",
      borderRadius: "2em"
    }}>
      {text}
    </span>
  );
}

function Pagination({ currentPage, totalPages, setPage, loading }) {
  // Render pagination controls for up to max display page numbers
  const maxDisplay = 7;
  let pageNumbers = [];
  let minPage = Math.max(1, currentPage - Math.floor(maxDisplay/2));
  let maxPage = Math.min(totalPages, minPage + maxDisplay - 1);
  if (maxPage - minPage < maxDisplay - 1) minPage = Math.max(1, maxPage - maxDisplay + 1);
  for (let i=minPage; i <= maxPage; ++i) pageNumbers.push(i);
  if (totalPages <= 1) return null;
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        padding: "1em"
      }}
    >
      <button
        disabled={loading || currentPage === 1}
        onClick={() => setPage(1)}
        aria-label="First page"
        tabIndex={0}
        style={{marginRight: 6}}
      >&laquo;</button>
      <button
        disabled={loading || currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
        aria-label="Previous page"
      >&lsaquo;</button>
      {pageNumbers.map((n) => (
        <button
          key={n}
          disabled={loading || n === currentPage}
          style={{
            fontWeight: n === currentPage ? "bold" : "normal",
            background: n === currentPage ? "var(--button-bg)" : undefined,
            color: n === currentPage ? "var(--button-text)" : undefined,
            borderRadius: "4px"
          }}
          onClick={() => setPage(n)}
        >
          {n}
        </button>
      ))}
      <button
        disabled={loading || currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
        aria-label="Next page"
      >&rsaquo;</button>
      <button
        disabled={loading || currentPage === totalPages}
        onClick={() => setPage(totalPages)}
        aria-label="Last page"
        style={{marginLeft: 6}}
      >&raquo;</button>
    </nav>
  );
}

MetricTable.propTypes = {
  data: PropTypes.array,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  totalPages: PropTypes.number,
  setPage: PropTypes.func,
  onSort: PropTypes.func,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
};
