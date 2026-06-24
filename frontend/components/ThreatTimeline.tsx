"use client";

import React from "react";
import { GitCommit, Clock, ArrowRight } from "lucide-react";

interface Alert {
  id: string;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  attack_class: string;
  confidence: number;
  risk_score: number;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  overall_risk_score: number;
  alerts: Alert[];
}

interface ThreatTimelineProps {
  incident?: Incident;
}

export default function ThreatTimeline({ incident }: ThreatTimelineProps) {
  if (!incident) {
    return (
      <div className="bg-slate-950 border border-cyber-border rounded-lg p-5 text-center py-12 text-xs text-gray-500 italic">
        Select an incident from the security console to visualize threat timeline.
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-cyber-border rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center">
          <GitCommit className="w-4 h-4 text-sky-500 mr-1.5" />
          Threat Evolution & Timeline
        </h3>
        <span className="text-[10px] text-gray-500 code-font">Incident Escalation</span>
      </div>

      <div className="relative pl-4 border-l border-cyber-border space-y-5">
        {incident.alerts.map((alert, idx) => {
          const isCritical = alert.risk_score > 80;
          const timeFormatted = alert.timestamp.slice(11, 19);

          return (
            <div key={idx} className="relative text-xs">
              {/* Timeline bubble */}
              <span className={`absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-red-500 shadow-neon-red' : 'bg-yellow-500'}`}></span>
              
              <div className="flex justify-between items-center text-[9px] code-font text-gray-500">
                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {timeFormatted}</span>
                <span className="text-sky-400 font-semibold">{alert.source_ip} &rarr; {alert.dest_ip}</span>
              </div>
              <div className="mt-1 text-gray-300">
                Flow prediction: <strong className="text-white">{alert.attack_class}</strong> (Confidence: {alert.confidence.toFixed(1)}%)
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Computed risk priority score: <span className="font-bold text-gray-400">{alert.risk_score}</span>
              </div>
            </div>
          );
        })}
        {/* End containment node */}
        <div className="relative text-xs text-gray-500 italic">
          <span className="absolute -left-[21.5px] top-1 w-2.5 h-2.5 rounded-full border border-cyber-border bg-slate-950"></span>
          <span>Analyst review active. Isolation playbook loaded.</span>
        </div>
      </div>
    </div>
  );
}
