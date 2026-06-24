# backend/incident_clusterer.py
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from backend.mitre_mapper import MitreMapper

class IncidentClusterer:
    """
    Groups raw network alerts into incident clusters to reduce alert fatigue.
    Correlates events using temporal proximity (sliding windows), host IP subnets,
    and attack similarity.
    """

    def __init__(self, temporal_window_seconds: int = 15):
        self.temporal_window = timedelta(seconds=temporal_window_seconds)
        self.active_incidents: List[Dict[str, Any]] = []

    def cluster_alerts(self, alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes a list of raw alerts sorted by timestamp and groups them into incidents.
        Returns the list of generated incidents.
        """
        self.active_incidents = []
        
        for alert in alerts:
            self.add_alert_to_clusters(alert)
            
        return self.active_incidents

    def generate_incident_title(self, attack_class: str, asset_type: str, alert_count: int) -> str:
        """
        Generates a professional enterprise-grade incident title.
        """
        if attack_class == "DoS":
            return f"Service Denial Attempt targeting {asset_type} Subnet"
        elif attack_class == "Exploits":
            return f"Exploit Activity & Fraud Prep detected on {asset_type}"
        elif attack_class == "Backdoor":
            return f"Active Backdoor & Persistence Alert on {asset_type}"
        elif attack_class == "Worms":
            return f"Lateral Infection Risk / Active Worm on {asset_type} LAN"
        elif attack_class == "Reconnaissance" or attack_class == "Analysis" or attack_class == "Fuzzers":
            return f"Reconnaissance Profile Scanning against {asset_type}"
        else:
            return f"Suspicious {attack_class} anomalies detected on {asset_type}"

    def add_alert_to_clusters(self, alert: Dict[str, Any]) -> None:
        """
        Evaluates whether an alert belongs to an existing active incident cluster,
        or if a new incident cluster should be spawned.
        """
        alert_time = alert.get("timestamp")
        if isinstance(alert_time, str):
            # Parse ISO timestamp
            alert_time = datetime.fromisoformat(alert_time.replace("Z", "+00:00"))
            
        src_ip = alert["source_ip"]
        dest_ip = alert["dest_ip"]
        attack_class = alert["attack_class"]
        asset_info = alert.get("asset_context", {})
        asset_type = asset_info.get("type", "Unknown Asset")
        
        # Check for correlation against existing incidents
        matched_incident = None
        for incident in self.active_incidents:
            # Criteria 1: Temporal overlap (alert timestamp within window of incident start/update)
            inc_updated = incident["updated_at"]
            if abs((alert_time - inc_updated).total_seconds()) > self.temporal_window.total_seconds():
                continue
                
            # Criteria 2: Common entity (shared source IP, or shared destination IP, or same asset type & attack class)
            same_source = incident["source_ips"].intersection({src_ip})
            same_dest = incident["dest_ips"].intersection({dest_ip})
            same_logical = (incident["asset_type"] == asset_type and incident["primary_attack_class"] == attack_class)
            
            if same_source or same_dest or same_logical:
                matched_incident = incident
                break
                
        if matched_incident:
            # Append alert
            matched_incident["alerts"].append(alert)
            matched_incident["updated_at"] = alert_time
            matched_incident["source_ips"].add(src_ip)
            matched_incident["dest_ips"].add(dest_ip)
            
            # Recalculate incident metrics
            alert_risks = [a["risk_score"] for a in matched_incident["alerts"]]
            matched_incident["overall_risk_score"] = round(max(alert_risks), 2)
            
            # Update title with correct count
            count = len(matched_incident["alerts"])
            matched_incident["title"] = self.generate_incident_title(
                matched_incident["primary_attack_class"], 
                matched_incident["asset_type"], 
                count
            )
        else:
            # Create new incident cluster
            incident_id = str(uuid.uuid4())
            mitre_info = MitreMapper.get_mitre_mapping(attack_class)
            
            new_incident = {
                "id": incident_id,
                "title": self.generate_incident_title(attack_class, asset_type, 1),
                "status": "New",
                "overall_risk_score": alert["risk_score"],
                "primary_attack_class": attack_class,
                "asset_type": asset_type,
                "mitre_tactic": mitre_info["tactic"],
                "mitre_technique": f"{mitre_info['technique_id']} ({mitre_info['technique']})",
                "source_ips": {src_ip},
                "dest_ips": {dest_ip},
                "alerts": [alert],
                "created_at": alert_time,
                "updated_at": alert_time,
                "summary": f"Clustered indicators representing {attack_class} mapping to MITRE {mitre_info['tactic']} targeting banking asset {asset_type}."
            }
            
            self.active_incidents.append(new_incident)

    def get_clustered_incidents_for_api(self) -> List[Dict[str, Any]]:
        """
        Formats set collections to list collections so it can be serialized to JSON.
        """
        api_ready = []
        for inc in self.active_incidents:
            copy_inc = inc.copy()
            copy_inc["source_ips"] = list(inc["source_ips"])
            copy_inc["dest_ips"] = list(inc["dest_ips"])
            
            # Format datetime objects to iso strings
            copy_inc["created_at"] = inc["created_at"].isoformat()
            copy_inc["updated_at"] = inc["updated_at"].isoformat()
            
            # Format alerts list timestamps
            formatted_alerts = []
            for alert in copy_inc["alerts"]:
                fa = alert.copy()
                if isinstance(fa.get("timestamp"), datetime):
                    fa["timestamp"] = fa["timestamp"].isoformat()
                formatted_alerts.append(fa)
            copy_inc["alerts"] = formatted_alerts
            
            api_ready.append(copy_inc)
            
        # Sort by overall risk score descending
        return sorted(api_ready, key=lambda x: x["overall_risk_score"], reverse=True)
