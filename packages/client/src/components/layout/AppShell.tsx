import { useState, useCallback, useEffect, type ReactNode } from 'react';
import HeaderBar from './HeaderBar.js';
import Sidebar from './Sidebar.js';
import MobileNav from './MobileNav.js';
import KeyboardHelpModal from './KeyboardHelpModal.js';
import MobileHelpModal from './MobileHelpModal.js';
import ToastContainer from './ToastContainer.js';
import PullToRefreshIndicator from './PullToRefreshIndicator.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import { usePullToRefresh } from '../../hooks/usePullToRefresh.js';
import { useAuthStore } from '../../stores/authStore.js';

interface AppShellProps {
  children: ReactNode;
  breadcrumb?: string;
  onRefresh?: () => Promise<void> | void;
}

function KeyboardShortcutsProvider({ onToggleHelp }: { onToggleHelp: () => void }) {
  useKeyboardShortcuts(onToggleHelp);
  return null;
}

export default function AppShell({ children, onRefresh }: AppShellProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const toggleHelp = useCallback(() => setShowHelp((v) => !v), []);
  const { checkSession, isAuthenticated, isLoading } = useAuthStore();

  const defaultRefresh = useCallback(async () => {
    window.location.reload();
  }, []);

  const { containerRef, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: onRefresh ?? defaultRefresh,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkSession();
    }
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-[var(--bg-void)] scanline-overlay">
      <KeyboardShortcutsProvider onToggleHelp={toggleHelp} />
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main ref={containerRef} className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>
      </div>
      <MobileNav />
      <ToastContainer />
      {showHelp && (
        isMobile 
          ? <MobileHelpModal onClose={() => setShowHelp(false)} />
          : <KeyboardHelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}
