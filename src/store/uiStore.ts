import { create } from 'zustand';
import type { DiffItem, ToastType } from '../types';

export interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

export type StatusColor = 'txt' | 'o' | 'g' | 'r';
export type MqttStatusColor = 'o' | 'g' | 'r';

let toastSeq = 0;

interface UIState {
  toasts: Toast[];
  showToast: (msg: string, type?: ToastType) => void;
  removeToast: (id: number) => void;

  statusColor: StatusColor;
  setStatus: (color: StatusColor) => void;

  mqttStatus: MqttStatusColor;
  setMqttStatus: (color: MqttStatusColor) => void;

  selectedTagIndex: number;
  selectTag: (index: number) => void;
  clearSelection: () => void;

  searchDropOpen: boolean;
  setSearchDropOpen: (open: boolean) => void;

  syncModalOpen: boolean;
  syncModalDiffs: DiffItem[];
  syncModalChecked: Set<number>;
  openSyncModal: (diffs: DiffItem[]) => void;
  closeSyncModal: () => void;
  toggleDiffChecked: (i: number, checked: boolean) => void;
  toggleAllDiffChecked: (checked: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  showToast: (msg, type = 'info') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  statusColor: 'txt',
  setStatus: (color) => set({ statusColor: color }),

  mqttStatus: 'o',
  setMqttStatus: (color) => set({ mqttStatus: color }),

  selectedTagIndex: -1,
  selectTag: (index) => {
    set({ selectedTagIndex: index });
    requestAnimationFrame(() => {
      document.getElementById(`q-item-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  },
  clearSelection: () => set({ selectedTagIndex: -1 }),

  searchDropOpen: false,
  setSearchDropOpen: (open) => set({ searchDropOpen: open }),

  syncModalOpen: false,
  syncModalDiffs: [],
  syncModalChecked: new Set(),
  openSyncModal: (diffs) =>
    set({
      syncModalOpen: true,
      syncModalDiffs: diffs,
      syncModalChecked: new Set(diffs.map((_, i) => i)),
    }),
  closeSyncModal: () => set({ syncModalOpen: false, syncModalDiffs: [], syncModalChecked: new Set() }),
  toggleDiffChecked: (i, checked) =>
    set((s) => {
      const next = new Set(s.syncModalChecked);
      if (checked) next.add(i);
      else next.delete(i);
      return { syncModalChecked: next };
    }),
  toggleAllDiffChecked: (checked) =>
    set((s) => ({
      syncModalChecked: checked ? new Set(s.syncModalDiffs.map((_, i) => i)) : new Set(),
    })),
}));
