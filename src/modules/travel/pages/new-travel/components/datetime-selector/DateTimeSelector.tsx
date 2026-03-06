import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Typography from '@/components/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { isCampusLocation } from '@/modules/travel/utils';
import type { FormSchema } from '../../NewTravel';

export default function DateTimeSelector() {
  const { control } = useFormContext<FormSchema>();
  const { origin } = useWatch({
    control,
    exact: true,
  });
  const isToCampus =
    origin && !isCampusLocation([origin.lat, origin.lon] as [number, number]);
  return (
    <div className="flex gap-4 mb-6">
      <Controller
        control={control}
        name="date"
        render={({ field }) => {
          const value = field.value || new Date();

          return (
            <>
              <Card className="relative flex-1 rounded-2xl p-4 cursor-pointer">
                <CardContent className="p-0">
                  <Field>
                    <Label className="flex items-center gap-2 mb-1 text-primary">
                      <CalendarIcon className="size-4" />
                      <Typography variant="muted">Fecha</Typography>
                    </Label>
                    <div className="text-lg font-bold">
                      {getRelativeLabel(value)}
                    </div>
                    <input
                      type="date"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      value={toDateValue(value)}
                      onChange={(e) => {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        const next = new Date(value);
                        next.setFullYear(y, m - 1, d);
                        field.onChange(next);
                      }}
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card className="relative flex-1 rounded-2xl p-4 cursor-pointer">
                <CardContent className="p-0">
                  <Field>
                    <Label className="flex items-center gap-2 mb-1 text-primary">
                      <Clock className="size-4" />
                      <Typography variant="muted">
                        Hora {isToCampus ? 'de llegada' : 'de salida'}
                      </Typography>
                    </Label>
                    <div className="text-lg font-bold">
                      {timeFormatter.format(value)}
                    </div>
                    <input
                      type="time"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      step={300}
                      value={toTimeValue(value)}
                      onChange={(e) => {
                        const [h, min] = e.target.value.split(':').map(Number);
                        const next = new Date(value);
                        next.setHours(h, min);
                        field.onChange(next);
                      }}
                    />
                  </Field>
                </CardContent>
              </Card>
            </>
          );
        }}
      />
    </div>
  );
}
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const toDateValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toTimeValue = (date: Date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};

const getRelativeLabel = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
  return dateFormatter.format(date);
};
