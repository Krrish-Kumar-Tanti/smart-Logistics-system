import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateRiskBand,
  calculateStoreFreshness,
  calculateFsoNfi,
  getNfiTier,
  haversineDistanceKm,
  rankSwapCandidates,
} from '../src/index.ts';

test('evaluateRiskBand — assigns RED when daysToExpiry <= 90', () => {
  const result = evaluateRiskBand({
    daysToExpiry: 45,
    stagnationDays: 10,
    daysOfInventory: 15,
  });

  assert.equal(result.band, 'RED');
  assert.equal(result.reason, 'EXPIRING_SOON');
  assert.equal(result.recommendedAction, 'swap');
  assert.equal(result.urgencyLevel, 'high');
});

test('evaluateRiskBand — assigns RED when stagnation > 60 days', () => {
  const result = evaluateRiskBand({
    daysToExpiry: 365,
    stagnationDays: 75,
    daysOfInventory: 20,
  });

  assert.equal(result.band, 'RED');
  assert.equal(result.reason, 'DEAD_STOCK');
  assert.equal(result.recommendedAction, 'swap');
});

test('evaluateRiskBand — assigns AMBER when stagnation > 30 days', () => {
  const result = evaluateRiskBand({
    daysToExpiry: 300,
    stagnationDays: 45,
    daysOfInventory: 20,
  });

  assert.equal(result.band, 'AMBER');
  assert.equal(result.reason, 'SLOWING_VELOCITY');
  assert.equal(result.recommendedAction, 'bundle');
});

test('evaluateRiskBand — assigns AMBER when DOI > 2 * targetDoi', () => {
  const result = evaluateRiskBand({
    daysToExpiry: 200,
    stagnationDays: 15,
    daysOfInventory: 55, // target is 21 -> 2 * 21 = 42
    targetDoi: 21,
  });

  assert.equal(result.band, 'AMBER');
  assert.equal(result.reason, 'OVERSTOCKED');
});

test('evaluateRiskBand — assigns GREEN when inventory is healthy', () => {
  const result = evaluateRiskBand({
    daysToExpiry: 250,
    stagnationDays: 5,
    daysOfInventory: 18,
    targetDoi: 21,
  });

  assert.equal(result.band, 'GREEN');
  assert.equal(result.reason, 'HEALTHY');
  assert.equal(result.recommendedAction, 'reorder');
});

test('calculateStoreFreshness — computes 100 for all green', () => {
  const score = calculateStoreFreshness(['GREEN', 'GREEN', 'GREEN']);
  assert.equal(score, 100);
});

test('calculateStoreFreshness — returns 100 for empty inventory list', () => {
  const score = calculateStoreFreshness([]);
  assert.equal(score, 100);
});

test('calculateStoreFreshness — computes penalty for RED and AMBER', () => {
  // RED = 25, AMBER = 10, GREEN = 0 -> avg = (25 + 10 + 0 + 0) / 4 = 35 / 4 = 8.75 -> 100 - 8.75 = 91.25 -> rounded 91.3
  const score = calculateStoreFreshness(['RED', 'AMBER', 'GREEN', 'GREEN']);
  assert.equal(score, 91.3);
});

test('calculateFsoNfi — computes NFI with rescue bonuses and skip penalties', () => {
  const nfi = calculateFsoNfi({
    totalSkusInTerritory: 100,
    postVisitRedSkus: 5, // 5% red share -> base = 95
    swapsCompleted: 2, // +8
    testerConversions: 1, // +2.5
    skippedStores: 1, // -8
  });

  // 95 + 8 + 2.5 - 8 = 97.5
  assert.equal(nfi, 97.5);
});

test('calculateFsoNfi — clamps boundary between 0 and 100 on extreme penalties', () => {
  const nfiZero = calculateFsoNfi({
    totalSkusInTerritory: 10,
    postVisitRedSkus: 10,
    swapsCompleted: 0,
    testerConversions: 0,
    skippedStores: 20, // severe penalty
  });
  assert.equal(nfiZero, 0);

  const nfiHundred = calculateFsoNfi({
    totalSkusInTerritory: 0,
    postVisitRedSkus: 0,
    swapsCompleted: 10,
    testerConversions: 10,
    skippedStores: 0,
  });
  assert.equal(nfiHundred, 100);
});

test('haversineDistanceKm — calculates Mumbai store distances accurately', () => {
  // Bandra West (19.0596, 72.8295) to Khar West (19.0700, 72.8333) is ~1.2 km
  const distance = haversineDistanceKm(19.0596, 72.8295, 19.0700, 72.8333);
  assert.ok(distance > 1.0 && distance < 1.5, `Expected ~1.2 km, got ${distance}`);
});

test('rankSwapCandidates — selects fast-moving nearby salon over distant or slow store', () => {
  const donor = { lat: 19.0596, lng: 72.8295, velocity30d: 0.2 }; // slow GT outlet in Bandra
  const candidates = [
    {
      storeId: 'store-1',
      storeName: 'Enrich Salon Bandra',
      storeType: 'salon' as const,
      lat: 19.0620,
      lng: 72.8310, // ~300m away
      currentVelocity30d: 1.8, // 9x velocity!
      currentDoi: 12,
    },
    {
      storeId: 'store-2',
      storeName: 'Lakme Salon Thane',
      storeType: 'salon' as const,
      lat: 19.2183,
      lng: 72.9781, // ~25km away (outside max radius)
      currentVelocity30d: 2.5,
      currentDoi: 10,
    },
    {
      storeId: 'store-3',
      storeName: 'Local Corner General Store',
      storeType: 'gt' as const,
      lat: 19.0610,
      lng: 72.8300,
      currentVelocity30d: 0.1, // slower than donor!
      currentDoi: 50,
    },
  ];

  const matches = rankSwapCandidates(donor, candidates, 10.0);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].storeId, 'store-1');
  assert.equal(matches[0].velocityMultiplier, 9);
});

test('getNfiTier — maps NFI scores to canonical leaderboard tiers', () => {
  assert.equal(getNfiTier(94.2), 'Elite Tier');
  assert.equal(getNfiTier(90), 'Elite Tier');
  assert.equal(getNfiTier(89.5), 'High Performer');
  assert.equal(getNfiTier(86.8), 'High Performer');
  assert.equal(getNfiTier(79.1), 'Improving');
  assert.equal(getNfiTier(55), 'Needs Triage Attention');
  assert.equal(getNfiTier(0), 'Needs Triage Attention');
});
