import type { Product, QueueItem } from '../types';
import { database } from '../lib/database';
import { extractSize, priceEq } from '../lib/utils';
import { DEFAULT_PACK_LABEL, type FlipSettings } from './config';

/* ข้อมูลที่ตัวป้าย/แถบใช้วาด — สร้างจากรายการในคิว หรือจากสินค้าในฐานข้อมูล */
export interface FlipData {
  barcode: string;
  name: string;
  size: string;
  price: string;
  pack: string;
  label: string; // ข้อความนำหน้าราคาแพ็ก เช่น "ยกลัง" (เก็บไว้สร้าง pack ใหม่ตอนราคาเปลี่ยน)
  corner: string;
  footer: string;
  lot: string;
  qty: number;
}

/* ค่าระดับสินค้าที่ผู้ใช้ override — มีคีย์ (แม้เป็น '') = ใช้ค่านั้น, ไม่มีคีย์ = อัตโนมัติ */
export interface FlipOverride {
  corner?: string;
  footer?: string;
  pack?: string;
}
export type FlipOverrides = Record<string, FlipOverride>;

export interface LastPrinted {
  price: string;
  pack: string;
  label: string;
  date: string;
  placed: boolean; // false = พิมพ์แล้วแต่ยังไม่ได้เปลี่ยนที่ชั้น
  prevPrice?: string; // ราคาที่ติดอยู่บนชั้นจริง (ก่อนพิมพ์ใบใหม่)
  prevPack?: string;
}
export interface TagPrinted {
  name: string;
  lot: string;
  date: string;
}

export const flipNum = (v: unknown): string => {
  const n = parseFloat(String(v));
  if (!isFinite(n)) return '0';
  return Number.isInteger(n)
    ? n.toLocaleString('en-US')
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* "ยกลัง 400.-" — ว่างถ้าไม่มีราคาแพ็ก (ว่าง = ซ่อนแถบดำทั้งแถบ) */
export const packText = (label: string, price2: unknown): string => {
  const n = parseFloat(String(price2));
  if (!(n > 0)) return '';
  return `${label} ${flipNum(n)}.-`;
};

export function fromQueueItem(item: QueueItem, settings: FlipSettings, ov: FlipOverride = {}): FlipData {
  const label = (item.Unit2 || '').trim() || DEFAULT_PACK_LABEL;
  return {
    barcode: item.Barcode,
    name: item.ProductName,
    size: (item.Size || '').trim(),
    price: item.Price,
    label,
    pack: ov.pack ?? packText(label, item.Price2),
    corner: ov.corner ?? settings.corner,
    footer: ov.footer ?? item.Barcode,
    lot: (item.Loc || '').trim() || database.find(item.Barcode)?.Lot || '',
    qty: Math.max(1, item.PrintQty || 1),
  };
}

export function fromProduct(p: Product, label: string, settings: FlipSettings, ov: FlipOverride = {}): FlipData {
  return {
    barcode: p.Barcode,
    name: p.ProductName,
    size: (p.Size || extractSize(p.ProductName)).trim(),
    price: p.Price,
    label,
    pack: ov.pack ?? packText(label, p.Price2),
    corner: ov.corner ?? settings.corner,
    footer: ov.footer ?? p.Barcode,
    lot: p.Lot || '',
    qty: 1,
  };
}

/* เรียงตามล็อค (เลขล็อคแบบ natural) ล็อคว่างไว้ท้าย แล้วตามชื่อ — เดินเปลี่ยนรอบเดียวจบ */
export function sortByLot<T extends { lot: string; name: string }>(items: T[]): T[] {
  const cmp = (a: string, b: string) => a.localeCompare(b, 'th', { numeric: true });
  return items.slice().sort((a, b) => {
    if (a.lot !== b.lot) {
      if (!a.lot) return 1;
      if (!b.lot) return -1;
      return cmp(a.lot, b.lot);
    }
    return cmp(a.name, b.name);
  });
}

export const chunk = <T,>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

/* ---------- รายการ "ต้องเปลี่ยนวันนี้" ---------- */
export interface TodayRow {
  kind: 'changed' | 'printed';
  data: FlipData;
  oldPrice: string;
  newPrice: string;
  oldPack: string;
  newPack: string;
}

export function computeToday(
  lastPrinted: Record<string, LastPrinted>,
  settings: FlipSettings,
  overrides: FlipOverrides,
): TodayRow[] {
  const rows: TodayRow[] = [];
  for (const [barcode, e] of Object.entries(lastPrinted)) {
    const p = database.find(barcode);
    if (!p || p.Price === '') continue;
    const ov = overrides[barcode] ?? {};
    const newPack = ov.pack ?? packText(e.label, p.Price2);
    const changed = !priceEq(e.price, p.Price) || e.pack !== newPack;
    const onShelfPrice = e.placed === false ? (e.prevPrice ?? e.price) : e.price;
    const onShelfPack = e.placed === false ? (e.prevPack ?? e.pack) : e.pack;
    if (!changed && e.placed !== false) continue;
    rows.push({
      kind: changed ? 'changed' : 'printed',
      data: fromProduct(p, e.label, settings, ov),
      oldPrice: onShelfPrice,
      newPrice: changed ? p.Price : e.price,
      oldPack: onShelfPack,
      newPack: changed ? newPack : e.pack,
    });
  }
  return sortByLot(rows.map((r) => ({ ...r, lot: r.data.lot, name: r.data.name })));
}

/* ---------- รายการ "ต้องพิมพ์ตัวป้ายถาวร" ---------- */
export interface TagRow {
  data: FlipData;
  reason: 'ใหม่' | 'เปลี่ยนชื่อ' | 'ย้ายล็อค';
}

export function computeNeedTags(
  tagsPrinted: Record<string, TagPrinted>,
  lastPrinted: Record<string, LastPrinted>,
  queueBarcodes: string[],
  settings: FlipSettings,
  overrides: FlipOverrides,
): TagRow[] {
  const barcodes = new Set([...Object.keys(lastPrinted), ...Object.keys(tagsPrinted), ...queueBarcodes]);
  const rows: TagRow[] = [];
  barcodes.forEach((b) => {
    const p = database.find(b);
    if (!p) return;
    const t = tagsPrinted[b];
    let reason: TagRow['reason'] | null = null;
    if (!t) reason = 'ใหม่';
    else if (t.name !== p.ProductName) reason = 'เปลี่ยนชื่อ';
    else if ((t.lot || '') !== (p.Lot || '')) reason = 'ย้ายล็อค';
    if (!reason) return;
    const label = lastPrinted[b]?.label || DEFAULT_PACK_LABEL;
    rows.push({ reason, data: fromProduct(p, label, settings, overrides[b] ?? {}) });
  });
  return sortByLot(rows.map((r) => ({ ...r, lot: r.data.lot, name: r.data.name })));
}
