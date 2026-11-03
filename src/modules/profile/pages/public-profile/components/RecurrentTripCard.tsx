import { Repeat, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { RecurringTrip } from '@/core/models';
import { universityLabel } from '@/modules/travel/const';
import { getClosestReferencePoint } from '@/modules/travel/utils';

interface RecurrentTripCardProps {
  trip: RecurringTrip;
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function parseRRULE(rule: string) {
  const parts = rule.replace('RRULE:', '').split(';');
  const freq = parts.find((p) => p.startsWith('FREQ='))?.split('=')[1];
  const byDay = parts.find((p) => p.startsWith('BYDAY='))?.split('=')[1];

  const dayMap: Record<string, string> = {
    MO: 'Lun',
    TU: 'Mar',
    WE: 'Mié',
    TH: 'Jue',
    FR: 'Vie',
    SA: 'Sáb',
    SU: 'Dom',
  };

  const freqMap: Record<string, string> = {
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
  };

  const freqLabel = freqMap[freq ?? ''] ?? freq ?? '';
  const daysLabel = byDay
    ?.split(',')
    .map((d) => dayMap[d] ?? d)
    .join(', ');

  return daysLabel ? `${freqLabel} · ${daysLabel}` : freqLabel;
}

export default function RecurrentTripCard({ trip }: RecurrentTripCardProps) {
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
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <div className="w-0.5 h-6 bg-primary/30" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Origen</p>
              <p className="text-sm font-semibold">{originLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="text-sm font-semibold">{destinationLabel}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat size={12} />
              <span>{parseRRULE(trip.recurrenceRule)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users size={12} />
              <span>
                {trip.seats} {trip.seats === 1 ? 'asiento' : 'asientos'}
              </span>
            </div>
            {trip.tripTime && (
              <span className="text-xs text-muted-foreground">
                {formatTime12(trip.tripTime)}
              </span>
            )}
          </div>
          <Badge variant="outline" className="font-bold">
            {priceLabel}
          </Badge>
        </div>

        {trip.routeDescription && (
          <p className="text-xs text-muted-foreground italic">
            {trip.routeDescription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
