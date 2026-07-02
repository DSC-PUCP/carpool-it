import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import styles from '@/assets/styles/no-scrollbar.module.css';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLocations } from '@/hooks/use-locations';
import { useProfile } from '@/hooks/use-profile';
import { useVehicle } from '@/hooks/use-vehicle';
import { cn, getDirectionByHour, getNowInLima } from '@/lib/utils';
import { useCreateLocation } from '@/modules/profile/pages/location/hooks/useCreateLocation';
import type { LatLngTuple } from '@/modules/travel/const';
import { universityCoordinates } from '../../const';
import { getClosestReferencePoint, isCampusLocation } from '../../utils';
import DateTimeSelector from './components/datetime-selector/DateTimeSelector';
import PassengerSelector from './components/passenger-selector/PassengerSelector';
import PriceEstimate from './components/price-estimate/PriceEstimate';
import RecurrencePrefill from './components/recurrence-selector/RecurrencePrefill';
import RecurrenceSelector from './components/recurrence-selector/RecurrenceSelector';
import RoleSelector from './components/role-selector/RoleSelector';
import RouteInputs from './components/route-inputs/RouteInputs';
import { usePublishRide } from './hooks/usePublishRide';
import { useRecurringTrips } from './hooks/useRecurringTrips';
import { useSetDriver } from './hooks/useSetDriver';
import { getDefaultDate } from './utils';

export default function NewTravel() {
  const { user } = useRouteContext({
    from: '/_layout/_auth/travel/new',
  });
  const { data: vehicleData } = useVehicle();
  const { data: profileData } = useProfile();
  const { data: locationsData } = useLocations();
  const { data: recurringTrips } = useRecurringTrips(user?.id);
  const { mutate, isPending } = usePublishRide();
  const { mutateAsync, isPending: isSettingDriver } = useSetDriver();
  const { mutate: locationMutate } = useCreateLocation();
  const navigation = useNavigate();

  const defaultRole = vehicleData
    ? 'offer'
    : ('request' as 'offer' | 'request');
  const defaultSeats = vehicleData ? vehicleData.seats : 1;
  const defaultPrice = vehicleData ? vehicleData.price : 5;
  const nowInLima = getNowInLima();
  const defaultDirection = getDirectionByHour(nowInLima.getHours());
  const defaultDate = getDefaultDate(nowInLima);

  const defaultLocation = profileData?.locationId
    ? locationsData?.find((loc) => loc.id === profileData.locationId)?.coords
    : undefined;
  const universityLat = universityCoordinates[0];
  const universityLon = universityCoordinates[1];
  const universityLocation = {
    lat: universityLat,
    lon: universityLon,
  };

  const destination =
    defaultDirection === 'to_campus'
      ? universityLocation
      : (defaultLocation ?? universityLocation);
  const origin =
    defaultDirection === 'to_campus'
      ? (defaultLocation ?? universityLocation)
      : universityLocation;
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: defaultRole,
      date: defaultDate,
      price: defaultPrice,
      seats: defaultSeats,
      origin,
      destination,
      newLocation: false,
      isRecurrent: false,
      recurrenceRule: '',
      isVisible: true,
      isPrefilledRecurrent: false,
      tripTime: '08:00',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const origin = [data.origin.lat, data.origin.lon] as LatLngTuple;
    const destination = [
      data.destination.lat,
      data.destination.lon,
    ] as LatLngTuple;

    if (!isCampusLocation(origin) && !isCampusLocation(destination)) {
      const errorMessage =
        'Solo se permiten viajes que inicien o terminen en el campus.';
      form.setError('origin', {
        message: errorMessage,
      });
      form.setError('destination', {
        message: errorMessage,
      });
      return;
    }
    if (!data.destination || !user.id) return;

    mutate(
      {
        ownerId: user.id,
        role: data.role === 'offer' ? 'driver' : 'passenger',
        origin: data.origin,
        destination: data.destination,
        campusAt: data.date,
        requestedSeats: data.seats,
        price: data.price,
        isRecurrent: data.isRecurrent,
        recurrenceRule: data.isRecurrent ? data.recurrenceRule : undefined,
        isVisible: data.isRecurrent ? data.isVisible : undefined,
        isPrefilledRecurrent: data.isPrefilledRecurrent,
        tripTime: data.isRecurrent
          ? `${String(data.date.getHours()).padStart(2, '0')}:${String(data.date.getMinutes()).padStart(2, '0')}`
          : undefined,
      },
      {
        onError: (error) => {
          toast.error(error.message || 'Error al publicar el viaje.');
        },
        onSuccess: (id) => {
          const url = `${window.location.origin}/travel/${id}`;
          const routeDescription = vehicleData?.routeDescription?.trim();
          const clipboardText = routeDescription
            ? `${url}\n${routeDescription}`
            : url;
          void navigator.clipboard.writeText(clipboardText);
          toast.success('Viaje publicado. Enlace copiado al portapapeles.');
          navigation({
            to: '/travel/$id',
            params: {
              id,
            },
          });
        },
      }
    );
    if (data.newLocation) {
      const fromCampus = isCampusLocation(origin);
      const newLocation = fromCampus ? data.destination : data.origin;
      const name =
        getClosestReferencePoint(fromCampus ? destination : origin)?.label ||
        'Casa';

      locationMutate({
        location: { name, coords: newLocation },
        userId: user.id,
        setDefault: locationsData?.length === 0,
      });
    }
  });

  return (
    <main
      className={cn('flex-1 px-6 pt-2 overflow-scroll', styles['no-scrollbar'])}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          {/* Recurrence Prefill */}
          {recurringTrips && recurringTrips.length > 0 && (
            <RecurrencePrefill trips={recurringTrips} />
          )}

          {/* Segmented Control for Role */}
          <RoleSelector
            isDriver={!!vehicleData}
            isSettingDriver={isSettingDriver}
            setDriver={(data) =>
              mutateAsync({
                ...data,
                userId: user.id,
              })
            }
          />

          {/* Route Visualizer & Inputs */}
          <RouteInputs />

          {/* Date & Time Pickers */}
          <DateTimeSelector />

          {/* Passengers / Seat Stepper */}
          <PassengerSelector max={vehicleData ? vehicleData.seats : 8} />

          {/* Price Estimate */}
          <PriceEstimate />

          {/* Recurrence Toggle */}
          <RecurrenceSelector />

          {/* Main CTA Button */}
          <div className="px-4">
            <Button
              type="submit"
              className="w-full h-12 py-3 flex items-center justify-center gap-2"
              disabled={isPending}
            >
              {isPending && <Spinner />}
              <span className="text-lg">Publicar</span>
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </form>
      </FormProvider>{' '}
      <p className="text-center text-xs text-muted-foreground mt-4 pb-4">
        Al publicar, aceptas que los datos del viaje se comparta con otros
        usuarios de la plataforma.
      </p>
    </main>
  );
}
const formSchema = z.object({
  role: z.enum(['offer', 'request']),
  origin: z.object(
    {
      lat: z.number(),
      lon: z.number(),
    },
    'El origen es obligatorio'
  ),
  destination: z.object(
    {
      lat: z.number(),
      lon: z.number(),
    },
    'El destino es obligatorio'
  ),
  date: z.date(),
  seats: z
    .number()
    .min(1)
    .max(8, 'No puedes exceder la capacidad del vehículo'),
  price: z.number().min(0),
  newLocation: z.boolean(),
  isRecurrent: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  isVisible: z.boolean().default(true),
  isPrefilledRecurrent: z.boolean().default(false),
  tripTime: z.string().default('08:00'),
});
export type FormSchema = z.infer<typeof formSchema>;
