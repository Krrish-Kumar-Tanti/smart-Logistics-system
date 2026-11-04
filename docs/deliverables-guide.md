# 📘 VeloCity AI — Detailed Deliverables Guide

**L'Oréal Sustainability Challenge (L'Oréal SUS) 2026**  
**Track:** Sales & Commercial Track  
**Case Statement:** *"Selling Smarter: Building a High-Impact Sales Engine with Reduced Waste"*

---

## 📑 Table of Contents

1. [Executive Problem Framing: The 2.5% Revenue Bleed](#1-executive-problem-framing-the-25-revenue-bleed)
2. [Key Deliverable A: Early Detection Architecture & Physical Cues](#2-key-deliverable-a-early-detection-architecture--physical-cues)
   - 2.1 Detection Checkpoints Across Channel Flow
   - 2.2 Physical On-Shelf Indicators
   - 2.3 3-Second Edge-CV Inference Pipeline
   - 2.4 Tri-Band Risk Classification Matrix
3. [Key Deliverable B: On-Ground Interventions & Hyperlocal Triage](#3-key-deliverable-b-on-ground-interventions--hyperlocal-triage)
   - 3.1 Differentiated Intervention Playbooks: Amber vs. Red
   - 3.2 Amber Playbook: Demand Stimulation & Planogram Reset
   - 3.3 Red Playbook: Hyperlocal Lateral StockSwap Architecture
   - 3.4 Salon Tester Conversion & Zero-Landfill Protocol
4. [Incentive Alignment: Net Freshness Index (NFI)](#4-incentive-alignment-net-freshness-index-nfi)
5. [EPR Regulatory Compliance & ESG Governance](#5-epr-regulatory-compliance--esg-governance)

---

## 1. Executive Problem Framing: The 2.5% Revenue Bleed

In traditional FMCG and beauty distribution across India, approximately **2.5% of gross revenue** is lost to unsellable inventory:
- **1.5% Direct Value Destruction:** Physical expiration, carton damage, heat damage, and unrecoverable write-offs.
- **1.0% Reverse Logistics Friction:** Multi-touch reverse freight, secondary warehouse handling, return authorization disputes, sorting, and disposal incineration.

Traditional enterprise supply chains operate on reactive, backward-flowing return loops: products linger unnoticed on general trade shelves until expiry is reached, at which point distributors initiate formal return claims. This creates inventory deadweight, burns distributor capital, and violates modern Extended Producer Responsibility (EPR) sustainability standards.

**VeloCity AI shifts the paradigm from passive reverse logistics to proactive lateral stock triage.**

---

## 2. Key Deliverable A: Early Detection Architecture & Physical Cues

### 2.1 Detection Checkpoints Across Channel Flow

Early detection occurs at three distinct operational touchpoints:

| Checkpoint | Frequency | Tool / Actor | Primary Signal Tracked |
|---|---|---|---|
| **Primary Distributor Inward** | Weekly | Batch Inward Scanner | FEFO compliance, remaining shelf life at distribution gate |
| **Field Sales Beat Audit** | Bi-weekly (14-day cycle) | VeloCity AI Mobile App (FSO) | Shelf visual degradation, batch OCR, shelf facing compliance |
| **Distributor POS Pull** | Daily | Automated DMS API Connector | Sell-through velocity deceleration, Days of Inventory (DOI) spike |

### 2.2 Physical On-Shelf Indicators

VeloCity AI trains field reps and edge-CV models to detect subtle physical cues that precede financial expiration by 60–90 days:

1. **Micro-Dust Accumulation (Dust Index > 0.6):**  
   Particulate settling on top caps, carton shoulders, and bottle shoulders indicates zero consumer handling or touch over a 30+ day period.
2. **Packaging Distress & Handling Scuffs:**  
   Minor corner abrasion, blister pack crinkling, or label edge peel from repeated shelf restocking without actual customer checkout.
3. **Planogram Drift & Secondary Demotion:**  
   Retailers organically push non-moving products to bottom shelves, rear rows, or shaded corners to free up eye-level real estate for high-velocity FMCG items.
4. **Batch Code & Expiry Decay Horizon:**  
   Products entering the $\le 90$-day Days to Expiry (DTE) cliff while remaining stock exceeds projected sell-through velocity ($DOI > 2 \times target$).

### 2.3 3-Second Edge-CV Inference Pipeline

Field Sales Officers (FSOs) often audit retail outlets in dense urban alleys or basements with minimal 4G/5G connectivity. VeloCity AI deploys a fully local, on-device computer vision pipeline:

- **Model Architecture:** YOLOv8n (nano), quantized to INT8 with Apple CoreML (iOS) and ONNX Runtime / NPU acceleration (Android).
- **Latency Budget:** Single camera frame inference executes in **$\le 180$ ms** on mid-range hardware.
- **Bounding Box Telemetry:**
  - `Box A: Barcode (EAN-13)` → Instant SKU identity and distributor pricing lookup.
  - `Box B: Batch Code & Expiry Stamp` → High-accuracy local OCR extracting manufacturing date and expiry date.
  - `Box C: Physical Degradation Classifier` → Surface dust score and package integrity verification.
- **Action Card Generation:** Entire shelf scan to verified triage recommendation takes under **3 seconds**.

### 2.4 Tri-Band Risk Classification Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRI-BAND RISK MATRIX                            │
├───────────┬──────────────────────────┬─────────────────┬───────────────┤
│ Band      │ Threshold Criteria       │ Root Cause      │ Default Action│
├───────────┼──────────────────────────┼─────────────────┼───────────────┤
│ 🟢 GREEN  │ DTE > 90d, Stagnation<30d│ High Velocity   │ Standard Order│
│ 🟡 AMBER  │ DTE > 90d, Stagnation>30d│ Slowing Velocity│ Bundle/Reposit│
│           │ OR DOI > 2x Target Buffer│                 │               │
│ 🔴 RED    │ DTE ≤ 90d                │ Expiry Cliff    │ Lateral Swap /│
│           │ OR Stagnation > 60d      │ Dead Stock      │ Tester Convert│
└───────────┴──────────────────────────┴─────────────────┴───────────────┘
```

---

## 3. Key Deliverable B: On-Ground Interventions & Hyperlocal Triage

### 3.1 Differentiated Intervention Playbooks: Amber vs. Red

Interventions must be differentiated based on the salvage window. An Amber product has healthy chemical integrity and requires commercial demand stimulation, whereas a Red product faces an impending expiry cliff and requires immediate physical relocation.

### 3.2 Amber Playbook: Demand Stimulation & Planogram Reset

When an SKU enters the **🟡 AMBER** band:
1. **Dynamic Pairing & Co-op Bundling:**  
   The VeloCity app automatically generates a promotional bundle recommendation pairing the slow-moving "pinch" SKU (e.g., Leave-In Styling Cream) with the store's highest-velocity "lead" SKU (e.g., Absolut Repair Shampoo).
2. **Margin-Neutral Co-op Subsidy:**  
   L'Oréal co-funds a 10–15% promotional allowance funded directly out of the trade budget, incentivizing the retailer to display the bundle at checkout.
3. **Planogram Repositioning (Eye-Level Golden Band):**  
   The FSO physically moves the SKU from bottom/back shelving to the eye-level (120–150 cm height) display rack, resetting the visual presentation.

### 3.3 Red Playbook: Hyperlocal Lateral StockSwap Architecture

When an SKU enters the **🔴 RED** band:
1. **Proximity-Constrained Matchmaking:**  
   Instead of shipping stock backward 200 km to a regional distribution center, the system searches within a **5–10 km hyperlocal radius** for high-absorption nodes.
2. **Channel Asymmetry Arbitrage (General Trade $\rightarrow$ Salons):**  
   A premium hair treatment SKU that sells 0.5 units/month in an unorganized corner pharmacy sells **18–25 units/month** in a high-traffic L'Oréal Professionnel partner salon.
3. **Execution Protocol:**
   - **Step 1:** Donor store scans stock; VeloCity AI identifies best recipient salon with high velocity multiplier ($> 2.5\times$).
   - **Step 2:** Field representative or 3PL hyperlocal courier initiates pickup and handoff with tamper-evident circular seal.
   - **Step 3:** Recipient signs via OTP/QR verification in the VeloCity mobile app.
   - **Step 4:** Distributor ERP ledger reconciles credit memo for donor and debit note for recipient automatically.

### 3.4 Salon Tester Conversion & Zero-Landfill Protocol

If no lateral retail recipient is available within the safe consumption window:
- Near-expiry premium SKUs are converted into **professional salon demonstration testers**.
- Converts a 100% P&L write-off into valuable trade marketing material that drives in-salon client trials.
- Completely eliminates packaging destruction and reverse freight carbon emissions.

---

## 4. Incentive Alignment: Net Freshness Index (NFI)

Traditional sales compensation rewards gross volume pushed into channel shelves, directly incentivizing overstocking and subsequent returns.

VeloCity AI introduces the **Net Freshness Index (NFI)** into monthly sales appraisals:

$$\text{NFI} = 100 \times \left(1 - \frac{\text{Post-Visit RED SKUs}}{\text{Total Monitored SKUs}}\right) + 4.0 \cdot S_{\text{swaps}} + 2.5 \cdot T_{\text{testers}} - 8.0 \cdot K_{\text{skipped}}$$

- **Base Freshness (0–100):** Reflects territory cleanliness and absence of expiring dead stock.
- **Rescue Bounties:** Immediate financial payout (₹200–₹500 per successful swap) credited to the sales representative.
- **Skip Penalty:** Discourages representatives from neglecting problematic, slow-moving outer rural stores.

---

## 5. EPR Regulatory Compliance & ESG Governance

Under India's Extended Producer Responsibility (EPR) regulations and plastic waste management guidelines, brand owners are legally accountable for post-consumer waste and expired packaging recovery.

VeloCity AI delivers an auditable digital chain of custody:
1. **Immutable Ledger Tracking:** Every batch transition (Inward $\rightarrow$ Audit $\rightarrow$ Swap $\rightarrow$ Tester $\rightarrow$ Recycled) is recorded with timestamp and GPS coordinates.
2. **Scope 3 Carbon Avoidance:** Eliminating long-haul reverse logistics reduces return freight fuel consumption by **65%**.
3. **Zero-Landfill Certification:** Auditable documentation proving that 90%+ of at-risk shelf inventory was redirected to active consumption or certified recycling rather than municipal landfills.
