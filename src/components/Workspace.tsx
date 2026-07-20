import { useRef } from 'react';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import PriceTag from './PriceTag';
import ScrollTopFab from './ScrollTopFab';

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

  return (
    <>
      <main className="workspace" id="workspace" ref={workspaceRef} onClick={clearSelection}>
        <div id="print-area">
          {tags.length === 0 ? (
            <div className="empty-msg">ยังไม่มีป้ายราคา — สแกนสินค้าเพื่อเริ่ม</div>
          ) : (
            tags.map(({ key, queueIndex }) => (
              <PriceTag
                key={key}
                item={queue[queueIndex]}
                config={config}
                queueIndex={queueIndex}
                selected={selectedTagIndex === queueIndex}
              />
            ))
          )}
        </div>
      </main>
      <ScrollTopFab targetRef={workspaceRef} variant="workspace" />
    </>
  );
}
