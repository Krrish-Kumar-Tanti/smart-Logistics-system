<div align="center">

# 🚚 VeloCity AI — Smart Reverse-Logistics & Sales Intelligence System

**Selling Smarter: Building a High-Impact Sales Engine with Reduced Waste**

Entry for **L'Oréal Sustainability Challenge (L'Oréal SUS) 2026** — Executive Case Submission · Sales & Commercial Track

[![Track](https://img.shields.io/badge/Track-Sales%20%26%20Commercial-000000)]()
[![Approach](https://img.shields.io/badge/Approach-Tech--First%20Mobile%20App-C9A227)]()
[![Tests](https://img.shields.io/badge/Tests-21%20Passed-brightgreen)]()
[![Presentation](https://img.shields.io/badge/Executive%20Deck-5%20Slides%20(HTML%20%2B%20PDF)-purple)](presentation/)
[![Status](https://img.shields.io/badge/Status-Phase%201%20API%20%2B%20Risk%20Engine%20%2B%20Simulation-blue)]()

</div>

---

## 📑 Table of Contents

| § | Section |
|---|---------|
| [1](#1--the-problem-why-this-exists) | The Problem — Why This Exists |
| [2](#2--the-solution--velocity-ai-at-a-glance) | The Solution — VeloCity AI at a Glance |
| [3](#3--system-architecture--how-it-all-works) | System Architecture — How It All Works |
| [4](#4--technology-stack) | Technology Stack |
| [5](#5--pages--screens-complete-map) | Pages & Screens — Complete Map |
| [6](#6--app-pages-deep-dive--page-by-page) | App Pages Deep Dive — Page by Page |
| [7](#7--the-3-second-edge-cv-shelf-scan-pipeline) | The 3-Second Edge-CV Shelf Scan Pipeline |
| [8](#8--tri-band-risk-engine--the-brain) | Tri-Band Risk Engine — The Brain |
| [9](#9--data-model) | Data Model |
| [10](#10--roles--permissions) | Roles & Permissions |
| [11](#11--end-to-end-workflows) | End-to-End Workflows |
| [12](#12--kpis--success-metrics) | KPIs & Success Metrics |
| [13](#13--simulation--poc-strategy) | Simulation & PoC Strategy |
| [14](#14--open-source-references--what-we-learned-from-each) | Open-Source References — What We Learned From Each |
| [15](#15--repository-structure) | Repository Structure |
| [16](#16--roadmap--build-phases) | Roadmap — Build Phases |
| [17](#17--running-the-project) | Running the Project |
| [18](#18--project-governance) | Project Governance |

---

## 1 · The Problem — Why This Exists

> **Case statement:** *"Selling Smarter: Building a High-Impact Sales Engine with Reduced Waste"* — L'Oréal SUS 2026, Sales Track.

India's beauty & personal-care market runs on general trade, modern trade, e-commerce, quick commerce and salons. When products fail to move once they reach distributors/retailers, they age in-channel, get returned damaged, or expire outright:

| Leakage | % of top-line revenue |
|---|---|
| Returned / expired / damaged stock | **~1.5%** |
| Handling, reverse logistics, destruction | **~1.0%** |
| **Total revenue leakage** | **~2.5%** (+ carbon & plastic landfill waste) |

**Root cause:** traditional Sales Force Automation (SFA) apps are blind *order-booking* tools. The Field Sales Officer (FSO) pushes fresh inventory into retail **without ever detecting** the stagnant, dust-coated, near-expiry stock sitting on the back-shelf. Waste is discovered at returns-time — when it's already too late.

**The constraint we must respect:** solve it *without* simply cutting orders (that risks stock-outs and lost sales).

---

## 2 · The Solution — VeloCity AI at a Glance

VeloCity AI is an enterprise-grade **mobile workstation for the Field Sales Officer** (beat rep) with a downstream **analytics cockpit for Area Sales Managers (ASM)**. Instead of booking orders blindly, every store visit becomes a **detect → classify → act** loop:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE VELOCITY VISIT LOOP (per store)                     │
│                                                                             │
│   ① WALK IN ──► ② 3-SECOND SHELF SCAN ──► ③ TRI-BAND RISK READ ──►          │
│                                                                             │
│   ⑤ LOG VISIT & SYNC ◄── ④ ONE-TAP ACTION CARD (swap / bundle / liquidate)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Modules

| # | Module | What it does |
|---|--------|--------------|
| 1 | **Smart Beat & Store Profile** | Retailer / salon overview; historic sell-through velocity; Days-of-Inventory (DOI). Beat plan for the day, sorted by risk-urgency. |
| 2 | **3-Second Edge-CV Shelf Scan** | Live camera pass over the back-shelf. Edge-CV cues detect dust/shelf degradation + OCR extracts **batch code & expiry**; barcode lookup via Open Food Facts fallback. |
| 3 | **Tri-Band Risk Engine** | Classifies every SKU per store: 🟢 Green (healthy velocity → normal reorder), 🟡 Amber (stagnant >60 days → re-anchor / bundle), 🔴 Red (<90 days to expiry → swap / liquidate). |
| 4 | **On-Ground Action Cards** | 1-tap **Lateral StockSwap** (transfers near-dead SKU to a nearby salon that sells it fast), **Dynamic B2B Margin Bundles** (green SKU + amber SKU at a discount), **Tester Conversion** approval (write-off → sampling instead of destruction). |
| 5 | **Green Sales Leaderboard** | **Net Freshness Index (NFI)** gamification + bounty rewards for saving near-dead SKUs. |

---

## 3 · System Architecture — How It All Works

```
                        ┌──────────────────────────────────────────┐
                        │              CLOUD LAYER                 │
                        │                                          │
   ┌─────────────┐      │  ┌────────────┐      ┌───────────────┐   │
   │ FSO MOBILE  │──────┼─►│  REST API  │─────►│  PostgreSQL   │   │
   │ APP         │◄─────┼──│ (Node/Ex-  │◄─────│  + Firestore  │   │
   │ (Expo RN)   │ sync │  │ press)     │      │  (aurora)     │   │
   └──────┬──────┘      │  └─────┬──────┘      └───────────────┘   │
          │             │        │                                  │
   offline-first │      │  ┌─────▼──────────┐    ┌──────────────┐   │
   IndexedDB/SQLite      │  │ RISK ENGINE    │◄───│ NIGHTLY ERP  │   │
   queue with background │  │ (velocity/DOI/ │    │ SYNC (stock  │   │
   sync on reconnect     │  │  expiry bands) │    │ movements)   │   │
          │              │  └────────────────┘    └──────────────┘   │
          │              │        │                                  │
          │              │  ┌─────▼──────────┐                       │
   ┌──────▼──────┐      │  │ OCR + Edge-CV  │  ML Kit OCR (on-device│
   │ ASM WEB     │◄─────┼──│ SERVICE        │  first, cloud fallback│
   │ COCKPIT     │ API  │  │ (Node + Tesseract/OpenCV)  │          │
   └─────────────┘      │  └────────────────┘                       │
                        │  ┌──────────────────────────────┐         │
                        │  │ GEOFENCE + GPS ATTESTATION + │         │
                        │  │ MEDIA (scan photos) STORE    │         │
                        │  └──────────────────────────────┘         │
                        └──────────────────────────────────────────┘
```

**Key architectural principles** (borrowed from field-proven OSS, §14):

1. **Offline-first** — store visits happen in basements / warehouses with no signal. All writes queue locally; background sync drains the queue on reconnect (pattern: AuditM-Field & Ruteria).
2. **On-device inference first** — OCR + barcode decoding run on-device via ML Kit at ~3 FPS through a quality-gated frame processor; cloud OCR is only a fallback (pattern: VizCount, StockFlow).
3. **Deterministic pipeline, AI as tier-3 fallback** — barcode → OCR → regex extraction always run; a vision model only fills gaps, never overrides (pattern: ExpirationRadar).
4. **Immutable movement ledger** — every stock move (order, swap, return, write-off) is an append-only ledger entry; stock denormalized via DB triggers (pattern: Ruteria, StockFlow). This is our audit trail for the case judges.
5. **FEFO everywhere** — First-Expire-First-Out governs every "which batch ships/swaps next" decision (pattern: StockFlow, Gategroup system).
6. **GPS + timestamp attestation** — every scan and action card is location-stamped so the evidence trail is tamper-evident (pattern: TORBA Retail, Occamy).

---

## 4 · Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **FSO mobile app** | React Native + **Expo**, TypeScript | Fast iteration, community scan/OCR plugins, works for a case demo on one device both online & offline |
| **ASM dashboard** | React (Vite) + Tailwind + Recharts | Quick analytics cockpit, shares `packages/shared` types with mobile |
| **API** | Node.js + Express | Simple REST + webhooks; matches OSS references |
| **Primary DB** | PostgreSQL (Supabase for PoC) + **Firestore** for sync-cache | RLS + triggers give the immutable ledger |
| **Scan pipeline** | `react-native-vision-camera` + ML Kit OCR + `tesseract.js` (cloud fallback) + ZXing/DataMatrix + OpenFoodFacts API | Battle-tested combo in the OSS references |
| **Risk engine** | Pure Node service (no ML to start): rules on velocity/DOI/expiry; ML scoring later | Explainable in front of judges; swap in gradient-boosting in Phase 2 |
| **Geo** | Haversine-based nearest-store matcher for StockSwap | Trivial, deterministic |
| **Hosting (PoC)** | Vercel (apps) + Render/Railway (API) + Supabase | All free tier — simulates a real rollout with $0 |

---

## 5 · Pages & Screens — Complete Map

Two applications, one shared core. Every page below gets a build ticket in Phase 1.

```
FSO (Field Sales Officer) MOBILE APP                    ASM (Area Sales Manager) WEB COCKPIT
┌─────────────────────────────┐                         ┌─────────────────────────────┐
│ P01 Login & Onboarding      │                         │ W01 Manager Login           │
│ P02 Home — My Beat Today    │                         │ W02 Territory Overview      │
│ P03 Store Profile           │                         │ W03 Risk Heatmaps           │
│ P04 Shelf Scan (camera)     │        sync             │ W04 StockSwap Board         │
│ P05 Scan Result (tri-band)  │◄───────────────────────►│ W05 NFI Leaderboard         │
│ P06 Action Card — Swap      │                         │ W06 Bundle Configurator     │
│ P07 Action Card — Bundle    │                         │ W07 Liquidation Approvals   │
│ P08 Action Card — Tester    │                         │ W08 Reports & Exports       │
│ P09 Re-Order Builder        │                         │ W09 Admin — Config          │
│ P10 StockSwap Marketplace   │                         └─────────────────────────────┘
│ P11 NFI Leaderboard (mobile)│
│ P12 Visit History & Sync    │
│ P13 Settings / Support      │
└─────────────────────────────┘
```

**Design source:** [Figma — VeloCity AI](https://www.figma.com/design/fc9sAJYGcAuPS7Oo7IJZ5T) — both pages (P01–P13 mobile, W01–W09 ASM cockpit) designed to match this map.

| ID | Page | Role | Purpose |
|----|------|------|---------|
| P01 | Login & Onboarding | FSO | Auth, day-start checklist, sync health, offline notice |
| P02 | My Beat Today | FSO | Route of the day sorted by risk urgency; SLA on visits |
| P03 | Store Profile | FSO | Per-store SKUs, velocity, DOI, historic actions |
| P04 | Shelf Scan | FSO | 3-second camera pass; quality gates; live band preview |
| P05 | Scan Result | FSO | Tri-band risk read per SKU + recommended actions |
| P06 | Action — StockSwap | FSO | Red SKU ⇄ nearby outlet match (A ↔ B) with both signatures |
| P07 | Action — Bundle | FSO | Green+amber pinned bundle w/ B2B margin |
| P08 | Action — Tester Conversion | FSO | approval request + sampling plan |
| P09 | Re-Order Builder | FSO | Risk-aware reorder (never plain order-booking) |
| P10 | StockSwap Marketplace | FSO | Browse open swap offers nearby |
| P11 | Leaderboard (mobile) | FSO | NFI standings, bounties, personal history |
| P12 | Visit History & Sync | FSO | Ledger of visits/actions, pending queue, force sync |
| P13 | Settings / Support | FSO | Language, offline radius, help, feedback |
| W01–W09 | Web cockpit | ASM | Territory dashboard, heatmap, approvals, exports, config |

---

## 6 · App Pages Deep Dive — Page by Page

### §6.1 · P01 — Login & Onboarding
- Auth0/Supabase auth; role-aware landing (FSO vs ASM vs Admin).
- Onboarding: 60-second product tour of the visit loop; **device capability check** (camera, GPS, storage).
- Day-start: shows sync status of last night's ERP pull; "X SKUs at risk in your territory" primer.

### §6.2 · P02 — My Beat Today (Home)
- Ordered store list for today's beat, sorted by **risk score** (a red-heavy store floats to top).
- Each store card: name, last-visit freshness snapshot, *(green/amber/red counts)*, distance, GPS check-in CTA.
- Territory strip at top: Net Freshness Index for the week, pending swaps, bounties available.

### §6.3 · P03 — Store Profile
- Header: store type (GT / modern trade / salon), neighborhood, owner notes, historic compliance.
- SKU table sorted by risk: `SKU · batch · expiry · on-hand · 30d velocity · DOI · band`.
- Section "Freshness Pulse": mini-graph of sell-through over 8 weeks (uses nightly ERP data).
- "Start Scan" primary CTA → P04; "Previous visit" summary drawer.

### §6.4 · P04 — Shelf Scan (the hero screen)
Camera-first, 3-second guided sweep (see §7 for the pipeline). On-device:
- Real-time **quality gates**: *"Hold steady"* (blur), *"Glare detected"*, *"Too dark"*.
- Auto frame capture at best-quality moments; overlays highlight detected SKU regions.
- Progress UI: `Frames → Blocks → Lines → Fields` with success haptics as batches resolve.
- Manual confirm/edit sheet for any low-confidence field (human-in-the-loop, provenance-tagged).

### §6.5 · P05 — Scan Result (Tri-Band Read)
- Rows appear card-by-card as the engine classifies: 🟢 / 🟡 / 🔴.
- Filter chips by band; store-level freshness verdict.
- Primary CTA context-aware: majority-red → "Run Swap Match"; majority-amber → "Build Bundle"; healthy → "Create Re-Order".

### §6.6–6.8 · P06–P08 — On-Ground Action Cards
Every action writes to the immutable ledger with GPS + timestamp + both-party signature:
- **P06 Lateral StockSwap (🔴 RED)**: engine finds a nearby outlet whose velocity on that SKU is strong (two-way value: the other store moves stock that would die here). FSO A proposes; counterparty (FSO B / outlet owner) accepts with e-signature (SMS/PIN). Replaces a write-off with real revenue + saves the freight miles of a fresh replacement shipment.
- **P07 Dynamic B2B Margin Bundle (🟡 AMBER)**: pairs a red/amber SKU with a fast-green SKU; discount is auto-computed from margin headroom + days-to-expiry curve. Retailer sees one tap: "Bundle saves you ₹X and clears your slow shelf".
- **P08 Tester Conversion (🔴 → 💚)**: near-expiry unit re-qualified as tester/sampling stock with per-case ASM approval; diverted from destruction → zero-landfill disposition.

### §6.9 · P09 — Re-Order Builder
- Suggests order per FEFO: fills gaps on green SKUs; hard-caps amber SKUs at survival quantity; blocks re-order when DOI > threshold.
- Explicitly " not a blind SFA": shows projected DOI post-order so the FSO can never recreate the waste problem.

### §6.10 · P10 — StockSwap Marketplace
- List of open swap offers in radius (distance-sorted). Two-sided marketplace for red inventory.
- Quick filter by SKU / expiry window / distance; 1-tap "Accept" with geolocation.

### §6.11 · P11 — Green Sales Leaderboard (mobile)
- Weekly/monthly **Net Freshness Index** ranking; bounty wall for saving near-dead SKUs.
- Individual NFI breakdown (weighted below in §12); social proof mechanics.

### §6.12 · P12 — Visit History & Sync
- Ledger of all visits, scans, actions (read-only; auditors' view).
- Pending queue of unsynced records; conflict-resolution notes; "force sync" for demos.

### §6.13 · P13 — Settings
- Language toggle (English/Hindi), offline pack management, feedback channel, robustness self-test (run a canned scan offline).

### §6.14 · W01–W09 — ASM Web Cockpit
- **Territory overview**: red skus aging curve, movement in last 7 days, FSO activity.
- **Risk heatmaps**: choropleth at store level; drill-down to shelf photos.
- **StockSwap board**: aggregate swaps completed vs write-off baseline.
- **Liquidation approvals**: tester-conversion & write-off queue with one-tap rubber-stamp.
- **Bundle configurator**: margin headroom curves, max-discount ceilings per SKU class.
- **Reports & exports**: 1-click case-judge pack (CSV + PDF).

---

## 7 · The 3-Second Edge-CV Shelf Scan Pipeline

Directly adapted from the accepted patterns of Scan2Go (Hybrid scanning + ML Kit), VizCount (10-stage frame processor) and ExpirationRadar (deterministic tiers):

```
frame in @ ~3 FPS
 │
 ▼ [WORKLET] (on-device)
 1 · Throttle ─── min 300ms between OCR passes
 2 · Quality ─── OpenCV Laplacian blur variance + brightness
 │                blur<80 → "Hold steady"
 │                bright>220 → "Glare"   bright<40 → "Too dark"
 3 · ML Kit OCR ─ scanText(frame) → text blocks
 4 · ROI filter ─ reject conf<0.8 or lines outside shelf rect
 5 · Field extractors (regex):
 │      batch   → "BATCH\s*/\s* (\w{6,12})"   (L'Oréal batch format)
 │      expiry  → (DD/MM/YY | DD-MMM-YYYY | YYYY-MM-DD)
 │      GTIN/barcode → EAN-13 via parallel ML Kit barcode track
 6 · Temporal stabilizer ─ rolling buffer (5)… value wins at ≥3/5 consensus
 7 · Record combiner ─ requires stable(BATCH|GTIN) + stable(EXPIRY)
 │
 ▼ [JS THREAD]
 8a · Catalog lookup ─ internal PostgreSQL → OpenFoodFacts API fallback
 8b · Batch-date math ─ days_to_expiry = expiry − today
 8c · Edge-CV dust score ─ Laplacian edge density of shelf background
 │                          near SKU region vs baseline per store
 9 · Band classification ─ → §8 risk engine (local rules mirror + latest server rules)
10 · Save record ─ scan_event led → fire success haptic + green border flash
                    cooldown 1.5s → next sweep pass
```

**What Edge-CV contributes beyond plain OCR:**
| Signal | Computation | Meaning |
|---|---|---|
| Dust/edge degradation | Edge-density (Canny/Laplacian) in shelf silhouette regions | Stagnant stock — untouched shelf areas |
| Carton dent flags | Contrast anomalies in lighting bands | Return-likely (damage) stock |
| Gap/dark-hole detection | Contour analysis | OOS or de-shelved items (lost sale signals) |

---

## 8 · Tri-Band Risk Engine — The Brain

Purely deterministic and explainable to judges (no black-box):

```
inputs per (store, sku, batch):
  velocity_30d   = Σ units_sold / 30
  doi            = on_hand / max(velocity_7d, ε)          # days of inventory
  dte            = expiry_date − today                    # days to expiry
  stagnation     = today − last_movement_date
  target_doi     = 21        # healthy beauty channel buffer (configurable)

band rules evaluate in priority order:
  IF dte <= 90                      → 🔴 RED      (expiring soon — act: swap/liquidate/tester)
  IF stagnation > 60 days           → 🔴 RED      (dead stock — act: swap)
  IF stagnation > 30 days           → 🟡 AMBER    (slowing — act: bundle/re-anchor)
  IF doi > 2 × target_doi           → 🟡 AMBER    (overstocked — act: throttle re-order + bundle)
  ELSE                              → 🟢 GREEN    (healthy — act: normal FEFO re-order)
```

**Aggregate store score:** `StoreFreshness = 100 − (Σ band_weight) / (n_skus)`, with `_RED_weight = 25, AMBER_weight = 10, GREEN_weight = 0` (one exposure to judges' mental math).

**NFI as a leaderboard metric (per FSO):**
```
NFI = 100 × (1 − weighted red share post-visit)
      + bonus for completed swaps
      + bonus for tester conversions
      − penalty for skipped stores in beat
```

Phase 2 upgrade path: gradient-boosted demand model per SKU × outlet × season on top of the same features (enginge stays interpretable, the band thresholds learn from data).

---

## 9 · Data Model

```
TERRITORY      (id, asm_id, region, countries)
FSO            (id, territory_id, name, phone, nfi_final, achieved_month)
OUTLET_STORE   (id, territory_id, type[gt|mt|salon], geo, owner, notes, last_visit)
SKU            (id, ean, gtin, name, family, mrp, cost, margin_pct, max_discount_pct)
STORE_BATCH    (id, store_id, sku_id, batch_code, expiry_date, on_hand, last_movement, band[latest])
SCAN_EVENT     (id, store_id, fso_id, ts, gps, frame_uri, scan_payload, confidence)
ACTION_CARD    (id, scan_event_id, type[sweep|bundle|tester_conv], payload, status, approved_by)
SWAP_OFFER     (id, sku_id, from_store, to_store, units, status[open|accepted|rejected|expired])
LEDGER_ENTRY   (id, ts, actor, type, ref, delta, store_id, sku_id, batch_id)  -- APPEND ONLY
BUNDLE_OFFER   (id, store_id, lead_sku, pinch_sku, discount_pct, expiry, status)
LEADERBOARD    (period, fso_id, nfi, rank, bounties)
NOTIFICATIONS  (id, to_role, channel, payload, read_at)
```

Ledger is append-only; `STORE_BATCH.on_hand` is a denormalized projection maintained by database triggers — never hand-edited (candor for auditors).

---

## 10 · Roles & Permissions

| Capability | FSO (mobile) | ASM (web) | Admin |
|---|---|---|---|
| Scan shelves / log visits | ✅ | — | — |
| Propose swap offer | ✅ | — | — |
| Accept swap offer | ✅ | view | — |
| Create bundle offer | ✅ | approve ceilings | config |
| Tester conversion | request | **approve** | config |
| Write-off | request | **approve** | audit |
| Beat reassignment | — | ✅ | ✅ |
| Thresholds / config (amber=60d, red=90d, target DOI) | — | view | ✅ |
| Reports & export | own | territory | org-wide |

Row-Level Security scoping: FSO sees own stored data → ASM sees territory → Admin sees org.

---

## 11 · End-to-End Workflows

### §11.1 · The Visit (the product's spine)
```
FSO GPS check-in ─► open store ─► shelf scan (§7) ─► tri-band read (§8)
 ├─ all green → FEFO re-order (P09) → log visit → close
 ├─ ambers    → bundle offer (P07) → retailer PO → close
 └─ reds      → swap match (P06) OR tester request (P08)
                → counterparty e-acceptance → ledger entry → close
every path ends in: ledger entry + media archive + sync queue drain
```

### §11.2 · Cross-FSO Swap (the waste killer)
```
FSO A scans store: SKU-X 80 units @ 43 days-to-expiry (RED)
 → engine: Outlet-B within 6.2 km sells SKU-X at 3.4× velocity of A's outlet
 → 1-tap proposal by A → SMS/PIN acceptance by B (72 h validity window)
 → estimate of saved ₹: (mrp × 80) − swap logistics + freshness value
 → geo-verified handover log → both stores' bands refresh → NFI↑ for A
```

### §11.3 · Nightly ERP sync (fast-follower realism)
- Pull channel inventory & sell-through deltas (SAP-style CSV/webhook in simulation).
- Recompute bands for all unvisited SKUs so the FSO's beat plan is pre-scouted next morning.

---

## 12 · KPIs & Success Metrics

| KPI | Baseline (case) | Target | Measured by |
|---|---|---|---|
| Write-off ≤ returns/expiry cost % of revenue | ~1.5% | ≤0.5% | ledger |
| Logistics/handling overhead | ~1.0% | ≤0.4% | ledger |
| Near-expiry salvage rate (swap CE/ester) | ~0 | ≥60% | swap_board |
| Days-to-destruction | avg 40 | ≤5 | scan→act latency |
| Unseen-dead-stock rate (back-shelf blind spot) | ~unknown | ≤1 scan-miss/quarter | audit sampling |
| Carbon avoided (reverse logistics trips) | 0 | /100f | ledger calc |
| FSO NFI ≥ 85 rank-share | n/a | 70% | leaderboard |

These are exactly the economics the judges grade; the deck cites them 1:1.

---

## 13 · Simulation & PoC Strategy

Because this is an Executive Case Submission, we **prove the system by simulating it**, then screen-record the demo:

1. **Synthetic territory** — seed script generates 40 outlets × 120 SKUs × realistic GT/beauty velocity distributions (Poisson-ish base + decay curves). Delivered as `simulation/seed.ts`.
2. **Mock ERP feed** — a nightly cron pretending to be L'Oréal IT: sells inward/outward CSV dramatizing 3 divergent store archetypes (fast salon cluster, stale general trade cluster, mixed).
3. **Back-shelf scan simulation** — three repos face-off to give a credible on-screen scan:
   - Buy-side barcode decode: ZXing / ML Kit via **Scan2Go_PoC** pattern;
   - OCR of batch/expiry: `tesseract.js` against printed benchtop mock-up of extracted labels;
   - Edge-CV dust demo: phone records real shelf wall; overlay effects annotate stagnated regions (OpenCV pre-baked in demo video, live flag when app is foreground).
4. **Live demo scenario script** — 5 min: day-start beat → 2 stores (green re-order, amber bundle) → 3rd store full RED → cross-FSO swap → NFI leaderboard jumps → ASM sees the audit trail.
5. **Fallback truth ladder** for scan lookup: internal catalog → OpenFoodFacts → manual confirm (never dead-ends).

Deliverables to the judges: demo video + slides + this repo as the "system actually exists" proof.

---

## 14 · Open-Source References — What We Learned From Each

> We did **not** fork anything. These are pattern donors per module (walked through in §5–§8). All are permissive for simulation/inspiration; licenses checked at Phase 1.

| Repo / source | What we borrow | Maps to |
|---|---|---|
| [`torba-lab/torba-retail`](https://github.com/torba-lab/torba-retail) | Full SFA feature benchmark — route plans, customer DB, order mgmt, **shelf stock audit + photo reports**, GPS stamping | P02–P10 |
| [`thewayla/Scan2Go_PoC`](https://github.com/thewayla/Scan2Go_PoC) | Kotlin scan UX; hybrid scan: internal catalog → **OpenFoodFacts API fallback**; ML Kit scanning; MVVM + Firebase atomic writes | P04, §7 steps 5–8a |
| [`nigdanil/AuditM-Field`](https://github.com/nigdanil/AuditM-Field) | **Offline-first PWA**, IndexedDB, JSON-driven audit config, photo annotation, AI-suggestion review queue, role-aware review | Architecture principles, P12, W05 |
| [`shyamal-bhatt/VizCount`](https://github.com/shyamal-bhatt/VizCount) | **10-stage on-device frame processor** — quality gates (blur/glare/dark), ROI filter, regex field extraction, temporal stabilization, scan lock | §7 entire pipeline |
| [`gauranshahuja/stockflow`](https://github.com/gauranshahuja/stockflow/blob/main/README.md) | Batch+expiry data model, **FEFO dispatch**, GS1/DataMatrix decode, `tesseract.js` expiry OCR, immutable stock ledger, free-tier Firebase | §9, §8, §11.3 |
| [`riddhivinayak/Ruteria`](https://github.com/riddhivinayak/Ruteria) | Route-of-the-day reassignment, **auto units-sold inference** from count deltas, immutable movement log + DB-trigger stock denormalization, offline sync queue | P02, §9 ledger, §10 RLS |
| [`K-dotKishan/occamy-field-operations-system`](https://github.com/K-dotKishan/occamy-hackathon) | Mobile-first field-ops in low-connectivity; role split Admin/Field; visits + stock + sales capture in one system; Vercel/Render deployment shapes | §3, §4 |
| [`Javierlcastillo/smartIntelligence-by-MJandTheMonstars`](https://github.com/Javierlcastillo/smartIntelligence-by-MJandTheMonstars) | **Scan-to-decision <1s** (Expired/OK/Near-expiry), FEFO guardrails-blocks on load, lifecycle statuses, unit-level tracking | P05, P09, §8 |
| [`ananyajaiswall/ExpiryTracking` (PantryPal)](https://github.com/ananyajaiswall/ExpiryTracking) | Status automation (Fresh/Nearing/Expired) + **action history on discount/donate/remove** — the direct ancestor of Action Cards | P06–P08 |
| [`Ps23102004/expirationradar`](https://github.com/Ps23102004/expirationradar) | **Deterministic tiers — barcode+OCR mandatory, vision-model only as gap-filler**, provenance+confidence shown per field | §7 principles |
| [`ScripterEve/DateWiseFull`](https://github.com/ScripterEve/DateWiseFull) | Color-band expiry UX (🔴/🟡/🟢), calendar of expiry peaks | P05 banding |
| `ARES SKT` (commercial, posares.com) | Product checklists for shelf-expiry workflows, FEFO tasks, thresholds-config pattern | §8 config |

---

## 15 · Repository Structure

```
smart-Logistics-system/
├── README.md                      ← this file (single source of truth for the system design)
├── LICENSE                        ← MIT license
├── presentation/                  ← Executive 5-Slide Pitch Deck (L'Oréal SUS 2026)
│   ├── index.html                 · Standalone interactive HTML presentation deck
│   ├── Loreal_VeloCity_AI_Presentation.pdf · High-DPI vector slide deck PDF
│   ├── slides/                    · Rendered high-res PNG slide previews (Slides 1-5)
│   ├── render_slides.cjs          · Puppeteer automated slide & PDF rendering pipeline
│   └── README.md                  · Presentation architecture & slide breakdown
├── docs/                          ← Case study analysis & deliverable deep-dives
│   ├── deliverables-guide.md      · Comprehensive breakdown of Key Deliverables A & B
│   ├── executive-summary.md       · One-page executive value proposition
│   └── references.md              · Open source & industry benchmarks
├── simulation/                    ← Territory simulation & synthetic data generator
│   ├── seed.ts                    · Synthetic 40-store Mumbai territory generator
│   ├── mock-erp-feed.ts           · Nightly SAP-like CSV webhook simulation
│   └── data/                      · territory-snapshot.json & mock-sap-feed.csv
├── services/
│   ├── api/                       ← Lightweight REST API Gateway (Node/TS native)
│   └── risk-engine/               ← Pure Tri-Band rules + NFI scoring (21 unit tests)
├── apps/
│   ├── mobile/                    ← FSO field app (Expo React Native, TypeScript)
│   └── dashboard/                 ← ASM regional cockpit (React + Vite + Tailwind)
└── packages/
    └── shared/                    ← Shared TypeScript models (SKU, bands, ledger DTOs)
```

**Conventions:**
- TypeScript end-to-end; `packages/shared` is the single source of truth for types.
- `services/risk-engine` must remain a **pure, dependency-free function library** so tests are trivial and the deck can print it verbatim.
- Every feature PR references a page ID (P01–P13 / W01–W09) so commits stay collated to the README map.
- Ledger is append-only by convention `no UPDATE/DELETE on ledger_entry`.

---

## 16 · Roadmap — Build Phases

| Phase | Scope | Exit criteria |
|---|---|---|
| **Phase 0 — now** | README (this), seed simulation, decision log | Judged-ready system narrative committed |
| **Phase 1 — Simulation PoC** | Mock API + risk-engine + ASM dashboard on demo data; mobile scan prototype w/ ML Kit + tesseract.js | 5-min demo script runs end-to-end on 2 devices |
| **Phase 2 — Field PoC** | Offline-first hardening, real e-acceptance of swaps (SMS/PIN), NFI jobs | Pilot metrics instrumented in 3 stores for 2 weeks |
| **Phase 3 — Productionization** | ML demand overlay, L'Oréal SAP-connector hardening, security review, scale-out plan | Deck-ready pilot report; final case submission |

---

## 17 · Running the Project

```bash
# 1. Run all unit tests across risk-engine and API services (21 tests)
npm test

# 2. Run synthetic territory simulation (generates 40 Mumbai stores, 400 batches)
npm run seed

# 3. Start the VeloCity AI REST API Gateway (port 4000)
cd services/api && npm start

# 4. View or re-render executive presentation slides
open presentation/index.html
# Re-render PNGs & vector PDF via Puppeteer:
cd presentation && node render_slides.cjs
```

# API (Phase 1)
cd services/api && pnpm i && pnpm dev             # → localhost:4000

# Mobile app (Phase 1)
cd apps/mobile && pnpm i && npx expo start        # scan QR from simulator/device
```

---

## 18 · Project Governance

*(Workspace protocol from `agents_talking.md` — the operating contract for this repo)*

- **Boss (User)** — supreme decision maker; locks product direction (currently: Tech-First Mobile App for the Sales Track).
- **OpenCode (Manager)** — architecture, system design, this README, design handoffs from Figma, code review.
- **Antigravity (Executor)** — implements tasks issued through the channel bridge, executes Figma component mappings.

Change control: README §15 structure & §5 page map are **frozen artifacts** — changes require a Boss sign-off via the bridge doc.

---

<div align="center">

**L'Oréal SUS 2026 · Sales Track · VeloCity AI**
*Move the stock, don't destroy it.*

</div>
