import { useUIStore } from '../store/uiStore';
import { useQueueStore } from '../store/queueStore';
import { printBridge } from '../lib/printBridge';
import { getFlipSettings, useFlipStore, type FlipPrintKind } from './store';
import type { FlipData } from './data';

const PAGE_STYLE_ID = 'flip-page-style';
const raf = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/* พิมพ์ A4 ตามข้อ 6 ของสเปก: ติด @page 5 มม. ชั่วคราว → พิมพ์ → คืนค่า
 * แล้วบันทึกประวัติการพิมพ์ (lastPrinted / tagsPrinted) หลัง afterprint */
export async function printFlip(kind: FlipPrintKind, items: FlipData[]) {
  const toast = useUIStore.getState().showToast;
  if (!items.length) {
    toast('ยังไม่มีป้ายดำแดงให้พิมพ์', 'error');
    return;
  }
  const store = useFlipStore.getState();
  store.setJob({ kind, items });
  await raf(); // รอ React วาดแผ่นพิมพ์ + คำนวณขนาดข้อความ
  try {
    await document.fonts.ready;
    await raf();
  } catch {
    /* เบราว์เซอร์เก่าไม่มี document.fonts */
  }

  const style = document.createElement('style');
  style.id = PAGE_STYLE_ID;
  style.textContent = '@page { size: A4; margin: 5mm; }';
  document.head.appendChild(style);
  document.body.classList.add('print-flip');

  const done = () => {
    window.removeEventListener('afterprint', done);
    document.body.classList.remove('print-flip');
    document.getElementById(PAGE_STYLE_ID)?.remove();
    const s = useFlipStore.getState();
    if (kind !== 'tags') s.markStripsPrinted(items);
    if (kind !== 'strips') s.markTagsPrinted(items);
    s.setJob(null);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

/* ส่งงานป้ายดำแดงไปเครื่องพิมพ์ปลายทาง (TAG_PRINTER.html) — บันทึกประวัติเมื่อส่งสำเร็จ */
export async function sendFlipRemote(kind: FlipPrintKind, items: FlipData[]) {
  const toast = useUIStore.getState().showToast;
  if (!items.length) {
    toast('ยังไม่มีป้ายดำแดงให้ส่งพิมพ์', 'error');
    return;
  }
  const settings = getFlipSettings();
  try {
    await printBridge.publishFlip(useQueueStore.getState().config, { kind, settings, items });
  } catch {
    toast('ส่งพิมพ์ไม่สำเร็จ — เช็คอินเทอร์เน็ต', 'error');
    return;
  }
  const s = useFlipStore.getState();
  if (kind !== 'tags') s.markStripsPrinted(items);
  if (kind !== 'strips') s.markTagsPrinted(items);
  toast('ส่งป้ายดำแดงไปเครื่องพิมพ์ปลายทางแล้ว ✓', 'success');
}
