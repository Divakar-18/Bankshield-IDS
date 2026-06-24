"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Activity, ShieldAlert, Zap, Cpu, Terminal, RefreshCw, Send, HelpCircle } from "lucide-react";
import IncidentClusterView from "../../components/IncidentClusterView";
import ThreatTimeline from "../../components/ThreatTimeline";
import ShapWaterfall from "../../components/ShapWaterfall";
import MitreMatrix from "../../components/MitreMatrix";
import ThreatHeatmap from "../../components/ThreatHeatmap";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [copilotHistory, setCopilotHistory] = useState<any[]>([]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchData = async () => {
    try {
      const [alertsRes, incidentsRes] = await Promise.all([
        fetch("/api/v1/alerts?limit=100"),
        fetch("/api/v1/incidents")
      ]);
      const alertsData = await alertsRes.json();
      const incidentsData = await incidentsRes.json();

      setAlerts(alertsData);
      setIncidents(incidentsData);

      if (incidentsData.length > 0) {
        const defaultInc = incidentsData[0];
        setSelectedIncident(defaultInc);
        if (defaultInc.alerts && defaultInc.alerts.length > 0) {
          setSelectedAlert(defaultInc.alerts[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching dashboard statistics:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectIncident = (inc: any) => {
    setSelectedIncident(inc);
    if (inc.alerts && inc.alerts.length > 0) {
      setSelectedAlert(inc.alerts[0]);
    }
    setCopilotHistory([
      {
        sender: "copilot",
        text: `Hi Analyst. I have initialized security context for Incident **${inc.id.slice(0, 8)}** targeting the **${inc.asset_type}** subnet. I can discuss its risk indicators, SHAP explanations, or mitigation playbooks. Ask me anything.`
      }
    ]);
  };

  const handleSimulateAttack = async (type: string) => {
    setSimulating(true);
    try {
      const response = await fetch("/api/v1/alerts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_class: type })
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleAskCopilot = async (preText?: string) => {
    const question = preText || copilotInput;
    if (!question || !selectedIncident) return;
    if (!preText) setCopilotInput("");

    setCopilotHistory(prev => [...prev, { sender: "user", text: question }]);
    setCopilotLoading(true);

    try {
      const response = await fetch("/api/v1/copilot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_id: selectedIncident.id,
          question: question
        })
      });
      const data = await response.json();
      setCopilotHistory(prev => [...prev, { sender: "copilot", text: data.answer }]);
    } catch (e) {
      setCopilotHistory(prev => [...prev, { sender: "copilot", text: "Failed to communicate with Security Copilot API." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const activeThreatCount = incidents.filter(i => i.status !== "Resolved").length;
  const criticalAlertCount = alerts.filter(a => a.severity === "Critical").length;
  const zeroDayCount = alerts.filter(a => a.anomaly_score > 80 && a.attack_class === "Normal").length;
  const avgRiskScore = incidents.length > 0 ? (incidents.reduce((sum, inc) => sum + parseFloat(inc.overall_risk_score), 0) / incidents.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-cyber-border bg-slate-950/80 px-6 py-4 flex flex-col md:flex-row justify-between items-center z-10 sticky top-0 backdrop-blur-md">
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white code-font">BANKSHIELD<span className="text-sky-500">AI</span></span>
            </div>
          </Link>
          <div className="text-xs text-gray-500 code-font border-l border-cyber-border pl-6">
            SOC Operations Center
          </div>
        </div>

        {/* Live Attack Simulator Trigger */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gray-500 code-font">SIMULATE ATTACK VECTOR:</span>
          <div className="flex space-x-1.5">
            {["DoS", "Worms", "Backdoor", "Exploits"].map((attack) => (
              <button 
                key={attack}
                onClick={() => handleSimulateAttack(attack)} 
                disabled={simulating}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyber-border rounded font-semibold text-sky-400 transition"
              >
                {attack}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* KPI Banner */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-slate-950/80 border border-cyber-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Traffic Logs</span>
            <span className="text-lg font-bold text-white mt-1 code-font">{alerts.length * 45} flows</span>
          </div>
          <div className="bg-slate-950/80 border border-cyber-border rounded-lg p-4 flex flex-col justify-center relative">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase flex items-center">
              Active Threats
              {activeThreatCount > 0 && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
            </span>
            <span className={`text-lg font-bold mt-1 code-font ${activeThreatCount > 0 ? "text-red-400" : "text-gray-300"}`}>{activeThreatCount} groups</span>
          </div>
          <div className="bg-slate-950/80 border border-cyber-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Critical Alerts</span>
            <span className="text-lg font-bold text-red-500 mt-1 code-font">{criticalAlertCount}</span>
          </div>
          <div className="bg-slate-950/80 border border-cyber-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Zero-Day Anomalies</span>
            <span className="text-lg font-bold text-sky-400 mt-1 code-font">{zeroDayCount}</span>
          </div>
          <div className="bg-slate-950/80 border border-cyber-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Average Risk</span>
            <span className="text-lg font-bold text-yellow-500 mt-1 code-font">{avgRiskScore}/100</span>
          </div>
          <div className="bg-slate-950/80 border border-cyber-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Classifier Accuracy</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 code-font">96.82%</span>
          </div>
        </div>

        {/* Sidebar Column: Incident listing */}
        <div className="lg:col-span-4 flex flex-col space-y-6 h-[800px] overflow-hidden">
          <IncidentClusterView 
            incidents={incidents}
            selectedId={selectedIncident?.id}
            onSelectIncident={handleSelectIncident}
          />
          <ThreatHeatmap alerts={alerts} />
        </div>

        {/* Center Panel Column */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-[800px] overflow-y-auto pr-1">
          <ThreatTimeline incident={selectedIncident} />
          
          <ShapWaterfall 
            shapExplanation={selectedAlert?.shap_explanation}
            predictionClass={selectedAlert?.attack_class}
          />

          {/* Business Impact Card */}
          <div className="bg-slate-950 border border-cyber-border rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center">
              <Activity className="w-4 h-4 text-emerald-400 mr-1.5" />
              Banking Business Impact Translation
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-900 border border-cyber-border p-3.5 rounded">
                <span className="text-[9px] text-gray-500 uppercase block font-semibold">Banking Vector</span>
                <span className="text-xs font-bold text-white block mt-1">{selectedAlert?.business_impact_translation?.impact_title || "Normal Operations"}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-cyber-border p-3 rounded">
                  <span className="text-[9px] text-gray-500 uppercase block">Financial Loss Exposure</span>
                  <span className="text-sm font-extrabold text-red-400 block mt-1 code-font">
                    ${selectedAlert?.business_impact_translation?.financial_exposure?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="bg-slate-900 border border-cyber-border p-3 rounded">
                  <span className="text-[9px] text-gray-500 uppercase block">Target Host</span>
                  <span className="text-xs font-bold text-white block mt-1 truncate">{selectedAlert?.asset_context?.name || "None"}</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-cyber-border p-3 rounded">
                <span className="text-[9px] text-gray-500 uppercase block font-semibold">Automated Containment Plan</span>
                <span className="text-[10px] code-font text-emerald-400 block mt-1.5 leading-relaxed">
                  {selectedAlert?.business_impact_translation?.action || "No action required."}
                </span>
              </div>
            </div>
          </div>

          {/* Zero-Day Anomaly Analysis */}
          <div className="bg-slate-950 border border-cyber-border rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center">
              <ShieldAlert className="w-4 h-4 text-sky-400 mr-1.5" />
              Zero-Day Anomaly Detection
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-900 border border-cyber-border p-3 rounded text-center">
                <span className="text-[9px] text-gray-500 block uppercase">Anomaly Index</span>
                <span className="text-sm font-extrabold text-white mt-1.5 block code-font">
                  {selectedAlert?.anomaly_score?.toFixed(1) || "0.0"}/100
                </span>
              </div>
              <div className="bg-slate-900 border border-cyber-border p-3 rounded text-center">
                <span className="text-[9px] text-gray-500 block uppercase">Novelty</span>
                <span className="text-xs font-bold text-sky-400 mt-2 block uppercase tracking-wide">
                  {selectedAlert?.anomaly_score > 70 ? "High" : "Normal"}
                </span>
              </div>
              <div className="bg-slate-900 border border-cyber-border p-3 rounded text-center">
                <span className="text-[9px] text-gray-500 block uppercase">Classification</span>
                <span className="text-[10px] font-bold text-white mt-2 block truncate">
                  {selectedAlert?.anomaly_score > 75 ? "Out of Bounds" : "Known Profile"}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 bg-slate-900/50 border border-cyber-border p-3 rounded leading-relaxed">
              {selectedAlert?.anomaly_score > 75 ? (
                <span className="text-red-400 font-semibold">
                  Flagged: Isolation Forest flags this session structure as highly atypical compared to regular ATM/transaction workloads.
                </span>
              ) : (
                <span>Session statistics comply with baseline profiles. No anomalies highlighted.</span>
              )}
            </div>
          </div>

          {/* MITRE ATT&CK Matrix component */}
          <div className="md:col-span-2">
            <MitreMatrix 
              activeTactic={selectedIncident?.mitre_tactic}
              activeTechnique={selectedIncident?.mitre_technique}
            />
          </div>

          {/* Security Copilot 2.0 chat panel */}
          <div className="bg-slate-950 border border-cyber-border rounded-lg p-5 md:col-span-2 flex flex-col space-y-4 h-[420px]">
            <div className="flex justify-between items-center border-b border-cyber-border/40 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="text-sky-500 w-5 h-5" />
                <h3 className="text-xs font-semibold text-white tracking-wider uppercase">Security Copilot 2.0 Chat</h3>
              </div>
              <span className="text-[9px] text-sky-400 code-font">Model Interpretability Active</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 bg-slate-900/30 border border-cyber-border p-4 rounded pr-2">
              {copilotHistory.map((item, idx) => (
                <div key={idx} className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded text-xs leading-relaxed max-w-[85%] ${item.sender === "user" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "bg-slate-900 text-gray-300 border border-cyber-border"}`}>
                    <span className="whitespace-pre-line">{item.text}</span>
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 italic pl-1 animate-pulse">
                  <span>Querying prediction vectors and SHAP attributions...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex space-x-2 text-[10px] overflow-x-auto pb-1">
                <button 
                  onClick={() => handleAskCopilot("Why was this attack classified as critical?")}
                  className="border border-cyber-border hover:border-sky-500/60 rounded px-2.5 py-1 bg-slate-900 text-gray-300 whitespace-nowrap"
                >
                  Why was this classified?
                </button>
                <button 
                  onClick={() => handleAskCopilot("Show top risk factors.")}
                  className="border border-cyber-border hover:border-sky-500/60 rounded px-2.5 py-1 bg-slate-900 text-gray-300 whitespace-nowrap"
                >
                  Show risk factors
                </button>
                <button 
                  onClick={() => handleAskCopilot("What is the recommended action plan?")}
                  className="border border-cyber-border hover:border-sky-500/60 rounded px-2.5 py-1 bg-slate-900 text-gray-300 whitespace-nowrap"
                >
                  Get mitigation plan
                </button>
              </div>

              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Ask copilot about the selected threat cluster..."
                  className="flex-grow bg-slate-900 border border-cyber-border rounded px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAskCopilot(); }}
                />
                <button 
                  onClick={() => handleAskCopilot()}
                  className="bg-sky-600 hover:bg-sky-500 text-white rounded px-4 py-2 text-xs font-semibold flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
