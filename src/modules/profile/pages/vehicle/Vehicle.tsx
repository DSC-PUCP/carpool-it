import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import DriverForm from '@/components/common/driver-form/DriverForm';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import { useTour } from '@/components/tour';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useVehicle } from '@/hooks/use-vehicle';
import getLocalStorage from '@/lib/localStorage';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { TOUR_FLOWS } from '@/lib/tours';
import { useUpdateVehicle } from './hooks/useUpdateVehicle';

const DRIVER_TOUR_PENDING_KEY = 'carpool_driver_tour_pending';

export default function Vehicle() {
  const { mutate, isPending } = useUpdateVehicle();
  const { data: vehicle } = useVehicle();
  const { setSteps, startTour, setIsTourCompleted } = useTour();
  const [mounted, setMounted] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle ?? undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const ls = getLocalStorage();
    const driverTourPending = ls.getItem(DRIVER_TOUR_PENDING_KEY) === '1';

    if (driverTourPending) {
      ls.removeItem(DRIVER_TOUR_PENDING_KEY);
      const flow = TOUR_FLOWS.driverOnboarding;
      setSteps([...flow.steps]);
      setIsTourCompleted(false);
      setTimeout(() => startTour(), 300);
    }
  }, [mounted, setSteps, startTour, setIsTourCompleted]);

  const onSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Vehículo actualizado correctamente');
      },
      onError: (error) => {
        toast.error(error.message || 'No se pudo actualizar el vehículo');
      },
    });
  });

  return (
    <div className="flex-1 [view-transition-name:main-content]">
      <TopStack>
        <TopStackAction>
          <Link to=".." viewTransition={{ types: ['slide-right'] }}>
            <ArrowLeft />
          </Link>
        </TopStackAction>
        <TopStackTitle>Mi Vehiculo</TopStackTitle>
      </TopStack>
      <main className="overflow-y-auto p-4 space-y-4">
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <DriverForm />
            <Button
              type="submit"
              disabled={isPending}
              id={TOUR_STEP_IDS.VEHICLE_FORM_SAVE}
            >
              {isPending && <Spinner />}
              <Save />
              Guardar cambios
            </Button>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}

const formSchema = z.object({
  color: z.string('El color es obligatorio').min(1, 'El color es obligatorio'),
  plate: z
    .string('El modelo es obligatorio')
    .length(3, 'La placa debe tener 3 caracteres'),
  seats: z.coerce.number().min(1, 'El vehículo debe tener al menos un asiento'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  routeDescription: z.string().trim().optional(),
});
