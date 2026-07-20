import { useRef } from 'react';
import { database } from '../lib/database';
import { useQueueStore } from '../store/queueStore';
import { useUIStore } from '../store/uiStore';
import { SHEET_EDIT_URL } from '../constants';

export default function BackupFold() {
  const exportQueue = useQueueStore((s) => s.exportQueue);
  const importQueue = useQueueStore((s) => s.importQueue);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await database.importCSV(file);
      useUIStore.getState().showToast(`โหลดไฟล์ราคาแล้ว: ${data.length} รายการ`, 'success');
    } catch {
      useUIStore.getState().showToast('อ่านไฟล์ CSV ไม่สำเร็จ', 'error');
    }
    e.target.value = '';
  };

  const handleQueueImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importQueue(file);
    e.target.value = '';
  };

  return (
    <details className="fold">
      <summary>
        สำรองข้อมูล และไฟล์ราคา<span className="fold-arrow">▾</span>
      </summary>
      <div className="fold-body">
        <button className="btn btn-io" onClick={() => window.open(SHEET_EDIT_URL, '_blank')}>
          เปิด Google Sheet เพื่อแก้ราคา
        </button>
        <button className="btn btn-io" onClick={() => csvInputRef.current?.click()} title="อัปโหลดไฟล์ Excel (.csv)">
          เปิดไฟล์ราคาจากเครื่อง (CSV)
        </button>
        <input type="file" ref={csvInputRef} style={{ display: 'none' }} accept=".csv" onChange={handleCsvImport} />
        <div className="btn-row">
          <button className="btn btn-io" onClick={exportQueue}>
            สำรองรายการป้าย
          </button>
          <button className="btn btn-io" onClick={() => fileInputRef.current?.click()}>
            กู้คืนจากไฟล์
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleQueueImport} />
        </div>
      </div>
    </details>
  );
}
