import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateRiskBand,
  calculateStoreFreshness,
  rankSwapCandidates,
  type RiskBand,
  type RiskEvaluationResult,
} from '../services/risk-engine/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawSku {
  id: string;
  skuCode: string;
  name: string;
  brand: string;
  family: string;
  category: 'haircare' | 'skincare' | 'haircolor' | 'styling';
  mrpInr: number;
  costInr: number;
  marginPct: number;
  targetDoi: number;
}

const CATALOG: RawSku[] = [
  {
    id: 'sku-lp-01',
    skuCode: 'LP-ABS-SHMP-300',
    name: 'Serie Expert Absolut Repair Shampoo 300ml',
    brand: "L'Oréal Professionnel",
    family: 'Serie Expert',
    category: 'haircare',
    mrpInr: 790,
    costInr: 513,
    marginPct: 35,
    targetDoi: 21,
  },
  {
    id: 'sku-lp-02',
    skuCode: 'LP-VIT-MASK-250',
    name: 'Serie Expert Vitamino Color Mask 250ml',
    brand: "L'Oréal Professionnel",
    family: 'Serie Expert',
    category: 'haircare',
    mrpInr: 950,
    costInr: 617,
    marginPct: 35,
    targetDoi: 21,
  },
  {
    id: 'sku-lp-03',
    skuCode: 'LP-MYTH-OIL-100',
    name: 'Mythic Oil Nourishing Argan Oil 100ml',
    brand: "L'Oréal Professionnel",
    family: 'Mythic Oil',
    category: 'styling',
    mrpInr: 1250,
    costInr: 812,
    marginPct: 35,
    targetDoi: 25,
  },
  {
    id: 'sku-lp-04',
    skuCode: 'LP-INOA-CLR-53',
    name: 'Inoa Ammonia-Free Permanent Hair Color 5.3 (60g)',
    brand: "L'Oréal Professionnel",
    family: 'Inoa',
    category: 'haircolor',
    mrpInr: 610,
    costInr: 396,
    marginPct: 35,
    targetDoi: 18,
  },
  {
    id: 'sku-lp-05',
    skuCode: 'LP-MAJ-CLR-04',
    name: 'Majirel Creme Color Brown 4 (50g)',
    brand: "L'Oréal Professionnel",
    family: 'Majirel',
    category: 'haircolor',
    mrpInr: 450,
    costInr: 292,
    marginPct: 35,
    targetDoi: 18,
  },
  {
    id: 'sku-paris-01',
    skuCode: 'PAR-REV-HA-SER-30',
    name: 'Revitalift 1.5% Hyaluronic Acid Plumping Serum 30ml',
    brand: "L'Oréal Paris",
    family: 'Revitalift',
    category: 'skincare',
    mrpInr: 999,
    costInr: 699,
    marginPct: 30,
    targetDoi: 21,
  },
  {
    id: 'sku-paris-02',
    skuCode: 'PAR-EXT-OIL-100',
    name: 'Extraordinary Oil Serum Multi-Use 100ml',
    brand: "L'Oréal Paris",
    family: 'Extraordinary Oil',
    category: 'haircare',
    mrpInr: 649,
    costInr: 454,
    marginPct: 30,
    targetDoi: 21,
  },
  {
    id: 'sku-paris-03',
    skuCode: 'PAR-CAST-GLOSS-316',
    name: 'Casting Crème Gloss No-Ammonia Color 316 Burgundy',
    brand: "L'Oréal Paris",
    family: 'Casting Creme Gloss',
    category: 'haircolor',
    mrpInr: 650,
    costInr: 455,
    marginPct: 30,
    targetDoi: 21,
  },
  {
    id: 'sku-mat-01',
    skuCode: 'MAT-OPTI-STRT-350',
    name: 'Matrix Opti.Care Smooth Straight Shampoo 350ml',
    brand: 'Matrix',
    family: 'Opti.Care',
    category: 'haircare',
    mrpInr: 440,
    costInr: 308,
    marginPct: 30,
    targetDoi: 21,
  },
  {
    id: 'sku-mat-02',
    skuCode: 'MAT-BIOL-COND-196',
    name: 'Matrix Biolage Colorlast Deep Treatment Pack 100ml',
    brand: 'Matrix',
    family: 'Biolage',
    category: 'haircare',
    mrpInr: 410,
    costInr: 287,
    marginPct: 30,
    targetDoi: 21,
  },
];

