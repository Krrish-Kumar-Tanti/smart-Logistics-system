import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateRiskBand,
  calculateStoreFreshness,
  calculateFsoNfi,
  getNfiTier,
  rankSwapCandidates,
  haversineDistanceKm,
  type RiskBand,
  type RiskEvaluationResult,
  type OutletCandidate,
} from '../../risk-engine/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load synthetic territory snapshot if available
let territoryData: any = null;
try {
  const snapshotPath = path.resolve(__dirname, '../../../simulation/data/territory-snapshot.json');
  if (fs.existsSync(snapshotPath)) {
    territoryData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  }
} catch (e) {
  territoryData = null;
}

const DEFAULT_PORT = Number(process.env.PORT) || 4000;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  const payload = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(payload);
}

/**
 * Validates a single numeric API field. Returns an error message string when invalid,
 * or null when the value is acceptable. Optional fields may be undefined.
 */
export function validateNumberField(
  label: string,
  value: unknown,
  { min, max, required = true }: { min?: number; max?: number; required?: boolean } = {}
): string | null {
  if (value === undefined || value === null || value === '') {
    return required ? `${label} is required` : null;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return `${label} must be a finite number`;
  }
  if (min !== undefined && num < min) {
    return `${label} must be >= ${min}`;
  }
  if (max !== undefined && num > max) {
    return `${label} must be <= ${max}`;
  }
  return null;
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

export async function handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method?.toUpperCase();

  // CORS pre-flight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  try {
    // 1. Health & Status
    if (pathname === '/health' && method === 'GET') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'VeloCity AI API Gateway',
        version: '0.1.0',
        engine: 'Tri-Band Risk Engine v1.0',
        territory: territoryData ? 'Mumbai Western Suburbs (40 Outlets)' : 'Runtime Standalone',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Product Catalog
    if (pathname === '/api/catalog' && method === 'GET') {
      const catalog = territoryData?.catalog ?? [];
      return sendJson(res, 200, { count: catalog.length, catalog });
    }

    // 3. Outlets List
    if (pathname === '/api/outlets' && method === 'GET') {
      const outlets = territoryData?.outlets ?? [];
      return sendJson(res, 200, { count: outlets.length, outlets });
    }

    // 4. Outlet Detail by Code (e.g., /api/outlets/SL-001)
    if (pathname.startsWith('/api/outlets/') && method === 'GET') {
      const code = pathname.replace('/api/outlets/', '').trim();
      const outlet = territoryData?.outlets?.find((o: any) => o.code === code);
      if (!outlet) {
        return sendJson(res, 404, { error: `Outlet ${code} not found` });
      }

      const batches = territoryData?.batches?.filter((b: any) => b.storeCode === code) ?? [];
      const bands: RiskBand[] = batches.map((b: any) => b.currentBand);
      const freshnessScore = calculateStoreFreshness(bands);

      return sendJson(res, 200, {
        outlet,
        freshnessScore,
        batchCount: batches.length,
        riskBreakdown: {
          red: bands.filter(b => b === 'RED').length,
          amber: bands.filter(b => b === 'AMBER').length,
          green: bands.filter(b => b === 'GREEN').length,
        },
        batches,
      });
    }

    // 5. Edge-CV Shelf Scan Simulation
    if (pathname === '/api/scan/shelf' && method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        storeCode = 'GT-001',
        fsoId = 'FSO-104',
        skuCode = 'LP-ABS-SHMP-300',
        barcode = '8901526001015',
        batchCode = 'B240412A',
        daysToExpiry = 74,
        stagnationDays = 45,
        daysOfInventory = 62,
        shelfDustScore = 0.72,
        packagingDentScore = 0.15,
      } = body;

      const validationErrors = [
        validateNumberField('daysToExpiry', daysToExpiry),
        validateNumberField('stagnationDays', stagnationDays, { min: 0 }),
        validateNumberField('daysOfInventory', daysOfInventory, { min: 0 }),
        validateNumberField('shelfDustScore', shelfDustScore, { min: 0, max: 1 }),
        validateNumberField('packagingDentScore', packagingDentScore, { min: 0, max: 1 }),
      ].filter(Boolean);

      if (validationErrors.length > 0) {
        return sendJson(res, 400, {
          error: 'Invalid scan input',
          message: 'Shelf telemetry must be finite numbers; counters >= 0 and edge-CV scores within [0, 1].',
          errors: validationErrors,
        });
      }

      const riskResult = evaluateRiskBand({
        daysToExpiry,
        stagnationDays,
        daysOfInventory,
      });

      const physicalFlag = shelfDustScore > 0.6 || packagingDentScore > 0.5;

      return sendJson(res, 200, {
        scanId: `SCN-${Date.now().toString(36).toUpperCase()}`,
        scannedAt: new Date().toISOString(),
        storeCode,
        fsoId,
        sku: {
          skuCode,
          barcode,
          batchCode,
        },
        shelfTelemetry: {
          daysToExpiry,
          stagnationDays,
          daysOfInventory,
          shelfDustScore,
          packagingDentScore,
          physicalDistressDetected: physicalFlag,
        },
        triage: {
          band: riskResult.band,
          reason: riskResult.reason,
          action: riskResult.recommendedAction,
          urgency: riskResult.urgencyLevel,
        },
        actionCard: {
          title:
            riskResult.band === 'RED'
              ? 'CRITICAL RESCUE: Initiate Lateral StockSwap'
              : riskResult.band === 'AMBER'
              ? 'ATTENTION: Activate Dynamic Bundle / Reposition'
              : 'HEALTHY: Standard Shelf Restock',
          nextStep:
            riskResult.band === 'RED'
              ? 'Match with nearby high-velocity salon within 5km radius'
              : riskResult.band === 'AMBER'
              ? 'Apply 15% co-op discount or pair with fast-moving styling lead SKU'
              : 'Maintain current inventory buffer',
        },
      });
    }

    // 6. Direct Batch Risk Evaluator
    if (pathname === '/api/inventory/evaluate' && method === 'POST') {
      const body = await parseJsonBody(req);
      const items = Array.isArray(body.items) ? body.items : [body];

      const validationErrors = items
        .flatMap((item: any, index: number) => [
          validateNumberField(`items[${index}].daysToExpiry`, item.daysToExpiry ?? 180),
          validateNumberField(`items[${index}].stagnationDays`, item.stagnationDays ?? 10, { min: 0 }),
          validateNumberField(`items[${index}].daysOfInventory`, item.daysOfInventory ?? 21, { min: 0 }),
          validateNumberField(`items[${index}].targetDoi`, item.targetDoi, { min: 0, required: false }),
        ])
        .filter(Boolean);

      if (validationErrors.length > 0) {
        return sendJson(res, 400, {
          error: 'Invalid inventory input',
          message: 'Batch counters must be finite numbers; stagnation days, DOI and target DOI must be >= 0.',
          errors: validationErrors,
        });
      }

      const evaluations = items.map((item: any) => {
        const res = evaluateRiskBand({
          daysToExpiry: Number(item.daysToExpiry ?? 180),
          stagnationDays: Number(item.stagnationDays ?? 10),
          daysOfInventory: Number(item.daysOfInventory ?? 21),
          targetDoi: item.targetDoi ? Number(item.targetDoi) : undefined,
        });
        return {
          skuId: item.skuId ?? 'unknown',
          input: item,
          result: res,
        };
      });

      const bands = evaluations.map((e: any) => e.result.band as RiskBand);
      const aggregateFreshness = calculateStoreFreshness(bands);

      return sendJson(res, 200, {
        evaluatedCount: evaluations.length,
        aggregateFreshnessScore: aggregateFreshness,
        evaluations,
      });
    }

    // 7. Hyperlocal Lateral StockSwap Matchmaker
    if (pathname === '/api/swaps/match' && method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        donorStoreCode,
        donorLat = 19.0598,
        donorLng = 72.8298,
        donorVelocity30d = 1.2,
        skuCode = 'LP-ABS-SHMP-300',
        unitsToSwap = 10,
        maxRadiusKm = 10.0,
      } = body;

      // Same hardening contract as the triage endpoints: malformed donor telemetry
      // must fail fast with 400 instead of propagating NaN through the Haversine
      // ranking (NaN comparisons are all false, so an unguarded NaN coordinate
      // silently matched every candidate with a NaN score).
      const validationErrors = [
        validateNumberField('donorLat', donorLat, { min: -90, max: 90, required: false }),
        validateNumberField('donorLng', donorLng, { min: -180, max: 180, required: false }),
        validateNumberField('donorVelocity30d', donorVelocity30d, { min: 0, required: false }),
        validateNumberField('unitsToSwap', unitsToSwap, { min: 0, required: false }),
        validateNumberField('maxRadiusKm', maxRadiusKm, { min: 0.1, max: 50, required: false }),
      ].filter(Boolean);

      if (validationErrors.length > 0) {
        return sendJson(res, 400, {
          error: 'Invalid swap match input',
          message:
            'Donor coordinates must fall in valid lat/lng ranges, counters must be >= 0, and search radius must be within [0.1, 50] km.',
          errors: validationErrors,
        });
      }

      let candidates: OutletCandidate[] = [];

      if (territoryData?.outlets) {
        candidates = territoryData.outlets
          .filter((o: any) => o.code !== donorStoreCode)
          .map((o: any) => ({
            storeId: o.code,
            storeName: o.name,
            storeType: o.type,
            lat: o.lat,
            lng: o.lng,
            currentVelocity30d: o.type === 'salon' ? 18.5 : o.type === 'mt' ? 14.0 : 2.5,
            currentDoi: 12,
          }));
      } else {
        candidates = [
          {
            storeId: 'SL-001',
            storeName: 'Enrich Salon Bandra',
            storeType: 'salon',
            lat: 19.062,
            lng: 72.831,
            currentVelocity30d: 22.0,
            currentDoi: 10,
          },
          {
            storeId: 'MT-001',
            storeName: 'Shoppers Stop Bandra',
            storeType: 'mt',
            lat: 19.055,
            lng: 72.836,
            currentVelocity30d: 16.0,
            currentDoi: 14,
          },
        ];
      }

      const rankedMatches = rankSwapCandidates(
        { lat: Number(donorLat), lng: Number(donorLng), velocity30d: Number(donorVelocity30d) },
        candidates,
        Number(maxRadiusKm)
      );

      return sendJson(res, 200, {
        donor: {
          storeCode: donorStoreCode ?? 'GT-UNKNOWN',
          skuCode,
          unitsToSwap,
          donorVelocity30d,
          coordinates: { lat: donorLat, lng: donorLng },
        },
        searchRadiusKm: maxRadiusKm,
        matchedRecipientCount: rankedMatches.length,
        bestMatch: rankedMatches[0] ?? null,
        candidates: rankedMatches,
      });
    }

    // 8. FSO Leaderboard (Net Freshness Index)
    if (pathname === '/api/leaderboard' && method === 'GET') {
      const leaders = [
        {
          rank: 1,
          fsoId: 'FSO-104',
          name: 'Priya Sharma',
          territory: 'Bandra & Khar West',
          nfiScore: 94.2,
          freshnessRank: 'Elite Tier',
          monthlyBountiesInr: 14500,
          swapsCompleted: 18,
          testerConversions: 8,
          status: 'On Target (Zero Landfill)',
        },
        {
          rank: 2,
          fsoId: 'FSO-101',
          name: 'Vikram Joshi',
          territory: 'Andheri West & Lokhandwala',
          nfiScore: 89.5,
          freshnessRank: 'High Performer',
          monthlyBountiesInr: 11000,
          swapsCompleted: 14,
          testerConversions: 5,
          status: 'Active',
        },
        {
          rank: 3,
          fsoId: 'FSO-108',
          name: 'Karan Mehra',
          territory: 'Juhu & Vile Parle',
          nfiScore: 86.8,
          freshnessRank: 'High Performer',
          monthlyBountiesInr: 8500,
          swapsCompleted: 11,
          testerConversions: 4,
          status: 'Active',
        },
        {
          rank: 4,
          fsoId: 'FSO-112',
          name: 'Ananya Deshmukh',
          territory: 'BKC & Kurla Hub',
          nfiScore: 79.1,
          freshnessRank: 'Improving',
          monthlyBountiesInr: 5000,
          swapsCompleted: 7,
          testerConversions: 3,
          status: 'Needs Triage Attention',
        },
      ];

      return sendJson(res, 200, {
        period: 'November 2026',
        territory: 'Mumbai West Region',
        fsoCount: leaders.length,
        leaderboard: leaders,
      });
    }

    // 9. FSO Net Freshness Index Evaluator
    if (pathname === '/api/fso/evaluate' && method === 'POST') {
      const body = await parseJsonBody(req);

      const params = {
        totalSkusInTerritory: Number(body.totalSkusInTerritory ?? 0),
        postVisitRedSkus: Number(body.postVisitRedSkus ?? 0),
        swapsCompleted: Number(body.swapsCompleted ?? 0),
        testerConversions: Number(body.testerConversions ?? 0),
        skippedStores: Number(body.skippedStores ?? 0),
      };

      const hasInvalidCount = Object.values(params).some(v => !Number.isFinite(v) || v < 0);
      if (hasInvalidCount) {
        return sendJson(res, 400, {
          error: 'Invalid NFI input',
          message: 'All NFI counters must be finite, non-negative numbers.',
          received: params,
        });
      }

      const nfiScore = calculateFsoNfi(params);

      return sendJson(res, 200, {
        fsoId: body.fsoId ?? 'unknown',
        evaluatedAt: new Date().toISOString(),
        inputs: params,
        nfiScore,
        freshnessRank: getNfiTier(nfiScore),
        monthlyBountiesInr: Math.round(nfiScore * 150),
      });
    }

    // 404 Route Not Found
    return sendJson(res, 404, {
      error: 'Route not found',
      path: pathname,
      availableRoutes: [
        'GET /health',
        'GET /api/catalog',
        'GET /api/outlets',
        'GET /api/outlets/:code',
        'POST /api/scan/shelf',
        'POST /api/inventory/evaluate',
        'POST /api/swaps/match',
        'GET /api/leaderboard',
        'POST /api/fso/evaluate',
      ],
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      error: 'Internal Server Error',
      message: err.message,
    });
  }
}

export function createServer() {
  return http.createServer(handleApiRequest);
}

// Start server if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createServer();
  server.listen(DEFAULT_PORT, () => {
    console.log(`================================================================`);
    console.log(`  🚚 VeloCity AI — API Gateway Server running on port ${DEFAULT_PORT}`);
    console.log(`  Health Check: http://localhost:${DEFAULT_PORT}/health`);
    console.log(`  Outlets:      http://localhost:${DEFAULT_PORT}/api/outlets`);
    console.log(`  Leaderboard:  http://localhost:${DEFAULT_PORT}/api/leaderboard`);
    console.log(`  NFI Evaluate: POST http://localhost:${DEFAULT_PORT}/api/fso/evaluate`);
    console.log(`================================================================`);
  });
}
