import { useState } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import { printBridge } from '../lib/printBridge';

export default function PrintFooter() {
  const queue = useQueueStore((s) => s.queue);
  const config = useQueueStore((s) => s.config);
  const clearQueue = useQueueStore((s) => s.clearQueue);
  const showToast = useUIStore((s) => s.showToast);
  const [sending, setSending] = useState(false);

  const handleSendRemote = async () => {
    if (!queue.length) {
      showToast('ยังไม่มีป้ายในคิว — สแกน/ค้นหาสินค้าเข้ามาก่อน', 'error');
      return;
    }
    setSending(true);
    try {
      await printBridge.publish(config, queue);
      showToast('ส่งพิมพ์ไปเครื่องพิมพ์ปลายทางแล้ว ✓', 'success');
    } catch {
      showToast('ส่งพิมพ์ไม่สำเร็จ — เช็คอินเทอร์เน็ต/MQTT', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sb-foot">
      <div className="foot-cap">
        <span className="step-no">3</span> เสร็จแล้วกดพิมพ์ลงกระดาษ A4
      </div>
      <button className="btn btn-print" onClick={() => window.print()}>
        ⎙ &nbsp;พิมพ์ป้ายราคา
      </button>
      <button className="btn btn-remote" onClick={handleSendRemote} disabled={sending}>
        📡 &nbsp;{sending ? 'กำลังส่ง...' : 'ส่งพิมพ์ไปเครื่องพิมพ์ปลายทาง'}
      </button>
      <button className="btn btn-clear" onClick={clearQueue}>
        ✕ ล้างรายการทั้งหมด
      </button>
    </div>
  );
}
