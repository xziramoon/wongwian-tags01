import type { Config } from './types';

/* ⚠️ ห้ามแก้ — ยกมาจาก wongwian-ui.html ตรงตัวตาม README */
export const CLOUD_DB_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUuWPCwpQbleOg8F8Kyt34obiUG15BuUuHJvRfo_I5GSqlCPp638EqDUgcqHG0igWkg9g6ko7h9hYS/pub?gid=2051624344&single=true&output=csv';
export const SHEET_EDIT_URL =
  'https://docs.google.com/spreadsheets/d/1-s82oHNNDUjwPyrkgSWP-YO2EHgVKK52-HV_FMh_wul/edit?gid=857533628#gid=857533628';
export const AUTO_SYNC_TOPIC = 'cyborg-tag-sys-wongwian-v8';
export const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // 5 min background price check
export const PRINT_TAGS_TOPIC = 'branch-nuea-print-tags';
export const PRINT_PAYLOAD_VERSION = 1;

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
};
