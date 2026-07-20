import { create } from 'zustand';
import type { Config, DualStyle, QueueItem, TagMode } from '../types';
import {
  CONFIG_STORAGE_KEY,
  CONFIG_STORAGE_KEY_LEGACY,
  DEFAULT_CONFIG,
  QUEUE_STORAGE_KEY,
  QUEUE_STORAGE_KEY_LEGACY,
  SIZE_PRESETS,
} from '../constants';
import { audioEngine } from '../lib/audio';
import { database } from '../lib/database';
import { autoFontSize, extractSize } from '../lib/utils';
import { useUIStore } from './uiStore';

/* ⚠️ ตรรกะฟิลด์เริ่มต้น (_normalize) ต้องคงเดิม เพื่อความเข้ากันได้กับข้อมูลเก่าใน localStorage */
function normalize(q: Partial<QueueItem>): QueueItem {
  return {
    Barcode: '',
    ProductName: '',
    NameFontSize: 0,
    TagMode: 'standard',
    DualStyle: 'A',
    OldPrice: '',
    Price: '0.00',
    Price2: '',
    PriceOffsetX: 0,
    Size: '',
    Unit: 'ชิ้น',
    Unit1: '',
    Unit2: '',
    PackType: '',
    Ribbon: '',
    Mfg: '',
    Exp: '',
    Image: '',
    PrintQty: 1,
    PriceDiff: null,
    ...q,
  };
}

function loadQueue(): QueueItem[] {
  try {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY) || localStorage.getItem(QUEUE_STORAGE_KEY_LEGACY);
    if (saved) return (JSON.parse(saved) as Partial<QueueItem>[]).map(normalize);
  } catch {
    /* corrupted storage — start with empty queue */
  }
  return [];
}

function loadConfig(): Config {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY) || localStorage.getItem(CONFIG_STORAGE_KEY_LEGACY);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {
    /* corrupted storage — fall back to defaults */
  }
  return { ...DEFAULT_CONFIG };
}

function persist(queue: QueueItem[], config: Config) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

interface QueueState {
  queue: QueueItem[];
  config: Config;

  updateConfig: (key: keyof Config, value: string | number | boolean) => void;
  applyPreset: (size: 'S' | 'M' | 'L' | 'XL') => void;

  updateQueueItem: (index: number, field: keyof QueueItem, value: string | number) => void;
  setDualStyle: (index: number, style: DualStyle) => void;
  changeQty: (index: number, delta: number) => void;
  remove: (index: number) => void;
  clearQueue: () => void;

  addFromBarcode: (code: string, exp?: string) => void;

  exportQueue: () => void;
  importQueue: (file: File) => void;

  flagPriceDiffs: (diffs: { idx: number; newPrice: string }[]) => void;
  applyPriceDiffs: (indices: number[]) => void;
  acceptSinglePriceDiff: (index: number) => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: loadQueue(),
  config: loadConfig(),

  updateConfig: (key, value) => {
    set((s) => {
      const config = { ...s.config, [key]: value };
      let queue = s.queue;
      if (key === 'globalNameSz') {
        const gs = parseInt(String(value), 10);
        if (gs && gs > 0) {
          queue = s.queue.map((q) => ({ ...q, NameFontSize: gs }));
        }
      }
      persist(queue, config);
      return { config, queue };
    });
  },

  applyPreset: (size) => {
    const preset = SIZE_PRESETS[size];
    if (!preset) return;
    set((s) => {
      const config = { ...s.config, ...preset };
      persist(s.queue, config);
      return { config };
    });
    useUIStore.getState().showToast(`ใช้ขนาดสำเร็จรูป [${size}] แล้ว`, 'success');
  },

  updateQueueItem: (index, field, value) => {
    set((s) => {
      const queue = s.queue.slice();
      const item = { ...queue[index], [field]: value } as QueueItem;
      if (field === 'ProductName') {
        const globalSize = parseInt(String(s.config.globalNameSz), 10);
        item.NameFontSize = globalSize && globalSize > 0 ? globalSize : autoFontSize(String(value), item.TagMode);
      }
      if (field === 'Price') item.PriceDiff = null; // manual edit clears flag
      queue[index] = item;
      persist(queue, s.config);
      return { queue };
    });
  },

  setDualStyle: (index, style) => {
    set((s) => {
      const queue = s.queue.slice();
      queue[index] = { ...queue[index], DualStyle: style };
      persist(queue, s.config);
      return { queue };
    });
  },

  changeQty: (index, delta) => {
    set((s) => {
      const queue = s.queue.slice();
      queue[index] = { ...queue[index], PrintQty: Math.max(1, queue[index].PrintQty + delta) };
      persist(queue, s.config);
      return { queue };
    });
  },

