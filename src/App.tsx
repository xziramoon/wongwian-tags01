import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import ToastContainer from './components/ToastContainer';
import SyncModal from './components/SyncModal';
import { useQueueStore } from './store/queueStore';
import { useUIStore } from './store/uiStore';
import { audioEngine } from './lib/audio';
import { database } from './lib/database';
import { scanner } from './lib/scanner';
import { applyCSSVars } from './lib/cssVars';
import { computeDiffs, startAutoSync } from './lib/sync';

function App() {
  const config = useQueueStore((s) => s.config);

  // apply tag CSS custom properties whenever config changes
  useEffect(() => {
    applyCSSVars(config);
  }, [config]);

  // one-time app init: MQTT scanner, initial DB sync, background auto price-check
  useEffect(() => {
    const setStatus = useUIStore.getState().setStatus;
    const setMqttStatus = useUIStore.getState().setMqttStatus;
    const showToast = useUIStore.getState().showToast;

    const offStatus = scanner.onStatus((status) => {
      setMqttStatus(status === 'connected' ? 'g' : status === 'offline' ? 'r' : 'o');
    });
    const offBarcode = scanner.onBarcode((code, exp) => {
      useQueueStore.getState().addFromBarcode(code, exp);
    });
    scanner.connect();

    setStatus('o');
    let stopAuto: (() => void) | undefined;
    database
      .sync()
      .then(() => {
        setStatus('g');
        const diffs = computeDiffs();
        if (diffs.length) {
          useQueueStore.getState().flagPriceDiffs(diffs);
          showToast(`⚠ ${diffs.length} รายการราคาต่างจาก Sheet · กด SYNC`, 'error');
        }
        stopAuto = startAutoSync();
      })
      .catch(() => {
        setStatus('r');
        showToast('ซิงค์ฐานข้อมูลไม่สำเร็จ — ลองกด SYNC ใหม่ภายหลัง', 'error');
      });

    // unlock AudioContext on first user interaction (browsers block autoplay until then)
    document.body.addEventListener('click', () => audioEngine.unlock(), { once: true });

    return () => {
      offStatus();
      offBarcode();
      stopAuto?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ToastContainer />
      <SyncModal />
      <Sidebar />
      <Workspace />
    </>
  );
}

export default App;
