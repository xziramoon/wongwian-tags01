import mqtt, { type MqttClient } from 'mqtt';
import { AUTO_SYNC_TOPIC } from '../constants';

/* ⚠️ ห้ามแก้ตรรกะ — MQTT connect/subscribe/parse ยกมาจาก ScannerService เดิมตรงตัว */

export type ScannerStatus = 'connecting' | 'connected' | 'offline';
export type ScannerStatusListener = (status: ScannerStatus) => void;
export type BarcodeListener = (code: string, exp: string) => void;

class ScannerService {
  private client: MqttClient | null = null;
  private statusListeners: ScannerStatusListener[] = [];
  private barcodeListeners: BarcodeListener[] = [];

  onStatus(fn: ScannerStatusListener) {
    this.statusListeners.push(fn);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== fn);
    };
  }

  onBarcode(fn: BarcodeListener) {
    this.barcodeListeners.push(fn);
    return () => {
      this.barcodeListeners = this.barcodeListeners.filter((l) => l !== fn);
    };
  }

  private emitStatus(status: ScannerStatus) {
    this.statusListeners.forEach((l) => l(status));
  }

  connect() {
    if (this.client) this.client.end();
    this.client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

    this.client.on('connect', () => {
      this.client!.subscribe(AUTO_SYNC_TOPIC);
      this.emitStatus('connected');
    });
    this.client.on('offline', () => {
      this.emitStatus('offline');
    });
    this.client.on('message', (topic, msg) => {
      if (topic !== AUTO_SYNC_TOPIC) return;
      let code = '';
      let exp = '';
      try {
        const d = JSON.parse(msg.toString());
        code = d.barcode || d.Barcode || '';
        exp = d.exp || d.Exp || '';
        if (!code) {
          const key = Object.keys(d).find((k) => k.toLowerCase() === 'barcode');
          if (key) code = d[key];
        }
      } catch {
        code = msg.toString();
      }
      this.barcodeListeners.forEach((l) => l(code, exp));
    });
  }
}

export const scanner = new ScannerService();
