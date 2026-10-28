import { useLocation } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import AppNavbar from '../common/AppNavbar';
import { SidebarTrigger } from '../ui/sidebar';

export default function AppLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const istravelRoom =
    pathname === '/travel/room' || pathname.startsWith('/travel/room/');
  const isTravelDetailOrNew = pathname.startsWith('/travel/');
  return (
    <div className="flex flex-col h-dvh w-full">
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>
      {children}{' '}
      {!isTravelDetailOrNew && !istravelRoom && (
        <div className="md:hidden">
          <AppNavbar />
        </div>
      )}
    </div>
  );
}
