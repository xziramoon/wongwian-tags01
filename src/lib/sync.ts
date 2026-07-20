import type { DiffItem } from '../types';
import { AUTO_SYNC_INTERVAL } from '../constants';
import { database } from './database';
import { audioEngine } from './audio';
import { priceEq } from './utils';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';

/* Compare queue prices to DB; returns list of diffs — mirrors SyncService.computeDiffs */
export function computeDiffs(): DiffItem[] {
  const { queue } = useQueueStore.getState();
  const diffs: DiffItem[] = [];
  queue.forEach((item, idx) => {
    const p = database.find(item.Barcode);
    if (!p) return;
    const dbPrice = p.Price;
    if (dbPrice === '' || dbPrice === undefined || dbPrice === null) return;
    if (!priceEq(item.Price, dbPrice)) {
      diffs.push({
        idx,
        barcode: item.Barcode,
        name: item.ProductName,
        oldPrice: item.Price,
        newPrice: dbPrice,
        newPrice2: p.Price2 || '',
        newUnit: p.Unit || '',
        newImage: p.Image || '',
      });
    }
  });
  return diffs;
}

export async function manualCheck() {
  const ui = useUIStore.getState();
  const { queue } = useQueueStore.getState();
  if (!queue.length) {
    ui.showToast('⚠ ยังไม่มีป้ายใน คิว — สแกน/ค้นหาสินค้าเข้ามาก่อน', 'error');
    return;
  }
  ui.showToast('กำลังซิงค์และตรวจสอบราคา...', 'info');
  try {
    await database.sync();
  } catch {
    ui.showToast('ซิงค์ฐานข้อมูลไม่สำเร็จ', 'error');
    return;
  }
  const diffs = computeDiffs();
  if (!diffs.length) {
    ui.showToast('ทุกป้ายราคาตรงกับ Sheet แล้ว ✓', 'success');
    return;
  }
  ui.openSyncModal(diffs);
  audioEngine.play('alert');
}

export async function autoCheck() {
  const { queue } = useQueueStore.getState();
  if (!queue.length) return;
  try {
    await database.sync();
  } catch {
    return;
  }
  const diffs = computeDiffs();
  if (!diffs.length) return;
  useQueueStore.getState().flagPriceDiffs(diffs);
  audioEngine.play('alert');
  useUIStore.getState().showToast(`⚠ พบ ${diffs.length} รายการราคาเปลี่ยน · กด SYNC เพื่อดู`, 'error');
}

export function startAutoSync(): () => void {
  const timer = setInterval(() => {
    autoCheck();
  }, AUTO_SYNC_INTERVAL);
  return () => clearInterval(timer);
}

export function applySelectedDiffs() {
  const ui = useUIStore.getState();
  const indices = ui.syncModalDiffs
    .filter((_, i) => ui.syncModalChecked.has(i))
    .map((d) => d.idx);
  useQueueStore.getState().applyPriceDiffs(indices);
  ui.closeSyncModal();
  ui.showToast(`อัปเดตราคา ${indices.length} รายการเรียบร้อย ✓`, 'success');
  audioEngine.play('success');
}
