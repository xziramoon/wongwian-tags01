import { useQueueStore } from '../store/queueStore';
import SliderRow from './SliderRow';

export default function SettingsFold() {
  const config = useQueueStore((s) => s.config);
  const updateConfig = useQueueStore((s) => s.updateConfig);
  const applyPreset = useQueueStore((s) => s.applyPreset);

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
        </div>

        <div className="panel">
          <div className="p-lbl">ตั้งค่าป้ายใหญ่</div>
          <div className="cfg-grid">
            <SliderRow configKey="largeW" />
            <SliderRow configKey="largeH" />
            <SliderRow configKey="bcHeightLrg" full />
          </div>
        </div>
      </div>
    </details>
  );
}
