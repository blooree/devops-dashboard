import React, { useEffect, useRef, useState } from "react";
import CpuChart from "./components/CpuChart.jsx";
import DeploymentFeed from "./components/DeploymentFeed.jsx";
import MemoryChart from "./components/MemoryChart.jsx";
import MetricCard from "./components/MetricCard.jsx";
import UptimeCounter from "./components/UptimeCounter.jsx";

const styles = {
  app: {
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: "#1a1a2e",
    borderBottom: "1px solid #00d4ff22",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  title: {
    fontSize: "1.4rem",
    fontWeight: 700,
    background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.05em",
  },
  serverBadge: {
    background: "#0f0f1a",
    border: "1px solid #00d4ff33",
    borderRadius: "6px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.8rem",
    color: "#00d4ff",
    fontFamily: "monospace",
  },
  statusRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 8px #00ff88",
    animation: "pulse 2s infinite",
  },
  dotOffline: { background: "#ff4444", boxShadow: "0 0 8px #ff4444" },
  lastUpdated: { fontSize: "0.8rem", color: "#888" },
  main: { padding: "1.5rem 2rem", maxWidth: "1400px", margin: "0 auto" },
  section: { marginBottom: "2rem" },
  sectionTitle: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#555",
    marginBottom: "1rem",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "1rem",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
  },
};

const REFRESH_MS = 5000;

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [secsAgo, setSecsAgo] = useState(0);
  const [online, setOnline] = useState(true);
  const lastFetch = useRef(Date.now());

  const fetchData = async () => {
    try {
      const [mRes, hRes] = await Promise.all([
        fetch("/api/metrics"),
        fetch("/api/history"),
      ]);
      const m = await mRes.json();
      const h = await hRes.json();
      setMetrics(m);
      setHistory(h.history || []);
      setOnline(true);
      lastFetch.current = Date.now();
      setSecsAgo(0);
    } catch {
      setOnline(false);
    }
  };

  useEffect(() => {
    fetchData();
    const pollId = setInterval(fetchData, REFRESH_MS);
    const tickId = setInterval(
      () => setSecsAgo(Math.floor((Date.now() - lastFetch.current) / 1000)),
      1000
    );
    return () => {
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, []);

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.title}>⚡ DevOps Dashboard</span>
          <span style={styles.serverBadge}>2.26.80.135</span>
        </div>
        <div style={styles.statusRow}>
          <div style={{ ...styles.dot, ...(online ? {} : styles.dotOffline) }} />
          <span style={{ fontSize: "0.85rem", color: online ? "#00ff88" : "#ff4444" }}>
            {online ? "Live" : "Offline"}
          </span>
          <span style={styles.lastUpdated}>
            Updated {secsAgo}s ago
          </span>
        </div>
      </header>

      <main style={styles.main}>
        {!metrics && (
          <p style={{ color: "#555", textAlign: "center", padding: "4rem" }}>
            Connecting to server…
          </p>
        )}

        {metrics && (
          <>
            <div style={styles.section}>
              <p style={styles.sectionTitle}>Current Metrics</p>
              <div style={styles.metricsGrid}>
                <MetricCard icon="🖥️" label="CPU Usage" value={`${metrics.cpu_percent}%`} percent={metrics.cpu_percent} sub={`${metrics.cpu_count} cores`} />
                <MetricCard icon="💾" label="Memory" value={`${metrics.memory_percent}%`} percent={metrics.memory_percent} sub={`${metrics.memory_used_gb} / ${metrics.memory_total_gb} GB`} />
                <MetricCard icon="💿" label="Disk" value={`${metrics.disk_percent}%`} percent={metrics.disk_percent} sub={`${metrics.disk_used_gb} / ${metrics.disk_total_gb} GB`} />
                <MetricCard icon="🌐" label="Network Out" value={`${metrics.network_bytes_sent_mb} MB`} percent={null} sub={`In: ${metrics.network_bytes_recv_mb} MB`} accent="#7c3aed" />
              </div>
            </div>

            <div style={styles.section}>
              <p style={styles.sectionTitle}>History (last 60 min)</p>
              <div style={styles.chartsGrid}>
                <CpuChart history={history} current={metrics.cpu_percent} />
                <MemoryChart history={history} current={metrics.memory_percent} total={metrics.memory_total_gb} />
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.bottomGrid}>
                <UptimeCounter uptimeSeconds={metrics.uptime_seconds} load={metrics} />
                <DeploymentFeed />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
