import { useRef } from 'react';
import Header from './Header';
import SearchPanel from './SearchPanel';
import QueuePanel from './QueuePanel';
import SettingsFold from './SettingsFold';
import BackupFold from './BackupFold';
import PrintFooter from './PrintFooter';
import ScrollTopFab from './ScrollTopFab';

export default function Sidebar() {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <aside className="sidebar">
        <Header />
        <div className="sb-body" ref={bodyRef}>
          <SearchPanel />
          <QueuePanel />
          <SettingsFold />
          <BackupFold />
        </div>
        <PrintFooter />
      </aside>
      <ScrollTopFab targetRef={bodyRef} variant="sidebar" />
    </>
  );
}
