import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { ArrowRight, Car, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import styles from '@/assets/styles/no-scrollbar.module.css';
import { useTour } from '@/components/tour';
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
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { TOUR_FLOWS } from '@/lib/tours';
import { cn, getDirectionByHour, getNowInLima } from '@/lib/utils';
import { useCreateLocation } from '@/modules/profile/pages/location/hooks/useCreateLocation';
import type { LatLngTuple } from '@/modules/travel/const';
import { universityCoordinates } from '../../const';
import { getClosestReferencePoint, isCampusLocation } from '../../utils';
import DateTimeSelector from './components/datetime-selector/DateTimeSelector';
import PassengerSelector from './components/passenger-selector/PassengerSelector';
import PriceEstimate from './components/price-estimate/PriceEstimate';
import RoleSelector from './components/role-selector/RoleSelector';
import RouteInputs from './components/route-inputs/RouteInputs';
import { usePublishRide } from './hooks/usePublishRide';
import { useSetDriver } from './hooks/useSetDriver';
import { getDefaultDate } from './utils';

const TRAVEL_TOUR_SEEN_KEY = 'carpool_travel_tour_seen';
const ONBOARDING_COMPLETED_KEY = 'carpool_onboarding_completed';

export default function NewTravel() {
  const { user } = useRouteContext({
    from: '/_layout/_auth/travel/new',
  });
  const { data: vehicleData } = useVehicle();
  const { data: profileData } = useProfile();
  const { data: locationsData } = useLocations();
  const { mutate, isPending } = usePublishRide();
  const { mutateAsync, isPending: isSettingDriver } = useSetDriver();
  const { mutate: locationMutate } = useCreateLocation();
  const navigation = useNavigate();
  const [showTourPrompt, setShowTourPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setSteps, startTour, setIsTourCompleted } = useTour();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const ls = getLocalStorage();
    const onboardingCompleted =
      ls.getItem(ONBOARDING_COMPLETED_KEY) === '1' ||
      ls.getItem('carpool_onboarding_seen') === '1';
    const travelTourSeen = ls.getItem(TRAVEL_TOUR_SEEN_KEY) === '1';

    if (onboardingCompleted && !travelTourSeen) {
      setShowTourPrompt(true);
    }
  }, [mounted]);

  const handleTourChoice = (choice: 'request' | 'offer' | 'skip') => {
    const ls = getLocalStorage();
    if (choice !== 'skip') {
      ls.setItem(TRAVEL_TOUR_SEEN_KEY, '1');
      if (choice === 'request') {
        form.setValue('role', 'request');
        const flow = TOUR_FLOWS.passenger;
        setSteps([...flow.steps]);
        setIsTourCompleted(false);
        startTour();
      } else {
        form.setValue('role', 'request');
        if (!vehicleData) {
          ls.setItem('carpool_driver_tour_pending', '1');
          const flow = TOUR_FLOWS.driverOnboarding;
          setSteps([...flow.steps]);
          setIsTourCompleted(false);
          startTour();
        } else {
          const driverPublishSeen =
            ls.getItem('carpool_driver_publish_tour_seen') === '1';
          if (!driverPublishSeen) {
            const flow = TOUR_FLOWS.driverPublish;
            setSteps([...flow.steps]);
            setIsTourCompleted(false);
            startTour();
          }
        }
      }
    } else {
      ls.setItem(TRAVEL_TOUR_SEEN_KEY, '1');
    }
    setShowTourPrompt(false);
  };

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
      },
      {
        onError: (error) => {
          toast.error(error.message || 'Error al publicar el viaje.');
        },
        onSuccess: (id) => {
          toast.success('Viaje publicado con éxito.');
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
        Al publicar, aceptas que el viaje se comparta con otros usuarios de la
        plataforma.
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
});
export type FormSchema = z.infer<typeof formSchema>;
