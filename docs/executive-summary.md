# VeloCity AI — Executive Case Summary

**L'Oréal Sustainability Challenge (L'Oréal SUS) 2026**  
**Track:** Sales & Commercial Track  
**Problem Statement:** *"Selling Smarter: Building a High-Impact Sales Engine with Reduced Waste"*

---

## 1. Executive Summary & Value Proposition

In the beauty and personal care supply chain, traditional return models treat unsellable shelf inventory as an inevitable cost of doing business. Expired or stagnant products travel backward through reverse logistics to centralized distribution centers, only to be incinerated or sent to landfills.

**VeloCity AI** converts reverse logistics from a passive loss center into an autonomous, proactive stock triage network:
- **Zero-Landfill Protocol:** Stagnant and near-expiry inventory is identified at shelf-side using edge computer vision and routed laterally to high-velocity demand clusters before value decay occurs.
- **Tri-Band Automated Triage:** Inventory is continuously classified into Green, Amber, and Red risk bands, triggering automated field sales workflows (reorder, bundle, lateral swap, tester conversion).
- **Gamified Field Execution:** Replaces traditional volume-only quotas with the **Net Freshness Index (NFI)**, aligning field sales incentives with waste reduction and store health.

---

## 2. Key Metrics & Financial Impact

| Metric | Industry / Baseline | Target with VeloCity AI | Delta / Impact |
| :--- | :--- | :--- | :--- |
| **Return Rate** | ~1.5% of gross revenue | **0.4%** | **-73% reduction** in field returns |
| **Reverse Logistics Cost** | ~1.0% of gross revenue | **0.35%** | **-65% reduction** in return freight & handling |
| **Total Revenue Leakage** | ~2.5% P&L drag | **< 0.8%** | **+1.7% net margin recapture** |
| **Shelf Freshness Score** | 62 / 100 average | **94 / 100** | Faster shelf turns & fresher consumer stock |
| **Carbon Footprint (Freight)** | High (Depot reverse freight) | Low (Hyperlocal < 5km swaps) | Drastic reduction in long-haul deadhead miles |

---

## 3. Core Architectural Components

1. **Tri-Band Risk Engine (`services/risk-engine`)**:
   - Deterministic, verifiable rules evaluating Days to Expiry (DTE), Stagnation Days, and Days of Inventory (DOI).
   - Near-instant scoring of outlet freshness and field representative Net Freshness Index (NFI).
2. **Lateral StockSwap Matchmaker**:
   - Haversine proximity-weighted candidate ranking.
   - Pairs slow-moving General Trade (GT) outlets with fast-velocity professional salons within a 5–10 km radius.
3. **Tester Conversion Ledger**:
   - Near-expiry high-end SKUs are converted into salon demonstration testers instead of write-offs, preserving brand equity and eliminating destruction costs.
4. **Offline-First Field Audit**:
   - Edge-friendly workflow enabling Field Sales Officers (FSOs) to conduct instant audits in low-connectivity retail basements.

---

## 4. Verification & Testing

The system is validated by an automated test suite verifying:
- Tri-band risk classification and edge boundaries (DTE $\le$ 90d, stagnation $>$ 60d).
- Net Freshness Index scoring and incentive math.
- Geographical candidate filtering and velocity multipliers for stock rescue.
