import { useQueueStore } from '../store/queueStore';
import { manualCheck } from '../lib/sync';
import QueueItemCard from './QueueItemCard';

export default function QueuePanel() {
  const queue = useQueueStore((s) => s.queue);
  const count = queue.reduce((sum, i) => sum + (i.PrintQty || 1), 0);

  return (
    <div className="panel">
      <div className="p-lbl">
        <span className="step-no">2</span> ตรวจรายการป้าย <span className="p-count">{count}</span>
      </div>
      <div className="queue-body">
        {queue.length === 0 ? (
          <div className="q-empty">ยังไม่มีป้าย — ยิงบาร์โค้ด หรือพิมพ์ชื่อสินค้าด้านบน</div>
        ) : (
          queue.map((item, i) => <QueueItemCard key={i} item={item} index={i} />)
        )}
      </div>
      <div className="panel-foot-btns">
        <button className="btn btn-sync" onClick={() => manualCheck()}>
          ⟳ เช็คราคาใหม่จากชีต
        </button>
      </div>
    </div>
  );
}
