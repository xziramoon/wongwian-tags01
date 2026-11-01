import { sortByLot, type FlipData } from './data';
import { FlipSticker, FlipStripAny, FlipTagAny } from './FlipTag';
import { packPages, pageOffset, stickerSize, stickersPerSheet, stripSize, tagSize, type Placed, type Size } from './layout';
import { useFlipSettings, useFlipStore } from './store';

const expand = (items: FlipData[]) => sortByLot(items).flatMap((d) => Array.from({ length: d.qty }, () => d));

type Piece = Size & { d?: FlipData };

function Page({ page, className, render }: { page: Placed<Piece>[]; className: string; render: (p: Piece) => React.ReactNode }) {
  const dx = pageOffset(page);
  return (
    <div className={`fsheet ${className}`}>
      {page.map(({ item, x, y }, i) => (
        <div
          key={i}
          className="fpiece"
          style={{ left: `${x + dx}mm`, top: `${y}mm`, width: `${item.w}mm`, height: `${item.h}mm` }}
        >
          {render(item)}
        </div>
      ))}
    </div>
  );
}

/* แผ่น A4 สำหรับพิมพ์ (ซ่อนบนจอ แสดงเฉพาะตอน body.print-flip)
 * จัดหน้าแบบชั้น (layout.ts): ตัวป้าย 14/แผ่น · แถบ 18 · ป้ายแคบ 28 · แถบแคบ 24 · สติกเกอร์ "หมด" เต็มแผ่น
 * ผสมขนาดในแผ่นเดียวได้ เรียงตามล็อค · มีเส้นตัดบางสีเทา */
export default function FlipSheets() {
  const job = useFlipStore((s) => s.job);
  const settings = useFlipSettings();
  if (!job) return <div id="flip-sheets" />;

  const all = expand(job.items);
  const tagPages =
    job.kind === 'tags' || job.kind === 'both'
      ? packPages<Piece>(all.map((d) => ({ ...tagSize(d), d })))
      : [];
  const stripPages =
    job.kind === 'strips' || job.kind === 'both'
      ? packPages<Piece>(all.map((d) => ({ ...stripSize(d), d })))
      : [];
  const stickerPages =
    job.kind === 'stickers' ? packPages<Piece>(Array.from({ length: stickersPerSheet() }, () => ({ ...stickerSize() }))) : [];

  return (
    <div id="flip-sheets">
      {tagPages.map((page, i) => (
        <Page
          key={`t${i}`}
          page={page}
          className="fsheet-tags"
          render={(p) => p.d && <FlipTagAny data={p.d} settings={settings} />}
        />
      ))}
      {stripPages.map((page, i) => (
        <Page
          key={`s${i}`}
          page={page}
          className="fsheet-strips"
          render={(p) => p.d && <FlipStripAny data={p.d} settings={settings} />}
        />
      ))}
      {stickerPages.map((page, i) => (
        <Page key={`k${i}`} page={page} className="fsheet-stickers" render={() => <FlipSticker settings={settings} />} />
      ))}
    </div>
  );
}
