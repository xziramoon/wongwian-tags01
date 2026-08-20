import { useHistoryStore, type PrintSource } from '../store/historyStore';

const SOURCE_LABEL: Record<PrintSource, string> = {
  remote: '📡 เครื่องพิมพ์ปลายทาง',
  local: '⎙ พิมพ์เครื่องนี้',
};

function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HistoryFold() {
  const entries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  return (
    <details className="fold">
      <summary>
        ประวัติการพิมพ์{entries.length > 0 ? ` (${entries.length})` : ''}
        <span className="fold-arrow">▾</span>
      </summary>
      <div className="fold-body">
        {entries.length === 0 && <div className="fold-hint">ยังไม่มีประวัติการพิมพ์</div>}
        {entries.map((entry) => (
          <details className="history-entry" key={entry.id}>
            <summary className="history-entry-head">
              <span className={`history-badge history-badge-${entry.source}`}>{SOURCE_LABEL[entry.source]}</span>
              <span className="history-entry-time">{fmtDateTime(entry.ts)}</span>
              <span className="history-entry-count">
                {entry.tagCount} ใบ ({entry.itemCount} รายการ)
              </span>
            </summary>
            <div className="history-items">
              {entry.items.map((item, i) => (
                <div className="history-item-row" key={i}>
                  <span className="history-item-name">{item.ProductName || item.Barcode || '—'}</span>
                  <span className="history-item-qty">×{item.PrintQty}</span>
                </div>
              ))}
            </div>
          </details>
        ))}
        {entries.length > 0 && (
          <button className="btn btn-io" onClick={clearHistory}>
            ล้างประวัติทั้งหมด
          </button>
        )}
      </div>
    </details>
  );
}
