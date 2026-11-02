export type RiskBand = 'GREEN' | 'AMBER' | 'RED';

export type OutletType = 'gt' | 'mt' | 'salon';

export type ActionType = 'swap' | 'bundle' | 'tester_conv' | 'reorder';

export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type SwapOfferStatus = 'open' | 'accepted' | 'rejected' | 'expired';

export type LedgerEntryType =
  | 'INWARD_SHIPMENT'
  | 'RETAIL_SALE'
  | 'STOCK_SWAP_OUT'
  | 'STOCK_SWAP_IN'
  | 'TESTER_CONVERSION'
  | 'LIQUIDATION_WRITEOFF'
  | 'RETURN_TO_DEPOT';

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
  pincode?: string;
}

export interface Territory {
  id: string;
  asmId: string;
  region: string;
  state: string;
  city: string;
}

export interface FsoUser {
  id: string;
  territoryId: string;
  name: string;
  phone: string;
  email: string;
  nfiScore: number;
  monthlyBountiesInr: number;
}

export interface OutletStore {
  id: string;
  territoryId: string;
  code: string;
  name: string;
  type: OutletType;
  geo: GeoPoint;
  ownerName: string;
  ownerPhone: string;
  lastVisitAt?: string;
  currentFreshnessScore?: number;
  notes?: string;
}

export interface SkuItem {
  id: string;
  ean: string;
  gtin?: string;
  skuCode: string;
  name: string;
  brand: string;
  family: string;
  category: 'haircare' | 'skincare' | 'haircolor' | 'styling';
  mrpInr: number;
  distributorPriceInr: number;
  standardMarginPct: number;
  maxDiscountPct: number;
  targetDoi: number;
}

export interface StoreBatch {
  id: string;
  storeId: string;
  skuId: string;
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  onHandUnits: number;
  unitsSoldLast30d: number;
  unitsSoldLast7d: number;
  velocity30d: number;
  daysOfInventory: number;
  daysToExpiry: number;
  stagnationDays: number;
  currentBand: RiskBand;
  lastMovementDate: string;
}

export interface ScanEvent {
  id: string;
  storeId: string;
  fsoId: string;
  scannedAt: string;
  gps: GeoPoint;
  frameUri?: string;
  barcodeExtracted?: string;
  batchCodeExtracted?: string;
  expiryDateExtracted?: string;
  edgeCvDustScore?: number;
  edgeCvDentScore?: number;
  confidence: number;
  classificationBand: RiskBand;
}

export interface ActionCard {
  id: string;
  scanEventId?: string;
  storeId: string;
  fsoId: string;
  batchId: string;
  skuId: string;
  type: ActionType;
  reason: string;
  unitsInvolved: number;
  proposedTerms?: Record<string, unknown>;
  status: ActionStatus;
  approvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SwapOffer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  skuId: string;
  batchId: string;
  units: number;
  distanceKm: number;
  status: SwapOfferStatus;
  proposedByFsoId: string;
  recipientOtp?: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: 'fso' | 'asm' | 'erp_sync' | 'system';
  entryType: LedgerEntryType;
  referenceDocId?: string;
  storeId: string;
  skuId: string;
  batchId: string;
  unitDelta: number;
  runningBalance: number;
  notes?: string;
}

export interface BundleOffer {
  id: string;
  storeId: string;
  leadSkuId: string;
  pinchSkuId: string;
  pinchDiscountPct: number;
  validUntil: string;
  status: 'active' | 'claimed' | 'expired';
}

export interface LeaderboardEntry {
  periodMonth: string;
  fsoId: string;
  fsoName: string;
  territoryName: string;
  nfiScore: number;
  rank: number;
  swapsCompleted: number;
  testersConverted: number;
  bountiesEarnedInr: number;
}

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
