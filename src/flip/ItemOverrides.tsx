import type { QueueItem } from '../types';
import { fromQueueItem, type FlipVariant } from './data';
import { useFlipStore } from './store';

type TextKey = 'corner' | 'footer' | 'pack';
const FIELDS: { key: TextKey; label: string; hint: string }[] = [
  { key: 'corner', label: 'คำมุมขวาหัวป้าย', hint: 'ว่าง = ตามตั้งค่าร้าน' },
  { key: 'footer', label: 'บรรทัดล่างของป้าย', hint: 'ว่าง = ไม่แสดง' },
  { key: 'pack', label: 'แถบดำใต้ราคา (ยกลัง)', hint: 'ว่าง = ซ่อนแถบดำ' },
];

const VARIANTS: { value: FlipVariant; label: string }[] = [
  { value: 'full', label: 'เต็ม 90 มม.' },
  { value: 'narrow', label: 'แคบ 45 มม.' },
  { value: 'group', label: 'กลุ่ม' },
];

/* ค่าระดับสินค้าของป้ายดำแดง — แก้แล้วทั้งตัวป้าย/แถบ/พรีวิวเปลี่ยนตาม · ↺ = กลับไปใช้ค่าอัตโนมัติ
 * + เลือกขนาดป้าย: เต็ม / แคบ / กลุ่ม (สเปกข้อ 12) */
export default function ItemOverrides({ item }: { item: QueueItem }) {
  const settings = useFlipStore((s) => s.settings);
  const overrides = useFlipStore((s) => s.overrides[item.Barcode]);
  const groups = useFlipStore((s) => s.groups);
  const setOverride = useFlipStore((s) => s.setOverride);
  const clearOverride = useFlipStore((s) => s.clearOverride);
  const auto = fromQueueItem(item, settings, {});
  const variant: FlipVariant = overrides?.variant ?? 'full';
  const memberOf = groups.find((g) => g.members.some((m) => m.barcode === item.Barcode));

  const chooseGroup = (id: string) => {
    setOverride(item.Barcode, 'variant', 'group');
    setOverride(item.Barcode, 'groupId', id);
  };

  return (
    <div className="flip-ov">
      <span className="q-lbl">ขนาดป้ายดำแดง</span>
      <div className="flip-variant-row">
        {VARIANTS.map((v) => (
          <button
            key={v.value}
            className="btn btn-preset"
            aria-pressed={variant === v.value}
            onClick={() => {
              if (v.value === 'group') chooseGroup(overrides?.groupId || groups[0]?.id || '');
              else setOverride(item.Barcode, 'variant', v.value);
            }}
            disabled={v.value === 'group' && !groups.length}
            title={v.value === 'group' && !groups.length ? 'สร้างกลุ่มในเมนู "ป้ายดำแดง" ก่อน' : undefined}
          >
            {v.label}
          </button>
        ))}
      </div>

      {variant === 'group' && (
        <div className="q-field">
          <span className="q-lbl">กลุ่มสินค้า</span>
          <select className="qi" value={overrides?.groupId ?? ''} onChange={(e) => chooseGroup(e.target.value)}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.members.length} กลิ่น)
              </option>
            ))}
          </select>
        </div>
      )}

      {memberOf && variant !== 'group' && (
        <div className="flip-hint-box">
          สินค้านี้อยู่ในกลุ่ม <b>{memberOf.name}</b> — พิมพ์ป้ายกลุ่มแทนไหม?{' '}
          <button className="btn btn-preset" onClick={() => chooseGroup(memberOf.id)}>
            พิมพ์ป้ายกลุ่มแทน
          </button>
        </div>
      )}

      {variant === 'narrow' && (
        <span className="fold-hint">ป้ายแคบไม่พิมพ์บาร์โค้ด/ราคายกลัง/คำมุมขวา · แถบราคา 43 × 21 มม. พับบน-ล่าง</span>
      )}

      {variant === 'full' && (
        <div className="q-grid2">
          {FIELDS.map(({ key, label, hint }) => {
            const overridden = overrides !== undefined && key in overrides;
            return (
              <div className="q-field" key={key}>
                <span className="q-lbl">
                  {label}
                  {overridden && (
                    <button
                      className="flip-reset"
                      title="กลับไปใช้ค่าอัตโนมัติ"
                      onClick={() => clearOverride(item.Barcode, key)}
                    >
                      ↺
                    </button>
                  )}
                </span>
                <input
                  className="qi"
                  value={overridden ? (overrides[key] ?? '') : auto[key]}
                  placeholder={hint}
                  onChange={(e) => setOverride(item.Barcode, key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
