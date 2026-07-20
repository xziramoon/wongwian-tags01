import { useUIStore } from '../store/uiStore';
import { applySelectedDiffs } from '../lib/sync';
import { fmtPrice } from '../lib/utils';

export default function SyncModal() {
  const open = useUIStore((s) => s.syncModalOpen);
  const diffs = useUIStore((s) => s.syncModalDiffs);
  const checked = useUIStore((s) => s.syncModalChecked);
  const closeSyncModal = useUIStore((s) => s.closeSyncModal);
  const toggleDiffChecked = useUIStore((s) => s.toggleDiffChecked);
  const toggleAllDiffChecked = useUIStore((s) => s.toggleAllDiffChecked);

  const allChecked = diffs.length > 0 && checked.size === diffs.length;

  return (
    <div className={`modal-overlay${open ? ' show' : ''}`}>
      <div className="modal-box">
        <div className="modal-head">
          <div>
            <div className="modal-title">มีราคาใหม่จาก Google Sheet</div>
            <div className="modal-sub">พบ {diffs.length} รายการที่ราคาต่างจาก Sheet</div>
          </div>
          <button className="mb-cancel modal-btn" style={{ flex: 0, padding: '8px 14px', minHeight: 0 }} onClick={closeSyncModal}>
            ✕
          </button>
        </div>
        <div className="modal-selectall">
          <input
            type="checkbox"
            id="diff-select-all"
            className="diff-check"
            checked={allChecked}
            onChange={(e) => toggleAllDiffChecked(e.target.checked)}
          />
          <label htmlFor="diff-select-all" style={{ cursor: 'pointer' }}>
            เลือกทั้งหมด
          </label>
        </div>
        <div className="modal-body">
          {diffs.map((d, i) => (
            <div className="diff-row" key={d.idx}>
              <input
                type="checkbox"
                className="diff-check"
                checked={checked.has(i)}
                onChange={(e) => toggleDiffChecked(i, e.target.checked)}
              />
              <div>
                <div className="diff-name">{d.name}</div>
                <div className="diff-bc">{d.barcode}</div>
              </div>
              <div className="diff-prices">
                <span className="diff-old">{fmtPrice(d.oldPrice)}</span>
                <span className="diff-arrow">→</span>
                <span className="diff-new">{fmtPrice(d.newPrice)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button className="modal-btn mb-cancel" onClick={closeSyncModal}>
            ยกเลิก
          </button>
          <button className="modal-btn mb-confirm" onClick={applySelectedDiffs}>
            ✓ ใช้ราคาใหม่ที่เลือก
          </button>
        </div>
      </div>
    </div>
  );
}
