import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { ArrowLeft, Eye, EyeOff, Plus, Repeat, Trash2 } from 'lucide-react';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Toggle } from '@/components/ui/toggle';
import type { RecurringTrip } from '@/core/models';
import { universityLabel } from '@/modules/travel/const';
import { parseRRULE } from '@/modules/travel/pages/new-travel/components/recurrence-selector/RecurrenceSelector';
import { useRecurringTrips } from '@/modules/travel/pages/new-travel/hooks/useRecurringTrips';
import { getClosestReferencePoint } from '@/modules/travel/utils';
import { useDeleteRecurringTrip } from './hooks/useDeleteRecurringTrip';
import { useUpdateRecurringTripVisibility } from './hooks/useUpdateRecurringTripVisibility';

const MAX_RECURRENTS = 5;

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function Recurrents() {
  const navigate = useNavigate();
  const { user } = useRouteContext({
    from: '/_layout/_auth/profile/recurrents',
  });
  const { data: trips = [] } = useRecurringTrips(user?.id);
  const { mutate: deleteTrip, isPending: isDeleting } =
    useDeleteRecurringTrip();
  const { mutate: updateVisibility, isPending: isUpdatingVisibility } =
    useUpdateRecurringTripVisibility();

  const count = trips.length;
  const atMax = count >= MAX_RECURRENTS;

  return (
    <>
      <TopStack>
        <TopStackAction>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/profile' })}
          >
            <ArrowLeft />
          </Button>
        </TopStackAction>
        <TopStackTitle>Viajes Recurrentes</TopStackTitle>
        <TopStackAction />
      </TopStack>

      <main className="flex-1 px-4 pt-4 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {count} / {MAX_RECURRENTS} viajes
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/travel/new' })}
            disabled={atMax}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear nuevo
          </Button>
        </div>

        {trips.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Repeat className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                No tienes viajes recurrentes.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea un viaje y actívalo como recurrente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <RecurrentTripItem
                key={trip.id}
                trip={trip}
                onDelete={() => deleteTrip(trip.id)}
                isDeleting={isDeleting}
                onToggleVisibility={(isVisible) =>
                  updateVisibility({ tripId: trip.id, isVisible })
                }
                isUpdatingVisibility={isUpdatingVisibility}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function RecurrentTripItem({
  trip,
  onDelete,
  isDeleting,
  onToggleVisibility,
  isUpdatingVisibility,
}: {
  trip: RecurringTrip;
  onDelete: () => void;
  isDeleting: boolean;
  onToggleVisibility: (isVisible: boolean) => void;
  isUpdatingVisibility: boolean;
}) {
  const isToCampus = trip.direction === 'to_campus';

  const originRef = getClosestReferencePoint([
    trip.originCoords.lat,
    trip.originCoords.lon,
  ]);
  const destRef = getClosestReferencePoint([
    trip.destinationCoords.lat,
    trip.destinationCoords.lon,
  ]);

  const originLabel = isToCampus
    ? (originRef?.label ?? 'Ubicación')
    : universityLabel;
  const destinationLabel = isToCampus
    ? universityLabel
    : (destRef?.label ?? 'Ubicación');

  const priceLabel = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  }).format(trip.price);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="w-0.5 h-6 bg-primary/30" />
              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{originLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {parseRRULE(trip.recurrenceRule)} ·{' '}
                {formatTime12(trip.tripTime)} · {trip.seats}{' '}
                {trip.seats === 1 ? 'asiento' : 'asientos'} · {priceLabel}
              </p>
              <p className="text-sm font-semibold truncate mt-2">
                {destinationLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Toggle
              variant="outline"
              size="sm"
              pressed={trip.isVisible}
              onPressedChange={(pressed) => onToggleVisibility(pressed)}
              disabled={isUpdatingVisibility}
              aria-label="Toggle visibilidad"
              className="h-8 w-8 p-0"
            >
              {trip.isVisible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Toggle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {trip.routeDescription && (
          <>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground italic">
              {trip.routeDescription}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
