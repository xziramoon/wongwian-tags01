import { useUIStore } from '../store/uiStore';

const MQTT_TEXT: Record<string, string> = {
  o: 'กำลังเชื่อมต่อเครื่องยิงบาร์โค้ด...',
  g: 'เครื่องยิงบาร์โค้ดพร้อมใช้ — ยิงสินค้าได้เลย',
  r: 'เครื่องยิงหลุดการเชื่อมต่อ — กำลังต่อใหม่ให้...',
};

const MQTT_CLASS: Record<string, string> = {
  o: '',
  g: 'status-ok',
  r: 'status-err',
};

export default function ScannerStatus() {
  const mqttStatus = useUIStore((s) => s.mqttStatus);
  return (
    <div id="mqtt-status" className={MQTT_CLASS[mqttStatus]}>
      <span className="mqtt-dot" />
      <span className="mqtt-text">{MQTT_TEXT[mqttStatus]}</span>
    </div>
  );
}
