import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import MetricTable from "./components/MetricTable";
import SummaryHeader from "./components/SummaryHeader";
import Footer from "./components/Footer";
import FilterControls from "./components/FilterControls";

// Utility to determine initial theme preference (system or fallback)
const getInitialTheme = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState(getInitialTheme());
  const [query, setQuery] = useState({
    search: "",
    date_from: "",
    date_to: "",
    status: "",
    project_type: "",
    sort_by: "created_at",
    sort_order: "desc",
    page: 1,
    page_size: 15,
  });
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableRefreshKey, setTableRefreshKey] = useState(Date.now());

  // Effect to sync theme to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Optionally persist theme
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Auto-load stored theme if available
    const stored = window.localStorage.getItem("theme");
    if (stored && stored !== theme) setTheme(stored);
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Build query string for API
  const buildQueryString = (params) =>
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

  // Resolve base API endpoint (allow .env override or fallback)
  // Uses REACT_APP_API_URL from environment (.env) if present, otherwise defaults to http://localhost:3001 in development.
  // This enables proper cross-origin API fetch between React (Vite) and FastAPI backend.
  const BASE_API_URL =
    process.env.REACT_APP_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : '');

  // Fetch metrics from backend
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ensure date string is valid or omitted
      const params = { ...query };
      if (!params.date_from) delete params.date_from;
      if (!params.date_to) delete params.date_to;
      if (!params.status) delete params.status;
      if (!params.project_type) delete params.project_type;
      if (!params.search) delete params.search;

      const qs = buildQueryString(params);
      const apiUrl = `${BASE_API_URL}/metrics${qs ? "?" + qs : ""}`;

      const resp = await fetch(
        apiUrl,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);
      const data = await resp.json();
      setMetrics(data.data || []);
      setSummary(data.summary || {});
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      setError("Failed to load metrics.");
      setMetrics([]);
      setSummary(null);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Fetch metrics any time query changes
  useEffect(() => {
    fetchMetrics();
    // reset table refresh key so child resets scroll, etc.
    setTableRefreshKey(Date.now());
  }, [fetchMetrics]);

  // For changing pagination, sorting, filters, etc.
  const updateQuery = (updates) =>
    setQuery((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1,
    }));

  return (
    <div className="App">
      <header>
        <SummaryHeader
          summary={summary}
          loading={loading}
          error={error}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <FilterControls
          filters={query}
          onChange={updateQuery}
          loading={loading}
        />
      </header>
      <main>
        <MetricTable
          key={tableRefreshKey}
          data={metrics}
          page={query.page}
          pageSize={query.page_size}
          totalPages={totalPages}
          setPage={(p) => setQuery((q) => ({ ...q, page: p }))}
          onSort={(col) => {
            setQuery((prev) => ({
              ...prev,
              sort_by: col,
              sort_order:
                prev.sort_by === col && prev.sort_order === "desc"
                  ? "asc"
                  : "desc",
              page: 1,
            }));
          }}
          sortBy={query.sort_by}
          sortOrder={query.sort_order}
          loading={loading}
          error={error}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
