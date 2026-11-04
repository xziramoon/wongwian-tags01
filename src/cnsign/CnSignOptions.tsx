import type { QueueItem } from '../types';
import { CN_ORIENTS, CN_STYLES } from './config';
import { useCnStore } from './store';

/* ตัวเลือกของป้ายจีน A4 ต่อใบ (การ์ดสินค้าในคิว): สไตล์ + แนวกระดาษ เป็นปุ่มใหญ่กดง่าย — ว่าง = ใช้ค่าตั้งต้นจากเมนู "ป้ายจีน A4" */
export default function CnSignOptions({ item, onSet }: { item: QueueItem; onSet: (field: keyof QueueItem, value: string) => void }) {
  const base = useCnStore((s) => s.settings);
  const style = item.CnStyle ?? base.style;
  const orient = item.CnOrient ?? base.orient;
  return (
    <div className="cn-opts">
      <div>
        <span className="q-lbl">สไตล์ป้ายจีน</span>
        <div className="mode-btns" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {CN_STYLES.map((s) => (
            <div key={s.value} className={`mode-btn${style === s.value ? ' active' : ''}`} onClick={() => onSet('CnStyle', s.value)} title={s.hint}>
              {s.label}
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="q-lbl">แนวกระดาษ A4</span>
        <div className="mode-btns" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {CN_ORIENTS.map((o) => (
            <div key={o.value} className={`mode-btn${orient === o.value ? ' active' : ''}`} onClick={() => onSet('CnOrient', o.value)}>
              {o.label}
            </div>
          ))}
        </div>
      </div>
      <span className="fold-hint">1 ใบ = 1 แผ่น A4 · พิมพ์จากเมนู "ป้ายจีน A4" ด้านซ้าย</span>
    </div>
  );
}
