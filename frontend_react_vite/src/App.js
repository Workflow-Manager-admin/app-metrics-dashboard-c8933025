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

/**
 * Helper to resolve the backend API base URL for metrics fetches.
 * Priority:
 * 1. Use process.env.REACT_APP_API_URL (defined in .env)
 * 2. If not set, use "http://localhost:3001" when running on localhost (for dev)
 * 3. Otherwise, fall back to window.location.origin for production/reverse proxy
 * Always trims trailing slashes and provides dev-time warnings if unset/misconfigured.
 */
function resolveApiBaseUrl() {
  let apiBase =
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL
      : null;

  if (!apiBase) {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      apiBase = "http://localhost:3001";
    } else {
      apiBase = window.location.origin;
    }
  }

  if (apiBase.endsWith("/")) apiBase = apiBase.replace(/\/+$/, "");
  return apiBase;
}

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

  // Correctly resolve API base URL ONCE per process
  const BASE_API_URL = resolveApiBaseUrl();

  // PUBLIC_INTERFACE
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ensure API URL set
      if (!BASE_API_URL) {
        throw new Error(
          "Backend API base URL is not set. Please configure REACT_APP_API_URL in your .env file. See .env.example for setup."
        );
      }

      // Clean up query
      const params = { ...query };
      if (!params.date_from) delete params.date_from;
      if (!params.date_to) delete params.date_to;
      if (!params.status) delete params.status;
      if (!params.project_type) delete params.project_type;
      if (!params.search) delete params.search;

      const qs = buildQueryString(params);
      let apiUrl = BASE_API_URL + "/metrics";
      if (qs) apiUrl += "?" + qs;

      // Log target API URL for debugging/preflight
      if (
        process.env.NODE_ENV === "development" ||
        !(
          typeof process !== "undefined" &&
          process.env &&
          process.env.REACT_APP_API_URL
        )
      ) {
        // eslint-disable-next-line
        console.log(
          "[metrics] Fetching metrics from:",
          apiUrl,
          "| BASE_API_URL source:",
          process.env.REACT_APP_API_URL
            ? "REACT_APP_API_URL"
            : window.location.hostname === "localhost"
            ? "localhost fallback"
            : "window.location.origin"
        );
      }
      if (BASE_API_URL === window.location.origin) {
        // eslint-disable-next-line
        console.warn(
          "[metrics] Using window.location.origin for API requests. If your backend is on a separate port or host, set REACT_APP_API_URL in .env."
        );
      }

      const resp = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(
          `API error: ${resp.status} ${resp.statusText} - ${text}`
        );
      }
      let data;
      try {
        data = await resp.json();
      } catch (err) {
        throw new Error("API did not return valid JSON.");
      }

      if (!data || typeof data !== "object") {
        throw new Error("API response was not an object.");
      }
      if (!("data" in data) || !("summary" in data) || !("total_pages" in data)) {
        throw new Error(
          "Response missing required fields (data, summary, total_pages)"
        );
      }
      setMetrics(data.data || []);
      setSummary(data.summary || {});
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      // Set detailed error for easier diagnosis, also log to console (for CORS, network, 404, etc).
      const msg =
        typeof e === "object" && e !== null && "message" in e
          ? e.message
          : String(e);

      let errHelp =
        `Failed to load metrics: ${msg}` +
        (/\bCORS\b/i.test(msg)
          ? ". Check backend CORS and API URL."
          : "");
      // If error is about 404/cannot GET/cannot connect, give targeted help
      if (
        /Cannot GET|404|Failed to fetch|NetworkError|Failed to load resource|TypeError/i.test(
          msg
        )
      ) {
        errHelp +=
          "\n\nTroubleshooting steps:\n" +
          "- Is REACT_APP_API_URL set correctly in .env? (Should point to backend root url, e.g., http://localhost:3001)\n" +
          "- Is backend running and accessible? Test by opening <API_URL>/metrics in your browser.\n" +
          "- Check for CORS issues (see browser Network tab for error details).\n";
        if (
          !(typeof process !== "undefined" &&
            process.env &&
            process.env.REACT_APP_API_URL)
        ) {
          errHelp +=
            "- REACT_APP_API_URL is not set in .env. See .env.example to fix this for local development.\n";
        }
      }
      setError(errHelp);

      // Log full error stack in dev for developers
      // eslint-disable-next-line
      if (process.env.NODE_ENV === "development") console.error(e);
      setMetrics([]);
      setSummary(null);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query, BASE_API_URL]);

  // Fetch metrics any time query changes
  useEffect(() => {
    fetchMetrics();
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
