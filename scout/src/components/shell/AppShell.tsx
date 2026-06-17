import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { SearchModal } from '../search/SearchModal';
import { useUIStore } from '../../store/uiStore';

export function AppShell() {
  const location = useLocation();
  const toggleSearch = useUIStore((s) => s.toggleSearch);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <TopBar />
      <main key={location.pathname} className="route-fade" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
      <StatusBar />
      <SearchModal />
    </div>
  );
}
