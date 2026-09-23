import { useEffect, useMemo, useRef, useState } from 'react';
import { database, MIN_QUERY_LENGTH } from '../lib/database';
import { useQueueStore } from '../store/queueStore';
import { debounce } from '../lib/utils';
import type { Product } from '../types';
import ScannerStatus from './ScannerStatus';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const addFromBarcode = useQueueStore((s) => s.addFromBarcode);
  const containerRef = useRef<HTMLDivElement>(null);

  // the product sheet runs ~38k rows, so database.search() gets scanned on every
  // keystroke — debounce so fast typing doesn't stack up a full-table scan per
  // character (this used to make typing feel sluggish/stuck on a large catalog)
  const applyDebounced = useMemo(() => debounce((q: string) => setDebouncedQuery(q), 150), []);

  useEffect(() => {
    applyDebounced(query);
  }, [query, applyDebounced]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setOpen(false);
      return;
    }
    setResults(database.search(debouncedQuery));
    setOpen(true);
    // re-run the search if the product database refreshes in the background
    // (e.g. the 5-minute auto price-check) while the dropdown is still open
    return database.onChange(() => setResults(database.search(debouncedQuery)));
  }, [debouncedQuery]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const pick = (p: Product) => {
    addFromBarcode(p.Barcode);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="panel">
      <div className="p-lbl">
        <span className="step-no">1</span> เพิ่มสินค้า
      </div>
      <ScannerStatus />
      <div className="search-container" ref={containerRef}>
        <div className="search-box-inner">
          <span className="search-ico">⌕</span>
          <input
            className="inp"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="หรือพิมพ์ชื่อสินค้า / เลขบาร์โค้ด ที่นี่..."
            autoComplete="off"
          />
        </div>
        <div className={`search-drop${open ? ' open' : ''}`}>
          {open && query.trim().length < MIN_QUERY_LENGTH && (
            <div className="s-item">
              <span className="s-meta">พิมพ์อย่างน้อย {MIN_QUERY_LENGTH} ตัวอักษร</span>
            </div>
          )}
          {open && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
            <div className="s-item">
              <span className="s-meta" style={{ color: 'var(--r)' }}>
                ✕ ไม่พบสินค้า
              </span>
            </div>
          )}
          {open &&
            results.map((p, i) => (
              <div className="s-item" key={`${p.Barcode}-${i}`} onClick={() => pick(p)}>
                {p.Image && (
                  <img
                    className="s-thumb"
                    src={p.Image}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="s-name">{p.ProductName}</div>
                  <div className="s-meta">
                    {p.Barcode} · {p.Price} บาท
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
