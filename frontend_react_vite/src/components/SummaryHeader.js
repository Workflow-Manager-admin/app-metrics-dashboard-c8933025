import React from "react";
import PropTypes from "prop-types";
import "../App.css";

// PUBLIC_INTERFACE
export default function SummaryHeader({
  summary,
  loading,
  error,
  theme,
  onToggleTheme,
}) {
  return (
    <div className="summary-header" style={{
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border-color)",
      padding: "1.5rem 1rem 1rem 1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap"
    }}>
      <div className="header-title" style={{minWidth: 200}}>
        <h1 style={{margin: 0, fontSize: "2rem"}}>
          <span role="img" aria-label="metrics">📊</span>{" "}
          App Metrics Dashboard
        </h1>
        <span style={{fontSize: "1rem", color: "var(--text-secondary)"}}>
          Modern insights on app generation
        </span>
      </div>
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        style={{marginLeft: "1rem", alignSelf: "flex-start"}}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <div className="summary-stats" style={{
        display: "flex",
        gap: "2rem",
        minWidth: 240,
        flexWrap: "wrap",
        justifyContent: "flex-end"
      }}>
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span style={{ color: "crimson" }}>{error}</span>
        ) : summary ? (
          <>
            <SummaryStat label="Total Runs" value={summary.total_count} />
            <SummaryStat label="Successes" value={summary.success_count} />
            <SummaryStat label="Failures" value={summary.failed_count} />
            <SummaryStat
              label="Avg Time (s)"
              value={summary.average_duration && summary.average_duration.toFixed(1)}
            />
            <SummaryStat
              label="Total Cost ($)"
              value={summary.total_cost && summary.total_cost.toFixed(2)}
            />
          </>
        ) : (
          <span>No summary.</span>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="summary-stat" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <span style={{
        color: "var(--text-secondary)", fontSize: "0.9rem"
      }}>
        {label}
      </span>
      <span style={{
        fontWeight: "bold",
        fontSize: "1.2rem",
        marginTop: 2,
        color: "var(--text-primary)"
      }}>
        {value ?? "-"}
      </span>
    </div>
  );
}

SummaryHeader.propTypes = {
  summary: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  theme: PropTypes.string,
  onToggleTheme: PropTypes.func
};
