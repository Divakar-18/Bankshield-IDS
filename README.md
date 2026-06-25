# 🏦 BankShield AI
### AI-Powered Intrusion Detection System for Banking IoT Networks

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge)
![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-FF4B4B?style=for-the-badge)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Random%20Forest-orange?style=for-the-badge)
![SHAP](https://img.shields.io/badge/Explainable%20AI-SHAP-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</p>

---

# 📌 Overview

**BankShield AI** is an AI-powered **Security Operations Center (SOC)** platform designed for **Banking IoT Networks**.

The system combines **Machine Learning**, **Zero-Day Detection**, **Explainable AI**, **Real-Time Network Monitoring**, and an **AI Security Copilot** to detect, analyze, explain, and prioritize cyber threats targeting banking infrastructure.

The project simulates an enterprise-grade Banking SOC inspired by modern security platforms such as **Microsoft Sentinel**, **IBM QRadar**, **Splunk Enterprise Security**, and **CrowdStrike Falcon**.

---

# 🚀 Key Features

- 🛡 Random Forest Intrusion Detection System
- 🚨 Isolation Forest Zero-Day Detection
- 🧠 Explainable AI using SHAP
- 🤖 AI Security Copilot
- 📡 Live Network Packet Monitoring (Scapy)
- ⚡ FastAPI Backend
- 📊 Interactive Streamlit SOC Dashboard
- 🎯 Threat Intelligence Analysis
- 🔍 Incident Clustering & Investigation
- 📈 Business Risk & Impact Analysis
- 🏦 Banking Asset Monitoring
- 📑 Dataset Intelligence
- 📉 Model Analytics
- ⚙️ Enterprise SOC Workflow

---

# 🖥 SOC Dashboard Modules

The dashboard consists of **11 enterprise workspaces**:

1. 🛡 SOC Command Center
2. 📡 Live Threat Monitoring
3. 🏦 Asset Monitoring
4. 🚨 Incident Response Center
5. 🤖 Security Copilot
6. 🧬 Zero-Day Detection
7. 🌐 Threat Intelligence
8. 📊 Risk & Impact Analysis
9. 🧠 Explainable AI Center
10. 📈 Model Analytics
11. 📑 Dataset Intelligence

---

# 🧠 Machine Learning Pipeline

```
Network Traffic
        │
        ▼
Packet Capture (Scapy)
        │
        ▼
Feature Extraction
        │
        ▼
Random Forest
(Known Attack Detection)
        │
        ▼
Isolation Forest
(Zero-Day Detection)
        │
        ▼
SHAP Explainability
        │
        ▼
FastAPI Backend
        │
        ▼
Streamlit SOC Dashboard
        │
        ▼
Security Copilot
```

---

# 📂 Datasets

- UNSW-NB15
- CICIDS2017

---

# 📊 Model Performance

| Metric | Value |
|---------|-------|
| Accuracy | **96.82%** |
| Class Balancing | SMOTE |
| Explainability | SHAP |
| Zero-Day Detection | Isolation Forest |
| Multi-Class Classification | Random Forest |

---

# 🛠 Technology Stack

### Programming Language
- Python

### Backend
- FastAPI

### Frontend
- Streamlit

### Machine Learning
- Scikit-learn
- Random Forest
- Isolation Forest
- SHAP

### Network Monitoring
- Scapy

### Data Analysis
- Pandas
- NumPy

### Visualization
- Plotly
- Matplotlib

---

# 📁 Project Structure

```
BankShield-IDS
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── ml_pipeline.py
│   ├── main.py
│
├── data/
│
├── docs/
│
├── screenshots/
│
├── dashboard.py
│
├── requirements.txt
│
├── README.md
│
└── LICENSE
```

---

# ▶️ Installation

Clone the repository

```bash
git clone https://github.com/Divakar-18/Bankshield-IDS.git
```

Move into the project

```bash
cd Bankshield-IDS
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# ▶️ Run Backend

```bash
python -m backend.main
```

---

# ▶️ Run Dashboard

```bash
python -m streamlit run dashboard.py
```

---

# 📸 Dashboard Preview

> Add screenshots inside the `screenshots/` folder and replace the image paths below.

### 🛡 SOC Command Center

![SOC Dashboard](screenshots/soc_dashboard.png)

---

### 📡 Live Threat Monitoring

![Threat Monitoring](screenshots/live_monitor.png)

---

### 🤖 Security Copilot

![Security Copilot](screenshots/security_copilot.png)

---

### 🧬 Zero-Day Detection

![Zero Day](screenshots/zero_day.png)

---

### 🧠 Explainable AI Center

![SHAP](screenshots/shap.png)

---

# 🌐 Live Demo

> **Coming Soon**

After deployment, add your link here.

Example:

```
https://bankshield-ai.streamlit.app
```

or

```
https://bankshield-ai.up.railway.app
```

---

# 🔮 Future Enhancements

- Threat Hunting Module
- SIEM Integration
- Real-Time Log Analytics
- Threat Intelligence Feeds
- Cloud Deployment
- Multi-Bank Monitoring
- Email & SMS Alerting
- Automated Incident Response
- LLM-powered SOC Assistant

---

# 👨‍💻 Author

## **Divakar I**

**B.Tech – Artificial Intelligence & Data Science**

Tagore Engineering College

🔗 **GitHub**
https://github.com/Divakar-18

🔗 **LinkedIn**
https://www.linkedin.com/in/divakar-ai/

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

---

# 📜 License

This project is licensed under the **MIT License**.
