import type { QueueItem } from '../types';
import { fromQueueItem, type FlipOverride } from './data';
import { useFlipStore } from './store';

const FIELDS: { key: keyof FlipOverride; label: string; hint: string }[] = [
  { key: 'corner', label: 'คำมุมขวาหัวป้าย', hint: 'ว่าง = ตามตั้งค่าร้าน' },
  { key: 'footer', label: 'บรรทัดล่างของป้าย', hint: 'ว่าง = ไม่แสดง' },
  { key: 'pack', label: 'แถบดำใต้ราคา (ยกลัง)', hint: 'ว่าง = ซ่อนแถบดำ' },
];

/* ค่าระดับสินค้าของป้ายดำแดง — แก้แล้วทั้งตัวป้าย/แถบ/พรีวิวเปลี่ยนตาม · ↺ = กลับไปใช้ค่าอัตโนมัติ */
export default function ItemOverrides({ item }: { item: QueueItem }) {
  const settings = useFlipStore((s) => s.settings);
  const overrides = useFlipStore((s) => s.overrides[item.Barcode]);
  const setOverride = useFlipStore((s) => s.setOverride);
  const clearOverride = useFlipStore((s) => s.clearOverride);
  const auto = fromQueueItem(item, settings, {});

  return (
    <div className="q-grid2 flip-ov">
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
  );
}
