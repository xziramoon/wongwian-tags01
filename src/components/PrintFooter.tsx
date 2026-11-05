import { useState } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import { useHistoryStore } from '../store/historyStore';
import { printBridge } from '../lib/printBridge';
import { printRank } from '../lib/fridge';
import { queueToCnData } from '../cnsign/data';
import { printCnSign, sendCnSignRemote } from '../cnsign/print';
import { getCnSettings } from '../cnsign/store';

export default function PrintFooter() {
  const queue = useQueueStore((s) => s.queue);
  const config = useQueueStore((s) => s.config);
  const clearQueue = useQueueStore((s) => s.clearQueue);
  const showToast = useUIStore((s) => s.showToast);
  const logPrint = useHistoryStore((s) => s.logPrint);
  const [sending, setSending] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');

  // ป้ายดำแดง (แถบพลิก) และป้ายจีน A4 พิมพ์/ส่งจากเมนูของมันเอง (A4 ขอบ 5 มม. คนละแบบกับป้ายทั่วไป)
  const stdQueue = queue.filter((i) => i.TagMode !== 'flip' && i.TagMode !== 'cnsign');
  // ป้ายจีน A4 ไปกับปุ่มพิมพ์/ส่งใหญ่ด้วย (พิมพ์ทีละแนวกระดาษ) — ป้ายดำแดงยังใช้เมนูของมันเอง เพราะต้องเลือกว่าพิมพ์ตัวป้าย/แถบ
  const cnQueue = queue.filter((i) => i.TagMode === 'cnsign');

  const handleLocalPrint = async () => {
    if (queue.length && !stdQueue.length && !cnQueue.length) {
      showToast('ในคิวมีแต่ป้ายดำแดง — พิมพ์จากเมนู "ป้ายดำแดง (แถบพลิก)" ด้านบน', 'error');
      return;
    }
    if (stdQueue.length) {
      logPrint('local', stdQueue);
      window.print();
    }
    if (cnQueue.length) await printCnSign(queueToCnData(queue, getCnSettings(), config), cnQueue);
  };

  const handleSendRemote = async () => {
    if (!queue.length) {
      showToast('ยังไม่มีป้ายในคิว — สแกน/ค้นหาสินค้าเข้ามาก่อน', 'error');
      return;
    }
    if (!stdQueue.length && !cnQueue.length) {
      showToast('ในคิวมีแต่ป้ายดำแดง — ใช้ปุ่ม 📡 ในเมนู "ป้ายดำแดง (แถบพลิก)" เพื่อส่งไปเครื่องปลายทาง', 'error');
      return;
    }
    setSending(true);
    setProgressLabel('');
    try {
      // แถบสินค้าหมด (oos) สูงแค่ 1.4 ซม. ไม่เท่าป้ายอื่น (4.0 ซม.) — ถ้าปนกลางแถวใน A4
      // จะเกิดช่องว่างฟันหลอ เรียงแถบไปท้ายสุดของงานพิมพ์เสมอ
      // ป้ายตู้แช่จัดเป็นแผ่น A4 ของตัวเอง (ขึ้นหน้าใหม่) ไว้ก่อนแถบสินค้าหมด
      if (stdQueue.length) {
        const ordered = [...stdQueue].sort((a, b) => printRank(a.TagMode) - printRank(b.TagMode));
        await printBridge.publish(config, ordered, (sent, total) => {
          if (total > 1) setProgressLabel(`${sent}/${total}`);
        });
        showToast('ส่งพิมพ์ไปเครื่องพิมพ์ปลายทางแล้ว ✓', 'success');
        logPrint('remote', stdQueue);
      }
      // ป้ายจีน A4 ส่งตามไปเป็นงานแยก (ตัวรับพิมพ์ A4 ทีละแนวกระดาษ) แจ้งผลเอง
      if (cnQueue.length) await sendCnSignRemote(queueToCnData(queue, getCnSettings(), config), cnQueue);
    } catch (err) {
      const reason =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message: unknown }).message)
            : '';
      showToast(`ส่งพิมพ์ไม่สำเร็จ${reason ? ` — ${reason}` : ' — เช็คอินเทอร์เน็ต'}`, 'error');
    } finally {
      setSending(false);
      setProgressLabel('');
    }
  };

  return (
    <div className="sb-foot">
      <div className="foot-cap">
        <span className="step-no">3</span> เสร็จแล้วกดพิมพ์ลงกระดาษ A4
      </div>
      <button className="btn btn-print" onClick={handleLocalPrint}>
        ⎙ &nbsp;พิมพ์ป้ายราคา
      </button>
      <button className="btn btn-remote" onClick={handleSendRemote} disabled={sending}>
        📡 &nbsp;{sending ? `กำลังส่ง...${progressLabel ? ` (${progressLabel})` : ''}` : 'ส่งพิมพ์ไปเครื่องพิมพ์ปลายทาง'}
      </button>
      <button className="btn btn-clear" onClick={clearQueue}>
        ✕ ล้างรายการทั้งหมด
      </button>
    </div>
  );
}
