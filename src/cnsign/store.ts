import { useMemo } from 'react';
import { create } from 'zustand';
import { useQueueStore } from '../store/queueStore';
import { CN_KEYS, DEFAULT_CN_SETTINGS, type CnOrient, type CnSignSettings } from './config';
import type { CnSignData } from './data';

function loadSettings(): CnSignSettings {
  try {
    const raw = localStorage.getItem(CN_KEYS.settings);
    if (raw) return { ...DEFAULT_CN_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* storage เสีย/ถูกบล็อก — ใช้ค่าเริ่มต้น */
  }
  return DEFAULT_CN_SETTINGS;
}
function saveSettings(s: CnSignSettings) {
  try {
    localStorage.setItem(CN_KEYS.settings, JSON.stringify(s));
  } catch {
    /* ไม่ให้การบันทึกล้มทำให้แอปพัง */
  }
}

export interface CnJob {
  orient: CnOrient;
  items: CnSignData[];
  settings?: CnSignSettings; // ใบทดสอบสี: ตั้งค่าเฉพาะงาน (ว่าง = ตามตั้งค่าปัจจุบัน)
}

interface CnState {
  settings: CnSignSettings;
  job: CnJob | null;
  updateSetting: <K extends keyof CnSignSettings>(key: K, value: CnSignSettings[K]) => void;
  resetSettings: () => void;
  setJob: (job: CnJob | null) => void;
}

export const useCnStore = create<CnState>((set) => ({
  settings: loadSettings(),
  job: null,
  updateSetting: (key, value) =>
    set((st) => {
      const settings = { ...st.settings, [key]: value };
      saveSettings(settings);
      return { settings };
    }),
  resetSettings: () => {
    saveSettings(DEFAULT_CN_SETTINGS);
    set({ settings: DEFAULT_CN_SETTINGS });
  },
  setJob: (job) => set({ job }),
}));

/* ตั้งค่าที่ใช้วาด: โหมดขาว-ดำของป้ายจีนเอง หรือของทั้งแอป (config.printMono) อย่างใดอย่างหนึ่ง */
export function useCnSettings(): CnSignSettings {
  const s = useCnStore((st) => st.settings);
  const printMono = useQueueStore((st) => st.config.printMono);
  return useMemo(() => (printMono && !s.mono ? { ...s, mono: true } : s), [s, printMono]);
}

export const getCnSettings = (): CnSignSettings => {
  const s = useCnStore.getState().settings;
  return useQueueStore.getState().config.printMono && !s.mono ? { ...s, mono: true } : s;
};
