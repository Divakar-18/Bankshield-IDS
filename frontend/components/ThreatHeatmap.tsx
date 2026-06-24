"use client";

import React from "react";
import { Grid } from "lucide-react";

interface Alert {
  risk_score: number;
  asset_context?: {
    type: string;
    name: string;
  };
}

interface ThreatHeatmapProps {
  alerts: Alert[];
}

export default function ThreatHeatmap({ alerts }: ThreatHeatmapProps) {
  const nodes = [
    { name: "SWIFT Gateway", type: "SWIFT" },
    { name: "ATM Subnet", type: "ATM" },
    { name: "POS Subnet", type: "POS" },
    { name: "Surveillance CCTV", type: "CCTV" },
    { name: "Corp Domain", type: "Active Directory" }
  ];

  return (
    <div className="bg-slate-950 border border-cyber-border rounded-lg p-5">
      <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4 flex items-center">
        <Grid className="w-4 h-4 text-sky-500 mr-1.5" />
        Subnet Threat Density Node Heatmap
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {nodes.map((node, idx) => {
          const matches = alerts.filter(
            a => a.asset_context?.type?.toLowerCase().includes(node.type.toLowerCase()) || 
                 a.asset_context?.name?.toLowerCase().includes(node.type.toLowerCase())
          );
          const count = matches.length;
          const maxRisk = count > 0 ? Math.max(...matches.map(a => a.risk_score)) : 0;

          let styleClasses = "bg-slate-900 border-cyber-border text-gray-400";
          if (count > 0) {
            if (maxRisk > 80) {
              styleClasses = "bg-red-950/60 border-red-500/50 text-red-400 shadow-neon-red font-bold";
            } else if (maxRisk > 60) {
              styleClasses = "bg-yellow-950/60 border-yellow-500/50 text-yellow-400 font-bold";
            } else {
              styleClasses = "bg-emerald-950/60 border-emerald-500/50 text-emerald-400 font-bold";
            }
          }

          return (
            <div key={idx} className={`border p-3.5 rounded text-center text-[10px] ${styleClasses}`}>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider truncate">{node.name}</div>
              <div className="text-base font-extrabold mt-1 code-font">{count}</div>
              <div className="text-[8px] text-gray-500 mt-1">
                {count > 0 ? `Max Risk: ${maxRisk.toFixed(0)}` : "Inactive"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
