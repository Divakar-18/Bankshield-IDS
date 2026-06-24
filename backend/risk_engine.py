# backend/risk_engine.py
from typing import Dict, Any, Tuple

class RiskEngine:
    """
    Advanced Risk Scoring Engine for BankShield AI.
    Calculates multi-dimensional risk scores using machine learning probabilities,
    unsupervised anomaly scores, static threat severity, and business impact mappings.
    """
    
    # Severity coefficients (CVSS-like static weights per attack class, 0-100)
    SEVERITY_MAP = {
        "Normal": 0.0,
        "Fuzzers": 35.0,
        "Analysis": 40.0,
        "Reconnaissance": 45.0,
        "Shellcode": 65.0,
        "Generic": 70.0,
        "DoS": 80.0,
        "Exploits": 90.0,
        "Backdoor": 95.0,
        "Worms": 100.0
    }

    # Weights for Risk Score elements
    # Risk = w_c * Confidence + w_i * BusinessImpact + w_s * Severity + w_a * Anomaly
    W_CONFIDENCE = 0.25
    W_IMPACT = 0.35
    W_SEVERITY = 0.20
    W_ANOMALY = 0.20

    @classmethod
    def get_asset_info(cls, dest_ip: str) -> Dict[str, Any]:
        """
        Simulates an Asset Inventory lookup to evaluate the business impact of a target asset.
        """
        # Define subnet/IP assets for a typical bank network
        if "10.0.100." in dest_ip: # SWIFT Subnet
            return {
                "name": "SWIFT Transaction Gateway",
                "type": "SWIFT Gateway",
                "impact": 100.0,
                "criticality": 10,
                "description": "Cross-border settlement and interbank messaging core."
            }
        elif "10.0.120." in dest_ip or dest_ip.endswith(".120") or dest_ip.endswith(".20"): # ATM Core Subnet
            return {
                "name": f"ATM Terminal Endpoint ({dest_ip})",
                "type": "ATM Network",
                "impact": 85.0,
                "criticality": 8,
                "description": "Automated teller machine terminal cash-dispensing network."
            }
        elif "10.0.130." in dest_ip: # POS Terminal Subnet
            return {
                "name": "POS Merchant Terminal Gateway",
                "type": "Point of Sale",
                "impact": 75.0,
                "criticality": 7,
                "description": "Retail merchant credit/debit card processing node."
            }
        elif "10.0.150." in dest_ip: # Branch Camera / IoT Surveillance Subnet
            return {
                "name": "Branch Surveillance CCTV Server",
                "type": "IoT CCTV System",
                "impact": 40.0,
                "criticality": 4,
                "description": "Physical security branch IP camera feed recording node."
            }
        elif "10.0.10." in dest_ip: # Internal Corporate Office / Active Directory
            return {
                "name": "Branch Domain Controller",
                "type": "Active Directory",
                "impact": 90.0,
                "criticality": 9,
                "description": "Branch user authentication and domain controller."
            }
        else: # Default branch client machine / general VLAN
            return {
                "name": f"Branch Workstation IP ({dest_ip})",
                "type": "Workstation",
                "impact": 50.0,
                "criticality": 5,
                "description": "General corporate operations client desktop."
            }

    @classmethod
    def get_business_impact_translation(cls, attack_class: str) -> Dict[str, Any]:
        """
        Translates raw network intrusion classifications into specific banking business impacts.
        """
        norm_class = attack_class.strip().capitalize()
        if norm_class == "Dos":
            norm_class = "DoS"

        if norm_class == "Normal":
            return {
                "impact_title": "Normal Operations",
                "financial_exposure": 0.0,
                "action": "No action required. Continuous monitoring."
            }
        elif norm_class == "DoS":
            return {
                "impact_title": "ATM Service Disruption / API Denial",
                "financial_exposure": 125000.0,
                "action": "Initiate DDoS scrubbing at the edge. Route-map traffic through failover gateway."
            }
        elif norm_class == "Exploits":
            return {
                "impact_title": "Account Hijacking / Fraud Preparation",
                "financial_exposure": 450000.0,
                "action": "Isolate the compromised application container immediately. Terminate active credentials."
            }
        elif norm_class == "Backdoor":
            return {
                "impact_title": "Unauthorized Persistence / AD Compromise Risk",
                "financial_exposure": 850000.0,
                "action": "Sever network gateway connection for host. Deploy forensic response team for host audit."
            }
        elif norm_class == "Worms":
            return {
                "impact_title": "Network-Wide Infection / ATM LAN Spread Risk",
                "financial_exposure": 1200000.0,
                "action": "VLAN quarantine enabled. Execute automated broadcast port blocking on branch routers."
            }
        elif norm_class == "Reconnaissance" or norm_class == "Analysis" or norm_class == "Fuzzers":
            return {
                "impact_title": "Reconnaissance & Penetration Profiling",
                "financial_exposure": 15000.0,
                "action": "Temporarily throttle connection rate. Flag source IP in threat intelligence feed."
            }
        else: # Shellcode, Generic, etc.
            return {
                "impact_title": "Arbitrary Binary Execution / Remote Exploitation",
                "financial_exposure": 320000.0,
                "action": "Suspend targeted virtual instance. Trigger memory dump analysis."
            }

    @classmethod
    def calculate_risk(
        cls, 
        attack_class: str, 
        rf_confidence: float, 
        anomaly_score: float, 
        dest_ip: str
    ) -> Dict[str, Any]:
        """
        Calculates the weighted risk score (0-100) and returns detailed risk metadata.
        
        Args:
            attack_class: Classification label (e.g. 'DoS', 'Normal')
            rf_confidence: Confidence percentage [0-100] from Random Forest
            anomaly_score: Anomaly percentage [0-100] from Isolation Forest (higher is more anomalous)
            dest_ip: Target destination IP address to determine asset value
        """
        severity = cls.SEVERITY_MAP.get(attack_class, 50.0)
        asset_info = cls.get_asset_info(dest_ip)
        business_impact = asset_info["impact"]
        
        # Weighted calculation
        raw_score = (
            cls.W_CONFIDENCE * rf_confidence +
            cls.W_IMPACT * business_impact +
            cls.W_SEVERITY * severity +
            cls.W_ANOMALY * anomaly_score
        )
        
        # Cap risk score between 0 and 100
        risk_score = max(0.0, min(100.0, raw_score))
        
        # Mapped risk category
        if risk_score <= 30.0:
            category = "Safe"
        elif risk_score <= 60.0:
            category = "Low"
        elif risk_score <= 80.0:
            category = "Medium"
        else:
            category = "Critical"
            
        business_translation = cls.get_business_impact_translation(attack_class)
        
        return {
            "risk_score": round(risk_score, 2),
            "category": category,
            "components": {
                "confidence": round(rf_confidence, 2),
                "business_impact": round(business_impact, 2),
                "threat_severity": round(severity, 2),
                "anomaly_score": round(anomaly_score, 2)
            },
            "asset_context": asset_info,
            "business_impact_translation": business_translation
        }
