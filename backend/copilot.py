# backend/copilot.py
from typing import Dict, Any, List
import json

class SecurityCopilot:
    """
    Security Copilot 2.0 AI Reasoning Engine.
    Combines Random Forest classifications, local SHAP feature attributions,
    Advanced Risk Engine scoring, Business Impact values, and MITRE ATT&CK vectors
    to answer security operator queries with explainable, high-fidelity security briefs.
    """

    @classmethod
    def generate_explanation(cls, incident: Dict[str, Any], question: str) -> Dict[str, Any]:
        """
        Parses an operator's question and compiles a detailed markdown explanation using 
        the ML pipeline outputs and asset context.
        """
        q = question.lower().strip()
        
        # Primary alert indicators
        alerts = incident.get("alerts", [])
        if not alerts:
            return {
                "answer": "No alerts found in this incident to evaluate.",
                "mitre_details": {},
                "shap_analysis": "No data",
                "action_plan": []
            }
            
        primary_alert = alerts[0]
        attack_class = primary_alert.get("attack_class", "Generic")
        risk_score = incident.get("overall_risk_score", 0.0)
        mitre_tactic = incident.get("mitre_tactic", "Execution")
        mitre_technique = incident.get("mitre_technique", "Unknown Technique")
        
        # Asset details
        asset_ctx = primary_alert.get("asset_context", {})
        asset_name = asset_ctx.get("name", "Unknown Asset")
        asset_type = asset_ctx.get("type", "Unknown Subnet")
        criticality = asset_ctx.get("criticality", 5)
        
        # Business impact
        impact_trans = primary_alert.get("business_impact_translation", {})
        impact_title = impact_trans.get("impact_title", "Operational Interruption")
        financial_exposure = impact_trans.get("financial_exposure", 50000.0)
        action_desc = impact_trans.get("action", "Perform standard host isolation.")
        
        # SHAP details
        shap_exp = primary_alert.get("shap_explanation", {})
        
        # Sort SHAP contributions
        sorted_shap = sorted(
            shap_exp.items(), 
            key=lambda x: abs(x[1]), 
            reverse=True
        )
        top_features = [f"{k} (value: {v})" for k, v in sorted_shap[:3]]
        top_feature_names = [k for k, _ in sorted_shap[:3]]

        # Construct specific responses based on the intent
        if "why" in q or "classify" in q or "cause" in q or "anomaly" in q:
            # Classification explanation (Why was this classified as X?)
            answer = (
                f"### Analysis of Classification: **{attack_class}**\n\n"
                f"The machine learning model classified this traffic session on **{asset_name}** as an active **{attack_class}** "
                f"with an overall risk rating of **{risk_score}/100** ({incident.get('status', 'New')} Status).\n\n"
                f"#### Core ML Triggers (SHAP Feature Attribution):\n"
                f"Local explainability calculations indicate that the classifier's decision was heavily driven by the following features:\n"
                f"1. **`{sorted_shap[0][0]}`** with an attribution weight of **+{sorted_shap[0][1]}**. This represents a significant deviation in state transition time.\n"
                f"2. **`{sorted_shap[1][0]}`** with an attribution weight of **+{sorted_shap[1][1]}**.\n"
                f"3. **`{sorted_shap[2][0]}`** with an attribution weight of **+{sorted_shap[2][1]}**.\n\n"
                f"#### Threat Interpretation:\n"
                f"Because the feature `{top_feature_names[0]}` is highly elevated, this suggests the session exhibited network characteristics typical of "
                f"{attack_class} patterns (e.g. rapid session state changes). Specifically, this maps to the MITRE ATT&CK tactic **{mitre_tactic}** "
                f"via technique **{mitre_technique}**, presenting an immediate danger of **{impact_title}**."
            )
            
        elif "risk" in q or "score" in q or "factor" in q:
            # Risk explanation (Show top risk factors / explain risk score)
            risk_comp = primary_alert.get("risk_components", {})
            conf_c = risk_comp.get("confidence", 75.0)
            imp_c = risk_comp.get("business_impact", 50.0)
            sev_c = risk_comp.get("threat_severity", 50.0)
            anom_c = risk_comp.get("anomaly_score", 50.0)
            
            answer = (
                f"### Risk Score Diagnostic: **{risk_score}/100**\n\n"
                f"The Advanced Risk Engine calculated the risk value based on a weighted four-factor analysis:\n\n"
                f"| Risk Component | Value | Weight | Contribution to Score |\n"
                f"| :--- | :--- | :--- | :--- |\n"
                f"| **Operational Asset Impact** | {imp_c} | 35% | {round(imp_c * 0.35, 1)} |\n"
                f"| **Classifier Confidence** | {conf_c} | 25% | {round(conf_c * 0.25, 1)} |\n"
                f"| **Static Threat Severity** | {sev_c} | 20% | {round(sev_c * 0.20, 1)} |\n"
                f"| **Isolation Forest Anomaly Score** | {anom_c} | 20% | {round(anom_c * 0.20, 1)} |\n\n"
                f"#### Primary Risk Accelerators:\n"
                f"- **Asset Value**: Targeting **{asset_name}** ({asset_type}) with critical business impact score of **{imp_c}/100**.\n"
                f"- **Anomaly Novelty**: Isolation Forest anomaly score is **{anom_c}/100**, signaling a highly out-of-distribution flow compared to normal transaction baselines.\n"
                f"- **Financial Exposure**: If successful, this attack incurs an estimated operational exposure of **${financial_exposure:,.2f}**."
            )
            
        elif "mitigate" in q or "action" in q or "remedy" in q or "plan" in q:
            # Mitigation explanation
            answer = (
                f"### Threat Mitigation Playbook for **{attack_class}**\n\n"
                f"To contain this threat and preserve financial operations, execute the following containment checklist:\n\n"
                f"- [ ] **Network Isolation**: Immediately apply firewall blocks to source IP `Host: {primary_alert.get('source_ip')}`.\n"
                f"- [ ] **VLAN Quarantine**: Quarantine target asset `Host: {primary_alert.get('dest_ip')} ({asset_name})`.\n"
                f"- [ ] **Session Termination**: Invalidate active application and API keys corresponding to this asset.\n"
                f"- [ ] **Static Rule Upgrades**: Inject a Snort/Yara rule to flag flows matching `{top_feature_names[0]} > {round(shap_exp.get(top_feature_names[0], 0), 2)}`.\n\n"
                f"#### Business Mitigation Protocol:\n"
                f"**{action_desc}**"
            )
            
        else:
            # General summary
            answer = (
                f"### Incident Executive Summary\n\n"
                f"Incident **{incident['id'][:8]}** represents a clustered threat series of **{len(alerts)} alerts** involving **{attack_class}** "
                f"targeting the bank's **{asset_type}** assets. The overall risk score is **{risk_score}/100**.\n\n"
                f"- **First Detection**: {incident['created_at']}\n"
                f"- **Latest Activity**: {incident['updated_at']}\n"
                f"- **Attacker Host**: `{primary_alert.get('source_ip')}`\n"
                f"- **Target Host**: `{primary_alert.get('dest_ip')} ({asset_name})`\n"
                f"- **MITRE Classification**: {mitre_tactic} ({mitre_technique})\n"
                f"- **SHAP Driving Factor**: `{top_feature_names[0]}` (weight: {shap_exp.get(top_feature_names[0])})\n\n"
                f"To inspect further, ask specific questions about 'risk', 'classification triggers', or 'mitigation'."
            )
            
        return {
            "answer": answer,
            "mitre_details": {
                "tactic": mitre_tactic,
                "technique": mitre_technique
            },
            "shap_analysis": f"Top feature contributors: {', '.join(top_features)}",
            "action_plan": [
                f"Isolate source host {primary_alert.get('source_ip')}",
                f"Flag network flows with high {top_feature_names[0]} values",
                f"Mitigation protocol: {action_desc}"
            ]
        }
