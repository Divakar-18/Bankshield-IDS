# backend/mitre_mapper.py
from typing import Dict, Any, Optional

class MitreMapper:
    """
    Maps UNSW-NB15 and general banking network threat classes to standard 
    MITRE ATT&CK tactics, techniques, and banking security objectives.
    """
    
    # Static MITRE ATT&CK mapping database
    MAPPINGS = {
        "Normal": {
            "tactic": "None",
            "technique": "None",
            "technique_id": "None",
            "security_objective": "Authorized Transactions & Activities"
        },
        "Generic": {
            "tactic": "Execution",
            "technique": "Command and Scripting Interpreter",
            "technique_id": "T1059",
            "security_objective": "Arbitrary Command Execution Prevention"
        },
        "Exploits": {
            "tactic": "Initial Access",
            "technique": "Exploit Public-Facing Application",
            "technique_id": "T1190",
            "security_objective": "System Integrity & Fraud Preparation Prevention"
        },
        "Fuzzers": {
            "tactic": "Reconnaissance",
            "technique": "Active Scanning",
            "technique_id": "T1595",
            "security_objective": "Vulnerability Profiling Detection"
        },
        "DoS": {
            "tactic": "Impact",
            "technique": "Network Denial of Service",
            "technique_id": "T1498",
            "security_objective": "ATM/Transactional Service Availability"
        },
        "Reconnaissance": {
            "tactic": "Discovery",
            "technique": "Network Service Discovery",
            "technique_id": "T1046",
            "security_objective": "Network Asset Map Protection"
        },
        "Analysis": {
            "tactic": "Reconnaissance",
            "technique": "Gather Victim Host Information",
            "technique_id": "T1592",
            "security_objective": "Host Configuration Secrecy"
        },
        "Backdoor": {
            "tactic": "Persistence",
            "technique": "Server Software Component / Backdoor",
            "technique_id": "T1505",
            "security_objective": "Persistent Unauthorized Remote Access Mitigation"
        },
        "Shellcode": {
            "tactic": "Defense Evasion",
            "technique": "Reflective Code Loading",
            "technique_id": "T1620",
            "security_objective": "Anti-Malware & Integrity Bypass Block"
        },
        "Worms": {
            "tactic": "Lateral Movement",
            "technique": "Exploitation of Remote Services",
            "technique_id": "T1210",
            "security_objective": "Intra-Branch Lateral Infection Containment"
        }
    }

    @classmethod
    def get_mitre_mapping(cls, attack_class: str) -> Dict[str, str]:
        """
        Returns the MITRE mapping dictionary for a given attack class.
        Defaults to Generic execution if not found.
        """
        # Normalize casing
        normalized = attack_class.strip().capitalize()
        if normalized == "Dos":
            normalized = "DoS"
            
        if normalized in cls.MAPPINGS:
            return cls.MAPPINGS[normalized]
            
        return {
            "tactic": "Execution",
            "technique": "Unidentified Exploitation Vector",
            "technique_id": "T1204",
            "security_objective": "General Network Integrity Maintenance"
        }