interface RawOutletSeed {
  code: string;
  name: string;
  type: 'gt' | 'mt' | 'salon';
  lat: number;
  lng: number;
  locality: string;
  owner: string;
  phone: string;
}

const OUTLETS_SEED: RawOutletSeed[] = [
  // 15 Salons (Western suburbs Mumbai)
  { code: 'SL-001', name: 'Enrich Salon Bandra West', type: 'salon', lat: 19.0598, lng: 72.8298, locality: 'Bandra West (Hill Rd)', owner: 'Rohit Shenoy', phone: '+91 98201 10001' },
  { code: 'SL-002', name: 'Jean-Claude Biguine Khar', type: 'salon', lat: 19.0712, lng: 72.8341, locality: 'Khar West (14th Rd)', owner: 'Alain Fernandes', phone: '+91 98201 10002' },
  { code: 'SL-003', name: 'Lakme Salon Juhu Tara Road', type: 'salon', lat: 19.0984, lng: 72.8276, locality: 'Juhu', owner: 'Pooja Bhatia', phone: '+91 98201 10003' },
  { code: 'SL-004', name: 'Toni & Guy Linking Road', type: 'salon', lat: 19.0664, lng: 72.8329, locality: 'Bandra West', owner: 'Karan Mehra', phone: '+91 98201 10004' },
  { code: 'SL-005', name: 'Truefitt & Hill Bandra', type: 'salon', lat: 19.0621, lng: 72.8302, locality: 'Pali Hill', owner: 'Sameer Merchant', phone: '+91 98201 10005' },
  { code: 'SL-006', name: 'Looks Salon Infinity Mall', type: 'salon', lat: 19.1412, lng: 72.8315, locality: 'Andheri West (Lokhandwala)', owner: 'Vikas Arora', phone: '+91 98201 10006' },
  { code: 'SL-007', name: 'BBLUNT Salon Juhu Circle', type: 'salon', lat: 19.1124, lng: 72.8268, locality: 'Juhu Circle', owner: 'Avan Contractor', phone: '+91 98201 10007' },
  { code: 'SL-008', name: 'Femina Flaunt Salon Santacruz', type: 'salon', lat: 19.0831, lng: 72.8402, locality: 'Santacruz West', owner: 'Rina Patel', phone: '+91 98201 10008' },
  { code: 'SL-009', name: 'Kapils Salon & Academy Oshiwara', type: 'salon', lat: 19.1502, lng: 72.8305, locality: 'Oshiwara', owner: 'Kapil Sharma', phone: '+91 98201 10009' },
  { code: 'SL-010', name: 'Jawed Habib Hair Studio Vile Parle', type: 'salon', lat: 19.1021, lng: 72.8465, locality: 'Vile Parle East', owner: 'Girish Joshi', phone: '+91 98201 10010' },
  { code: 'SL-011', name: 'Juice Salon Khar Danda', type: 'salon', lat: 19.0754, lng: 72.8291, locality: 'Khar Danda', owner: 'Natasha Dcosta', phone: '+91 98201 10011' },
  { code: 'SL-012', name: 'Myrah Spa & Salon Juhu', type: 'salon', lat: 19.1051, lng: 72.8252, locality: '10th Road Juhu', owner: 'Nisha Javeri', phone: '+91 98201 10012' },
  { code: 'SL-013', name: 'Enrich Salon BKC', type: 'salon', lat: 19.0660, lng: 72.8682, locality: 'Bandra Kurla Complex', owner: 'Vikram Zaveri', phone: '+91 98201 10013' },
  { code: 'SL-014', name: 'Mad O Wot Hair Studio Pali', type: 'salon', lat: 19.0645, lng: 72.8288, locality: 'Pali Naka', owner: 'Sapna Bhavnani', phone: '+91 98201 10014' },
  { code: 'SL-015', name: 'Naturals Salon Versova', type: 'salon', lat: 19.1325, lng: 72.8152, locality: 'Versova Beach Rd', owner: 'Deepak Roy', phone: '+91 98201 10015' },

  // 18 General Trade (GT) Outlets
  { code: 'GT-001', name: 'Beauty Centre Khar', type: 'gt', lat: 19.0705, lng: 72.8335, locality: 'SV Road Khar', owner: 'Haresh Vora', phone: '+91 98202 20001' },
  { code: 'GT-002', name: 'National Chemist & Beauty Bandra', type: 'gt', lat: 19.0578, lng: 72.8312, locality: 'Turner Rd Bandra', owner: 'Sunil Thakkar', phone: '+91 98202 20002' },
  { code: 'GT-003', name: 'Royal Cosmetics Pali Naka', type: 'gt', lat: 19.0635, lng: 72.8290, locality: 'Pali Naka Bandra', owner: 'Iqbal Qureshi', phone: '+91 98202 20003' },
  { code: 'GT-004', name: 'Shree Krishna Beauty Mart Santacruz', type: 'gt', lat: 19.0815, lng: 72.8390, locality: 'Station Rd Santacruz', owner: 'Ramesh Shah', phone: '+91 98202 20004' },
  { code: 'GT-005', name: 'Prabhat Medical & Cosmetics Juhu', type: 'gt', lat: 19.1012, lng: 72.8310, locality: 'Gulmohar Cross Rd', owner: 'Prakash Jain', phone: '+91 98202 20005' },
  { code: 'GT-006', name: 'Modern Beauty World Andheri', type: 'gt', lat: 19.1195, lng: 72.8470, locality: 'Andheri East Station', owner: 'Kishore Gada', phone: '+91 98202 20006' },
  { code: 'GT-007', name: 'Glamour House Lokhandwala', type: 'gt', lat: 19.1435, lng: 72.8295, locality: 'Main Market Lokhandwala', owner: 'Bipin Mehta', phone: '+91 98202 20007' },
  { code: 'GT-008', name: 'Choice Collection Vile Parle', type: 'gt', lat: 19.0998, lng: 72.8440, locality: 'Monghibai Rd Vile Parle', owner: 'Dinesh Doshi', phone: '+91 98202 20008' },
  { code: 'GT-009', name: 'New Beauty Centre Hill Road', type: 'gt', lat: 19.0555, lng: 72.8305, locality: 'Hill Road Bandra', owner: 'Manish Choksi', phone: '+91 98202 20009' },
  { code: 'GT-010', name: 'Apex Cosmetics & General Stores', type: 'gt', lat: 19.1350, lng: 72.8330, locality: 'Four Bungalows Andheri', owner: 'Bharat Patel', phone: '+91 98202 20010' },
  { code: 'GT-011', name: 'Khar Novelty Stores', type: 'gt', lat: 19.0725, lng: 72.8360, locality: '1st Road Khar', owner: 'Vinod Sanghavi', phone: '+91 98202 20011' },
  { code: 'GT-012', name: 'Galaxy Beauty Care Kurla', type: 'gt', lat: 19.0710, lng: 72.8760, locality: 'Kurla West', owner: 'Aslam Shaikh', phone: '+91 98202 20012' },
  { code: 'GT-013', name: 'Milan Medical & General Store', type: 'gt', lat: 19.0880, lng: 72.8415, locality: 'Milan Subway Santacruz', owner: 'Ashok Purohit', phone: '+91 98202 20013' },
  { code: 'GT-014', name: 'Saraswati General Mart Mahim', type: 'gt', lat: 19.0410, lng: 72.8420, locality: 'Lady Jamshedji Rd', owner: 'Sudhir Kamat', phone: '+91 98202 20014' },
  { code: 'GT-015', name: 'Kohinoor Cosmetics Versova', type: 'gt', lat: 19.1310, lng: 72.8180, locality: 'Yari Road Versova', owner: 'Farhan Ansari', phone: '+91 98202 20015' },
  { code: 'GT-016', name: 'City Beauty Shoppe Marol', type: 'gt', lat: 19.1170, lng: 72.8820, locality: 'Marol Military Rd', owner: 'Mahesh Nair', phone: '+91 98202 20016' },
  { code: 'GT-017', name: 'Mahalaxmi Chemist & Cosmetics', type: 'gt', lat: 19.0680, lng: 72.8510, locality: 'Bandra East Kalanagar', owner: 'Devendra Dave', phone: '+91 98202 20017' },
  { code: 'GT-018', name: 'Fair Look Beauty Corner', type: 'gt', lat: 19.1260, lng: 72.8390, locality: 'DN Nagar Andheri', owner: 'Kamlesh Soni', phone: '+91 98202 20018' },

  // 7 Modern Trade (MT) Outlets
  { code: 'MT-001', name: 'Nykaa Luxe Linking Road', type: 'mt', lat: 19.0685, lng: 72.8338, locality: 'Linking Rd Bandra', owner: 'Falguni Nayar (Corp)', phone: '+91 98203 30001' },
  { code: 'MT-002', name: 'Sephora Palladium Mall', type: 'mt', lat: 18.9940, lng: 72.8250, locality: 'High Street Phoenix Lower Parel', owner: 'Arvind Lifestyle', phone: '+91 98203 30002' },
  { code: 'MT-003', name: 'Shoppers Stop Bandra', type: 'mt', lat: 19.0610, lng: 72.8340, locality: 'Bandra West (Linking Rd)', owner: 'Shoppers Stop Ltd', phone: '+91 98203 30003' },
  { code: 'MT-004', name: 'Health & Glow Infiniti Malad', type: 'mt', lat: 19.1820, lng: 72.8340, locality: 'Link Rd Malad West', owner: 'Health & Glow Ltd', phone: '+91 98203 30004' },
  { code: 'MT-005', name: 'Lifestyle Stores Phoenix Marketcity', type: 'mt', lat: 19.0860, lng: 72.8890, locality: 'Kurla West', owner: 'Landmark Group', phone: '+91 98203 30005' },
  { code: 'MT-006', name: 'Tira Beauty Jio World Drive', type: 'mt', lat: 19.0675, lng: 72.8620, locality: 'BKC Bandra East', owner: 'Reliance Retail', phone: '+91 98203 30006' },
  { code: 'MT-007', name: 'Shoppers Stop Andheri SV Road', type: 'mt', lat: 19.1210, lng: 72.8420, locality: 'SV Road Andheri', owner: 'Shoppers Stop Ltd', phone: '+91 98203 30007' },
];

