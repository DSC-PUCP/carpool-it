import { Link, useRouteContext } from '@tanstack/react-router';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Armchair, CarTaxiFront, MapPinned, Star } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import type { TravelRoom } from '@/core/models';
import { cn } from '@/lib/utils';
import { universityCoordinates, universityLabel } from '../../const';
import {
  farestPointFromCampus,
  getClosestReferencePoint,
  orderLocationsByNearestWithDirection,
} from '../../utils';

export default function RideCard(
  props: Omit<TravelRoom, 'currentStop'> & { hideActions?: boolean }
) {
  const { user } = useRouteContext({ from: '__root__' });
  const { id, direction, datetime, driver, stops, hideActions } = props;

  const isToCampus = direction === 'to_campus';

  const driverStop = stops.find((s) => s.userRole === 'driver');
  const relevantLocation = driver
    ? driverStop?.stopCoords
    : farestPointFromCampus(stops.map((s) => s.stopCoords));

  const closestRef = relevantLocation
    ? getClosestReferencePoint(relevantLocation)
    : null;
  const relevantLabel = closestRef?.label ?? 'Ubicación';

  const distanceText = closestRef
    ? `a ${
        closestRef.distanceMeters >= 1000
          ? `${(closestRef.distanceMeters / 1000).toFixed(2)} km`
          : `${closestRef.distanceMeters} m`
      } de`
    : null;

  const originLabel = isToCampus ? relevantLabel : universityLabel;
  const destinationLabel = isToCampus ? universityLabel : relevantLabel;

  const totalSeats = driver?.seats ?? 0;
  const occupiedSeats = stops.reduce((acc, stop) => {
    return stop.userRole === 'passenger' ? acc + stop.seats : acc;
  }, 0);
  const availableSeats = Math.max(0, totalSeats - occupiedSeats);

  const uniqueStopLocations = new Set(
    stops
      .filter((s) => {
        if (!relevantLocation) return true;
        return (
          s.stopCoords[0] !== relevantLocation[0] ||
          s.stopCoords[1] !== relevantLocation[1]
        );
      })
      .map((s) => `${s.stopCoords[0]},${s.stopCoords[1]}`)
  );

  const passengerStops = uniqueStopLocations.size;

  const rawPrice = driver ? driver.price : 0;

  const priceLabel = driver
    ? new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        maximumFractionDigits: 2,
      }).format(rawPrice)
    : null;

  const driverName = driver?.userTag ?? 'Taxi';
  const driverInitial = driverName.charAt(0).toUpperCase();
  const driverRating = driver?.rating ?? 0;
  const driverRides = driver?.rides ?? 0;
  const carInfo = driver
    ? `***-${driver.plate} • ${driver.color}`
    : 'Vehículo externo';

  const dateObj = datetime;
  let dateLabel = format(dateObj, "d 'de' MMMM", { locale: es });

  if (isToday(dateObj)) {
    dateLabel = 'Hoy';
  } else if (isTomorrow(dateObj)) {
    dateLabel = 'Mañana';
  }

  const timeLabel = format(dateObj, 'HH:mm', { locale: es });

  const stopsCoords = stops.map((s) => s.stopCoords);
  const startPoint = isToCampus
    ? (relevantLocation ?? stopsCoords[0])
    : universityCoordinates;
  const endPoint = isToCampus
    ? universityCoordinates
    : (relevantLocation ?? stopsCoords[0]);

  const orderedStops =
    relevantLocation && startPoint && endPoint
      ? orderLocationsByNearestWithDirection(stopsCoords, startPoint, endPoint)
      : stopsCoords;

  const routePoints = isToCampus
    ? [...orderedStops, universityCoordinates]
    : [universityCoordinates, ...orderedStops];

  const googleMapsUrl = `https://www.google.com/maps/dir/${routePoints
    .map((c) => c.join(','))
    .join('/')}`;
  const isOwnRide = user ? stops.some((s) => s.userId === user.id) : false;
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header: Route & Time */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex gap-3 relative">
              {/* Visual Timeline */}
              <div className="flex flex-col items-center pt-1.5 h-full">
                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 shrink-0" />
                <div className="w-0.5 grow min-h-7.5 bg-linear-to-b from-primary/50 to-primary/10 my-0.5 rounded-full" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-transparent shrink-0" />
              </div>

              {/* Route Text */}
              <div className="flex flex-col justify-between gap-4 py-0.5">
                <div>
                  {!isToCampus && (
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mb-0.5">
                      {dateLabel} <span className="text-primary/50">•</span>{' '}
                      {timeLabel}
                    </p>
                  )}
                  {isToCampus && distanceText && (
                    <p className="text-[10px] text-muted-foreground leading-tight mb-0.5">
                      {distanceText}
                    </p>
                  )}
                  <p className="text-sm font-bold leading-tight">
                    {originLabel}
                  </p>
                  {isToCampus && passengerStops > 0 && (
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {passengerStops}{' '}
                      {passengerStops === 1
                        ? 'parada intermedia'
                        : 'paradas intermedias'}
                    </p>
                  )}
                </div>
                <div>
                  {isToCampus && (
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mb-0.5">
                      {dateLabel} <span className="text-primary/50">•</span>{' '}
                      {timeLabel}
                    </p>
                  )}
                  {!isToCampus && distanceText && (
                    <p className="text-[10px] text-muted-foreground leading-tight mb-0.5">
                      {distanceText}
                    </p>
                  )}
                  <p className="text-sm font-bold leading-tight">
                    {destinationLabel}
                  </p>
                  {!isToCampus && passengerStops > 0 && (
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {passengerStops}{' '}
                      {passengerStops === 1
                        ? 'parada intermedia'
                        : 'paradas intermedias'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price & Availability */}
          <div className="flex flex-col items-end gap-1">
            {priceLabel && (
              <h4 className="text-xl font-bold text-primary">{priceLabel}</h4>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md mt-1',
                !driver
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : availableSeats > 0
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              )}
            >
              <Armchair size={12} />{' '}
              {driver
                ? `${availableSeats} disp.`
                : `${occupiedSeats} requeridos`}
            </span>
          </div>
        </div>

        <Separator />

        {/* Footer: Driver & Action */}
        <div className="flex items-stretch justify-between">
          <div className="flex flex-col  md:flex-row md:items-center gap-3 flex-1">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                {driver && <AvatarImage src={driver.userAvatar} />}
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {driver ? driverInitial : <CarTaxiFront size={16} />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold leading-none">
                  {driverName}
                </p>
                <p
                  className="text-[10px] text-muted-foreground mt-1 truncate max-w-30"
                  title={carInfo}
                >
                  {carInfo}
                </p>
                {driver && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star
                      size={10}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {driverRating.toFixed(1)} ({driverRides})
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-8" />
            <div className="pl-1 md:pl-0">
              <AvatarGroup>
                {stops
                  .filter((s) => s.userRole === 'passenger')
                  .map((stop) => (
                    <DropdownMenu key={stop.userId}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <Avatar className="h-7 w-7 border border-border">
                            <AvatarImage src={stop.userAvatar} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {stop.userTag.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>{stop.userTag}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
              </AvatarGroup>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-start gap-2">
            <Button size="sm" variant="ghost" className="text-xs" asChild>
              <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                <MapPinned /> Ver Ruta
              </a>
            </Button>
            {!hideActions && (
              <Button asChild size="sm" className="h-8 text-xs font-medium">
                <Link
                  to="/travel/$id"
                  params={{
                    id: id,
                  }}
                  viewTransition
                >
                  {isOwnRide ? 'Ver Mi Viaje' : 'Unirse al Viaje'}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
