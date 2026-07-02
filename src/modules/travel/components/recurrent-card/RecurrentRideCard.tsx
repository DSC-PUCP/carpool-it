import { Link } from '@tanstack/react-router';
import { Repeat, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { universityLabel } from '@/modules/travel/const';
import { parseRRULE } from '@/modules/travel/pages/new-travel/components/recurrence-selector/RecurrenceSelector';
import { getClosestReferencePoint } from '@/modules/travel/utils';

export type RecurrentCardData = {
  id: string;
  userId: string;
  userTag: string;
  userAvatar: string | null;
  direction: string;
  originCoords: { lat: number; lon: number };
  destinationCoords: { lat: number; lon: number };
  seats: number;
  price: number;
  recurrenceRule: string;
  routeDescription: string | null;
  tripTime: string;
};

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function RecurrentRideCard({
  data,
}: {
  data: RecurrentCardData;
}) {
  const isToCampus = data.direction === 'to_campus';

  const originRef = getClosestReferencePoint([
    data.originCoords.lat,
    data.originCoords.lon,
  ]);
  const destRef = getClosestReferencePoint([
    data.destinationCoords.lat,
    data.destinationCoords.lon,
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
  }).format(data.price);

  const userInitial = data.userTag.charAt(0).toUpperCase();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Header: badge + price */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Repeat size={10} />
            Recurrente
          </Badge>
          <span className="text-lg font-bold text-primary">{priceLabel}</span>
        </div>

        {/* Route */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-1.5 h-full">
            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 shrink-0" />
            <div className="w-0.5 grow min-h-6 bg-linear-to-b from-primary/50 to-primary/10 my-0.5 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-transparent shrink-0" />
          </div>
          <div className="flex flex-col justify-between gap-3 py-0.5 flex-1 min-w-0">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Origen
              </p>
              <p className="text-sm font-bold truncate">{originLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Destino
              </p>
              <p className="text-sm font-bold truncate">{destinationLabel}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Schedule + seats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat size={12} />
              <span>{parseRRULE(data.recurrenceRule)}</span>
            </div>
            {data.tripTime && (
              <span className="text-xs text-muted-foreground">
                {formatTime12(data.tripTime)}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users size={12} />
              <span>
                {data.seats} {data.seats === 1 ? 'asiento' : 'asientos'}
              </span>
            </div>
          </div>
        </div>

        {/* User */}
        <Link
          to="/u/$usertag"
          params={{ usertag: data.userTag }}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-7 w-7 border border-border">
            {data.userAvatar && <AvatarImage src={data.userAvatar} />}
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{data.userTag}</span>
        </Link>

        {data.routeDescription && (
          <p className="text-xs text-muted-foreground italic">
            {data.routeDescription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
