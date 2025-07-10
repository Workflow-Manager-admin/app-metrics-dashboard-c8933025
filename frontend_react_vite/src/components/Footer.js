import React from "react";

// PUBLIC_INTERFACE
export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1.5px solid var(--border-color)",
        background: "var(--bg-secondary)",
        padding: "1.15rem",
        marginTop: 40,
        textAlign: "center",
        fontSize: "1.1em",
        color: "var(--text-secondary)"
      }}
    >
      <span>
        © {new Date().getFullYear()} App Metrics Dashboard &mdash; made with <span role="img" aria-label="love">❤️</span> for developers.
        {"  "}
        <a
          href="https://reactjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-secondary)", textDecoration: "underline" }}
        >React</a>
        {" | "}
        <a
          href="https://vitejs.dev/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-secondary)", textDecoration: "underline" }}
        >Vite</a>
      </span>
    </footer>
  );
}
