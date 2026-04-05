<div align="center">

# 🌐 NetPulse AI
### *Intelligent 5G Network Optimization with AI*

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-FF6B35?style=for-the-badge&logo=ai&logoColor=white)](https://groq.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-FF6B6B?style=for-the-badge&logo=socket.io&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

### **Watch AI outperform traditional network allocation in real-time**

*A full-stack simulation platform demonstrating how AI optimizes 5G network resources better than conventional methods*

[🚀 Live Demo](https://netpulseai.vercel.app) • [📖 API Docs](https://netpulseai.onrender.com/docs) • [🎯 Features](#features) • [🏗️ Architecture](#architecture)

</div>

## 🎯 What is NetPulse AI?

NetPulse AI is a **real-time 5G network bandwidth allocation simulator** that compares three allocation strategies side-by-side:

<table>
<tr>
<td width="33%" align="center">
<img src="https://img.shields.io/badge/Baseline-Equal_Split-3B82F6?style=for-the-badge" alt="Baseline">
<br><br>
<b>Traditional Approach</b>
<br>
Simple equal distribution
<br>
25 Mbps per user type
</td>
<td width="33%" align="center">
<img src="https://img.shields.io/badge/AI-Weighted_Priority-8B5CF6?style=for-the-badge" alt="AI">
<br><br>
<b>Smart Allocation</b>
<br>
Priority-based distribution
<br>
Optimized for QoS
</td>
<td width="33%" align="center">
<img src="https://img.shields.io/badge/RL-Multi--Armed_Bandit-22C55E?style=for-the-badge" alt="RL">
<br><br>
<b>Machine Learning</b>
<br>
Learns optimal strategy
<br>
Adapts over time
</td>
</tr>
</table>

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎮 **Real-time Simulation**
- **100ms tick rate** for responsive updates
- **WebSocket streaming** with < 50ms latency
- **Fair comparison** - same demands for all strategies
- **Reproducible results** with random seed control

### 📊 **Interactive Visualization**
- **Live charts** showing allocation trends
- **Side-by-side comparison** panels
- **Statistics table** with rolling averages
- **QoS breakdown** by user type

</td>
<td width="50%">

### 🤖 **AI Integration**
- **Groq API** powered by Llama 3
- **Weighted priority** allocation algorithm
- **Reinforcement learning** with exploration
- **Strategic recommendations** every 50 ticks

### 🔧 **Developer Friendly**
- **REST API** with Swagger UI documentation
- **Type-safe** TypeScript frontend
- **Property-based testing** with Hypothesis
- **Docker support** for easy deployment

</td>
</tr>
</table>

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NetPulse AI                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │   Frontend (Next.js) │◄───────►│  Backend (FastAPI)  │        │
│  │                      │         │                      │        │
│  │  • Dashboard         │  HTTP   │  • Simulation Engine │        │
│  │  • Real-time Charts  │  WS     │  • 3 Allocators      │        │
│  │  • Configuration     │         │  • Metrics Collector │        │
│  │  • Statistics        │         │  • Groq Integration  │        │
│  └─────────────────────┘         └─────────────────────┘        │
│           ▲                                  │                    │
│           │                                  ▼                    │
│           │                       ┌─────────────────────┐        │
│           │                       │   Database Layer    │        │
│           │                       │                     │        │
│           │                       │  • SQLite (Local)   │        │
│           └───────────────────────│  • Supabase (Cloud) │        │
│                                   └─────────────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Key Metrics

The system evaluates network performance using a **weighted QoS formula**:

```
QoS Score = (Throughput × 25%) + (Latency × 25%) + (Packet Retention × 15%) + (Allocation Efficiency × 35%)
```

<div align="center">

| Metric | Weight | Description | Better |
|--------|--------|-------------|--------|
| **Throughput** | 25% | Actual data transfer rate (Mbps) | Higher ↑ |
| **Latency** | 25% | Network delay (ms) | Lower ↓ |
| **Packet Retention** | 15% | Successfully delivered packets (%) | Higher ↑ |
| **Allocation Efficiency** | 35% | Smart bandwidth usage | Higher ↑ |

</div>

> **Note:** Allocation Efficiency has the highest weight (35%) as it directly measures how intelligently bandwidth is distributed - the core advantage of AI over traditional methods.


## 🎯 User Types

The simulation models **4 distinct user types** with different network requirements:

<table>
<tr>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🎥-Video_Streaming-06B6D4?style=for-the-badge" alt="Video">
<br><br>
<b>5-25 Mbps</b>
<br>
Medium latency tolerance
<br>
<i>Netflix, YouTube</i>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🎮-Online_Gaming-10B981?style=for-the-badge" alt="Gaming">
<br><br>
<b>1-5 Mbps</b>
<br>
Ultra-low latency critical
<br>
<i>PUBG, Call of Duty</i>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/📡-IoT_Devices-F59E0B?style=for-the-badge" alt="IoT">
<br><br>
<b>0.1-1 Mbps</b>
<br>
Latency tolerant
<br>
<i>Smart home, sensors</i>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/💬-VoIP_Messaging-8B5CF6?style=for-the-badge" alt="VoIP">
<br><br>
<b>0.5-2 Mbps</b>
<br>
Real-time communication
<br>
<i>WhatsApp, Zoom</i>
</td>
</tr>
</table>

## 📖 Documentation

<div align="center">

### 📚 **Detailed Documentation Available**

<table>
<tr>
<td align="center" width="50%">

### 🔧 Backend

[![Backend Docs](https://img.shields.io/badge/Backend-Documentation-3B82F6?style=for-the-badge&logo=python&logoColor=white)](./backend/README.md)

FastAPI • Simulation Engine • API Reference

[**→ Read Backend Docs**](./backend/README.md)

</td>
<td align="center" width="50%">

### 🎨 Frontend

[![Frontend Docs](https://img.shields.io/badge/Frontend-Documentation-8B5CF6?style=for-the-badge&logo=next.js&logoColor=white)](./frontend/README.md)

Next.js • Components • Deployment

[**→ Read Frontend Docs**](./frontend/README.md)

</td>
</tr>
</table>

---
</div> <center>

### 🌟 **Star this repo if you find it useful!** 🌟

</div>
