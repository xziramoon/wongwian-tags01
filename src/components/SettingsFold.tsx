import { useQueueStore } from '../store/queueStore';
import SliderRow from './SliderRow';
import { PRICE_FONTS, THEME_PRESETS } from '../constants';

export default function SettingsFold() {
  const config = useQueueStore((s) => s.config);
  const updateConfig = useQueueStore((s) => s.updateConfig);
  const applyPreset = useQueueStore((s) => s.applyPreset);

  /* ใส่ค่าตั้งของธีมครบชุดเฉพาะตอนเปลี่ยนจากแบบเดิม และไม่ทับช่องที่กรอกเองไว้แล้ว (ยกเว้น tagTheme)
     สลับระหว่างธีมใหม่ด้วยกัน = เปลี่ยนแค่ tagTheme ช่องที่ผู้ใช้ลบทิ้งจะไม่ถูกเติมกลับ */
  const applyTheme = (name: 'korean' | 'ink') => {
    const preset = THEME_PRESETS[name];
    const fromClassic = !config.tagTheme || config.tagTheme === 'classic';
    Object.entries(preset).forEach(([k, v]) => {
      const key = k as keyof typeof config;
      const cur = String(config[key] ?? '').trim();
      const isDefaultHeader = key === 'header' && (cur === '' || cur === 'ร้านวงเวียน');
      if (key === 'tagTheme' || (fromClassic && (cur === '' || isDefaultHeader))) updateConfig(key, v as string);
    });
  };

  return (
    <details className="fold">
      <summary>
        ตั้งค่าขนาดป้ายและตัวหนังสือ<span className="fold-arrow">▾</span>
      </summary>
      <div className="fold-body">
        <div className="panel">
          <div className="p-lbl">
            ขนาดสำเร็จรูป <span className="fold-hint" style={{ marginLeft: 'auto' }}>กดเลือกได้เลย</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '12px 14px' }}>
            <button className="btn btn-preset" onClick={() => applyPreset('S')}>เล็ก</button>
            <button className="btn btn-preset" onClick={() => applyPreset('M')}>มาตรฐาน</button>
            <button className="btn btn-preset" onClick={() => applyPreset('L')}>ใหญ่</button>
            <button className="btn btn-preset" onClick={() => applyPreset('XL')}>ป้ายใหญ่</button>
          </div>
        </div>

        <div className="panel">
          <div className="p-lbl">ตั้งค่าป้ายปกติ</div>
          <div className="cfg-grid">
            <div className="cfg-full">
              <span className="cfg-lbl">ชื่อร้านบนหัวป้าย</span>
              <input className="inp" value={config.header} onChange={(e) => updateConfig('header', e.target.value)} />
            </div>

            <div className="cfg-full">
              <span className="cfg-lbl">ฟอนต์ตัวหนังสือบนป้าย</span>
              <select className="inp" value={config.font} onChange={(e) => updateConfig('font', e.target.value)}>
                <option value="'Kanit',sans-serif">Kanit</option>
                <option value="'Prompt',sans-serif">Prompt</option>
                <option value="'Sarabun',sans-serif">Sarabun</option>
                <option value="'Mitr',sans-serif">Mitr</option>
              </select>
            </div>

            <div className="cfg-full">
              <span className="cfg-lbl">ธีมป้ายปกติ</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  className="btn btn-preset"
                  aria-pressed={!config.tagTheme || config.tagTheme === 'classic'}
                  onClick={() => updateConfig('tagTheme', 'classic')}
                >
                  แบบเดิม
                </button>
                <button
                  className="btn btn-preset"
                  aria-pressed={config.tagTheme === 'korean'}
                  onClick={() => applyTheme('korean')}
                >
                  เกาหลี
                </button>
                <button
                  className="btn btn-preset"
                  aria-pressed={config.tagTheme === 'ink'}
                  onClick={() => applyTheme('ink')}
                >
                  หมึกแดง
                </button>
              </div>
              <span className="fold-hint">
                ธีมใหม่ใช้สีแดง ต้องพิมพ์ด้วยเครื่องพิมพ์สี · ตรา SALE / 特价 ขึ้นเองเมื่อสินค้ามี "ราคาเดิม"
              </span>
            </div>

            <div>
              <span className="cfg-lbl">ข้อความขวาบนหัวป้าย (เว้นว่าง = ไม่แสดง)</span>
              <input
                className="inp"
                value={String(config.headerSub || '')}
                onChange={(e) => updateConfig('headerSub', e.target.value)}
                placeholder="ซุปเปอร์มาร์เก็ต"
              />
            </div>
            <div>
              <span className="cfg-lbl">ชื่อสาขา มุมล่างซ้าย (เว้นว่าง = ไม่แสดง)</span>
              <input
                className="inp"
                value={String(config.branchLabel || '')}
                onChange={(e) => updateConfig('branchLabel', e.target.value)}
                placeholder="สาขาวงเวียน"
              />
            </div>

            <div className="cfg-full">
              <span className="cfg-lbl">ชื่อจีนบนหัวป้าย (เว้นว่าง = ไม่แสดง)</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="inp"
                  style={{ flex: 1, fontFamily: "'Noto Serif SC', serif", fontWeight: 900 }}
                  value={String(config.headerCN || '')}
                  onChange={(e) => updateConfig('headerCN', e.target.value)}
                  placeholder="黄六盛"
                />
                <button className="btn btn-preset" onClick={() => updateConfig('headerCN', '黄六盛')}>
                  ใส่ 黄六盛
                </button>
              </div>
            </div>

            <div className="cfg-full">
              <span className="cfg-lbl">ฟอนต์ตัวเลขราคา (หมึกพู่กัน)</span>
              <select
                className="inp"
                style={{ fontFamily: config.priceFont || undefined }}
                value={String(config.priceFont || '')}
                onChange={(e) => updateConfig('priceFont', e.target.value)}
              >
                {PRICE_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="cfg-full">
              <span className="cfg-lbl">สีตัวเลขราคา</span>
              <select
                className="inp"
                value={config.priceInk === 'red' ? 'red' : 'black'}
                onChange={(e) => updateConfig('priceInk', e.target.value)}
              >
                <option value="black">ดำ (เดิม)</option>
                <option value="red">แดงหมึก — ต้องใช้เครื่องพิมพ์สี</option>
              </select>
            </div>

            <div>
              <span className="cfg-lbl">คำนำหน้า "ขนาด"</span>
              <input className="inp" value={config.labelSize} onChange={(e) => updateConfig('labelSize', e.target.value)} />
            </div>
            <div>
              <span className="cfg-lbl">คำนำหน้า "บรรจุ"</span>
              <input className="inp" value={config.labelUnit} onChange={(e) => updateConfig('labelUnit', e.target.value)} />
            </div>
            <div className="cfg-full">
              <span className="cfg-lbl">คำว่า "ปลีก" (ป้ายโชว์ 2 ราคา แบบ A)</span>
              <input
                className="inp"
                value={config.labelRetail}
                onChange={(e) => updateConfig('labelRetail', e.target.value)}
                placeholder="เช่น ปลีก, ราคาปกติ, ขายปลีก"
              />
            </div>

            <SliderRow configKey="w" />
            <SliderRow configKey="h" />
            <SliderRow configKey="bcHeight" full />

            <div className="cfg-full">
              <span className="cfg-lbl cfg-sec-lbl">ขนาดตัวหนังสือ (px)</span>
            </div>
            <SliderRow configKey="globalNameSz" />
            <SliderRow configKey="priceSz" />
            <SliderRow configKey="dualSz" />
            <SliderRow configKey="metaSz" />

            <div className="cfg-full">
              <span className="cfg-lbl cfg-sec-lbl">ริบบิ้นมุมป้าย</span>
            </div>
            <SliderRow configKey="ribbonSz" />
            <SliderRow configKey="ribbonX" />
            <SliderRow configKey="ribbonY" />
          </div>

          <div className="cb-wrap">
            <input
              type="checkbox"
              id="invert-baht"
              checked={!!config.invertBaht}
              onChange={(e) => updateConfig('invertBaht', e.target.checked)}
            />
            <label htmlFor="invert-baht">ถมดำพื้นหลังคำว่า "บาท"</label>
          </div>
          <div className="cb-wrap">
            <input
              type="checkbox"
              id="ink-tilt"
              checked={!!config.inkTilt}
              onChange={(e) => updateConfig('inkTilt', e.target.checked)}
            />
            <label htmlFor="ink-tilt">เอียงตัวเลขราคาแบบหมึกพู่กัน</label>
          </div>
          <div className="cb-wrap">
            <input
              type="checkbox"
              id="veg-auto"
              checked={!!config.vegAuto}
              onChange={(e) => updateConfig('vegAuto', e.target.checked)}
            />
            <label htmlFor="veg-auto">ติดป้าย 齋 เจ อัตโนมัติเมื่อชื่อสินค้ามีคำว่า "เจ"</label>
          </div>
        </div>

        <div className="panel">
          <div className="p-lbl">ตั้งค่าป้ายใหญ่</div>
          <div className="cfg-grid">
            <SliderRow configKey="largeW" />
            <SliderRow configKey="largeH" />
            <SliderRow configKey="bcHeightLrg" full />
          </div>
        </div>

        <div className="panel">
          <div className="p-lbl">ตั้งค่าแถบสินค้าหมด</div>
          <div className="cfg-grid">
            <SliderRow configKey="oosW" />
            <SliderRow configKey="oosH" />
            <SliderRow configKey="oosSz" full />
          </div>
        </div>
      </div>
    </details>
  );
}
