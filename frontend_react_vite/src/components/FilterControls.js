import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../App.css";

// Some possible status values for quick-select
const statusChoices = ["", "SUCCESS", "FAILED", "RUNNING"];

// PUBLIC_INTERFACE
export default function FilterControls({ filters, onChange, loading }) {
  // Project types are not hardcoded – may update from API in future
  const [projectTypes, setProjectTypes] = useState(["", "web", "mobile", "api", "backend"]);
  // Allow controlled form; use effects to pass new values upward only on submit/input change

  // Handler for search bar with submit
  const [searchVal, setSearchVal] = useState(filters.search || "");

  useEffect(() => {
    setSearchVal(filters.search || "");
  }, [filters.search]);

  // Handler for date pickers
  const handleFilterChange = (evt) => {
    onChange({ [evt.target.name]: evt.target.value, page: 1 });
  };

  const handleSearchSubmit = (evt) => {
    evt.preventDefault();
    onChange({ search: searchVal, page: 1 });
  };

  const handleClear = () => {
    onChange({
      search: "",
      date_from: "",
      date_to: "",
      status: "",
      project_type: "",
      page: 1,
    });
  };

  return (
    <section className="filter-controls" style={{
      display: "flex",
      gap: "1.2em",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      alignItems: "center",
      background: "var(--bg-secondary)",
      padding: "1.1rem 1rem 0.8rem 1rem",
      borderBottom: "1.5px solid var(--border-color)"
    }}>
      <form style={{ display: "flex", gap: 8, alignItems: "center" }} onSubmit={handleSearchSubmit}>
        <input
          type="search"
          name="search"
          placeholder="🔎 Search project or user"
          autoComplete="off"
          disabled={loading}
          style={{
            padding: "7px 13px",
            border: "1.3px solid var(--border-color)",
            borderRadius: 8,
            fontSize: 14,
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            minWidth: 140
          }}
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          maxLength={80}
        />
        <button
          type="submit"
          style={{ padding: "6px 13px", borderRadius: 8 }}
          disabled={loading}
        >Search</button>
      </form>
      <label>
        Date from:{" "}
        <input
          type="date"
          name="date_from"
          value={filters.date_from}
          max={filters.date_to}
          disabled={loading}
          onChange={handleFilterChange}
          style={{
            borderRadius: 6,
            border: "1.2px solid var(--border-color)",
            padding: "5px 7px"
          }}
        />
      </label>
      <label>
        to{" "}
        <input
          type="date"
          name="date_to"
          value={filters.date_to}
          min={filters.date_from}
          disabled={loading}
          onChange={handleFilterChange}
          style={{
            borderRadius: 6,
            border: "1.2px solid var(--border-color)",
            padding: "5px 7px"
          }}
        />
      </label>
      <label>
        Status:{" "}
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          disabled={loading}
          style={{
            borderRadius: 6,
            border: "1.2px solid var(--border-color)",
            padding: "5px 7px",
            background: "var(--bg-primary)"
          }}
        >
          <option value="">All</option>
          {statusChoices.filter((v) => v).map((status) =>
            <option value={status} key={status}>{status}</option>
          )}
        </select>
      </label>
      <label>
        Type:{" "}
        <select
          name="project_type"
          value={filters.project_type}
          onChange={handleFilterChange}
          disabled={loading}
          style={{
            borderRadius: 6,
            border: "1.2px solid var(--border-color)",
            padding: "5px 7px",
            background: "var(--bg-primary)"
          }}
        >
          <option value="">All</option>
          {projectTypes.filter((v) => v).map((type) =>
            <option value={type} key={type}>{type}</option>
          )}
        </select>
      </label>
      <button
        type="button"
        style={{
          background: "#d34700",
          color: "#fff",
          border: "none",
          borderRadius: 7,
          padding: "6px 14px",
          cursor: "pointer",
          marginLeft: 6
        }}
        onClick={handleClear}
        disabled={loading}
      >
        Clear
      </button>
    </section>
  );
}

FilterControls.propTypes = {
  filters: PropTypes.object,
  onChange: PropTypes.func,
  loading: PropTypes.bool
};
