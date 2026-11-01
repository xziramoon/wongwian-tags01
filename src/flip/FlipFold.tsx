import { useEffect, useMemo, useState } from 'react';
import { database } from '../lib/database';
import { fmtPrice } from '../lib/utils';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import { FLIP_FONTS, FLIP_REDS, type FlipSettings } from './config';
import { computeNeedTags, computeToday, fromQueueItem, type FlipData } from './data';
import { FlipStrip, FlipTag } from './FlipTag';
import { printFlip, sendFlipRemote } from './print';
import { useFlipSettings, useFlipStore } from './store';

const SAMPLE: FlipData = {
  barcode: '8850999123456',
  name: 'น้ำดื่มตัวอย่าง ขวดใหญ่ 1.5 ลิตร',
  size: '1.5 ลิตร',
  price: '25',
  pack: 'ยกลัง 12 ขวด 400.-',
  label: 'ยกลัง',
  corner: '',
  footer: '8850999123456',
  lot: '',
  qty: 1,
};

/* ฐานข้อมูลสินค้าโหลด/ซิงค์ใหม่เมื่อไหร่ ให้รายการเทียบราคาคำนวณใหม่ */
function useDbVersion() {
  const [v, setV] = useState(0);
  useEffect(() => database.onChange(() => setV((n) => n + 1)), []);
  return v;
}

const SETTING_TEXT: { key: keyof FlipSettings; label: string; full?: boolean }[] = [
  { key: 'shopCn', label: 'ตราจีน (หัวป้าย)' },
  { key: 'shopTh', label: 'ชื่อร้านไทย' },
  { key: 'corner', label: 'คำมุมขวาหัวป้าย' },
  { key: 'unit', label: 'หน่วยราคา' },
  { key: 'outText', label: 'ด้านหลัง: ข้อความใหญ่' },
  { key: 'outSub', label: 'ด้านหลัง: บรรทัดเล็ก' },
];

