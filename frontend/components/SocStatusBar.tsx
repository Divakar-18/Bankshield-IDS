"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, RefreshCw, Radio, Clock, AlertTriangle, Target } from "lucide-react";

interface SocStatusBarProps {
  activeThreats: number;
  criticalAlerts: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function SocStatusBar({
  activeThreats,
  criticalAlerts,
  onRefresh,
  refreshing,
}: SocStatusBarProps) {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + " UTC");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const threatLevel =
    criticalAlerts > 5 ? "CRITICAL" :
    activeThreats > 3 ? "ELEVATED" :
    activeThreats > 0 ? "GUARDED" : "NORMAL";

  const threatClass =
    threatLevel === "CRITICAL" ? "soc-threat-critical" :
    threatLevel === "ELEVATED" ? "soc-threat-elevated" :
    threatLevel === "GUARDED" ? "soc-threat-guarded" :
    "soc-threat-normal";

  return (
    <div className="soc-status-bar">
      {/* Top telemetry strip */}
      <div className="soc-status-strip">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3 h-3" aria-hidden="true" />
            <span className="soc-status-dot soc-status-dot-live" aria-hidden="true" />
            LIVE MONITORING
          </span>
          <span className="text-gray-700 hidden sm:inline">|</span>
          <span className="text-gray-500 hidden sm:inline">
            Banking IoT IDS · Random Forest + Isolation Forest
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {utcTime}
          </span>
          <span className={`px-2 py-0.5 rounded border font-bold tracking-wider ${threatClass}`}>
            THREAT LEVEL: {threatLevel}
          </span>
        </div>
      </div>

      {/* Main SOC header */}
      <header className="px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
        <Link href="/" className="group">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-emerald-600 flex items-center justify-center shadow-neon-blue group-hover:soc-glow-blue transition-shadow">
              <Shield className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-base text-white code-font tracking-wide block leading-tight">
                BANKSHIELD<span className="text-sky-400">AI</span>
              </span>
              <span className="text-[9px] text-gray-500 tracking-widest uppercase">
                Banking Security Operations Center
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Read-only status chips — display props only */}
          <span className="flex items-center gap-1 px-2 py-1 rounded border border-cyber-border bg-slate-900/60 text-[10px] code-font text-gray-400">
            <Target className="w-3 h-3 text-red-400" aria-hidden="true" />
            {activeThreats} active
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded border border-cyber-border bg-slate-900/60 text-[10px] code-font text-gray-400">
            <AlertTriangle className="w-3 h-3 text-yellow-400" aria-hidden="true" />
            {criticalAlerts} critical
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] code-font text-gray-400 hover:text-sky-400 border border-cyber-border hover:border-sky-500/50 rounded transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              REFRESH TELEMETRY
            </button>
          )}
        </div>
      </header>
    </div>
  );
}
