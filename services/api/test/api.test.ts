import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { handleApiRequest } from '../src/server.ts';

class MockRequest extends EventEmitter {
  method: string;
  url: string;
  headers: Record<string, string>;

  constructor(method: string, url: string, body?: any) {
    super();
    this.method = method;
    this.url = url;
    this.headers = { host: 'localhost' };

    process.nextTick(() => {
      if (body !== undefined) {
        this.emit('data', Buffer.from(JSON.stringify(body)));
      }
      this.emit('end');
    });
  }
}

class MockResponse extends EventEmitter {
  statusCode: number = 200;
  headers: Record<string, string> = {};
  body: string = '';

  writeHead(statusCode: number, headers?: any) {
    this.statusCode = statusCode;
    if (headers) {
      Object.assign(this.headers, headers);
    }
    return this;
  }

  end(chunk?: any) {
    if (chunk) {
      this.body += chunk.toString();
    }
    this.emit('finish');
    return this;
  }
}

function simulateRequest(method: string, path: string, body?: any): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = new MockRequest(method, path, body) as any;
    const res = new MockResponse() as any;

    res.on('finish', () => {
      try {
        const data = res.body ? JSON.parse(res.body) : null;
        resolve({ statusCode: res.statusCode, data });
      } catch (e) {
        resolve({ statusCode: res.statusCode, data: res.body });
      }
    });

    handleApiRequest(req, res).catch(reject);
  });
}

describe('VeloCity AI — API Gateway Service Tests', () => {
  it('GET /health — returns 200 with service status and Tri-Band engine version', async () => {
    const res = await simulateRequest('GET', '/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'UP');
    assert.ok(res.data.engine.includes('Tri-Band'));
  });

  it('GET /api/catalog — returns active product SKUs', async () => {
    const res = await simulateRequest('GET', '/api/catalog');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.data.catalog));
    assert.ok(res.data.count > 0);
  });

  it('GET /api/outlets — returns mapped retail outlets in territory', async () => {
    const res = await simulateRequest('GET', '/api/outlets');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.data.outlets));
    assert.ok(res.data.count >= 20);
  });

  it('GET /api/outlets/SL-001 — returns outlet detail with batches and freshness score', async () => {
    const res = await simulateRequest('GET', '/api/outlets/SL-001');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.outlet.code, 'SL-001');
    assert.ok(typeof res.data.freshnessScore === 'number');
    assert.ok(res.data.batchCount > 0);
  });

  it('POST /api/scan/shelf — simulates edge-CV scan and classifies expiring SKU as RED with rescue action', async () => {
    const res = await simulateRequest('POST', '/api/scan/shelf', {
      storeCode: 'GT-001',
      fsoId: 'FSO-104',
      skuCode: 'LP-ABS-SHMP-300',
      daysToExpiry: 65, // Below 90d threshold -> RED
      stagnationDays: 50,
      daysOfInventory: 45,
      shelfDustScore: 0.85,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.data.scanId.startsWith('SCN-'));
    assert.strictEqual(res.data.triage.band, 'RED');
    assert.strictEqual(res.data.triage.reason, 'EXPIRING_SOON');
    assert.strictEqual(res.data.triage.action, 'swap');
    assert.strictEqual(res.data.shelfTelemetry.physicalDistressDetected, true);
  });

  it('POST /api/inventory/evaluate — correctly calculates aggregate store freshness score', async () => {
    const res = await simulateRequest('POST', '/api/inventory/evaluate', {
      items: [
        { skuId: 'sku-1', daysToExpiry: 300, stagnationDays: 10, daysOfInventory: 15 }, // GREEN (0 penalty)
        { skuId: 'sku-2', daysToExpiry: 200, stagnationDays: 35, daysOfInventory: 20 }, // AMBER (10 penalty)
        { skuId: 'sku-3', daysToExpiry: 60, stagnationDays: 20, daysOfInventory: 30 },  // RED (25 penalty)
      ],
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.evaluatedCount, 3);
    // Average penalty = (0 + 10 + 25) / 3 = 11.67 -> Score = 88.3
    assert.ok(res.data.aggregateFreshnessScore > 85 && res.data.aggregateFreshnessScore < 90);
  });

  it('POST /api/swaps/match — finds nearby high-velocity salon recipient for slow-moving GT stock', async () => {
    const res = await simulateRequest('POST', '/api/swaps/match', {
      donorStoreCode: 'GT-001',
      donorLat: 19.0598,
      donorLng: 72.8298,
      donorVelocity30d: 1.2,
      skuCode: 'LP-ABS-SHMP-300',
      unitsToSwap: 8,
      maxRadiusKm: 5.0,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.data.matchedRecipientCount > 0);
    assert.ok(res.data.bestMatch.velocityMultiplier > 1.2);
    assert.ok(res.data.bestMatch.distanceKm <= 5.0);
  });

  it('GET /api/leaderboard — returns FSO rankings by Net Freshness Index (NFI)', async () => {
    const res = await simulateRequest('GET', '/api/leaderboard');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.data.leaderboard));
    assert.strictEqual(res.data.leaderboard[0].rank, 1);
    assert.ok(res.data.leaderboard[0].nfiScore >= 90);
  });

  it('OPTIONS /any-route — handles CORS pre-flight gracefully', async () => {
    const res = await simulateRequest('OPTIONS', '/api/scan/shelf');
    assert.strictEqual(res.statusCode, 204);
  });
});
