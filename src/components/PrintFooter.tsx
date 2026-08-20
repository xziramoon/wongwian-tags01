import { useState } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import { useHistoryStore } from '../store/historyStore';
import { printBridge } from '../lib/printBridge';

export default function PrintFooter() {
  const queue = useQueueStore((s) => s.queue);
  const config = useQueueStore((s) => s.config);
  const clearQueue = useQueueStore((s) => s.clearQueue);
  const showToast = useUIStore((s) => s.showToast);
  const logPrint = useHistoryStore((s) => s.logPrint);
  const [sending, setSending] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');

  const handleLocalPrint = () => {
    if (queue.length) logPrint('local', queue);
    window.print();
  };

  const handleSendRemote = async () => {
    if (!queue.length) {
      showToast('ยังไม่มีป้ายในคิว — สแกน/ค้นหาสินค้าเข้ามาก่อน', 'error');
      return;
    }
    setSending(true);
    setProgressLabel('');
    try {
      await printBridge.publish(config, queue, (sent, total) => {
        if (total > 1) setProgressLabel(`${sent}/${total}`);
      });
      showToast('ส่งพิมพ์ไปเครื่องพิมพ์ปลายทางแล้ว ✓', 'success');
      logPrint('remote', queue);
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
