# backend/live_monitor.py
import threading
from datetime import datetime
from collections import deque
import logging

logger = logging.getLogger("LiveMonitor")

try:
    from scapy.all import sniff, IP, TCP, UDP, ICMP, conf
    HAS_SCAPY = True
except ImportError:
    HAS_SCAPY = False

class LiveMonitor:
    def __init__(self):
        self.packets = deque(maxlen=100)
        self.total_count = 0
        self.lock = threading.Lock()
        self.error_message = None
        self.thread = None
        self.iface_name = "Unknown"
        self.is_running = False
        
        if not HAS_SCAPY:
            self.error_message = "Scapy package is not installed. Please run: pip install scapy"
            return
            
        try:
            # Determine default interface name
            if conf.iface:
                self.iface_name = getattr(conf.iface, "name", "Network Interface")
                # Grabs the Windows user-friendly description if available
                desc = getattr(conf.iface, "description", None)
                if desc:
                    self.iface_name = desc
            else:
                self.iface_name = "Ethernet/Wi-Fi"
        except Exception as e:
            logger.warning(f"Could not determine default interface: {e}")
            self.iface_name = "Network Interface"

    def start(self):
        if self.error_message:
            logger.error(f"Cannot start LiveMonitor: {self.error_message}")
            return
            
        self.is_running = True
        self.thread = threading.Thread(target=self._sniff_loop, daemon=True)
        self.thread.start()
        logger.info(f"LiveMonitor background thread started sniffing on interface: {self.iface_name}")

    def _sniff_loop(self):
        try:
            def prn_callback(packet):
                if not self.is_running:
                    return
                # Extract packet metadata
                proto = "Other"
                src_ip = "Unknown"
                dst_ip = "Unknown"
                
                if IP in packet:
                    src_ip = packet[IP].src
                    dst_ip = packet[IP].dst
                    
                    if TCP in packet:
                        proto = "TCP"
                    elif UDP in packet:
                        proto = "UDP"
                    elif ICMP in packet:
                        proto = "ICMP"
                
                pkt_data = {
                    "timestamp": datetime.now().isoformat(),
                    "interface": self.iface_name,
                    "protocol": proto,
                    "source_ip": src_ip,
                    "dest_ip": dst_ip,
                    "length": len(packet)
                }
                
                with self.lock:
                    self.packets.append(pkt_data)
                    self.total_count += 1
            
            # Sniff in a non-blocking way using Scapy's native sniff
            sniff(prn=prn_callback, store=0)
        except Exception as e:
            self.error_message = f"Failed to initialize raw socket capture: {str(e)}. (On Windows, ensure you are running as Administrator and Npcap is installed)."
            self.is_running = False
            logger.error(f"Sniffer loop error: {self.error_message}")

    def get_packets(self):
        with self.lock:
            return list(self.packets)

    def get_stats(self):
        with self.lock:
            return {
                "total_count": self.total_count,
                "error_message": self.error_message,
                "interface": self.iface_name,
                "is_running": self.is_running
            }