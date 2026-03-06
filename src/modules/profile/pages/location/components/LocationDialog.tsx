import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';
import LocationForm from '@/components/common/location-form/LocationForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LocationFormSchema) => void;
  defaultValues?: Partial<LocationFormSchema>;
};
export default function LocationDialog({
  onOpenChange,
  onSubmit,
  open,
  defaultValues,
}: Props) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      coords: defaultValues?.coords,
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
  });
  return (
    <FormProvider {...form}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ubicación</DialogTitle>
            <DialogDescription>
              Guarda una nueva ubicación para usarla en tus viajes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <LocationForm />
          </form>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button onClick={handleSubmit}>Guardar ubicación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim(),
  coords: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
});
type LocationFormSchema = z.infer<typeof formSchema>;
