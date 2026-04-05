import { Link, useLoaderData, useRouteContext } from '@tanstack/react-router';
import { MapPinOff, MapPinXInside } from 'lucide-react';
import { useEffect, useRef } from 'react';
import styles from '@/assets/styles/no-scrollbar.module.css';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn, getDirectionByHour, getNowInLima } from '@/lib/utils';
import FilterChips from './components/filter-chips/FilterChips';
import RideCard from './components/ride-card/RideCard';
import RideCardSkeleton from './components/ride-card/RideCardSkeleton';
import UserHeader from './components/user-header/UserHeader';
import { useListRooms } from './hooks/useListRooms';

export default function Travel() {
  const { user } = useRouteContext({ from: '/_layout/_auth/home' });
  const { filters } = useLoaderData({ from: '/_layout/_auth/home' });

  const {
    isError,
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useListRooms(filters);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const travelRooms = data?.pages.flatMap((page) => page.travels) ?? [];

  return (
    <div className="flex flex-1 w-full flex-col overflow-hidden [view-transition-name:main-content]">
      <div className="shrink-0">
        <UserHeader {...user} />
      </div>

      <main className="flex flex-col flex-1 overflow-hidden z-10 relative">
        <div className="shrink-0">
          <FilterChips />
        </div>
        <div
          className={cn(
            'flex-1 px-4 pb-24 space-y-2 overflow-y-auto',
            styles['no-scrollbar']
          )}
        >
          {isLoading ? (
            ['sk-1', 'sk-2', 'sk-3'].map((key) => (
              <RideCardSkeleton key={key} />
            ))
          ) : travelRooms.length ? (
            <>
              {travelRooms.map((room) => (
                <div
                  key={room.id}
                  style={{ viewTransitionName: `ride-card-${room.id}` }}
                >
                  <RideCard {...room} />
                </div>
              ))}
              {isFetchingNextPage &&
                ['load-1', 'load-2'].map((key) => (
                  <RideCardSkeleton key={key} />
                ))}
              <div ref={sentinelRef} className="h-1" />
            </>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  {isError ? <MapPinXInside /> : <MapPinOff />}
                </EmptyMedia>
                <EmptyTitle>
                  {isError
                    ? 'No se pudieron cargar los viajes'
                    : 'No hay viajes disponibles'}
                </EmptyTitle>
              </EmptyHeader>
              {!isError && (
                <EmptyContent>
                  <Button asChild>
                    <Link to="/travel/new"> Crear un nuevo viaje</Link>
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}
        </div>
      </main>
    </div>
  );
}
