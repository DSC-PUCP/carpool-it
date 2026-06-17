import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import z from 'zod';
import DriverForm from '@/components/common/driver-form/DriverForm';
import { useTour } from '@/components/tour';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import type { DriverVehicle } from '@/core/models';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { TOUR_FLOWS } from '@/lib/tours';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DriverVehicle) => Promise<void>;
  isPending: boolean;
};
export default function DialogDriver({
  onOpenChange,
  onSubmit,
  open,
  isPending,
}: Props) {
  const { setSteps, startTour, setIsTourCompleted } = useTour();

  useEffect(() => {
    const handleShowDriverTour = () => {
      const flow = TOUR_FLOWS.driverOnboarding;
      setSteps([...flow.steps]);
      setIsTourCompleted(false);
      setTimeout(() => startTour(), 300);
    };

    window.addEventListener('showDriverTour', handleShowDriverTour);
    return () =>
      window.removeEventListener('showDriverTour', handleShowDriverTour);
  }, [setSteps, startTour, setIsTourCompleted]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: '',
      color: '',
      seats: 4,
      price: 5,
      routeDescription: '',
      confirmation: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const { confirmation, ...vehicleData } = data;
    await onSubmit(vehicleData as DriverVehicle);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('advanceDriverTour'));
    }, 300);
  });

  return (
    <FormProvider {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent id={TOUR_STEP_IDS.DIALOG_DRIVER}>
          <DialogHeader>
            <DialogTitle>Ingresa los datos de tu vehículo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DriverForm />
            <Controller
              control={form.control}
              name="confirmation"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  id={TOUR_STEP_IDS.DIALOG_DRIVER_CONFIRMATION}
                >
                  <FieldSet>
                    <FieldGroup>
                      <Field orientation="horizontal">
                        <Checkbox
                          id="form-rhf-checkbox-responses"
                          name={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel
                          htmlFor="form-rhf-checkbox-responses"
                          className="text-xs text-muted-foreground"
                        >
                          Acepto que la información de mi vehículo es correcta y
                          será compartida con los pasajeros en caso de ofrecer
                          un viaje.
                        </FieldLabel>
                      </Field>
                      {fieldState.invalid && (
                        <FieldError>{fieldState?.error?.message}</FieldError>
                      )}
                    </FieldGroup>
                  </FieldSet>
                </Field>
              )}
            />
          </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() => handleSubmit()}
              id={TOUR_STEP_IDS.DIALOG_DRIVER_SUBMIT}
            >
              {isPending && <Spinner />} Guardar y continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
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
  confirmation: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar que la información es correcta',
  }),
});
