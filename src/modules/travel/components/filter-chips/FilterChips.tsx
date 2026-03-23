import { BadgeCheck, Calendar, CarFront, Clock, MapPin } from 'lucide-react';
import { useRef } from 'react';
import styles from '@/assets/styles/no-scrollbar.module.css';
import { Badge } from '@/components/ui/badge';
import { useFilters } from '@/hooks/use-filters';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function FilterChips() {
  const isMobile = useIsMobile();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const { filters, setFilters } = useFilters('/_layout/_auth/home');

  const openInputPicker = (input: HTMLInputElement | null) => {
    if (!input) return;

    const picker = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof picker.showPicker === 'function') {
      picker.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const applyDate = (date: Date) => {
    const current = filters.datetime ? new Date(filters.datetime) : new Date();
    const next = new Date(current);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setFilters({ datetime: next });
  };

  const applyTime = (hours: number, minutes: number) => {
    const current = filters.datetime ? new Date(filters.datetime) : new Date();
    const next = new Date(current);
    next.setHours(hours, minutes, 0, 0);
    setFilters({ datetime: next });
  };

  const isAllSelected =
    !filters.datetime &&
    filters.onlyOffers !== true &&
    filters.location === undefined;

  const isAnyFilterApplied =
    Boolean(filters.datetime) ||
    filters.onlyOffers === true ||
    filters.location !== undefined;
  const isOffersSelected = filters.onlyOffers === true;

  const isDefaultLocationSelected = filters.location === 'default';

  const baseBadgeClass =
    'shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs cursor-pointer transition-all';
  const activeClass = 'font-semibold shadow-lg shadow-primary/25';
  const inactiveClass = 'font-medium bg-card hover:bg-accent';

  const datetimeValue = filters.datetime
    ? new Date(filters.datetime)
    : new Date();

  return (
    <div
      className={cn(
        'flex gap-2 px-4 py-4 overflow-x-auto w-full',
        styles['no-scrollbar']
      )}
    >
      <Badge
        variant={isAllSelected ? 'default' : 'outline'}
        className={cn(
          baseBadgeClass,
          isAllSelected ? activeClass : inactiveClass
        )}
        onClick={() =>
          setFilters({
            datetime: undefined,
            onlyOffers: undefined,
            location: undefined,
          })
        }
        aria-disabled={!isAnyFilterApplied}
      >
        <BadgeCheck className={cn('w-4 h-4', !isAllSelected && 'hidden')} />
        <span>Todos</span>
      </Badge>

      <Badge
        variant={isOffersSelected ? 'default' : 'outline'}
        className={cn(
          baseBadgeClass,
          isOffersSelected ? activeClass : inactiveClass
        )}
        onClick={() =>
          setFilters({ onlyOffers: isOffersSelected ? undefined : true })
        }
      >
        <CarFront className="w-4 h-4" />
        <span>Asignados</span>
      </Badge>

      <Badge
        variant={isDefaultLocationSelected ? 'default' : 'outline'}
        className={cn(
          baseBadgeClass,
          isDefaultLocationSelected ? activeClass : inactiveClass
        )}
        onClick={() =>
          setFilters({
            location: isDefaultLocationSelected ? undefined : 'default',
          })
        }
      >
        <MapPin className="w-4 h-4" />
        <span>Mi ubicación</span>
      </Badge>

      <Badge
        variant={filters.datetime ? 'default' : 'outline'}
        className={cn(
          'relative overflow-hidden',
          baseBadgeClass,
          filters.datetime ? activeClass : inactiveClass
        )}
        onClick={() => {
          if (!isMobile) {
            openInputPicker(dateInputRef.current);
          }
        }}
      >
        <Calendar className="w-4 h-4" />
        <span>Fecha</span>
        <input
          ref={dateInputRef}
          type="date"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={toDateValue(datetimeValue)}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split('-').map(Number);
            const next = new Date(datetimeValue);
            next.setFullYear(y, m - 1, d);
            applyDate(next);
          }}
        />
      </Badge>

      <Badge
        variant={filters.datetime ? 'default' : 'outline'}
        className={cn(
          'relative overflow-hidden',
          baseBadgeClass,
          filters.datetime ? activeClass : inactiveClass
        )}
        onClick={() => {
          if (!isMobile) {
            openInputPicker(timeInputRef.current);
          }
        }}
      >
        <Clock className="w-4 h-4" />
        <span>Hora</span>
        <input
          ref={timeInputRef}
          type="time"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          step={300}
          value={toTimeValue(datetimeValue)}
          onChange={(e) => {
            const [h, min] = e.target.value.split(':').map(Number);
            applyTime(h, min);
          }}
        />
      </Badge>
    </div>
  );
}

const toDateValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toTimeValue = (date: Date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};