export interface SimulatedBatchRecord {
  batchId: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  storeType: 'gt' | 'mt' | 'salon';
  skuId: string;
  skuName: string;
  batchCode: string;
  mrpInr: number;
  onHandUnits: number;
  velocity30d: number;
  daysOfInventory: number;
  daysToExpiry: number;
  stagnationDays: number;
  band: RiskBand;
  reason: string;
  recommendedAction: string;
}

export function generateTerritoryData() {
  const batches: SimulatedBatchRecord[] = [];
  const storeSummaries: Array<{
    code: string;
    name: string;
    type: string;
    freshnessScore: number;
    redCount: number;
    amberCount: number;
    greenCount: number;
    totalUnits: number;
    valueAtRiskInr: number;
  }> = [];

  for (const outlet of OUTLETS_SEED) {
    const storeBands: RiskBand[] = [];
    let redCount = 0;
    let amberCount = 0;
    let greenCount = 0;
    let totalUnits = 0;
    let valueAtRiskInr = 0;

    for (let i = 0; i < CATALOG.length; i++) {
      const sku = CATALOG[i];
      const batchCode = `B26-${outlet.code}-${i + 101}`;

      // Realistic archetype behavior:
      // - Salons sell LP Serie Expert and Inoa at high speed, but rarely sell Paris mass haircare.
      // - GT stores sell mass items fast, but get stuck with expensive Serie Expert masks (dead stock / near expiry).
      // - MT has steady volume with occasional overstock.
      let velocity30d = 1.0;
      let onHand = 12;
      let daysToExpiry = 280;
      let stagnationDays = 12;

      const isSalonProduct = sku.brand === "L'Oréal Professionnel";

      if (outlet.type === 'salon') {
        if (isSalonProduct) {
          velocity30d = Math.round((2.0 + (i % 3) * 1.2) * 10) / 10;
          onHand = Math.round(velocity30d * 14); // lean 14-day stock
          daysToExpiry = 240 + (i * 25);
          stagnationDays = Math.max(2, Math.round(15 - velocity30d * 4));
        } else {
          // Salons don't push mass market Paris items
          velocity30d = 0.2;
          onHand = 6;
          daysToExpiry = 120 + i * 20;
          stagnationDays = 35 + (i * 4);
        }
      } else if (outlet.type === 'gt') {
        if (isSalonProduct) {
          // GT often gets dumped premium stock that lingers on back-shelf (classic case scenario)
          if (i === 1 || i === 2) {
            // Vitamino Color Mask or Mythic Oil: stagnant on shelf!
            velocity30d = 0.08;
            onHand = 16;
            daysToExpiry = 48 + (outlet.code.charCodeAt(4) % 35); // <= 90 days! RED
            stagnationDays = 68; // > 60 days! RED
          } else {
            velocity30d = 0.3;
            onHand = 10;
            daysToExpiry = 160;
            stagnationDays = 38; // AMBER
          }
        } else {
          // Mass market products sell well in GT
          velocity30d = 1.8 + (i % 2) * 0.8;
          onHand = 20;
          daysToExpiry = 320;
          stagnationDays = 5;
        }
      } else {
        // Modern Trade
        velocity30d = 2.2 + (i % 4) * 0.5;
        onHand = 35;
        daysToExpiry = 220;
        stagnationDays = 8;
      }

      const doi = Math.round(onHand / Math.max(velocity30d, 0.05));
      const evalResult = evaluateRiskBand({
        daysToExpiry,
        stagnationDays,
        daysOfInventory: doi,
        targetDoi: sku.targetDoi,
      });

      storeBands.push(evalResult.band);
      totalUnits += onHand;

      if (evalResult.band === 'RED') {
        redCount++;
        valueAtRiskInr += onHand * sku.mrpInr;
      } else if (evalResult.band === 'AMBER') {
        amberCount++;
      } else {
        greenCount++;
      }

      batches.push({
        batchId: `batch-${outlet.code}-${sku.skuCode}`,
        storeId: outlet.code,
        storeCode: outlet.code,
        storeName: outlet.name,
        storeType: outlet.type,
        skuId: sku.id,
        skuName: sku.name,
        batchCode,
        mrpInr: sku.mrpInr,
        onHandUnits: onHand,
        velocity30d,
        daysOfInventory: doi,
        daysToExpiry,
        stagnationDays,
        band: evalResult.band,
        reason: evalResult.reason,
        recommendedAction: evalResult.recommendedAction,
      });
    }

    const freshnessScore = calculateStoreFreshness(storeBands);
    storeSummaries.push({
      code: outlet.code,
      name: outlet.name,
      type: outlet.type.toUpperCase(),
      freshnessScore,
      redCount,
      amberCount,
      greenCount,
      totalUnits,
      valueAtRiskInr,
    });
  }

  return { outlets: OUTLETS_SEED, catalog: CATALOG, batches, storeSummaries };
}

