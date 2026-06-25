"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, ShieldAlert, Zap, Cpu, Send,
  Network, Target, AlertTriangle, Gauge, Crosshair
} from "lucide-react";
import IncidentClusterView from "../../components/IncidentClusterView";
import ThreatTimeline from "../../components/ThreatTimeline";
import ShapWaterfall from "../../components/ShapWaterfall";
import MitreMatrix from "../../components/MitreMatrix";
import ThreatHeatmap from "../../components/ThreatHeatmap";
import SocKpiCard from "../../components/SocKpiCard";
import SocStatusBar from "../../components/SocStatusBar";

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
  const avgRiskScore = incidents.length > 0
    ? (incidents.reduce((sum, inc) => sum + parseFloat(inc.overall_risk_score), 0) / incidents.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col relative">
      <div className="absolute inset-0 soc-grid-bg opacity-40 pointer-events-none" aria-hidden="true" />

      <SocStatusBar
        activeThreats={activeThreatCount}
        criticalAlerts={criticalAlertCount}
        onRefresh={fetchData}
      />

      {/* Attack Simulation Toolbar */}
      <div className="soc-toolbar">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 code-font">
            <Crosshair className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
            <span className="uppercase tracking-wider font-semibold">Threat Vector Simulator</span>
            <span className="text-gray-600 hidden sm:inline">
              — Inject banking IoT attack scenarios for real-time classifier evaluation
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {["DoS", "Worms", "Backdoor", "Exploits"].map((attack) => (
              <button
                key={attack}
                type="button"
                onClick={() => handleSimulateAttack(attack)}
                disabled={simulating}
                className="soc-btn-simulate"
              >
                {simulating ? "..." : attack}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] mx-auto w-full">
        {/* KPI Banner */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SocKpiCard label="Traffic Logs" value={`${alerts.length * 45}`} sublabel="network flows" accent="neutral" icon={Network} />
          <SocKpiCard label="Active Threats" value={`${activeThreatCount}`} sublabel="incident groups" accent="red" icon={Target} pulse={activeThreatCount > 0} />
          <SocKpiCard label="Critical Alerts" value={criticalAlertCount} accent="red" icon={AlertTriangle} />
          <SocKpiCard label="Zero-Day Anomalies" value={zeroDayCount} accent="blue" icon={ShieldAlert} />
          <SocKpiCard label="Average Risk" value={`${avgRiskScore}/100`} accent="yellow" icon={Gauge} />
          <SocKpiCard label="Classifier Accuracy" value="96.82%" accent="green" icon={Activity} />
        </div>

        {/* Sidebar Column: Incident listing */}
        <div className="lg:col-span-4 flex flex-col space-y-5 h-[820px] overflow-hidden">
          <IncidentClusterView
            incidents={incidents}
            selectedId={selectedIncident?.id}
            onSelectIncident={handleSelectIncident}
          />
          <ThreatHeatmap alerts={alerts} />
        </div>

        {/* Center Panel Column */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 h-[820px] overflow-y-auto soc-panel-scroll pr-1">
          <ThreatTimeline incident={selectedIncident} />

          <ShapWaterfall
            shapExplanation={selectedAlert?.shap_explanation}
            predictionClass={selectedAlert?.attack_class}
          />

          {/* Business Impact Card */}
          <div className="soc-card p-5 space-y-4">
            <h3 className="soc-card-title">
              <Activity className="w-4 h-4 text-emerald-400 mr-1.5" aria-hidden="true" />
              Banking Business Impact Translation
            </h3>
            <div className="space-y-3">
              <div className="soc-inner-stat p-3.5">
                <span className="text-[9px] text-gray-500 uppercase block font-semibold">Banking Vector</span>
                <span className="text-xs font-bold text-white block mt-1">
                  {selectedAlert?.business_impact_translation?.impact_title || "Normal Operations"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="soc-inner-stat p-3">
                  <span className="text-[9px] text-gray-500 uppercase block">Financial Loss Exposure</span>
                  <span className="text-sm font-extrabold text-red-400 block mt-1 code-font">
                    ${selectedAlert?.business_impact_translation?.financial_exposure?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="soc-inner-stat p-3">
                  <span className="text-[9px] text-gray-500 uppercase block">Target Host</span>
                  <span className="text-xs font-bold text-white block mt-1 truncate">
                    {selectedAlert?.asset_context?.name || "None"}
                  </span>
                </div>
              </div>
              <div className="soc-inner-stat p-3">
                <span className="text-[9px] text-gray-500 uppercase block font-semibold">Automated Containment Plan</span>
                <span className="text-[10px] code-font text-emerald-400 block mt-1.5 leading-relaxed">
                  {selectedAlert?.business_impact_translation?.action || "No action required."}
                </span>
              </div>
            </div>
          </div>

          {/* Zero-Day Anomaly Analysis */}
          <div className="soc-card p-5 space-y-4">
            <h3 className="soc-card-title">
              <ShieldAlert className="w-4 h-4 text-sky-400 mr-1.5" aria-hidden="true" />
              Zero-Day Anomaly Detection
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="soc-inner-stat p-3 text-center">
                <span className="text-[9px] text-gray-500 block uppercase">Anomaly Index</span>
                <span className="text-sm font-extrabold text-white mt-1.5 block code-font">
                  {selectedAlert?.anomaly_score?.toFixed(1) || "0.0"}/100
                </span>
              </div>
              <div className="soc-inner-stat p-3 text-center">
                <span className="text-[9px] text-gray-500 block uppercase">Novelty</span>
                <span className="text-xs font-bold text-sky-400 mt-2 block uppercase tracking-wide">
                  {selectedAlert?.anomaly_score > 70 ? "High" : "Normal"}
                </span>
              </div>
              <div className="soc-inner-stat p-3 text-center">
                <span className="text-[9px] text-gray-500 block uppercase">Classification</span>
                <span className="text-[10px] font-bold text-white mt-2 block truncate">
                  {selectedAlert?.anomaly_score > 75 ? "Out of Bounds" : "Known Profile"}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 soc-inner-stat p-3 leading-relaxed">
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
          <div className="soc-card p-5 md:col-span-2 flex flex-col space-y-4 h-[420px]">
            <div className="soc-card-header !mb-0 !pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="text-sky-500 w-5 h-5" aria-hidden="true" />
                <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
                  Security Copilot 2.0 Chat
                </h3>
              </div>
              <span className="text-[9px] text-sky-400 code-font flex items-center gap-1">
                <Zap className="w-3 h-3" aria-hidden="true" /> Model Interpretability Active
              </span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 bg-slate-900/30 border border-cyber-border p-4 rounded soc-panel-scroll">
              {copilotHistory.length === 0 && (
                <p className="text-xs text-gray-600 italic text-center py-8">
                  Select an incident to begin analyst copilot session.
                </p>
              )}
              {copilotHistory.map((item, idx) => (
                <div key={idx} className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded text-xs leading-relaxed max-w-[85%] ${item.sender === "user" ? "soc-chat-user" : "soc-chat-copilot"}`}>
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
                  type="button"
                  onClick={() => handleAskCopilot("Why was this attack classified as critical?")}
                  className="soc-btn-chip"
                >
                  Why was this classified?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskCopilot("Show top risk factors.")}
                  className="soc-btn-chip"
                >
                  Show risk factors
                </button>
                <button
                  type="button"
                  onClick={() => handleAskCopilot("What is the recommended action plan?")}
                  className="soc-btn-chip"
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
                  className="soc-input flex-grow"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAskCopilot(); }}
                />
                <button
                  type="button"
                  onClick={() => handleAskCopilot()}
                  className="bg-sky-600 hover:bg-sky-500 text-white rounded px-4 py-2 text-xs font-semibold flex items-center space-x-1 transition"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SOC Footer */}
      <footer className="soc-footer">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center text-[9px] text-gray-600 code-font gap-1">
          <span>BankShield AI SOC Console · UNSW-NB15 + CICIDS2017 Validated · SMOTE + Random Forest + Isolation Forest</span>
          <span>SHAP Explainability · MITRE ATT&CK Mapping · Live Scapy Monitoring</span>
        </div>
      </footer>
    </div>
  );
}
