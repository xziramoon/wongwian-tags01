import { useUIStore } from '../store/uiStore';

const STATUS_TEXT: Record<string, string> = {
  txt: 'กำลังเริ่มระบบ...',
  o: 'กำลังโหลดข้อมูล กรุณารอสักครู่...',
  g: '✔ ระบบพร้อมใช้งาน',
  r: '⚠ มีปัญหาการเชื่อมต่อ — ลองเช็คอินเทอร์เน็ต',
};

const STATUS_CLASS: Record<string, string> = {
  txt: '',
  o: 'status-busy',
  g: 'status-ok',
  r: 'status-err',
};

export default function Header() {
  const statusColor = useUIStore((s) => s.statusColor);

  return (
    <>
      <div className="sb-head">
        <div className="sb-head-logo">◎</div>
        <div className="brand-mark">ร้านวงเวียน</div>
        <div className="brand-sub">ระบบพิมพ์ป้ายราคา</div>
      </div>
      <div id="status-bar" className={STATUS_CLASS[statusColor]}>
        {STATUS_TEXT[statusColor]}
      </div>
    </>
  );
}
