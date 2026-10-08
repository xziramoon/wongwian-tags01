import type { Config } from './types';

/* ⚠️ ห้ามแก้ — ยกมาจาก wongwian-ui.html ตรงตัวตาม README */
export const CLOUD_DB_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUuWPCwpQbleOg8F8Kyt34obiUG15BuUuHJvRfo_I5GSqlCPp638EqDUgcqHG0igWkg9g6ko7h9hYS/pub?gid=2051624344&single=true&output=csv';
export const SHEET_EDIT_URL =
  'https://docs.google.com/spreadsheets/d/1-s82oHNNDUjwPyrkgSWP-YO2EHgVKK52-HV_FMh_wul/edit?gid=857533628#gid=857533628';
/* Ably realtime — used only for the print-tags bridge (src/lib/printBridge.ts +
 * public/TAG_PRINTER.html). Replaces the old public MQTT broker (broker.emqx.io)
 * so that link only ever needs outbound wss on port 443, which normal shop/office
 * Wi-Fi never blocks. Key is scoped to publish+subscribe only. */
export const ABLY_API_KEY = '8nH3AQ.PvSlnw:CWEkBBL-RYpuLLgRyfLQIxivigFmhnbd2EzDD3oZvh8';
export const PRINT_TAGS_CHANNEL = 'branch-nuea-print-tags';
export const PRINT_EVENT_NAME = 'print';
/* v2 adds batchId/batchIndex/batchTotal so large queues can be split across several
 * Ably messages — a single message is capped at 64KB and a big queue used to blow past
 * that silently. TAG_PRINTER.html treats batchTotal<=1 (or missing) as a single-shot
 * payload, so it stays compatible with anything still sending the old v1 shape. */
export const PRINT_PAYLOAD_VERSION = 2;
/* keep each published message safely under Ably's ~64KB cap */
export const PRINT_BATCH_MAX_BYTES = 48 * 1024;

/* MQTT (broker.emqx.io) — kept for the barcode-scanner feed (src/lib/scanner.ts).
 * The external scanner hardware/gateway publishes over MQTT, so this side stays
 * as-is; only the print-tags bridge above moved to Ably. */
export const AUTO_SYNC_TOPIC = 'cyborg-tag-sys-wongwian-v8';
export const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 min background price check

export const QUEUE_STORAGE_KEY = 'wongwianQueue_v9';
export const QUEUE_STORAGE_KEY_LEGACY = 'wongwianQueue';
export const CONFIG_STORAGE_KEY = 'wongwianConfig_v9';
export const CONFIG_STORAGE_KEY_LEGACY = 'wongwianConfig';

export interface SliderDef {
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
}

/* Slider definitions (label, min, max, step, unit, default) */
export const SLIDER_DEFS: Record<string, SliderDef> = {
  w: { label: 'W (cm)', min: 2, max: 15, step: 0.1, def: 5.4 },
  h: { label: 'H (cm)', min: 2, max: 15, step: 0.1, def: 4.0 },
  bcHeight: { label: 'BARCODE HEIGHT', min: 10, max: 60, step: 1, def: 24 },
  globalNameSz: { label: 'NAME (0=Auto)', min: 0, max: 40, step: 1, def: 0 },
  priceSz: { label: 'PRICE 1', min: 10, max: 100, step: 1, def: 46 },
  dualSz: { label: 'DUAL / WHOLESALE', min: 10, max: 80, step: 1, def: 28 },
  metaSz: { label: 'META INFO', min: 6, max: 24, step: 1, def: 10 },
  ribbonSz: { label: 'RIBBON SIZE', min: 6, max: 24, step: 1, def: 10 },
  ribbonX: { label: 'RIBBON OFFSET X', min: -100, max: 100, step: 1, def: -32 },
  ribbonY: { label: 'RIBBON OFFSET Y', min: -100, max: 100, step: 1, def: 15 },
  largeW: { label: 'LARGE W (cm)', min: 5, max: 20, step: 0.1, def: 11.4 },
  largeH: { label: 'LARGE H (cm)', min: 3, max: 15, step: 0.1, def: 6.0 },
  bcHeightLrg: { label: 'LARGE BC HEIGHT', min: 10, max: 80, step: 1, def: 35 },
  oosW: { label: 'OOS W (cm)', min: 2, max: 15, step: 0.1, def: 5.4 },
  oosH: { label: 'OOS H (cm)', min: 0.8, max: 4, step: 0.1, def: 1.4 },
  oosSz: { label: 'OOS TEXT', min: 10, max: 40, step: 1, def: 22 },
};

