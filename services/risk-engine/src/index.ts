/**
 * VeloCity AI — Tri-Band Risk Engine
 * 
 * Deterministic, rule-based classification and scoring for FMCG shelf inventory.
 * Follows README §8 logic:
 *   1. Evaluate batch bands (RED / AMBER / GREEN)
 *   2. Compute store-level Net Freshness score
 *   3. Score Field Sales Officer (FSO) Net Freshness Index (NFI)
 *   4. Rank lateral stock-swap recipient candidates
 */

export type RiskBand = 'GREEN' | 'AMBER' | 'RED';

export type ActionType = 'swap' | 'bundle' | 'tester_conv' | 'reorder';

export interface RiskEvaluationInput {
  daysToExpiry: number;
  stagnationDays: number;
  daysOfInventory: number;
  targetDoi?: number;
}

export interface RiskEvaluationResult {
  band: RiskBand;
  reason:
    | 'EXPIRING_SOON'
    | 'DEAD_STOCK'
    | 'SLOWING_VELOCITY'
    | 'OVERSTOCKED'
    | 'HEALTHY';
  recommendedAction: ActionType;
  urgencyLevel: 'high' | 'medium' | 'low';
}

export const DEFAULT_TARGET_DOI = 21; // Healthy FMCG/salon beauty channel buffer (days)
export const RED_EXPIRY_THRESHOLD_DAYS = 90; // <= 90 days to expiry -> RED
export const RED_STAGNATION_THRESHOLD_DAYS = 60; // > 60 days stagnant -> RED
export const AMBER_STAGNATION_THRESHOLD_DAYS = 30; // > 30 days stagnant -> AMBER

const BAND_WEIGHTS: Record<RiskBand, number> = {
  RED: 25,
  AMBER: 10,
  GREEN: 0,
};

/**
 * Classifies a single batch into Green, Amber, or Red based on expiry,
 * movement stagnation, and days of inventory (DOI).
 */
export function evaluateRiskBand(input: RiskEvaluationInput): RiskEvaluationResult {
  const targetDoi = input.targetDoi ?? DEFAULT_TARGET_DOI;

  // 1. Expiry cliff: less than or equal to 90 days remaining
  if (input.daysToExpiry <= RED_EXPIRY_THRESHOLD_DAYS) {
    return {
      band: 'RED',
      reason: 'EXPIRING_SOON',
      recommendedAction: 'swap',
      urgencyLevel: 'high',
    };
  }

  // 2. Dead stock: untouched on shelf for > 60 days
  if (input.stagnationDays > RED_STAGNATION_THRESHOLD_DAYS) {
    return {
      band: 'RED',
      reason: 'DEAD_STOCK',
      recommendedAction: 'swap',
      urgencyLevel: 'high',
    };
  }

  // 3. Stagnation warning: untouched for > 30 days
  if (input.stagnationDays > AMBER_STAGNATION_THRESHOLD_DAYS) {
    return {
      band: 'AMBER',
      reason: 'SLOWING_VELOCITY',
      recommendedAction: 'bundle',
      urgencyLevel: 'medium',
    };
  }

  // 4. Overstock check: DOI exceeds 2x target buffer
  if (input.daysOfInventory > 2 * targetDoi) {
    return {
      band: 'AMBER',
      reason: 'OVERSTOCKED',
      recommendedAction: 'bundle',
      urgencyLevel: 'medium',
    };
  }

  // 5. Default: healthy sell-through
  return {
    band: 'GREEN',
    reason: 'HEALTHY',
    recommendedAction: 'reorder',
    urgencyLevel: 'low',
  };
}

/**
 * Computes aggregate store freshness score (0 - 100):
 * StoreFreshness = 100 - (Σ band_weight) / (n_skus)
 */
export function calculateStoreFreshness(bands: RiskBand[]): number {
  if (bands.length === 0) return 100;

  const totalPenalty = bands.reduce((acc, band) => acc + (BAND_WEIGHTS[band] ?? 0), 0);
  const avgPenalty = totalPenalty / bands.length;
  const rawScore = 100 - avgPenalty;

  return Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));
}

