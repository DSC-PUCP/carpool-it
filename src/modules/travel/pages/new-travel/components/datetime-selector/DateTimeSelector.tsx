import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useRef } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Typography from '@/components/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { isCampusLocation } from '@/modules/travel/utils';
import type { FormSchema } from '../../NewTravel';

export default function DateTimeSelector() {
  const isMobile = useIsMobile();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const { control } = useFormContext<FormSchema>();
  const { origin, role } = useWatch({
    control,
    exact: true,
  });
  const isToCampus =
    origin && !isCampusLocation([origin.lat, origin.lon] as [number, number]);
  const timeLabelPrefix = role === 'request' ? 'Hora deseada' : 'Hora';

  const openInputPicker = (input: HTMLInputElement | null) => {
    if (!input) return;

    const picker = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof picker.showPicker === 'function') {
      picker.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="flex gap-4 mb-6" id={TOUR_STEP_IDS.TRAVEL_FORM_DATE}>
      <Controller
        control={control}
        name="date"
        render={({ field }) => {
          const isValidDate =
            field.value instanceof Date && !Number.isNaN(field.value.getTime());
          const value = isValidDate ? field.value : new Date();

          return (
            <>
              <Card
                className="relative flex-1 rounded-2xl p-4 cursor-pointer"
                onClick={() => {
                  if (!isMobile) {
                    openInputPicker(dateInputRef.current);
                  }
                }}
              >
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
                      ref={dateInputRef}
                      id={TOUR_STEP_IDS.TRAVEL_FORM_DATE_INPUT}
                      type="date"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      value={toDateValue(value)}
                      onChange={(e) => {
                        if (!e.target.value) {
                          return;
                        }

                        const [y, m, d] = e.target.value.split('-').map(Number);
                        if ([y, m, d].some(Number.isNaN)) {
                          return;
                        }

                        const next = new Date(value);
                        next.setFullYear(y, m - 1, d);

                        if (Number.isNaN(next.getTime())) {
                          return;
                        }

                        field.onChange(next);
                      }}
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card
                className="relative flex-1 rounded-2xl p-4 cursor-pointer"
                onClick={() => {
                  if (!isMobile) {
                    openInputPicker(timeInputRef.current);
                  }
                }}
              >
                <CardContent className="p-0">
                  <Field>
                    <Label className="flex items-center gap-2 mb-1 text-primary">
                      <Clock className="size-4" />
                      <Typography variant="muted">
                        {timeLabelPrefix}{' '}
                        {isToCampus ? 'de llegada' : 'de salida'}
                      </Typography>
                    </Label>
                    <div className="text-lg font-bold">
                      {timeFormatter.format(value)}
                    </div>
                    <input
                      ref={timeInputRef}
                      id={TOUR_STEP_IDS.TRAVEL_FORM_TIME_INPUT}
                      type="time"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      step={300}
                      value={toTimeValue(value)}
                      onChange={(e) => {
                        if (!e.target.value) {
                          return;
                        }

                        const [h, min] = e.target.value.split(':').map(Number);
                        if ([h, min].some(Number.isNaN)) {
                          return;
                        }

                        const next = new Date(value);
                        next.setHours(h, min);

                        if (Number.isNaN(next.getTime())) {
                          return;
                        }

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
  hour12: true,
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
