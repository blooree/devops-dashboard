import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

function formatTime(ts) {
  try { return format(parseISO(ts), "HH:mm"); } catch { return ts; }
}

export default function CpuChart({ history, current }) {
  const data = history.map((d) => ({
    time: formatTime(d.timestamp),
    cpu: d.cpu_percent,
  }));

  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #00d4ff22", borderRadius: "12px", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🖥️ CPU History
        </span>
        <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00d4ff" }}>{current}%</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={{ background: "#0f0f1a", border: "1px solid #00d4ff33", borderRadius: "8px", fontSize: "0.8rem" }}
            labelStyle={{ color: "#888" }}
            itemStyle={{ color: "#00d4ff" }}
            formatter={(v) => [`${v}%`, "CPU"]}
          />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#00d4ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#00d4ff" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
