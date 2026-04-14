import { useEffect } from 'react';
import styles from '@/assets/styles/no-scrollbar.module.css';
import { useTourFlow } from '@/hooks/use-tour-flow';
import { cn } from '@/lib/utils';
import MenuItems from './components/MenuItems';
import ProfileHeader from './components/ProfileHeader';
import StatsCards from './components/StatsCards';

export default function Profile() {
  const { shouldPrompt, startFlow } = useTourFlow('profile');

  useEffect(() => {
    if (!shouldPrompt) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startFlow();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldPrompt, startFlow]);

  return (
    <div className="flex-1 flex w-full flex-col overflow-hidden [view-transition-name:main-content]">
      <main className={cn('flex-1 overflow-y-scroll', styles['no-scrollbar'])}>
        <ProfileHeader />
        <StatsCards />
        <MenuItems />
      </main>
    </div>
  );
}
