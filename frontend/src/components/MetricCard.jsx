import React from "react";

function colorForPercent(pct) {
  if (pct === null) return "#7c3aed";
  if (pct < 60) return "#00ff88";
  if (pct < 80) return "#ff6b35";
  return "#ff4444";
}

export default function MetricCard({ icon, label, value, percent, sub, accent }) {
  const color = accent ?? colorForPercent(percent);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = percent !== null ? circumference * (1 - percent / 100) : 0;

  return (
    <div style={{
      background: "#1a1a2e",
      border: `1px solid ${color}22`,
      borderRadius: "12px",
      padding: "1.25rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      transition: "border-color 0.3s",
    }}>
      {percent !== null && (
        <svg width="90" height="90" style={{ flexShrink: 0 }}>
          <circle cx="45" cy="45" r={radius} fill="none" stroke="#ffffff0d" strokeWidth="7" />
          <circle
            cx="45" cy="45" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s" }}
          />
          <text x="45" y="50" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">
            {percent}%
          </text>
        </svg>
      )}

      {percent === null && (
        <span style={{ fontSize: "2.5rem" }}>{icon}</span>
      )}

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.25rem" }}>
          {percent !== null && <span style={{ marginRight: "0.4rem" }}>{icon}</span>}
          {label}
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color, wordBreak: "break-word" }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "0.25rem" }}>{sub}</div>}
      </div>
    </div>
  );
}
