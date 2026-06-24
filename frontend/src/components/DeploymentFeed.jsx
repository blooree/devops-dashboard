import React, { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";

function timeAgo(ts) {
  try { return formatDistanceToNow(parseISO(ts), { addSuffix: true }); } catch { return ts; }
}

export default function DeploymentFeed() {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const load = () =>
      fetch("/api/deployments")
        .then((r) => r.json())
        .then((d) => setDeployments(d.deployments || []))
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #7c3aed22", borderRadius: "12px", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#00ff88", boxShadow: "0 0 6px #00ff88",
          animation: "pulse 2s infinite",
        }} />
        <span style={{ fontSize: "0.75rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Live Deployment Feed
        </span>
      </div>

      {deployments.length === 0 && (
        <p style={{ color: "#444", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0" }}>
          No deployments yet. Push to main to trigger one.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {deployments.map((dep) => (
          <div key={dep.id} style={{
            background: "#0f0f1a",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            borderLeft: `3px solid ${dep.status === "success" ? "#00ff88" : "#ff4444"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <code style={{ fontSize: "0.75rem", color: "#7c3aed", background: "#7c3aed11", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>
                  {dep.commit}
                </code>
                <span style={{
                  fontSize: "0.65rem",
                  padding: "0.1rem 0.5rem",
                  borderRadius: "999px",
                  background: dep.status === "success" ? "#00ff8822" : "#ff444422",
                  color: dep.status === "success" ? "#00ff88" : "#ff4444",
                  fontWeight: 600,
                }}>
                  {dep.status}
                </span>
              </div>
              <span style={{ fontSize: "0.7rem", color: "#444" }}>{timeAgo(dep.timestamp)}</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#ccc", marginTop: "0.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {dep.message}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.15rem" }}>
              {dep.author} · {dep.duration_sec}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