// Execute simulation run
const data = generateTerritoryData();

// Find sample lateral swap match between GT and nearby Salon
const redBatches = data.batches.filter((b) => b.band === 'RED');
const candidateOutlets = OUTLETS_SEED.map((o) => {
  const storeBatches = data.batches.filter((b) => b.storeCode === o.code);
  const avgVelocity =
    storeBatches.reduce((acc, b) => acc + b.velocity30d, 0) / storeBatches.length;
  const avgDoi =
    storeBatches.reduce((acc, b) => acc + b.daysOfInventory, 0) / storeBatches.length;

  return {
    storeId: o.code,
    storeName: o.name,
    storeType: o.type,
    lat: o.lat,
    lng: o.lng,
    currentVelocity30d: avgVelocity,
    currentDoi: avgDoi,
  };
});

let sampleSwapRecommendation = null;
if (redBatches.length > 0) {
  const donorBatch = redBatches[0];
  const donorStore = OUTLETS_SEED.find((o) => o.code === donorBatch.storeCode)!;
  const matches = rankSwapCandidates(
    { lat: donorStore.lat, lng: donorStore.lng, velocity30d: donorBatch.velocity30d },
    candidateOutlets.filter((c) => c.storeId !== donorStore.code),
    6.0
  );

  sampleSwapRecommendation = {
    donor: {
      store: donorStore.name,
      sku: donorBatch.skuName,
      unitsAtRisk: donorBatch.onHandUnits,
      expiryDays: donorBatch.daysToExpiry,
      currentVelocity: donorBatch.velocity30d,
    },
    topRecipient: matches[0] || null,
  };
}

