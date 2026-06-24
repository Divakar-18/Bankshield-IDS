"use client";

import React from "react";
import { Layers } from "lucide-react";

interface Alert {
  id: string;
  risk_score: number;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  overall_risk_score: number;
  mitre_tactic: string;
  alerts: Alert[];
}

interface IncidentClusterViewProps {
  incidents: Incident[];
  selectedId?: string;
  onSelectIncident: (inc: Incident) => void;
}

export default function IncidentClusterView({ incidents, selectedId, onSelectIncident }: IncidentClusterViewProps) {
  return (
    <div className="bg-slate-950 border border-cyber-border rounded-lg p-4 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center">
          <Layers className="w-4 h-4 text-sky-500 mr-1.5" />
          Clustered Threat Incidents
        </h3>
        <span className="text-[10px] text-gray-500 code-font">Alert Fatigue Reduction</span>
      </div>

      <div className="space-y-2 overflow-y-auto flex-grow pr-1">
        {incidents.map((inc) => {
          const isSelected = selectedId === inc.id;
          const risk = inc.overall_risk_score;
          
          let borderGlow = "border-cyber-border";
          if (isSelected) {
            borderGlow = "border-sky-500 bg-sky-950/10 shadow-neon-blue";
          }

          return (
            <div 
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`cursor-pointer border p-3 rounded transition hover:border-sky-500/80 flex flex-col ${borderGlow}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-white truncate max-w-[70%]">{inc.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${risk > 80 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  Risk: {risk}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-500 code-font">
                <span>Tactics: {inc.mitre_tactic}</span>
                <span>{inc.alerts.length} events</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
