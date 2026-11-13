# 🧪 API Examples — Copy-Pasteable Requests

Practical `curl` examples for every VeloCity AI API gateway endpoint. Start the server first:

```bash
cd services/api && npm start
# 🚚 VeloCity AI — API Gateway Server running on port 4000
```

All examples assume `http://localhost:4000`. Set `PORT` in `services/api/.env` (see `.env.example`) to change it.

> ℹ️ Any unrecognized path returns a `404` listing all available routes — handy for discovery.

---

## 1 · Health Check

```bash
curl -s http://localhost:4000/health | jq
```

Returns service status, active territory, and the loaded risk-engine version.

---

## 2 · Product Catalog

```bash
curl -s http://localhost:4000/api/catalog | jq '.count, .catalog[0]'
```

Lists active L'Oréal Professional & Consumer SKUs used across the simulation.

---

## 3 · Outlets

List all mapped outlets (Salons, GT, MT):

```bash
curl -s http://localhost:4000/api/outlets | jq '.count, .outlets[0]'
```

Full detail for one outlet — inventory, risk-band breakdown, and store freshness score:

```bash
curl -s http://localhost:4000/api/outlets/SL-001 | jq
```

---

## 4 · Edge-CV Shelf Scan Triage

Simulates the 3-second camera scan and returns an instant action card. Every field is optional (defaults shown below):

```bash
curl -s -X POST http://localhost:4000/api/scan/shelf \
  -H "Content-Type: application/json" \
  -d '{
    "storeCode": "GT-001",
    "fsoId": "FSO-104",
    "skuCode": "LP-ABS-SHMP-300",
    "barcode": "8901526001015",
    "batchCode": "B240412A",
    "daysToExpiry": 74,
    "stagnationDays": 45,
    "daysOfInventory": 62,
    "shelfDustScore": 0.72,
    "packagingDentScore": 0.15
  }' | jq '.triage, .actionCard'
```

`shelfDustScore > 0.6` or `packagingDentScore > 0.5` flags physical distress on the shelf.

Telemetry is validated: counters must be finite and `>= 0`, edge-CV scores must stay within `[0, 1]` (`daysToExpiry` may be `0` or negative — that is an already-expired batch). Malformed payloads return `400`:

```bash
curl -s -X POST http://localhost:4000/api/scan/shelf \
  -H "Content-Type: application/json" \
  -d '{ "daysToExpiry": "ninety-days" }' | jq
```

---

## 5 · Batch Inventory Evaluation (Tri-Band Risk Engine)

Evaluate a single batch *or* an array of batches (`items`), and get an aggregate store freshness score back. Batch counters must be finite; `stagnationDays`, `daysOfInventory` and `targetDoi` must be `>= 0` (else `400`):

```bash
curl -s -X POST http://localhost:4000/api/inventory/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "skuId": "LP-ABS-SHMP-300", "daysToExpiry": 18, "stagnationDays": 45, "daysOfInventory": 62 },
      { "skuId": "LPC-MFX-SER-100", "daysToExpiry": 210, "stagnationDays": 4, "daysOfInventory": 15 }
    ]
  }' | jq '.aggregateFreshnessScore, .evaluations[].result'
```

---

## 6 · Hyperlocal Lateral StockSwap Matchmaker

Pairs a slow-moving GT donor outlet with high-velocity recipients (salons/MT) within `maxRadiusKm`, ranked by Haversine distance and velocity differential:

```bash
curl -s -X POST http://localhost:4000/api/swaps/match \
  -H "Content-Type: application/json" \
  -d '{
    "donorStoreCode": "GT-001",
    "donorLat": 19.0598,
    "donorLng": 72.8298,
    "donorVelocity30d": 1.2,
    "skuCode": "LP-ABS-SHMP-300",
    "unitsToSwap": 10,
    "maxRadiusKm": 10
  }' | jq '.bestMatch, .matchedRecipientCount'
```

A 400 example for validation (donor coordinates must fall in valid lat/lng ranges, counters `>= 0`, and radius within `[0.1, 50]` km):

```bash
curl -s -X POST http://localhost:4000/api/swaps/match \
  -H "Content-Type: application/json" \
  -d '{ "donorStoreCode": "GT-001", "donorLat": 95, "maxRadiusKm": 0 }' | jq
```

---

## 7 · FSO Leaderboard (Net Freshness Index)

```bash
curl -s http://localhost:4000/api/leaderboard | jq '.leaderboard'
```

---

## 8 · Live FSO NFI Evaluation

Compute an FSO's Net Freshness Index, freshness tier, and monthly bounty from live field counters. All counters must be finite and non-negative (else `400`):

```bash
curl -s -X POST http://localhost:4000/api/fso/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "fsoId": "FSO-104",
    "totalSkusInTerritory": 120,
    "postVisitRedSkus": 8,
    "swapsCompleted": 18,
    "testerConversions": 8,
    "skippedStores": 2
  }' | jq '.nfiScore, .freshnessRank, .monthlyBountiesInr'
```

A 400 example for validation:

```bash
curl -s -X POST http://localhost:4000/api/fso/evaluate \
  -H "Content-Type: application/json" \
  -d '{ "fsoId": "FSO-104", "swapsCompleted": -3 }' | jq
```

---

## Verify

Run the full test suite (mirrors the GitHub Actions CI workflow):

```bash
cd services/api && npm test
```
