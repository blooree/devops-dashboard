import React, { useEffect, useState } from "react";

function formatUptime(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { d, h, m, s };
}

export default function UptimeCounter({ uptimeSeconds, load }) {
  const [secs, setSecs] = useState(uptimeSeconds ?? 0);

  useEffect(() => {
    setSecs(uptimeSeconds ?? 0);
  }, [uptimeSeconds]);

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { d, h, m, s } = formatUptime(secs);

  const Seg = ({ val, label }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#00d4ff", fontVariantNumeric: "tabular-nums", minWidth: "2.5ch" }}>
        {String(val).padStart(2, "0")}
      </div>
      <div style={{ fontSize: "0.65rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #00d4ff22", borderRadius: "12px", padding: "1.5rem" }}>
      <p style={{ fontSize: "0.75rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>
        ⏱ Server Uptime
      </p>
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
        <Seg val={d} label="days" />
        <Seg val={h} label="hrs" />
        <Seg val={m} label="min" />
        <Seg val={s} label="sec" />
      </div>
      {load && (
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          {[["1m", load.load_avg_1m], ["5m", load.load_avg_5m], ["15m", load.load_avg_15m]].map(([lbl, val]) => (
            <div key={lbl} style={{ textAlign: "center", background: "#0f0f1a", borderRadius: "8px", padding: "0.4rem 0.75rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#ff6b35" }}>{val}</div>
              <div style={{ fontSize: "0.65rem", color: "#555" }}>load {lbl}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
