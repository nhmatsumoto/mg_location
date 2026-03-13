import { useEffect, useState, Suspense, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { StatusStrip } from './StatusStrip';
import { ToastStack } from '../feedback/ToastStack';
import { NotificationCenter } from '../feedback/NotificationCenter';
import { useNotifications } from '../../context/NotificationsContext';
import { setApiNotifier } from '../../services/apiClient';

interface AppShellProps {
  children: ReactNode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  variant?: 'default' | 'tactical';
}

export function AppShell({ children, theme, onToggleTheme, variant = 'default' }: AppShellProps) {
  const themeClass = theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_45%)] text-slate-100'
    : 'bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#f8fafc_55%)] text-slate-900';

  const { notices, pushNotice } = useNotifications();
  const [openCenter, setOpenCenter] = useState(false);

  useEffect(() => {
    setApiNotifier((title, message) => pushNotice({ title, message, type: 'error' }));
  }, [pushNotice]);

  if (variant === 'tactical') {
    return (
      <div className={`min-h-screen ${themeClass}`}>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar className="w-64 h-full shrink-0 border-r border-slate-700/50 bg-slate-900/90" />
          <main className="flex-1 relative overflow-hidden">
            <Suspense fallback={<div className="p-8 text-slate-500 font-bold animate-pulse text-center">Iniciando sistemas de comando...</div>}>
              {children}
            </Suspense>
            <div className="absolute top-4 right-4 z-40">
              <Topbar
                theme={theme}
                onToggleTheme={onToggleTheme}
                notificationCount={notices.length}
                onOpenNotifications={() => setOpenCenter(true)}
                minimal
              />
            </div>
          </main>
        </div>
        <NotificationCenter open={openCenter} onClose={() => setOpenCenter(false)} />
        <ToastStack />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClass}`}>
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="space-y-3">
          <Topbar
            theme={theme}
            onToggleTheme={onToggleTheme}
            notificationCount={notices.length}
            onOpenNotifications={() => setOpenCenter(true)}
          />
          <StatusStrip />
          {children}
        </main>
      </div>
      <NotificationCenter open={openCenter} onClose={() => setOpenCenter(false)} />
      <ToastStack />
    </div>
  );
}
