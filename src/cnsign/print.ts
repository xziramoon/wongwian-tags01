import { useUIStore } from '../store/uiStore';
import { useQueueStore } from '../store/queueStore';
import { useHistoryStore } from '../store/historyStore';
import { printBridge } from '../lib/printBridge';
import type { QueueItem } from '../types';
import type { CnOrient } from './config';
import { CN_COLOR_TESTS, type CnSignSettings } from './config';
import { cnPageCount, colorTestSample, splitByOrient, type CnSignData } from './data';
import { getCnSettings, useCnStore } from './store';

const PAGE_STYLE_ID = 'cnsign-page-style';
const raf = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const ORIENTS: CnOrient[] = ['portrait', 'landscape'];

/* พิมพ์ทีละแนวกระดาษ (@page ใช้ได้ทีละแนว): ใส่ @page ชั่วคราว → window.print() → คืนค่าใน afterprint — ยึดโครง flip/print.ts */
function printOrient(orient: CnOrient, items: CnSignData[], settings?: CnSignSettings): Promise<void> {
  return new Promise((resolve) => {
    useCnStore.getState().setJob({ orient, items, settings });
    raf()
      .then(async () => {
        try {
          await document.fonts.ready;
          await raf();
        } catch {
          /* เบราว์เซอร์เก่าไม่มี document.fonts */
        }
        const style = document.createElement('style');
        style.id = PAGE_STYLE_ID;
        style.textContent = `@page { size: A4 ${orient}; margin: 5mm; }`;
        document.head.appendChild(style);
        document.body.classList.add('print-cnsign');
        const done = () => {
          window.removeEventListener('afterprint', done);
          document.body.classList.remove('print-cnsign');
          document.getElementById(PAGE_STYLE_ID)?.remove();
          useCnStore.getState().setJob(null);
          resolve();
        };
        window.addEventListener('afterprint', done);
        window.print();
      })
      .catch(() => resolve());
  });
}

export async function printCnSign(items: CnSignData[], source: QueueItem[]) {
  const toast = useUIStore.getState().showToast;
  if (!items.length) {
    toast('ยังไม่มีป้ายจีน A4 ให้พิมพ์ — เลือกแบบ "ป้ายจีน A4" ให้สินค้าในคิวก่อน', 'error');
    return;
  }
  const groups = splitByOrient(items);
  for (const o of ORIENTS) {
    if (groups[o].length) await printOrient(o, groups[o]);
  }
  useHistoryStore.getState().logPrint('local', source);
}

/* ส่งไปเครื่องพิมพ์ปลายทาง (TAG_PRINTER.html) — แยกงานตามแนวกระดาษ เครื่องปลายทางพิมพ์ทีละงาน */
export async function sendCnSignRemote(items: CnSignData[], source: QueueItem[]) {
  const toast = useUIStore.getState().showToast;
  if (!items.length) {
    toast('ยังไม่มีป้ายจีน A4 ให้ส่งพิมพ์ — เลือกแบบ "ป้ายจีน A4" ให้สินค้าในคิวก่อน', 'error');
    return;
  }
  const groups = splitByOrient(items);
  try {
    for (const o of ORIENTS) {
      if (groups[o].length) {
        await printBridge.publishCnSign(useQueueStore.getState().config, { orient: o, settings: getCnSettings(), items: groups[o] });
      }
    }
  } catch {
    toast('ส่งพิมพ์ไม่สำเร็จ — เช็คอินเทอร์เน็ต', 'error');
    return;
  }
  useHistoryStore.getState().logPrint('remote', source);
  toast(`ส่งป้ายจีน A4 ${cnPageCount(items)} แผ่นไปเครื่องพิมพ์ปลายทางแล้ว ✓`, 'success');
}

/* ใบทดสอบสี: ปริ้นป้ายตัวอย่างทุกแบบใน CN_COLOR_TESTS ใบละแบบ (ที่เครื่องนี้) */
export async function printCnColorTests() {
  const base = getCnSettings();
  for (const t of CN_COLOR_TESTS) {
    await printOrient('portrait', [colorTestSample(t.label)], { ...base, ink: t.ink, red: t.red ?? base.red });
  }
}

/* ส่งใบทดสอบสีไปเครื่องพิมพ์ปลายทาง (ตัวรับ TAG_PRINTER) — ใบละแบบ */
export async function sendCnColorTests() {
  const toast = useUIStore.getState().showToast;
  const base = getCnSettings();
  try {
    for (const t of CN_COLOR_TESTS) {
      await printBridge.publishCnSign(useQueueStore.getState().config, {
        orient: 'portrait',
        settings: { ...base, ink: t.ink, red: t.red ?? base.red },
        items: [colorTestSample(t.label)],
      });
    }
  } catch {
    toast('ส่งพิมพ์ไม่สำเร็จ — เช็คอินเทอร์เน็ต', 'error');
    return;
  }
  toast(`ส่งใบทดสอบสี ${CN_COLOR_TESTS.length} แผ่นไปเครื่องพิมพ์ปลายทางแล้ว ✓`, 'success');
}
