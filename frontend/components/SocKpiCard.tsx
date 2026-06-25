"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface SocKpiCardProps {
  label: string;
  value: string | number;
  accent?: "blue" | "green" | "yellow" | "red" | "neutral";
  icon?: LucideIcon;
  pulse?: boolean;
  sublabel?: string;
}

const accentMap = {
  blue: { text: "text-sky-400", bar: "#0ea5e9", iconBg: "bg-sky-500/10" },
  green: { text: "text-emerald-400", bar: "#10b981", iconBg: "bg-emerald-500/10" },
  yellow: { text: "text-yellow-400", bar: "#f59e0b", iconBg: "bg-yellow-500/10" },
  red: { text: "text-red-400", bar: "#ef4444", iconBg: "bg-red-500/10" },
  neutral: { text: "text-gray-300", bar: "#64748b", iconBg: "bg-slate-700/40" },
};

export default function SocKpiCard({
  label,
  value,
  accent = "blue",
  icon: Icon,
  pulse,
  sublabel,
}: SocKpiCardProps) {
  const colors = accentMap[accent];

  return (
    <div
      className="soc-kpi-card group"
      style={{ "--kpi-accent": colors.bar } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase flex items-center gap-1.5 leading-tight">
          {pulse && <span className="soc-status-dot soc-status-dot-live" aria-hidden="true" />}
          {label}
        </span>
        {Icon && (
          <span className={`p-1 rounded ${colors.iconBg}`}>
            <Icon className={`w-3 h-3 ${colors.text}`} aria-hidden="true" />
          </span>
        )}
      </div>
      <span className={`text-xl font-bold mt-2 code-font leading-none ${colors.text}`}>
        {value}
      </span>
      {sublabel && (
        <span className="text-[9px] text-gray-600 mt-1 code-font uppercase tracking-wide">
          {sublabel}
        </span>
      )}
    </div>
  );
}
