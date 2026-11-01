# Open-Source Simulation References — Deep Dive

Companion to README §14. Research run on GitHub/web (Nov 2026) to answer:
*"Does something like VeloCity AI already exist that we can simulate against / take inspiration from?"*

**Answer: no single repo matches, but 6 components of our system have production-grade OSS donors. We do not fork — each donor answers a specific build question.**

## Donor-by-Donor Notes

### 1. Scan & OCR pipeline → `shyamal-bhatt/VizCount`
- Kitchen-department scanner (Expo RN): 10-stage frame processor; stages 1–7 on worklet thread, 8–10 on JS thread.
- What resolves our §7 design: throttle gate (300 ms), quality gates (Laplacian blur < 80, brightness >  glare > 220 / < 40), ROI spatial filter w/ conf ≥ 0.8, regex field extractors, rolling 5-frame majority consensus (≥ 3/5), dedupe guard, scan lock (1.5 s).
- Adopt: stage structure *as-is*, swap domain (PID/kg → batch code/expiry/GTIN).

### 2. Scan-to-decision & FEFO → `gauranshahuja/stockflow`, `Javierlcastillo/smartIntelligence-by-MJandTheMonstars`
- StockFlow: SKU → batches fan-out, color-coded by expiry; FEFO ordering enforced at dispatch; append-only ledger; ZXing + GS1 DataMatrix + `tesseract.js` OCR expiry; Firestore free tier.
- Gategroup: scan → `Expired / OK / Near expiry` verdict < 1s; FEFO guardrail blocks expired picks; lifecycle statuses time-stamped & user-attributed.
- Adopt: data model + the "verdict in one tap" interaction model for P05.

### 3. SFA feature benchmark → `torba-lab/torba-retail`
- Route planning, customer DB, catalog, orders, **shelf stock audit + photo reports**, debt view, GPS auto-stamp, supervisor module for team monitoring.
- Adopt: checklist for P02/P03 completeness; proof that "GPS-stamped shelf audits" is field-standard practice.

### 4. Offline-first field architecture → `nigdanil/AuditM-Field`, `riddhivinayak/Ruteria`
- AuditM-Field: config-driven PWA (JSON audit config), IndexedDB, photo annotation, supervisor review, ZIP export/import, AI-suggestion review queue.
- Ruteria: inventory count with **auto units_sold = prev − current** inference; immutable movement log; stock denormalized via SQL triggers; background sync queue; RBAC + RLS; Supabase stack.
- Adopt: offline queue + ledger-trigger pattern (§9) + role model (§10).

### 5. Field-ops role & deployment shape → `K-dotKishan/occamy-field-operations-system`
- Mobile-first; low-connectivity focus; attendance/visits/photos + distributor stock; RBAC/JWT; React+Express+Mongo; Vercel/Render live.
- Adopt: splitting FSO mobile vs Admin web, and the free-tier hosting topology in §4/§17.

### 6. Action cards ancestry → `ananyajaiswall/ExpiryTracking` (PantryPal)
- Automated status (Fresh / Nearing / Expired) + **action with history logging** (discount / donate / remove).
- Adopt: "every rescue action must be logged with action history" — the audit trail our Action Cards write to the ledger.

### 7. Deterministic-tier scan fallback → `Ps23102004/expirationradar`
- Barcode (pyzbar) → OCR (tesseract, regex-parsed) → vision-model (Ollama) **only as gap-filler**, never authority; per-field provenance + confidence displayed.
- Adopt: our fallback ladder in §13 point 5 + human-in-the-loop confirm sheets.

### 8. Band UX → `ScripterEve/DateWiseFull`
- Red/yellow/green remaining-days bands, expiry calendar.
- Adopt: color language of P05/P11.

## What does NOT exist (our novelty to defend)
1. **Cross-store lateral swap marketplace** for red-band stock (no repo does two-way relocation between outlets with e-acceptance).
2. **Tri-band engine fed by on-device shelf scans + ERP deltas** (repos are either scan-tools or inventory-DBs; none fuse both into a risk engine).
3. **NFI gamification/bounty** tied to salvage actions.
4. Tester-conversion as a zero-landfill write-off alternative with ledger attestation.