  remove: (index) => {
    set((s) => {
      const queue = s.queue.slice();
      queue.splice(index, 1);
      persist(queue, s.config);
      return { queue };
    });
  },

  clearQueue: () => {
    if (!confirm('ล้างรายการป้ายทั้งหมด?')) return;
    set((s) => {
      persist([], s.config);
      return { queue: [] };
    });
    useUIStore.getState().showToast('ล้างรายการเรียบร้อย', 'error');
  },

  addFromBarcode: (code, exp = '') => {
    code = String(code).trim();
    if (!code) return;
    const { queue, config } = get();
    const existingIdx = queue.findIndex((i) => i.Barcode === code);
    const product = database.find(code);

    if (existingIdx !== -1) {
      const next = queue.slice();
      const item = { ...next[existingIdx] };
      item.PrintQty++;
      if (exp) item.Exp = exp;
      next[existingIdx] = item;
      persist(next, config);
      set({ queue: next });
      useUIStore.getState().showToast(`+1 · ${item.ProductName}`, 'success');
      audioEngine.play('success');
    } else {
      const name = product ? product.ProductName || 'รหัส: ' + code : 'รหัส: ' + code;
      const size = product ? product.Size || extractSize(name) : extractSize(name);
      const globalSize = parseInt(String(config.globalNameSz), 10);
      const newItem = normalize({
        Barcode: code,
        ProductName: name,
        NameFontSize: globalSize && globalSize > 0 ? globalSize : autoFontSize(name),
        TagMode: 'standard' as TagMode,
        OldPrice: '',
        Price: product ? product.Price || '0.00' : '0.00',
        PriceOffsetX: 0,
        Size: size,
        Unit: product ? product.Unit || 'ชิ้น' : 'ชิ้น',
        Ribbon: '',
        Unit2: 'ยกลัง',
        Price2: product ? product.Price2 || '' : '',
        Image: product ? product.Image || '' : '',
        Mfg: '',
        Exp: exp,
        PrintQty: 1,
      });
      const next = [...queue, newItem];
      persist(next, config);
      set({ queue: next });
      if (product) {
        useUIStore.getState().showToast(`พบสินค้า · ${name}`, 'success');
        audioEngine.play('success');
      } else {
        useUIStore.getState().showToast('ไม่พบสินค้าในฐานข้อมูล · กรุณากรอกเอง', 'error');
        audioEngine.play('error');
      }
    }
  },

  exportQueue: () => {
    const { queue } = get();
    if (!queue.length) {
      useUIStore.getState().showToast('ยังไม่มีรายการป้าย', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(queue, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `TAGS_${new Date().toISOString().slice(0, 10)}.json`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    useUIStore.getState().showToast('สำรองข้อมูลเรียบร้อย', 'info');
  },

  importQueue: (file) => {
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        const arr: Partial<QueueItem>[] = Array.isArray(d)
          ? d
          : (d.items || []).map((x: Partial<QueueItem> & { Qty?: number }) => ({
              ...x,
              PrintQty: x.Qty || 1,
              TagMode: x.TagMode || 'standard',
            }));
        const queue = arr.map(normalize);
        const { config } = get();
        persist(queue, config);
        set({ queue });
        useUIStore.getState().showToast('กู้คืนข้อมูลเรียบร้อย', 'success');
      } catch {
        useUIStore.getState().showToast('ไฟล์ข้อมูลเสียหาย', 'error');
      }
    };
    r.readAsText(file);
  },

  flagPriceDiffs: (diffs) => {
    set((s) => {
      const queue = s.queue.map((item) => ({ ...item, PriceDiff: null as string | null }));
      diffs.forEach((d) => {
        queue[d.idx] = { ...queue[d.idx], PriceDiff: d.newPrice };
      });
      persist(queue, s.config);
      return { queue };
    });
  },

  applyPriceDiffs: (indices) => {
    set((s) => {
      const queue = s.queue.slice();
      indices.forEach((idx) => {
        const item = queue[idx];
        if (item && item.PriceDiff != null) {
          queue[idx] = { ...item, Price: item.PriceDiff, PriceDiff: null };
        }
      });
      persist(queue, s.config);
      return { queue };
    });
  },

  acceptSinglePriceDiff: (index) => {
    const { queue } = get();
    const item = queue[index];
    if (item && item.PriceDiff != null) {
      get().applyPriceDiffs([index]);
      useUIStore.getState().showToast('อัปเดตราคาแล้ว ✓', 'success');
      audioEngine.play('success');
    }
  },
}));
