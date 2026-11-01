import { SHEET } from './config';
import { chunk, sortByLot, type FlipData } from './data';
import { FlipStrip, FlipTag } from './FlipTag';
import { useFlipSettings, useFlipStore } from './store';

const expand = (items: FlipData[]) => sortByLot(items).flatMap((d) => Array.from({ length: d.qty }, () => d));

/* แผ่น A4 สำหรับพิมพ์ (ซ่อนบนจอ แสดงเฉพาะตอน body.print-flip)
 * ตัวป้าย 2×7 = 14 ใบ/แผ่น · แถบกางออก 2×9 = 18 แถบ/แผ่น · มีเส้นตัดบางสีเทา */
export default function FlipSheets() {
  const job = useFlipStore((s) => s.job);
  const settings = useFlipSettings();
  if (!job) return <div id="flip-sheets" />;

  const all = expand(job.items);
  const tagPages = job.kind === 'strips' ? [] : chunk(all, SHEET.tagCols * SHEET.tagRows);
  const stripPages = job.kind === 'tags' ? [] : chunk(all, SHEET.stripCols * SHEET.stripRows);

  return (
    <div id="flip-sheets">
      {tagPages.map((page, i) => (
        <div key={`t${i}`} className="fsheet fsheet-tags">
          {page.map((d, j) => (
            <div key={j} className="fcell">
              <FlipTag data={d} settings={settings} />
            </div>
          ))}
        </div>
      ))}
      {stripPages.map((page, i) => (
        <div key={`s${i}`} className="fsheet fsheet-strips">
          {page.map((d, j) => (
            <div key={j} className="fcell">
              <FlipStrip data={d} settings={settings} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
