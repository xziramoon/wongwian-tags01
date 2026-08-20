import { create } from 'zustand';
import type { QueueItem } from '../types';

export type PrintSource = 'remote' | 'local';

export interface HistoryItemSummary {
  Barcode: string;
  ProductName: string;
  PrintQty: number;
}

export interface HistoryEntry {
  id: string;
  ts: number;
  source: PrintSource;
  itemCount: number;
  tagCount: number;
  items: HistoryItemSummary[];
}

const HISTORY_STORAGE_KEY = 'wongwianPrintHistory_v1';
const MAX_HISTORY_ENTRIES = 200;

function loadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as HistoryEntry[];
  } catch {
    /* corrupted storage — start empty */
  }
  return [];
}

function persist(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

interface HistoryState {
  entries: HistoryEntry[];
  logPrint: (source: PrintSource, items: QueueItem[]) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: loadHistory(),

  logPrint: (source, items) => {
    if (!items.length) return;
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      source,
      itemCount: items.length,
      tagCount: items.reduce((sum, i) => sum + (i.PrintQty || 1), 0),
      items: items.map((i) => ({ Barcode: i.Barcode, ProductName: i.ProductName, PrintQty: i.PrintQty })),
    };
    set((s) => {
      const entries = [entry, ...s.entries].slice(0, MAX_HISTORY_ENTRIES);
      persist(entries);
      return { entries };
    });
  },

  clearHistory: () => {
    if (!confirm('ล้างประวัติการพิมพ์ทั้งหมด?')) return;
    persist([]);
    set({ entries: [] });
  },
}));
