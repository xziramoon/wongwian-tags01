import { useMemo } from 'react';
import { useQueueStore } from '../store/queueStore';
import { queueToFlipData } from './data';
import { FlipStripAny, FlipTagAny } from './FlipTag';
import { useFlipSettings, useFlipStore } from './store';
import { stripSize, tagSize } from './layout';
import { useDbVersion } from './useDbVersion';

/* พรีวิวบนจอของรายการที่เลือกแบบ "ป้ายดำแดง" — ตัวป้าย + แถบกางออก (ไม่ถูกพิมพ์ตอนกดพิมพ์ป้ายปกติ) */
export default function FlipPreview() {
  const queue = useQueueStore((s) => s.queue);
  const settings = useFlipSettings();
  const overrides = useFlipStore((s) => s.overrides);
  const groups = useFlipStore((s) => s.groups);
  const dbVersion = useDbVersion(); // ราคากลุ่มมาจากฐานข้อมูล

  const items = useMemo(() => queue.filter((i) => i.TagMode === 'flip'), [queue]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const list = useMemo(() => queueToFlipData(items, settings, overrides, groups), [items, settings, overrides, groups, dbVersion]);
  if (!list.length) return null;

  return (
    <div id="flip-area">
      <div className="flip-area-title">ป้ายดำแดง (แถบพลิก) · พิมพ์จากเมนู "ป้ายดำแดง" ด้านซ้าย</div>
      {list.map((d) => {
        const t = tagSize(d);
        const s = stripSize(d);
        return (
          <div key={d.barcode} className="flip-area-row">
            <div className="flip-mm">
              <FlipTagAny data={d} settings={settings} />
              <span className="flip-cap">
                {d.variant === 'group' ? 'ป้ายกลุ่ม' : d.variant === 'narrow' ? 'ป้ายแคบ' : 'ตัวป้ายถาวร'} {t.w} × {t.h} มม.
              </span>
            </div>
            <div className="flip-mm">
              <FlipStripAny data={d} settings={settings} />
              <span className="flip-cap">
                แถบราคา {s.w} × {s.h} มม. {d.variant === 'narrow' ? 'หน้า / หลัง (พับบน-ล่าง)' : 'หน้า | หลัง (พับตามเส้นประ)'} × {d.qty}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