export interface FsoNfiParams {
  totalSkusInTerritory: number;
  postVisitRedSkus: number;
  swapsCompleted: number;
  testerConversions: number;
  skippedStores: number;
}

/**
 * Calculates Net Freshness Index (NFI) for a Field Sales Officer (0 - 100 scale).
 * Rewards active rescues (swaps, tester conversions) and penalizes skipped visits.
 */
export function calculateFsoNfi(params: FsoNfiParams): number {
  const {
    totalSkusInTerritory,
    postVisitRedSkus,
    swapsCompleted,
    testerConversions,
    skippedStores,
  } = params;

  if (totalSkusInTerritory === 0) return 100;

  const redShare = Math.min(1, Math.max(0, postVisitRedSkus / totalSkusInTerritory));
  const baseFreshness = 100 * (1 - redShare);

  const swapBonus = swapsCompleted * 4.0;
  const testerBonus = testerConversions * 2.5;
  const skippedPenalty = skippedStores * 8.0;

  const totalScore = baseFreshness + swapBonus + testerBonus - skippedPenalty;
  return Math.max(0, Math.min(100, Math.round(totalScore * 10) / 10));
}

export type NfiTier = 'Elite Tier' | 'High Performer' | 'Improving' | 'Needs Triage Attention';

/**
 * Maps a Net Freshness Index score to its leaderboard performance tier.
 * Thresholds mirror the canonical leaderboard cut-offs:
 *   >= 90 Elite Tier, >= 80 High Performer, >= 65 Improving, else Needs Triage Attention.
 */
export function getNfiTier(nfiScore: number): NfiTier {
  if (nfiScore >= 90) return 'Elite Tier';
  if (nfiScore >= 80) return 'High Performer';
  if (nfiScore >= 65) return 'Improving';
  return 'Needs Triage Attention';
}

/**
 * Haversine distance formula between two GPS coordinates in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export interface OutletCandidate {
  storeId: string;
  storeName: string;
  storeType: 'gt' | 'mt' | 'salon';
  lat: number;
  lng: number;
  currentVelocity30d: number;
  currentDoi: number;
}

export interface SwapCandidateResult {
  storeId: string;
  storeName: string;
  storeType: 'gt' | 'mt' | 'salon';
  distanceKm: number;
  velocityMultiplier: number;
  score: number;
}

/**
 * Identifies and ranks nearby outlets capable of absorbing near-expiry or stagnant stock.
 * Prioritizes outlets with high sell-through velocity, safe DOI, and close physical proximity.
 */
export function rankSwapCandidates(
  donorStore: { lat: number; lng: number; velocity30d: number },
  candidates: OutletCandidate[],
  maxRadiusKm: number = 10.0,
  targetDoi: number = DEFAULT_TARGET_DOI
): SwapCandidateResult[] {
  const baseVelocity = Math.max(0.1, donorStore.velocity30d);

  const matches: SwapCandidateResult[] = [];

  for (const candidate of candidates) {
    const dist = haversineDistanceKm(donorStore.lat, donorStore.lng, candidate.lat, candidate.lng);

    if (dist > maxRadiusKm) continue;

    // Recipient should have higher velocity and not already be overstocked
    const velocityMultiplier = Math.round((candidate.currentVelocity30d / baseVelocity) * 10) / 10;
    if (velocityMultiplier < 1.2) continue;
    if (candidate.currentDoi > 2 * targetDoi) continue;

    // Higher score for closer distance and faster velocity
    const distanceFactor = Math.max(0.2, 1 / (1 + dist * 0.3));
    const score = Math.round((velocityMultiplier * distanceFactor * 100)) / 10;

    matches.push({
      storeId: candidate.storeId,
      storeName: candidate.storeName,
      storeType: candidate.storeType,
      distanceKm: dist,
      velocityMultiplier,
      score,
    });
  }

  // Sort by highest score descending
  return matches.sort((a, b) => b.score - a.score);
}
