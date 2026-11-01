import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import JsBarcode from 'jsbarcode';
import { TAG, fontStack, flipPriceFamily, flipPriceWeight, flipRed, type FlipSettings } from './config';
import { flipNum, type FlipData } from './data';
import { fitName, fitWidth, useFontsTick } from './fit';

/* ตัวแปรสี/ฟอนต์ของป้ายชุดนี้ — สีตามธีม (หมึกแดง/เกาหลี) โหมดขาวดำแทนแดงด้วยดำทั้งหมด */
const flipVars = (s: FlipSettings) =>
  ({ '--ft-red': flipRed(s), '--ft-font': fontStack(s.font), '--ft-price-font': flipPriceFamily(s), '--ft-price-weight': flipPriceWeight(s) }) as CSSProperties;
const wrapClass = (s: FlipSettings, base: string) => `${base} ft-theme-${s.theme}${s.mono ? ' flip-mono' : ''}`;
const FONT_WAIT = ['"Noto Serif SC"'];

interface Props {
  data: FlipData;
  settings: FlipSettings;
}

function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !value) return;
    try {
      JsBarcode(svg, value, { format: 'CODE128', displayValue: false, margin: 0, width: 1, height: 40 });
      // ให้ขนาดจริงถูกกำหนดด้วย CSS (มม.) ไม่ใช่ px จาก JsBarcode
      const w = parseFloat(svg.getAttribute('width') || '0');
      const h = parseFloat(svg.getAttribute('height') || '0');
      if (w && h) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('preserveAspectRatio', 'none');
    } catch {
      svg.innerHTML = ''; // บาร์โค้ดใช้ไม่ได้ — เว้นว่าง
    }
  }, [value]);
  if (!value) return null;
  return <svg ref={ref} className="ft-bc" />;
}

/* ตัวป้ายถาวร 90 × 40 มม. */
export function FlipTag({ data, settings }: Props) {
  const family = fontStack(settings.font);
  const tick = useFontsTick(...FONT_WAIT);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nameSz = useMemo(() => fitName(data.name, family), [data.name, family, tick]);

  return (
    <div className={wrapClass(settings, 'ft')} style={flipVars(settings)}>
      <div className="ft-head">
        <span className="ft-cn">{settings.shopCn}</span>
        <span className="ft-th">{settings.shopTh}</span>
        <span className="ft-corner">{data.corner}</span>
      </div>
      <div className="ft-body">
        <div className="ft-info">
          <div className="ft-name" style={{ fontSize: `${nameSz}mm` }}>
            {data.name}
          </div>
          {data.size && <div className="ft-size">{data.size}</div>}
          <div className="ft-spacer" />
          <Barcode value={data.barcode} />
          {data.footer && <div className="ft-foot">{data.footer}</div>}
        </div>
        <div className="ft-slot">
          <div className="ft-slot-box">ช่องแถบราคา</div>
        </div>
      </div>
    </div>
  );
}

/* ด้านหน้าแถบ: ราคา (ฟอนต์/สีตามธีมเดียวกับป้ายปกติ) */
export function FlipFront({ data, settings }: Props) {
  const family = fontStack(settings.font);
  const priceFamily = flipPriceFamily(settings);
  const priceWeight = flipPriceWeight(settings);
  const tick = useFontsTick(priceFamily, ...FONT_WAIT);
  const price = flipNum(data.price);
  // ธีมเอียง -4° ต้องเว้นที่ขอบเผื่อมุม จึงจำกัดความกว้างน้อยกว่าเล็กน้อย
  const maxW = settings.theme === 'ink' ? 33 : 36;
  /* eslint-disable react-hooks/exhaustive-deps */
  const priceSz = useMemo(
    () => fitWidth(price, priceFamily, priceWeight, maxW, 17.5, 11),
    [price, priceFamily, priceWeight, maxW, tick],
  );
  const packSz = useMemo(() => fitWidth(data.pack, family, 600, 36, 3, 2), [data.pack, family, tick]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className={wrapClass(settings, 'fs-face fs-front')} style={flipVars(settings)}>
      <div className="fs-pw">
        <div className="fs-price" style={{ fontSize: `${priceSz}mm` }}>
          {price}
        </div>
        <div className="fs-unit">{settings.unit}</div>
      </div>
      {data.pack && (
        <div className="fs-pack" style={{ fontSize: `${packSz}mm` }}>
          {data.pack}
        </div>
      )}
    </div>
  );
}

/* ด้านหลังแถบ: สินค้าหมด */
export function FlipBack({ settings }: { settings: FlipSettings }) {
  const family = fontStack(settings.font);
  const tick = useFontsTick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sz = useMemo(() => fitWidth(settings.outText, family, 800, 36, 8, 4), [settings.outText, family, tick]);
  return (
    <div className={wrapClass(settings, 'fs-face fs-back')} style={flipVars(settings)}>
      <div className="fs-out" style={{ fontSize: `${sz}mm` }}>
        {settings.outText}
      </div>
      {settings.outSub && <div className="fs-outsub">{settings.outSub}</div>}
    </div>
  );
}

/* แถบกางออก 80 × 31 มม.: หน้า | เส้นประพับ | หลัง — พับแล้วหนา 2 ชั้น */
export function FlipStrip({ data, settings }: Props) {
  return (
    <div className="fs" style={{ width: `${TAG.slotW * 2}mm`, height: `${TAG.stripH}mm` }}>
      <FlipFront data={data} settings={settings} />
      <FlipBack settings={settings} />
      <div className="fs-fold" />
    </div>
  );
}
