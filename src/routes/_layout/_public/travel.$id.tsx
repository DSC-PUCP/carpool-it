import {
  createFileRoute,
  Link,
  notFound,
  useLocation,
} from '@tanstack/react-router';
import { isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { ArrowLeft, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import { Button } from '@/components/ui/button';
import { QueryKeys } from '@/const/query-keys';
import { env } from '@/env';
import { universityLabel } from '@/modules/travel/const';
import TravelDetail from '@/modules/travel/pages/travel-detail/TravelDetail';
import { TravelService } from '@/modules/travel/services';
import {
  farestPointFromCampus,
  getClosestReferencePoint,
} from '@/modules/travel/utils';

export const Route = createFileRoute('/_layout/_public/travel/$id')({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const result = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.TRAVEL_DETAIL, params.id],
      queryFn: () => TravelService.getRoomDetails(params.id),
    });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    const { direction, datetime, driver, stops } = loaderData;
    const isToCampus = direction === 'to_campus';

    const driverStop = stops.find((s) => s.userRole === 'driver');
    const relevantLocation = driver
      ? driverStop?.stopCoords
      : farestPointFromCampus(stops.map((s) => s.stopCoords));

    const closestRef = relevantLocation
      ? getClosestReferencePoint(relevantLocation)
      : null;
    const relevantLabel = closestRef?.label ?? 'Ubicación';

    const originLabel = isToCampus ? relevantLabel : universityLabel;
    const destinationLabel = isToCampus ? universityLabel : relevantLabel;

    const totalSeats = driver?.seats ?? 0;
    const occupiedSeats = stops.reduce((acc, stop) => {
      return stop.userRole === 'passenger' ? acc + stop.seats : acc;
    }, 0);
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);

    const LIMA_TZ = 'America/Lima';

    const dateObj = new Date(datetime);

    const dateInLima = toZonedTime(dateObj, LIMA_TZ);

    let dateLabel = formatInTimeZone(dateObj, LIMA_TZ, "d 'de' MMM", {
      locale: es,
    });

    if (isToday(dateInLima)) {
      dateLabel = 'Hoy';
    } else if (isTomorrow(dateInLima)) {
      dateLabel = 'Mañana';
    }

    const timeLabel = formatInTimeZone(dateObj, LIMA_TZ, 'hh:mm a', {
      locale: es,
    });

    const title = `${originLabel} → ${destinationLabel} • ${isToCampus ? 'LLegada' : 'Salida'} ${dateLabel} ${timeLabel}`;

    let description = '';
    if (driver) {
      const priceLabel = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      }).format(driver.price);
      description = `${priceLabel} • ${availableSeats} ${
        availableSeats === 1 ? 'asiento' : 'asientos'
      } • Con ${driver.userTag}`;
    } else {
      const ownerTag =
        stops.find((stop) => stop.userId === loaderData.ownerId)?.userTag ??
        'Usuario';
      description = `Buscando conductor • ${occupiedSeats} ${
        occupiedSeats === 1 ? 'pasajero' : 'pasajeros'
      } • Publicado por ${ownerTag}`;
    }

    return {
      title,
      meta: [
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:image',
          content: `${env.VITE_SERVER_URL}/api/travel/${loaderData.id}/og`,
        },
        {
          property: 'og:url',
          content: `${env.VITE_SERVER_URL}/travel/${loaderData.id}`,
        },
        {
          property: 'twitter:card',
          content: 'summary_large_image',
        },
      ],
    };
  },
});

function RouteComponent() {
  const { url } = useLocation();
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: '',
          url: url.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Error al compartir el viaje');
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url.href);
        toast.success('Enlace copiado al portapapeles');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Error al copiar el enlace');
      }
    }
  };
  return (
    <>
      <TopStack>
        <TopStackAction>
          <Link to="/home" search={{}}>
            <ArrowLeft />
          </Link>
        </TopStackAction>
        <TopStackTitle>Detalle del viaje</TopStackTitle>
        <TopStackAction>
          <Button size="icon" variant="ghost" onClick={handleShare}>
            <Share2 />
          </Button>
        </TopStackAction>
      </TopStack>
      <TravelDetail />
    </>
  );
}
