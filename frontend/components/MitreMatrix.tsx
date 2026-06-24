"use client";

import React from "react";
import { Layers } from "lucide-react";

interface MitreMatrixProps {
  activeTactic?: string;
  activeTechnique?: string;
}

export default function MitreMatrix({ activeTactic, activeTechnique }: MitreMatrixProps) {
  // Static representation of MITRE Tactics and techniques relevant to banking IoT
  const matrix = [
    {
      tactic: "Reconnaissance",
      techniques: [
        { id: "T1595", name: "Active Scanning" },
        { id: "T1592", name: "Gather Host Info" }
      ]
    },
    {
      tactic: "Initial Access",
      techniques: [
        { id: "T1190", name: "Exploit Public App" }
      ]
    },
    {
      tactic: "Execution",
      techniques: [
        { id: "T1059", name: "Command Interpreter" },
        { id: "T1204", name: "User Execution" }
      ]
    },
    {
      tactic: "Persistence",
      techniques: [
        { id: "T1505", name: "Server Software Component" }
      ]
    },
    {
      tactic: "Defense Evasion",
      techniques: [
        { id: "T1620", name: "Reflective Loading" }
      ]
    },
    {
      tactic: "Lateral Movement",
      techniques: [
        { id: "T1210", name: "Exploit Remote Service" }
      ]
    },
    {
      tactic: "Impact",
      techniques: [
        { id: "T1498", name: "Network DoS" }
      ]
    }
  ];

  return (
    <div className="bg-slate-950 border border-cyber-border rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center">
          <Layers className="w-4 h-4 text-emerald-500 mr-1.5" />
          MITRE ATT&CK Mapping Matrix
        </h3>
        <span className="text-[10px] text-gray-500 code-font">Enterprise Alignment</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {matrix.map((col, idx) => {
          const isTacticActive = col.tactic.toLowerCase() === activeTactic?.toLowerCase();

          return (
            <div key={idx} className="flex flex-col space-y-1.5">
              <div className={`p-2 rounded text-[10px] font-bold text-center border truncate ${isTacticActive ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-neon-green' : 'bg-slate-900/40 border-cyber-border text-gray-500'}`}>
                {col.tactic}
              </div>
              <div className="space-y-1">
                {col.techniques.map((tech, techIdx) => {
                  const isTechActive = activeTechnique?.includes(tech.id);
                  return (
                    <div 
                      key={techIdx} 
                      className={`p-2 rounded border text-[9px] code-font flex flex-col ${isTechActive ? 'bg-red-950/40 border-red-500 text-red-400 font-bold' : 'bg-slate-900/20 border-cyber-border/40 text-gray-600'}`}
                    >
                      <span className="font-bold">{tech.id}</span>
                      <span className="truncate mt-0.5">{tech.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
