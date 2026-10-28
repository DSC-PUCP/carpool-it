import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { RecurringTrip } from '@/core/models';
import { universityLabel } from '@/modules/travel/const';
import { getClosestReferencePoint } from '@/modules/travel/utils';
import type { FormSchema } from '../../NewTravel';

interface RecurrencePrefillProps {
  trips: RecurringTrip[];
  onSelect?: () => void;
}

function formatTime12(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatRecurrence(rule: string): string {
  const parts = rule.replace('RRULE:', '').split(';');
  const frequency = parts
    .find((part) => part.startsWith('FREQ='))
    ?.split('=')[1];

  if (frequency === 'DAILY') return 'Diario';
  if (frequency === 'MONTHLY') return 'Mensual';

  const dayLabels: Record<string, string> = {
    MO: 'L',
    TU: 'M',
    WE: 'X',
    TH: 'J',
    FR: 'V',
    SA: 'S',
    SU: 'D',
  };
  const days = parts
    .find((part) => part.startsWith('BYDAY='))
    ?.split('=')[1]
    ?.split(',')
    .map((day) => dayLabels[day] ?? day)
    .join(', ');

  return days ?? 'Semanal';
}

export default function RecurrencePrefill({ trips }: RecurrencePrefillProps) {
  const { setValue } = useFormContext<FormSchema>();
  const [open, setOpen] = useState(false);

  if (trips.length === 0) return null;

  const handleSelect = (trip: RecurringTrip) => {
    setValue('origin', trip.originCoords);
    setValue('destination', trip.destinationCoords);
    setValue('seats', trip.seats);
    setValue('price', trip.price);
    setValue('isRecurrent', true);
    setValue('recurrenceRule', trip.recurrenceRule);
    setValue('isVisible', trip.isVisible);
    setValue('isPrefilledRecurrent', true);
    setValue('tripTime', trip.tripTime);

    const [h, m] = trip.tripTime.split(':').map(Number);
    const currentDate = new Date();
    currentDate.setHours(h, m, 0, 0);
    setValue('date', currentDate);

    setOpen(false);
    toast.success('Viaje recurrente seleccionado');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full my-2">
          <Bookmark className="mr-2 h-4 w-4" />
          Usar viaje recurrente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Viajes Recurrentes</DialogTitle>
          <DialogDescription>
            Selecciona un viaje recurrente para prellenar el formulario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {trips.map((trip) => (
            <RecurrentTripOption
              key={trip.id}
              trip={trip}
              onSelect={() => handleSelect(trip)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecurrentTripOption({
  trip,
  onSelect,
}: {
  trip: RecurringTrip;
  onSelect: () => void;
}) {
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

  return (
    <button
      type="button"
      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
      onClick={onSelect}
    >
      <p className="text-sm font-medium">
        {originLabel} → {destinationLabel}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatRecurrence(trip.recurrenceRule)} · {formatTime12(trip.tripTime)}{' '}
        · {trip.seats} asientos · S/. {trip.price.toFixed(2)}
      </p>
    </button>
  );
}
