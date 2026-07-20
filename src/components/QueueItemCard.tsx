import { useUIStore } from '../store/uiStore';
import { useQueueStore } from '../store/queueStore';
import type { QueueItem } from '../types';
import { autoFontSize, fmtPrice } from '../lib/utils';

interface Props {
  item: QueueItem;
  index: number;
}

export default function QueueItemCard({ item, index }: Props) {
  const updateQueueItem = useQueueStore((s) => s.updateQueueItem);
  const setDualStyle = useQueueStore((s) => s.setDualStyle);
  const changeQty = useQueueStore((s) => s.changeQty);
  const remove = useQueueStore((s) => s.remove);
  const acceptSinglePriceDiff = useQueueStore((s) => s.acceptSinglePriceDiff);
  const selectedTagIndex = useUIStore((s) => s.selectedTagIndex);

  const fs = item.NameFontSize || autoFontSize(item.ProductName, item.TagMode);
  const selected = selectedTagIndex === index;

  const set = (field: keyof QueueItem, value: string | number) => updateQueueItem(index, field, value);

  return (
    <div
      id={`q-item-${index}`}
      className={`q-item${selected ? ' selected' : ''}${item.PriceDiff != null ? ' price-diff' : ''}`}
    >
      {item.PriceDiff != null && (
        <div className="q-diff-flag" onClick={() => acceptSinglePriceDiff(index)} title="กดเพื่อใช้ราคาใหม่">
          ⚠ ราคาใหม่จากชีต <b>{fmtPrice(item.PriceDiff)} บาท</b> (เดิม {fmtPrice(item.Price)}) — กดที่นี่เพื่อใช้ราคาใหม่
        </div>
      )}

      <div className="q-row">
        {item.Image && <img className="q-thumb-mini" src={item.Image} title="รูปสินค้า" onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '.2')} />}
        <input
          className="qi name"
          value={item.ProductName}
          onChange={(e) => set('ProductName', e.target.value)}
          placeholder="ชื่อสินค้า"
        />
      </div>

      <div className="q-price-grid">
        <div className="q-field q-field-retail">
          <span className="q-lbl">ราคาขาย (บาท)</span>
          <input
            className="qi price"
            type="number"
            step=".01"
            value={item.Price}
            onChange={(e) => set('Price', e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="q-field q-field-pack">
          <span className="q-lbl">ราคาแพ็ค / ยกลัง (บาท)</span>
          <div className="q-pack-row">
            <input
              className="qi price2 packname"
              value={item.Unit2 || ''}
              onChange={(e) => set('Unit2', e.target.value)}
              placeholder="ยกลัง"
            />
            <input
              className="qi price2 packprice"
              type="number"
              step=".01"
              value={item.Price2 || ''}
              onChange={(e) => set('Price2', e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
      </div>

      <div>
        <span className="q-lbl">เลือกแบบป้าย</span>
        <div className="mode-btns">
          <div
            className={`mode-btn${item.TagMode === 'standard' ? ' active' : ''}`}
            onClick={() => set('TagMode', 'standard')}
          >
            ป้ายปกติ
          </div>
          <div className={`mode-btn${item.TagMode === 'dual' ? ' active' : ''}`} onClick={() => set('TagMode', 'dual')}>
            โชว์ 2 ราคา
          </div>
          <div className={`mode-btn${item.TagMode === 'large' ? ' active' : ''}`} onClick={() => set('TagMode', 'large')}>
            ป้ายใหญ่
          </div>
        </div>
      </div>

      {item.TagMode === 'dual' && (
        <div className="mode-btns" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className={`mode-btn${item.DualStyle !== 'B' ? ' active' : ''}`} onClick={() => setDualStyle(index, 'A')}>
            แบบ A: แบ่งสองช่อง
          </div>
          <div className={`mode-btn${item.DualStyle === 'B' ? ' active' : ''}`} onClick={() => setDualStyle(index, 'B')}>
            แบบ B: ราคาเด่น + แถบส่ง
          </div>
        </div>
      )}

      <details className="q-more">
        <summary>
          แก้ไขเพิ่มเติม <span className="q-more-hint">ขนาด · รูป · วันหมดอายุ · ริบบิ้น</span>
        </summary>
        <div className="q-more-body">
          <div className="q-grid2">
            <div className="q-field">
              <span className="q-lbl">ราคาเดิม (ขีดฆ่า)</span>
              <input className="qi" type="number" step=".01" value={item.OldPrice || ''} onChange={(e) => set('OldPrice', e.target.value)} placeholder="—" />
            </div>
            <div className="q-field">
              <span className="q-lbl">คำว่า "ปลีก" บนป้าย</span>
              <input className="qi" value={item.Unit1 || ''} onChange={(e) => set('Unit1', e.target.value)} placeholder="ว่าง = ตามตั้งค่า" />
            </div>
            <div className="q-field">
              <span className="q-lbl">ขนาดสินค้า</span>
              <input className="qi" value={item.Size || ''} onChange={(e) => set('Size', e.target.value)} placeholder="เช่น 500 กรัม" />
            </div>
            <div className="q-field">
              <span className="q-lbl">หน่วยขาย</span>
              <input className="qi" value={item.Unit} onChange={(e) => set('Unit', e.target.value)} placeholder="ชิ้น" />
            </div>
            <div className="q-field">
              <span className="q-lbl">ริบบิ้นมุมป้าย</span>
              <input className="qi" value={item.Ribbon || ''} onChange={(e) => set('Ribbon', e.target.value)} placeholder="เช่น ลดพิเศษ" />
            </div>
            <div className="q-field">
              <span className="q-lbl">แพ็ค / ลัง</span>
              <input className="qi" value={item.PackType || ''} onChange={(e) => set('PackType', e.target.value)} placeholder="เช่น แพ็ค 6" />
            </div>
            <div className="q-field">
              <span className="q-lbl">วันผลิต (MFG)</span>
              <input className="qi" value={item.Mfg || ''} onChange={(e) => set('Mfg', e.target.value)} placeholder="—" />
            </div>
            <div className="q-field">
              <span className="q-lbl">วันหมดอายุ (EXP)</span>
              <input className="qi" value={item.Exp || ''} onChange={(e) => set('Exp', e.target.value)} placeholder="—" />
            </div>
            <div className="q-field">
              <span className="q-lbl">ขนาดตัวหนังสือชื่อ</span>
              <input className="qi" type="number" value={fs} onChange={(e) => set('NameFontSize', +e.target.value)} title="ขนาดฟอนต์ชื่อ" />
            </div>
            <div className="q-field">
              <span className="q-lbl">เลื่อนราคา ซ้าย-ขวา</span>
              <input className="qi" type="number" value={item.PriceOffsetX || 0} onChange={(e) => set('PriceOffsetX', +e.target.value)} placeholder="0" title="เลื่อนราคา (px)" />
            </div>
          </div>
          <div className="q-field">
            <span className="q-lbl">ลิงก์รูปสินค้า (ไม่บังคับ)</span>
            <input className="qi" value={item.Image || ''} onChange={(e) => set('Image', e.target.value)} placeholder="วางลิงก์รูปที่นี่" />
          </div>
        </div>
      </details>

      <div className="q-foot">
        <div className="q-qty-wrap">
          <span className="q-lbl" style={{ margin: 0 }}>
            จำนวนใบ
          </span>
          <div className="qty-ctrl">
            <button className="qb" onClick={() => changeQty(index, -1)}>
              −
            </button>
            <span className="qv">{item.PrintQty}</span>
            <button className="qb" onClick={() => changeQty(index, 1)}>
              +
            </button>
          </div>
        </div>
        <button className="q-del" onClick={() => remove(index)}>
          ✕ ลบป้ายนี้
        </button>
      </div>
    </div>
  );
}
