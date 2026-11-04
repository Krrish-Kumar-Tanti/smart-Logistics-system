# 🌐 @velocity/api — VeloCity AI REST API Gateway

High-performance, lightweight REST API service powering the VeloCity AI reverse logistics and field sales triage ecosystem for **L'Oréal Sustainability Challenge (L'Oréal SUS) 2026**.

---

## ⚡ Features

- **Edge-CV Shelf Scan Ingestion (`POST /api/scan/shelf`)**: Simulates 3-second camera frame capture, evaluates barcode, batch code, expiry countdown, shelf dust, and packaging dent telemetry to produce instant action cards.
- **Tri-Band Risk Engine Integration (`POST /api/inventory/evaluate`)**: Evaluates batches in real time (Days to Expiry, Stagnation Days, Days of Inventory) and computes store freshness scores.
- **Hyperlocal Lateral StockSwap Matchmaker (`POST /api/swaps/match`)**: Uses the Haversine distance formula and velocity differential scoring to pair slow-moving GT outlets with fast-velocity salons within a 5–10 km radius.
- **FSO Net Freshness Index Leaderboard (`GET /api/leaderboard`)**: Real-time sales representative leaderboard rewarding proactive stock rescues and zero-landfill execution.
- **Zero Heavy Runtime Dependencies**: Built with native Node.js HTTP primitives and TypeScript execution (`--experimental-strip-types`).

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm start
# Server starts on port 4000 (configurable via process.env.PORT)
```

### 2. Run Test Suite
```bash
npm test
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status, active territory, and risk engine version |
| `GET` | `/api/catalog` | Active L'Oréal Professional & Consumer SKUs |
| `GET` | `/api/outlets` | List of mapped outlets (Salons, GT, MT) |
| `GET` | `/api/outlets/:code` | Store inventory, risk band breakdown, and freshness score |
| `POST` | `/api/scan/shelf` | Edge-CV camera scan triage & action card generator |
| `POST` | `/api/inventory/evaluate` | Batch inventory evaluation and store freshness scoring |
| `POST` | `/api/swaps/match` | Hyperlocal lateral StockSwap recipient matchmaker |
| `GET` | `/api/leaderboard` | FSO Net Freshness Index (NFI) rankings and bounties |
