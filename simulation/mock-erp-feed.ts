/**
 * VeloCity AI — Mock ERP / SAP Nightly Feed Generator
 * 
 * Simulates nightly batch movement synchronization between L'Oréal SAP ERP
 * and the VeloCity Cloud Layer (§3 System Architecture & §13 PoC Strategy).
 * Generates structured movement CSVs representing depot inward dispatches and POS sell-throughs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ErpRow {
  transactionId: string;
  timestamp: string;
  plantCode: string;
  storeCode: string;
  skuCode: string;
  batchCode: string;
  movementType: '101_DEPOT_INWARD' | '201_POS_SALE' | '651_RETURN_DAMAGE';
  quantityDelta: number;
  closingStock: number;
  expiryDate: string;
}

export function generateDailyErpFeed(targetDate = new Date().toISOString().slice(0, 10)) {
  const snapshotPath = path.join(__dirname, 'data', 'territory-snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    throw new Error('Please run simulation/seed.ts first to generate territory data.');
  }

  const territoryData = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
  const rows: ErpRow[] = [];

  let txCounter = 10001;

  for (const batch of territoryData.batches.slice(0, 80)) {
    // 1. Simulate POS retail sell-through
    const unitsSold = Math.max(1, Math.round(batch.velocity30d));
    const newClosing = Math.max(0, batch.onHandUnits - unitsSold);

    rows.push({
      transactionId: `SAP-TX-${txCounter++}`,
      timestamp: `${targetDate}T19:30:00Z`,
      plantCode: 'IN01_BHIWANDI_WH',
      storeCode: batch.storeCode,
      skuCode: batch.skuId,
      batchCode: batch.batchCode,
      movementType: '201_POS_SALE',
      quantityDelta: -unitsSold,
      closingStock: newClosing,
      expiryDate: new Date(Date.now() + batch.daysToExpiry * 86400000).toISOString().slice(0, 10),
    });

    // 2. Replenishment inward dispatch for high-velocity salon batches
    if (batch.storeType === 'salon' && batch.band === 'GREEN' && batch.daysOfInventory < 14) {
      const dispatchQty = 24;
      rows.push({
        transactionId: `SAP-TX-${txCounter++}`,
        timestamp: `${targetDate}T22:15:00Z`,
        plantCode: 'IN01_BHIWANDI_WH',
        storeCode: batch.storeCode,
        skuCode: batch.skuId,
        batchCode: `B26-INW-${batch.skuId.slice(-4)}-${txCounter}`,
        movementType: '101_DEPOT_INWARD',
        quantityDelta: dispatchQty,
        closingStock: newClosing + dispatchQty,
        expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      });
    }
  }

  // Write CSV
  const csvHeaders = 'transaction_id,timestamp,plant_code,store_code,sku_code,batch_code,movement_type,delta,closing_stock,expiry_date';
  const csvLines = rows.map(
    (r) =>
      `${r.transactionId},${r.timestamp},${r.plantCode},${r.storeCode},${r.skuCode},${r.batchCode},${r.movementType},${r.quantityDelta},${r.closingStock},${r.expiryDate}`
  );
  const csvContent = [csvHeaders, ...csvLines].join('\n');

  const csvPath = path.join(__dirname, 'data', 'mock-sap-feed.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');

  return { rowCount: rows.length, csvPath };
}

const result = generateDailyErpFeed();
console.log(`✓ Generated mock SAP ERP sync feed: ${result.rowCount} transactions written to ${result.csvPath}`);
