import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

function formatTime(ts) {
  try { return format(parseISO(ts), "HH:mm"); } catch { return ts; }
}

export default function MemoryChart({ history, current, total }) {
  const data = history.map((d) => ({
    time: formatTime(d.timestamp),
    mem: d.memory_percent,
    used: d.memory_used_gb,
  }));

  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #00ff8822", borderRadius: "12px", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          💾 Memory History
        </span>
        <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00ff88" }}>
          {current}% <span style={{ fontSize: "0.85rem", color: "#555" }}>of {total} GB</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={{ background: "#0f0f1a", border: "1px solid #00ff8833", borderRadius: "8px", fontSize: "0.8rem" }}
            labelStyle={{ color: "#888" }}
            itemStyle={{ color: "#00ff88" }}
            formatter={(v, n) => n === "mem" ? [`${v}%`, "Usage"] : [`${v} GB`, "Used"]}
          />
          <Area
            type="monotone"
            dataKey="mem"
            stroke="#00ff88"
            strokeWidth={2}
            fill="url(#memGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
