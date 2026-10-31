import { useRef } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import PriceTag from './PriceTag';
import ScrollTopFab from './ScrollTopFab';
import { chunkSheets, fridgeSheetLayout, printRank } from '../lib/fridge';
import { hamperSheetLayout } from '../lib/hamper';

export default function Workspace() {
  const queue = useQueueStore((s) => s.queue);
  const config = useQueueStore((s) => s.config);
  const selectedTagIndex = useUIStore((s) => s.selectedTagIndex);
  const clearSelection = useUIStore((s) => s.clearSelection);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const tags: { key: string; queueIndex: number }[] = [];
  queue.forEach((item, index) => {
    for (let k = 0; k < item.PrintQty; k++) {
      tags.push({ key: `${index}-${k}`, queueIndex: index });
    }
  });
  /* ลำดับบนกระดาษเหมือน TAG_PRINTER: ป้ายทั่วไป → แผ่นป้ายตู้แช่ → แผ่นป้ายกระเช้า (ตาราง A4 ขึ้นหน้าใหม่) → แถบสินค้าหมด */
  const rankOf = (t: { queueIndex: number }) => printRank(queue[t.queueIndex].TagMode);
  const sheet = fridgeSheetLayout(config);
  const fridgeSheets = chunkSheets(tags.filter((t) => rankOf(t) === 1), sheet.perSheet);
  const hpSheet = hamperSheetLayout(config);
  const hamperSheets = chunkSheets(tags.filter((t) => rankOf(t) === 2), hpSheet.perSheet);
  const renderTag = ({ key, queueIndex }: { key: string; queueIndex: number }) => (
    <PriceTag
      key={key}
      item={queue[queueIndex]}
      config={config}
      queueIndex={queueIndex}
      selected={selectedTagIndex === queueIndex}
    />
  );

  return (
    <>
      <main className="workspace" id="workspace" ref={workspaceRef} onClick={clearSelection}>
        <div id="print-area">
          {tags.length === 0 ? (
            <div className="empty-msg">ยังไม่มีป้ายราคา — สแกนสินค้าเพื่อเริ่ม</div>
          ) : (
            <>
              {tags.filter((t) => rankOf(t) === 0).map(renderTag)}
              {fridgeSheets.map((s, i) => (
                <div key={`fr-sheet-${i}`} className="fr-sheet" style={{ gridTemplateColumns: `repeat(${sheet.cols}, var(--fridge-w))` }}>
                  {s.map(renderTag)}
                </div>
              ))}
              {hamperSheets.map((s, i) => (
                <div key={`hp-sheet-${i}`} className="hp-sheet" style={{ gridTemplateColumns: `repeat(${hpSheet.cols}, var(--hamper-w))` }}>
                  {s.map(renderTag)}
                </div>
              ))}
              {tags.filter((t) => rankOf(t) === 3).map(renderTag)}
            </>
          )}
        </div>
      </main>
      <ScrollTopFab targetRef={workspaceRef} variant="workspace" />
    </>
  );
}
