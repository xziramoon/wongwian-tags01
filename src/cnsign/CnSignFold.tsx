import { useMemo } from 'react';
import { useQueueStore } from '../store/queueStore';
import { CnScaled } from './CnSignViews';
import { CN_INK_LEVELS, CN_ORIENTS, CN_REDS, CN_STYLES, DEFAULT_CN_SETTINGS, type CnSignSettings } from './config';
import { cnPageCount, queueToCnData, type CnSignData } from './data';
import { printCnSign, sendCnSignRemote } from './print';
import { useCnSettings, useCnStore } from './store';

const SAMPLE: CnSignData = {
  name: 'น้ำปลาทิพรส สูตรต้นตำรับ',
  size: '700 มล.',
  price: '35',
  packLabel: 'ยกลัง 12 ขวด',
  packPrice: '399',
  barcode: '8850144000013',
  branch: 'สาขาวงเวียน',
  style: 'strip',
  orient: 'portrait',
  qty: 1,
};

const TEXTS: { key: 'shopCn' | 'shopTh' | 'corner' | 'unit'; label: string }[] = [
  { key: 'shopCn', label: 'ตราจีน' },
  { key: 'shopTh', label: 'ชื่อร้านไทย' },
  { key: 'corner', label: 'คำมุม' },
  { key: 'unit', label: 'หน่วยราคา' },
];

/* เมนูพับ "ป้ายจีน A4": พิมพ์/ส่งพิมพ์ + ตั้งค่าข้อความ สีแดง ขาว-ดำ + พรีวิวสด */
export default function CnSignFold() {
  const raw = useCnStore((s) => s.settings);
  const settings = useCnSettings();
  const update = useCnStore((s) => s.updateSetting);
  const reset = useCnStore((s) => s.resetSettings);
  const queue = useQueueStore((s) => s.queue);
  const config = useQueueStore((s) => s.config);

  const source = useMemo(() => queue.filter((i) => i.TagMode === 'cnsign'), [queue]);
  const data = useMemo(() => queueToCnData(queue, settings, config), [queue, settings, config]);
  const pages = cnPageCount(data);
  const previewData: CnSignData = data[0] ?? { ...SAMPLE, style: raw.style, orient: raw.orient };

  return (
    <details className="fold">
      <summary>
        ป้ายจีน A4
        {data.length > 0 && <span className="flip-badge">{pages}</span>}
        <span className="fold-arrow">▾</span>
      </summary>
      <div className="fold-body">
        <div className="panel">
          <div className="p-lbl">
            พิมพ์ป้ายจีน A4 <span className="fold-hint" style={{ marginLeft: 'auto' }}>{pages} แผ่นในคิว</span>
          </div>
          <div className="flip-btn-row flip-btn-row2">
            <button className="btn btn-preset" onClick={() => printCnSign(data, source)}>
              ⎙ พิมพ์ป้ายจีน A4 ({pages} แผ่น)
            </button>
            <button className="btn btn-remote" onClick={() => sendCnSignRemote(data, source)}>
              📡 ส่งไปเครื่องปลายทาง
            </button>
          </div>
          <div className="flip-note">
            A4 · ขอบ 5 มม. · 1 ป้าย/แผ่น · ในหน้าต่างพิมพ์ตั้ง Scale = 100% (ห้าม "Fit to page") · แนวตั้งกับแนวนอนพิมพ์แยกกันทีละงาน
          </div>
        </div>

        <div className="panel">
          <div className="p-lbl">
            ตั้งค่าป้ายจีน A4 <span className="fold-hint" style={{ marginLeft: 'auto' }}>พรีวิวสด</span>
          </div>
          <div className="cn-fold-prev">
            <CnScaled data={previewData} scale={previewData.orient === 'portrait' ? 0.3 : 0.26} />
          </div>
          <div className="cfg-grid">
            <div className="cfg-full">
              <span className="cfg-lbl">สไตล์ตั้งต้น (ปรับรายใบได้ที่การ์ดสินค้า)</span>
              <div className="flip-theme-row">
                {CN_STYLES.map((t) => (
                  <button key={t.value} className="btn btn-preset" aria-pressed={raw.style === t.value} onClick={() => update('style', t.value)} title={t.hint}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="cfg-full">
              <span className="cfg-lbl">แนวกระดาษตั้งต้น</span>
              <div className="flip-theme-row">
                {CN_ORIENTS.map((t) => (
                  <button key={t.value} className="btn btn-preset" aria-pressed={raw.orient === t.value} onClick={() => update('orient', t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {TEXTS.map(({ key, label }) => (
              <div key={key}>
                <span className="cfg-lbl">{label}</span>
                <input className="inp" value={raw[key]} onChange={(e) => update(key, e.target.value)} />
              </div>
            ))}
            <div className="cfg-full">
              <span className="cfg-lbl">ความเข้มสี (ปริ้นออกมาซีดให้เพิ่ม)</span>
              <div className="flip-theme-row">
                {CN_INK_LEVELS.map((t) => (
                  <button key={t.value} className="btn btn-preset" aria-pressed={raw.ink === t.value} onClick={() => update('ink', t.value)} title={t.hint}>
                    {t.label}
                  </button>
                ))}
              </div>
              <span className="fold-hint">แดงเข้มขึ้น ตัวเลขราคาหนาขึ้น ตัวเทา/เส้นบางเข้มขึ้น · ตั้ง "คุณภาพสูง/เพิ่มความเข้มสี" ที่ไดรเวอร์เครื่องพิมพ์ด้วยถ้ายังซีด</span>
            </div>
            <div className="cfg-full">
              <span className="cfg-lbl">สีแดง</span>
              <div className="flip-red">
                <select
                  className="inp"
                  value={CN_REDS.some((r) => r.value.toLowerCase() === raw.red.toLowerCase()) ? raw.red : ''}
                  onChange={(e) => e.target.value && update('red', e.target.value)}
                >
                  {CN_REDS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} {r.value}
                    </option>
                  ))}
                  <option value="">กำหนดเอง</option>
                </select>
                <input type="color" value={raw.red} onChange={(e) => update('red', e.target.value)} title="เลือกสีแดงเอง" />
              </div>
            </div>
          </div>
          <div className="cb-wrap">
            <input type="checkbox" id="cn-mono" checked={raw.mono} onChange={(e) => update('mono', e.target.checked)} />
            <label htmlFor="cn-mono">โหมดขาวดำ (เครื่องพิมพ์หมึกดำ — ไม่มีสีแดง)</label>
          </div>
          <div className="flip-btn-row flip-btn-row2">
            <button className="btn btn-preset" onClick={reset} disabled={JSON.stringify(raw) === JSON.stringify(DEFAULT_CN_SETTINGS as CnSignSettings)}>
              คืนค่าเริ่มต้น
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
