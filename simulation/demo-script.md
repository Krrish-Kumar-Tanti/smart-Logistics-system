# 5-Minute Executive Demo Runbook — VeloCity AI

Live pitch walk-through for the **L'Oréal Sustainability Challenge (L'Oréal SUS) 2026** executive jury.

---

## Pitch Narrative Arc (5 Minutes)

```
[00:00 - 01:00]  Minute 1: The Blind Spot (The ₹ Leakage & Today's Beat)
[01:00 - 02:15]  Minute 2: The 3-Second Shelf Scan (Edge-CV + OCR in action)
[02:15 - 03:30]  Minute 3: On-Ground Action Cards (Lateral StockSwap vs Dump)
[03:30 - 04:15]  Minute 4: ASM Real-Time Cockpit & Audit Trail
[04:15 - 05:00]  Minute 5: Unit Economics & Net Freshness Index (NFI)
```

---

## Detailed Runbook

### Minute 1: The Problem & Morning Beat (P01 / P02)
* **Screen:** Field Sales Officer (FSO) opens **P02 — My Beat Today**.
* **Talking Points:**
  - Standard SFA apps only ask: *"What can I sell to this shop today?"* They never check what is rotting on the bottom shelf.
  - VeloCity reverses the workflow: before taking a new order, the app prioritizes visits by **shelf risk score**.
  - Show the route: 6 scheduled outlets in Bandra & Khar. Store #1 (Enrich Salon) has a high freshness rating (96/100). Store #2 (Beauty Centre Khar) is flagged Amber. Store #3 (National Chemist) is heavily Red.

### Minute 2: The 3-Second Shelf Scan (P04 / P05)
* **Screen:** FSO walks into Store #2 (Beauty Centre Khar), taps **Start Scan (P04)**.
* **Demonstration:**
  - Sweep camera across the back shelf.
  - On-device ML Kit OCR reads batch number `B26-GT-001-102` and expiry date `12/26`.
  - Edge-CV evaluates surface dust and low shelf-turnover.
  - Within 800ms, the screen populates the **Tri-Band Risk Screen (P05)**:
    - 🟢 *Serie Expert Absolut Repair Shampoo*: Healthy 18-day DOI → Green.
    - 🟡 *Matrix Opti.Care Straight Shampoo*: 65 days of stock → Amber warning.
    - 🔴 *Serie Expert Vitamino Color Mask (16 units)*: Untouched for 68 days, expiring in 48 days → Critical Red.

### Minute 3: The Lateral StockSwap Rescue (P06)
* **Screen:** Tap the Red SKU to trigger **Action Card: Lateral StockSwap (P06)**.
* **Demonstration:**
  - Instead of booking a costly reverse logistics return (which incurs freight + repackaging + write-off loss), VeloCity queries nearby outlets.
  - Haversine engine matches **Enrich Salon Bandra West** (0.46 km away), which sells this exact mask at **14.2x** the speed.
  - FSO confirms transfer of 12 units at dealer price with 1-tap OTP verification.
  - Stock is relocated horizontally across outlets rather than routed back to Bhiwandi depot to expire.

### Minute 4: ASM Territory Cockpit & Immutable Ledger (W02 / W04)
* **Screen:** Switch view to Area Sales Manager web cockpit (**W02 Territory Overview**).
* **Demonstration:**
  - The swap appears instantly on the ASM's live territory board.
  - Show the append-only ledger entry: zero manual overrides, tamper-evident GPS timestamp.
  - Immediate stock balance update via database triggers.

### Minute 5: Wrap-up & Financial Impact (W05 / Pitch Deck Slide 3)
* **Screen:** FSO **Green Sales Leaderboard (P11)**.
* **Closing Numbers:**
  - FSO earns a ₹350 bounty for saving 12 units of Vitamino Mask from expiration.
  - NFI score climbs from 82.4 to 88.6.
  - Bottom-line return for L'Oréal: avoids 1.5% inventory write-down + 1.0% reverse freight and handling costs = **2.5% margin recovered**.
