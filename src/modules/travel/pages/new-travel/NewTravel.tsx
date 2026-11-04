import { zodResolver } from '@hookform/resolvers/zod';
import {
  useLoaderData,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router';
import { ArrowRight, Car, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import styles from '@/assets/styles/no-scrollbar.module.css';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useLocations } from '@/hooks/use-locations';
import { useProfile } from '@/hooks/use-profile';
import { useVehicle } from '@/hooks/use-vehicle';
import getLocalStorage from '@/lib/localStorage';
import { cn } from '@/lib/utils';
import { useCreateLocation } from '@/modules/profile/pages/location/hooks/useCreateLocation';
import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '@/modules/tour/constants';
import {
  TOUR_GATE_EVENT,
  useTourStart,
} from '@/modules/tour/hooks/use-tour-flow';
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

export default function NewTravel() {
  const { defaultDate, defaultDirection } = useLoaderData({
    from: '/_layout/_auth/travel/new',
  });
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
  const [showTourPrompt, setShowTourPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const startTour = useTourStart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkGate = () => {
      const ls = getLocalStorage();
      const onboardingCompleted =
        ls.getItem(TOUR_STORAGE_KEYS.ONBOARDING_LEGACY) === '1' ||
        ls.getItem(TOUR_STORAGE_KEYS.WELCOME) === '1';
      const travelTourSeen = ls.getItem(TOUR_STORAGE_KEYS.TRAVEL_FORM) === '1';

      if (onboardingCompleted && !travelTourSeen) {
        setShowTourPrompt(true);
      }
    };

    checkGate();
    window.addEventListener(TOUR_GATE_EVENT, checkGate);

    return () => {
      window.removeEventListener(TOUR_GATE_EVENT, checkGate);
    };
  }, [mounted]);

  const handleTourChoice = (choice: 'request' | 'offer' | 'skip') => {
    const ls = getLocalStorage();
    ls.setItem(TOUR_STORAGE_KEYS.TRAVEL_FORM, '1');
    setShowTourPrompt(false);

    if (choice === 'skip') {
      return;
    }

    if (choice === 'request') {
      form.setValue('role', 'request');
      startTour('passenger');
      return;
    }

    if (!vehicleData) {
      // No vehicle yet: keep this tab and point at "Ofrece un viaje".
      form.setValue('role', 'request');
      ls.setItem(TOUR_STORAGE_KEYS.DRIVER_ONBOARDING_PENDING, '1');
      startTour('driverOnboarding');
      return;
    }

    // The driver flow only makes sense on the offer tab.
    form.setValue('role', 'offer');
    form.setValue('seats', vehicleData.seats);
    form.setValue('price', vehicleData.price);

    if (ls.getItem(TOUR_STORAGE_KEYS.DRIVER_PUBLISH) !== '1') {
      startTour('driverPublish');
    }
  };

  const defaultRole = vehicleData
    ? 'offer'
    : ('request' as 'offer' | 'request');
  const defaultSeats = vehicleData ? vehicleData.seats : 1;
  const defaultPrice = vehicleData ? vehicleData.price : 5;
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
      isPrivate: false,
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
        isPrivate: data.isPrivate,
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
          <div className="px-4" id={TOUR_STEP_IDS.TRAVEL_FORM_PUBLISH_BUTTON}>
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
      <Dialog open={showTourPrompt} onOpenChange={setShowTourPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Deseas hacer un recorrido?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Te mostramos cómo usar el formulario para buscar o publicar
              viajes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => handleTourChoice('request')}
              className="w-full justify-start gap-3"
            >
              <Users className="size-5" />
              Buscar viajes (pasajero)
            </Button>
            <Button
              onClick={() => handleTourChoice('offer')}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <Car className="size-5" />
              Publicar viajes (conductor)
            </Button>
            <Button
              onClick={() => handleTourChoice('skip')}
              variant="ghost"
              className="w-full"
            >
              No gracias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  isPrivate: z.boolean(),
});
export type FormSchema = z.infer<typeof formSchema>;
