import { useQueueStore } from '../store/queueStore';
import { fromQueueItem } from './data';
import { FlipStrip, FlipTag } from './FlipTag';
import { useFlipSettings, useFlipStore } from './store';

/* พรีวิวบนจอของรายการที่เลือกแบบ "ป้ายดำแดง" — ตัวป้าย + แถบกางออก (ไม่ถูกพิมพ์ตอนกดพิมพ์ป้ายปกติ) */
export default function FlipPreview() {
  const queue = useQueueStore((s) => s.queue);
  const settings = useFlipSettings();
  const overrides = useFlipStore((s) => s.overrides);

  const items = queue.filter((i) => i.TagMode === 'flip');
  if (!items.length) return null;

  return (
    <div id="flip-area">
      <div className="flip-area-title">ป้ายดำแดง (แถบพลิก) · พิมพ์จากเมนู "ป้ายดำแดง" ด้านซ้าย</div>
      {items.map((item) => {
        const d = fromQueueItem(item, settings, overrides[item.Barcode]);
        return (
          <div key={item.Barcode} className="flip-area-row">
            <div className="flip-mm">
              <FlipTag data={d} settings={settings} />
              <span className="flip-cap">ตัวป้ายถาวร 90 × 40 มม.</span>
            </div>
            <div className="flip-mm">
              <FlipStrip data={d} settings={settings} />
              <span className="flip-cap">แถบราคา หน้า | หลัง (พับตามเส้นประ) × {d.qty}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