export default function FlipFold() {
  const rawSettings = useFlipStore((s) => s.settings);
  const settings = useFlipSettings(); // รวมโหมดขาว-ดำของแอปแล้ว (ใช้วาด/พรีวิว)
  const overrides = useFlipStore((s) => s.overrides);
  const lastPrinted = useFlipStore((s) => s.lastPrinted);
  const tagsPrinted = useFlipStore((s) => s.tagsPrinted);
  const updateSetting = useFlipStore((s) => s.updateSetting);
  const acknowledge = useFlipStore((s) => s.acknowledge);
  const queue = useQueueStore((s) => s.queue);
  const showToast = useUIStore((s) => s.showToast);
  const dbVersion = useDbVersion();

  const flipItems = useMemo(() => queue.filter((i) => i.TagMode === 'flip'), [queue]);
  const queueData = useMemo(
    () => flipItems.map((i) => fromQueueItem(i, settings, overrides[i.Barcode])),
    [flipItems, settings, overrides],
  );
  const preview = queueData[0] ?? { ...SAMPLE, corner: settings.corner };

  /* eslint-disable react-hooks/exhaustive-deps */
  const today = useMemo(() => computeToday(lastPrinted, settings, overrides), [lastPrinted, settings, overrides, dbVersion]);
  const needTags = useMemo(
    () =>
      computeNeedTags(
        tagsPrinted,
        lastPrinted,
        flipItems.map((i) => i.Barcode),
        settings,
        overrides,
      ),
    [tagsPrinted, lastPrinted, flipItems, settings, overrides, dbVersion],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const printQueue = (kind: 'tags' | 'strips' | 'both', remote = false) => {
    if (!queueData.length) {
      showToast('เลือกแบบป้าย "ดำแดง" ให้สินค้าในคิวก่อน', 'error');
      return;
    }
    if (remote) sendFlipRemote(kind, queueData);
    else printFlip(kind, queueData);
  };

  return (
    <details className="fold">
      <summary>
        ป้ายดำแดง (แถบพลิก)
        {today.length + needTags.length > 0 && <span className="flip-badge">{today.length + needTags.length}</span>}
        <span className="fold-arrow">▾</span>
      </summary>
      <div className="fold-body">
        <div className="panel">
          <div className="p-lbl">
            พิมพ์ป้ายดำแดง <span className="fold-hint" style={{ marginLeft: 'auto' }}>{queueData.length} รายการในคิว</span>
          </div>
          <div className="flip-btn-row">
            <button className="btn btn-preset" onClick={() => printQueue('tags')}>ตัวป้าย</button>
            <button className="btn btn-preset" onClick={() => printQueue('strips')}>แถบราคา</button>
            <button className="btn btn-preset" onClick={() => printQueue('both')}>ทั้งคู่</button>
          </div>
          <div className="flip-btn-row flip-btn-remote">
            <button className="btn btn-remote" onClick={() => printQueue('tags', true)}>📡 ส่งตัวป้าย</button>
            <button className="btn btn-remote" onClick={() => printQueue('strips', true)}>📡 ส่งแถบ</button>
            <button className="btn btn-remote" onClick={() => printQueue('both', true)}>📡 ส่งทั้งคู่</button>
          </div>
          <div className="cb-wrap">
            <input
              type="checkbox"
              id="flip-mono"
              checked={rawSettings.mono}
              onChange={(e) => updateSetting('mono', e.target.checked)}
            />
            <label htmlFor="flip-mono">โหมดขาวดำ (เครื่องพิมพ์หมึกดำ — ไม่มีสีแดง)</label>
          </div>
          <div className="flip-note">
            A4 · ขอบ 5 มม. · ในหน้าต่างพิมพ์ตั้ง Scale = 100% (ห้าม "Fit to page") ตัวป้ายพิมพ์ได้ 14 ใบ/แผ่น แถบ 18 แถบ/แผ่น
          </div>
        </div>

        <div className="panel">
          <div className="p-lbl">
            ต้องเปลี่ยนวันนี้ <span className="p-count">{today.length}</span>
          </div>
          {today.length === 0 ? (
            <div className="flip-empty">ราคาบนชั้นตรงกับชีตทุกรายการ ✓</div>
          ) : (
            <>
              <div className="flip-list">
                {today.map((r) => (
                  <label key={r.data.barcode} className="flip-row">
                    <input type="checkbox" onChange={() => acknowledge([r])} title="เปลี่ยนแล้ว" />
                    <div className="flip-row-main">
                      <div className="flip-row-name">{r.data.name}</div>
                      <div className="flip-row-sub">
                        {r.data.lot && <b>ล็อค {r.data.lot} · </b>}
                        {r.kind === 'printed' ? 'พิมพ์แล้ว รอเปลี่ยน · ' : ''}
                        {r.oldPrice ? (
                          <>
                            {fmtPrice(r.oldPrice)} → <b>{fmtPrice(r.newPrice)}</b>
                          </>
                        ) : (
                          <b>{fmtPrice(r.newPrice)}</b>
                        )}
                        {r.newPack !== r.oldPack && r.newPack && <> · {r.newPack}</>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flip-btn-row flip-btn-row2">
                <button
                  className="btn btn-preset"
                  onClick={() => printFlip('strips', today.map((r) => r.data))}
                >
                  ⎙ พิมพ์แถบทั้งหมด ({today.length})
                </button>
                <button className="btn btn-remote" onClick={() => sendFlipRemote('strips', today.map((r) => r.data))}>
                  📡 ส่งแถบไปเครื่องปลายทาง
                </button>
                <button className="btn btn-preset" onClick={() => acknowledge(today)}>
                  ✓ เปลี่ยนแล้วทั้งหมด
                </button>
              </div>
            </>
          )}
        </div>

        <div className="panel">
          <div className="p-lbl">
            ต้องพิมพ์ตัวป้ายถาวร <span className="p-count">{needTags.length}</span>
          </div>
          {needTags.length === 0 ? (
            <div className="flip-empty">ตัวป้ายถาวรครบทุกสินค้า ✓</div>
          ) : (
            <>
              <div className="flip-list">
                {needTags.map((r) => (
                  <div key={r.data.barcode} className="flip-row">
                    <div className="flip-row-main">
                      <div className="flip-row-name">{r.data.name}</div>
                      <div className="flip-row-sub">
                        {r.data.lot && <b>ล็อค {r.data.lot} · </b>}
                        {r.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flip-btn-row flip-btn-row2">
                <button className="btn btn-preset" onClick={() => printFlip('tags', needTags.map((r) => r.data))}>
                  ⎙ พิมพ์ตัวป้าย ({needTags.length})
                </button>
              </div>
            </>
          )}
        </div>

        <div className="panel">
          <div className="p-lbl">
            ตั้งค่าป้ายดำแดง <span className="fold-hint" style={{ marginLeft: 'auto' }}>พรีวิวสด</span>
          </div>
          <div className="flip-preview">
            <div className="flip-mm flip-zoom">
              <FlipTag data={preview} settings={settings} />
            </div>
            <div className="flip-mm flip-zoom">
              <FlipStrip data={preview} settings={settings} />
            </div>
          </div>
          <div className="cfg-grid">
            {SETTING_TEXT.map(({ key, label }) => (
              <div key={key}>
                <span className="cfg-lbl">{label}</span>
                <input
                  className="inp"
                  value={String(rawSettings[key])}
                  onChange={(e) => updateSetting(key, e.target.value as never)}
                />
              </div>
            ))}
            <div>
              <span className="cfg-lbl">ฟอนต์</span>
              <select className="inp" value={settings.font} onChange={(e) => updateSetting('font', e.target.value)}>
                {FLIP_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="cfg-lbl">สีแดง</span>
              <div className="flip-red">
                <select
                  className="inp"
                  value={FLIP_REDS.some((r) => r.value === settings.red) ? settings.red : ''}
                  onChange={(e) => e.target.value && updateSetting('red', e.target.value)}
                >
                  {FLIP_REDS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} {r.value}
                    </option>
                  ))}
                  <option value="">กำหนดเอง</option>
                </select>
                <input
                  type="color"
                  value={settings.red}
                  onChange={(e) => updateSetting('red', e.target.value)}
                  title="เลือกสีแดงเอง"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
