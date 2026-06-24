# backend/generator.py
import numpy as np
import random
from datetime import datetime
from typing import Dict, Any, List

class TrafficGenerator:
    """
    Simulates real-world banking IoT network traffic logs.
    Models distinct branch network segments:
    - SWIFT gateway (High-criticality transaction server)
    - ATMs (Cash dispensing endpoints)
    - POS terminals (Retail merchant transactions)
    - CCTV IP cameras (Physical branch surveillance)
    """

    IP_SWIFT = "10.0.100.12"
    IP_ATM_GATEWAY = "10.0.120.1"
    IP_AD_CONTROLLER = "10.0.10.2"
    
    IP_ATMS = [f"10.0.120.{i}" for i in range(10, 45)]
    IP_POS_TERMINALS = [f"10.0.130.{i}" for i in range(100, 150)]
    IP_SURVEILLANCE = [f"10.0.150.{i}" for i in range(200, 220)]
    IP_WORKSTATIONS = [f"10.0.10.{i}" for i in range(50, 80)]
    
    IP_EXTERNAL_SUSPECTS = [
        "198.51.100.44", "203.0.113.88", "185.190.140.22",
        "45.227.254.12", "91.240.118.45", "103.24.140.9"
    ]

    ATTACK_CLASSES = ["Normal", "Generic", "Exploits", "Fuzzers", "DoS", "Reconnaissance", "Analysis", "Backdoor", "Shellcode", "Worms"]

    @classmethod
    def generate_flow(cls, force_class: str = None) -> Dict[str, Any]:
        """
        Generates a single network flow record with IP routing context and feature statistics.
        """
        # Determine threat class
        if force_class:
            attack_class = force_class
        else:
            # 85% normal, 15% suspicious/malicious
            if random.random() < 0.85:
                attack_class = "Normal"
            else:
                attack_class = random.choice(cls.ATTACK_CLASSES[1:])

        # Define protocol and ports
        proto = "TCP"
        src_port = random.randint(1024, 65535)
        dst_port = 80 # Default
        
        # Define IP routing based on attack type & subnet model
        if attack_class == "Normal":
            # Typical ATM to gateway / SWIFT traffic
            scenario = random.choice(["atm_txn", "pos_txn", "cctv_feed", "ws_web"])
            if scenario == "atm_txn":
                source_ip = random.choice(cls.IP_ATMS)
                dest_ip = cls.IP_ATM_GATEWAY
                dst_port = 443
            elif scenario == "pos_txn":
                source_ip = random.choice(cls.IP_POS_TERMINALS)
                dest_ip = cls.IP_SWIFT
                dst_port = 8443
            elif scenario == "cctv_feed":
                source_ip = random.choice(cls.IP_SURVEILLANCE)
                dest_ip = "10.0.150.5" # CCTV storage DVR
                dst_port = 554 # RTSP port
            else:
                source_ip = random.choice(cls.IP_WORKSTATIONS)
                dest_ip = "8.8.8.8"
                dst_port = 443
                
        elif attack_class == "DoS":
            # DDoS attacking ATM gateway or AD controller
            source_ip = random.choice(cls.IP_EXTERNAL_SUSPECTS)
            dest_ip = random.choice([cls.IP_ATM_GATEWAY, cls.IP_AD_CONTROLLER])
            dst_port = 80
            proto = "UDP" if random.random() < 0.5 else "TCP"
            
        elif attack_class == "Worms":
            # Lateral worm spread from workstation to ATM or POS
            source_ip = random.choice(cls.IP_WORKSTATIONS)
            dest_ip = random.choice(cls.IP_ATMS + cls.IP_POS_TERMINALS)
            dst_port = 445 # SMB port
            
        elif attack_class == "Backdoor":
            # Backdoor server connection on compromised IP CCTV camera calling home
            source_ip = random.choice(cls.IP_SURVEILLANCE)
            dest_ip = random.choice(cls.IP_EXTERNAL_SUSPECTS)
            dst_port = 8080
            
        elif attack_class == "Exploits":
            # Attempting exploit on SWIFT gateway or AD Domain controller
            source_ip = random.choice(cls.IP_EXTERNAL_SUSPECTS)
            dest_ip = random.choice([cls.IP_SWIFT, cls.IP_AD_CONTROLLER])
            dst_port = 443
            
        elif attack_class == "Reconnaissance" or attack_class == "Analysis" or attack_class == "Fuzzers":
            # Port scanning POS subnet or fuzzing ATM interfaces
            source_ip = random.choice(cls.IP_EXTERNAL_SUSPECTS + cls.IP_WORKSTATIONS)
            dest_ip = random.choice(cls.IP_POS_TERMINALS + cls.IP_ATMS)
            dst_port = random.choice([21, 22, 23, 80, 443, 8080])
            
        else: # Shellcode, Generic
            source_ip = random.choice(cls.IP_EXTERNAL_SUSPECTS)
            dest_ip = random.choice(cls.IP_WORKSTATIONS)
            dst_port = 139

        # Map base features (UNSW-NB15 metrics)
        features = {}
        if attack_class == "Normal":
            features = {
                "dur": random.uniform(0.01, 0.1),
                "spkts": random.randint(5, 15),
                "dpkts": random.randint(4, 12),
                "sbytes": random.randint(300, 1000),
                "dbytes": random.randint(400, 2000),
                "rate": random.uniform(50.0, 300.0),
                "sttl": random.choice([31, 62]),
                "dttl": random.choice([29, 31]),
                "sload": random.uniform(10000.0, 50000.0),
                "dload": random.uniform(20000.0, 80000.0),
                "ct_state_ttl": 0
            }
        elif attack_class == "DoS":
            features = {
                "dur": random.uniform(1.0, 3.0),
                "spkts": random.randint(100, 1000),
                "dpkts": random.randint(0, 5),
                "sbytes": random.randint(10000, 60000),
                "dbytes": random.randint(0, 200),
                "rate": random.uniform(5000.0, 25000.0),
                "sttl": 254,
                "dttl": random.choice([0, 252]),
                "sload": random.uniform(2000000.0, 8000000.0),
                "dload": random.uniform(0.0, 1000.0),
                "ct_state_ttl": random.choice([4, 6])
            }
        elif attack_class == "Exploits":
            features = {
                "dur": random.uniform(0.5, 2.0),
                "spkts": random.randint(10, 30),
                "dpkts": random.randint(8, 25),
                "sbytes": random.randint(1000, 4000),
                "dbytes": random.randint(2000, 10000),
                "rate": random.uniform(15.0, 60.0),
                "sttl": random.choice([62, 254]),
                "dttl": 252,
                "sload": random.uniform(15000.0, 40000.0),
                "dload": random.uniform(30000.0, 90000.0),
                "ct_state_ttl": 1
            }
        elif attack_class == "Worms":
            features = {
                "dur": random.uniform(2.0, 5.0),
                "spkts": random.randint(40, 100),
                "dpkts": random.randint(30, 80),
                "sbytes": random.randint(8000, 25000),
                "dbytes": random.randint(5000, 18000),
                "rate": random.uniform(10.0, 35.0),
                "sttl": 254,
                "dttl": 252,
                "sload": random.uniform(10000.0, 30000.0),
                "dload": random.uniform(8000.0, 25000.0),
                "ct_state_ttl": 6
            }
        elif attack_class == "Backdoor":
            features = {
                "dur": random.uniform(1.5, 4.0),
                "spkts": random.randint(15, 40),
                "dpkts": random.randint(10, 30),
                "sbytes": random.randint(1200, 3500),
                "dbytes": random.randint(1000, 4000),
                "rate": random.uniform(5.0, 20.0),
                "sttl": 62,
                "dttl": 252,
                "sload": random.uniform(5000.0, 15000.0),
                "dload": random.uniform(5000.0, 15000.0),
                "ct_state_ttl": 1
            }
        elif attack_class == "Fuzzers":
            features = {
                "dur": random.uniform(0.001, 0.02),
                "spkts": random.randint(2, 6),
                "dpkts": 0,
                "sbytes": random.randint(100, 400),
                "dbytes": 0,
                "rate": random.uniform(4000.0, 12000.0),
                "sttl": 254,
                "dttl": 0,
                "sload": random.uniform(200000.0, 600000.0),
                "dload": 0.0,
                "ct_state_ttl": 4
            }
        else: # Reconnaissance, Analysis, Shellcode, Generic
            features = {
                "dur": random.uniform(0.1, 0.8),
                "spkts": random.randint(4, 12),
                "dpkts": random.randint(3, 10),
                "sbytes": random.randint(400, 1500),
                "dbytes": random.randint(300, 1200),
                "rate": random.uniform(40.0, 150.0),
                "sttl": random.choice([62, 254]),
                "dttl": random.choice([62, 252]),
                "sload": random.uniform(10000.0, 40000.0),
                "dload": random.uniform(10000.0, 30000.0),
                "ct_state_ttl": 2
            }

        # Pack fully completed routing data
        flow_record = {
            "timestamp": datetime.now().isoformat(),
            "source_ip": source_ip,
            "dest_ip": dest_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": proto,
            "label": attack_class
        }
        flow_record.update(features)
        
        return flow_record