// Summary statistics
const totalBatches = data.batches.length;
const totalRed = data.batches.filter((b) => b.band === 'RED').length;
const totalAmber = data.batches.filter((b) => b.band === 'AMBER').length;
const totalGreen = data.batches.filter((b) => b.band === 'GREEN').length;
const totalValueAtRisk = data.storeSummaries.reduce((acc, s) => acc + s.valueAtRiskInr, 0);

const outputDir = path.join(__dirname, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'territory-snapshot.json'),
  JSON.stringify({ ...data, sampleSwapRecommendation }, null, 2),
  'utf-8'
);

console.log('================================================================');
console.log("  VeloCity AI — Synthetic Territory Seed Simulation (40 Outlets)");
console.log('================================================================');
console.log(`Territory: Mumbai Western Suburbs & South Zone (Bandra, Juhu, Khar, Andheri, BKC)`);
console.log(`Total Outlets:           ${OUTLETS_SEED.length} (15 Salons, 18 General Trade, 7 Modern Trade)`);
console.log(`Catalog SKUs:            ${CATALOG.length} L'Oréal Professional & Consumer SKUs`);
console.log(`Total Monitored Batches: ${totalBatches}`);
console.log(`----------------------------------------------------------------`);
console.log(`Tri-Band Distribution:`);
console.log(`  🟢 Healthy (GREEN):    ${totalGreen} (${Math.round((totalGreen / totalBatches) * 100)}%)`);
console.log(`  🟡 Attention (AMBER):  ${totalAmber} (${Math.round((totalAmber / totalBatches) * 100)}%)`);
console.log(`  🔴 Critical (RED):     ${totalRed} (${Math.round((totalRed / totalBatches) * 100)}%)`);
console.log(`Total Stock Value at Risk: ₹${totalValueAtRisk.toLocaleString('en-IN')}`);
console.log('----------------------------------------------------------------');
if (sampleSwapRecommendation && sampleSwapRecommendation.topRecipient) {
  console.log(`Sample Lateral StockSwap Recommendation:`);
  console.log(`  Donor Store:    ${sampleSwapRecommendation.donor.store}`);
  console.log(`  At-Risk SKU:    ${sampleSwapRecommendation.donor.sku} (${sampleSwapRecommendation.donor.unitsAtRisk} units, ${sampleSwapRecommendation.donor.expiryDays}d to expiry)`);
  console.log(`  Matched Outlet: ${sampleSwapRecommendation.topRecipient.storeName} (${sampleSwapRecommendation.topRecipient.distanceKm} km away)`);
  console.log(`  Velocity Gain:  ${sampleSwapRecommendation.topRecipient.velocityMultiplier}x sell-through speed`);
  console.log(`  Rescue Score:   ${sampleSwapRecommendation.topRecipient.score}/100`);
}
console.log('----------------------------------------------------------------');
console.log(`✓ Seed territory snapshot saved to: simulation/data/territory-snapshot.json`);
console.log('================================================================\n');