export const SIZE_PRESETS: Record<string, Partial<Config>> = {
  S: { w: 3.0, h: 2.5, bcHeight: 18 },
  M: { w: 5.4, h: 4.0, bcHeight: 24 },
  L: { w: 8.0, h: 6.0, bcHeight: 30 },
  XL: { largeW: 11.4, largeH: 6.0, bcHeightLrg: 35 },
};

export const DEFAULT_CONFIG: Config = {
  header: 'ร้านวงเวียน',
  font: "'Kanit',sans-serif",
  labelSize: 'ขนาด',
  labelUnit: 'บรรจุ',
  labelRetail: 'ปลีก',
  invertBaht: true,
  w: SLIDER_DEFS.w.def,
  h: SLIDER_DEFS.h.def,
  bcHeight: SLIDER_DEFS.bcHeight.def,
  globalNameSz: SLIDER_DEFS.globalNameSz.def,
  priceSz: SLIDER_DEFS.priceSz.def,
  dualSz: SLIDER_DEFS.dualSz.def,
  metaSz: SLIDER_DEFS.metaSz.def,
  ribbonSz: SLIDER_DEFS.ribbonSz.def,
  ribbonX: SLIDER_DEFS.ribbonX.def,
  ribbonY: SLIDER_DEFS.ribbonY.def,
  largeW: SLIDER_DEFS.largeW.def,
  largeH: SLIDER_DEFS.largeH.def,
  bcHeightLrg: SLIDER_DEFS.bcHeightLrg.def,
  oosW: SLIDER_DEFS.oosW.def,
  oosH: SLIDER_DEFS.oosH.def,
  oosSz: SLIDER_DEFS.oosSz.def,
  labelOos: 'สินค้าหมด',
  labelStop: 'เลิกจำหน่าย',
  priceFont: '',
  priceInk: 'black',
  inkTilt: false,
  headerCN: '',
  tagTheme: 'classic',
  headerSub: '',
  branchLabel: '',
};

/* ฟอนต์ตัวเลขราคา — หมึกพู่กันญี่ปุ่น/จีน (โหลดจาก Google Fonts ใน index.html และ TAG_PRINTER.html) */
export const PRICE_FONTS: { value: string; label: string }[] = [
  { value: '', label: 'ค่าเริ่มต้น (ป้ายเดิม = ฟอนต์ตัวหนังสือ · ธีม = ฟอนต์ของธีม)' },
  { value: "'Potta One',cursive", label: 'J1 · Potta One — พู่กันหนา' },
  { value: "'Yuji Boku',serif", label: 'J2 · Yuji Boku — พู่กันแห้ง' },
  { value: "'Yuji Syuku',serif", label: 'J3 · Yuji Syuku — ลายมือพู่กัน' },
  { value: "'Yuji Mai',serif", label: 'J4 · Yuji Mai — พู่กันอ่อนช้อย' },
  { value: "'Zen Kurenaido',sans-serif", label: 'J5 · Zen Kurenaido — ปากกาพู่กัน' },
  { value: "'Reggae One',cursive", label: 'J6 · Reggae One — หมึกขอบขรุขระ' },
  { value: "'Ma Shan Zheng',cursive", label: 'พู่กันจีน · Ma Shan Zheng' },
  { value: "'Black Han Sans',sans-serif", label: 'K1 · Black Han Sans — ตัวหนาเกาหลี' },
];
export const INK_RED = '#C0141C';
export const THEME_ACCENT = '#B3261E';

/* ค่าตั้งสำเร็จรูปของธีม — กดปุ่มในหน้าตั้งค่าแล้วใส่ให้ครบทีเดียว */
export const THEME_PRESETS: Record<string, Partial<Config>> = {
  korean: { tagTheme: 'korean', header: 'อึ้งลักเส็ง', headerCN: '黄六盛', headerSub: 'ซุปเปอร์มาร์เก็ต', branchLabel: 'สาขาวงเวียน' },
  ink: { tagTheme: 'ink', header: 'อึ้งลักเส็ง', headerCN: '黄六盛', headerSub: 'ซุปเปอร์มาร์เก็ต', branchLabel: 'สาขาวงเวียน' },
};
