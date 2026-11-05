import { useMemo } from 'react';
import { useQueueStore } from '../store/queueStore';
import { CnSignTag } from './CnSignTag';
import { CN_SHEET } from './config';
import { queueToCnData, type CnSignData } from './data';
import { useCnSettings, useCnStore } from './store';

/* ย่อป้ายทั้งแผ่นลงให้ดูบนจอ (วาดเป็น มม. จริงแล้ว scale) */
export function CnScaled({ data, scale }: { data: CnSignData; scale: number }) {
  const settings = useCnSettings();
  const w = data.orient === 'portrait' ? CN_SHEET.short : CN_SHEET.long;
  const h = data.orient === 'portrait' ? CN_SHEET.long : CN_SHEET.short;
  return (
    <div className="cn-prev" style={{ width: `${w * scale}mm`, height: `${h * scale}mm` }}>
      <div className="cn-prev-inner" style={{ transform: `scale(${scale})` }}>
        <CnSignTag data={data} settings={settings} />
      </div>
    </div>
  );
}

/* พรีวิวป้ายจีน A4 ใน Workspace — ไม่ถูกพิมพ์ตอนกดพิมพ์ป้ายปกติ */
export function CnPreview() {
  const queue = useQueueStore((s) => s.queue);
  const config = useQueueStore((s) => s.config);
  const settings = useCnSettings();
  const list = useMemo(() => queueToCnData(queue, settings, config), [queue, settings, config]);
  if (!list.length) return null;
  return (
    <div id="cn-area">
      <div className="flip-area-title">ป้ายจีน A4 · พิมพ์จากเมนู "ป้ายจีน A4" ด้านซ้าย</div>
      <div className="cn-area-row">
        {list.map((d, i) => (
          <div key={i} className="cn-area-item">
            <CnScaled data={d} scale={0.34} />
            <span className="flip-cap">
              {d.style === 'strip' ? 'แถบตั้ง' : 'แผ่นป้ายบน'} · A4 {d.orient === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'} × {d.qty} แผ่น
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* แผ่นพิมพ์ A4 (ซ่อนบนจอ แสดงเฉพาะ body.print-cnsign) — 1 ป้าย = 1 หน้า, PrintQty = จำนวนหน้าซ้ำ */
export function CnSheets() {
  const job = useCnStore((s) => s.job);
  const settings = useCnSettings();
  if (!job) return <div id="cn-sheets" />;
  const pages = job.items.flatMap((d) => Array.from({ length: d.qty }, () => d));
  return (
    <div id="cn-sheets">
      {pages.map((d, i) => (
        <div key={i} className={`cn-sheet cn-sheet-${job.orient === 'portrait' ? 'p' : 'l'}`}>
          <CnSignTag data={d} settings={job.settings ?? settings} />
        </div>
      ))}
    </div>
  );
}
