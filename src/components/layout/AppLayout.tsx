import { useLocation } from '@tanstack/react-router';
import { Activity, type PropsWithChildren } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppNavbar from '../common/AppNavbar';
import { SidebarTrigger } from '../ui/sidebar';

export default function AppLayout({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const istravelRoom =
    pathname === '/travel/room' || pathname.startsWith('/travel/room/');
  const isTravelDetailOrNew = pathname.startsWith('/travel/');
  return (
    <div className="flex flex-col h-dvh w-full">
      <Activity mode={isMobile ? 'hidden' : 'visible'}>
        <SidebarTrigger />
      </Activity>
      {children}{' '}
      {!isTravelDetailOrNew && (
        <Activity mode={isMobile && !istravelRoom ? 'visible' : 'hidden'}>
          <AppNavbar />
        </Activity>
      )}
    </div>
  );
}
