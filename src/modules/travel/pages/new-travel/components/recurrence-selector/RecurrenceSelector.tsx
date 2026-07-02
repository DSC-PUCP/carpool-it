import { Bookmark, Eye, EyeOff, Info } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import type { FormSchema } from '../../NewTravel';

const DAYS = [
  { key: 'MO', label: 'L' },
  { key: 'TU', label: 'M' },
  { key: 'WE', label: 'X' },
  { key: 'TH', label: 'J' },
  { key: 'FR', label: 'V' },
  { key: 'SA', label: 'S' },
  { key: 'SU', label: 'D' },
] as const;

type Frequency = 'WEEKLY' | 'DAILY' | 'MONTHLY';

function buildRRULE(freq: Frequency, days: string[]): string {
  if (freq === 'DAILY') return 'RRULE:FREQ=DAILY';
  if (freq === 'MONTHLY') return 'RRULE:FREQ=MONTHLY';
  const byDay = days.length > 0 ? days.join(',') : 'MO';
  return `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`;
}

export function parseRRULE(rule: string) {
  const parts = rule.replace('RRULE:', '').split(';');
  const freq = parts.find((p) => p.startsWith('FREQ='))?.split('=')[1];
  const byDay = parts.find((p) => p.startsWith('BYDAY='))?.split('=')[1];

  const dayMap: Record<string, string> = {
    MO: 'Lun',
    TU: 'Mar',
    WE: 'Mié',
    TH: 'Jue',
    FR: 'Vie',
    SA: 'Sáb',
    SU: 'Dom',
  };

  const freqMap: Record<string, string> = {
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
  };

  const freqLabel = freqMap[freq ?? ''] ?? freq ?? '';
  const daysLabel = byDay
    ?.split(',')
    .map((d) => dayMap[d] ?? d)
    .join(', ');

  return daysLabel ? `${freqLabel} · ${daysLabel}` : freqLabel;
}

export default function RecurrenceSelector() {
  const { control, setValue } = useFormContext<FormSchema>();

  const isRecurrent = useWatch({ control, name: 'isRecurrent' });
  const recurrenceRule = useWatch({ control, name: 'recurrenceRule' });
  const isVisible = useWatch({ control, name: 'isVisible' });

  // Parse current rule to extract freq and days
  const parsedFreq = (() => {
    if (!recurrenceRule) return 'WEEKLY' as Frequency;
    const freq = recurrenceRule
      .replace('RRULE:', '')
      .split(';')
      .find((p) => p.startsWith('FREQ='))
      ?.split('=')[1];
    if (freq === 'DAILY' || freq === 'MONTHLY') return freq as Frequency;
    return 'WEEKLY' as Frequency;
  })();

  const parsedDays = (() => {
    if (!recurrenceRule) return ['MO', 'WE', 'FR'];
    const byDay = recurrenceRule
      .replace('RRULE:', '')
      .split(';')
      .find((p) => p.startsWith('BYDAY='))
      ?.split('=')[1];
    return byDay ? byDay.split(',') : ['MO', 'WE', 'FR'];
  })();

  const handleFreqChange = (freq: Frequency) => {
    const newRule = buildRRULE(freq, parsedDays);
    setValue('recurrenceRule', newRule);
  };

  const handleDayToggle = (day: string) => {
    const newDays = parsedDays.includes(day)
      ? parsedDays.filter((d) => d !== day)
      : [...parsedDays, day];
    if (newDays.length === 0) return; // At least one day
    const newRule = buildRRULE(parsedFreq, newDays);
    setValue('recurrenceRule', newRule);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Recurrente</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Viaje Recurrente</DialogTitle>
              <DialogDescription>
                Un viaje recurrente se repite automáticamente según la
                frecuencia que elijas. Los pasajeros podrán ver tus viajes
                recurrentes en tu perfil y en el feed principal.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <Controller
        control={control}
        name="isRecurrent"
        render={({ field }) => (
          <Toggle
            variant="outline"
            size="sm"
            pressed={field.value}
            onPressedChange={(pressed) => {
              field.onChange(pressed);
              if (pressed && !recurrenceRule) {
                setValue('recurrenceRule', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR');
              }
              if (pressed) {
                setValue('isPrefilledRecurrent', false);
              }
            }}
            aria-label="Marcar como recurrente"
          >
            <Bookmark className={field.value ? 'fill-foreground' : ''} />
            Recurrente
          </Toggle>
        )}
      />

      {isRecurrent && (
        <div className="space-y-3 rounded-lg border p-3">
          {/* Frequency */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Frecuencia</p>
            <div className="flex gap-1">
              {(
                [
                  { key: 'DAILY', label: 'Diario' },
                  { key: 'WEEKLY', label: 'Semanal' },
                  { key: 'MONTHLY', label: 'Mensual' },
                ] as const
              ).map((freq) => (
                <Button
                  key={freq.key}
                  variant={parsedFreq === freq.key ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs flex-1"
                  onClick={() => handleFreqChange(freq.key)}
                  type="button"
                >
                  {freq.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Days of week (only for WEEKLY) */}
          {parsedFreq === 'WEEKLY' && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Repite los</p>
              <div className="flex gap-1">
                {DAYS.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    className={cn(
                      'w-9 h-9 rounded-full text-xs font-medium transition-colors',
                      parsedDays.includes(day.key)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                    onClick={() => handleDayToggle(day.key)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <p className="text-xs text-muted-foreground">
            {parseRRULE(recurrenceRule ?? '')}
          </p>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isVisible ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {isVisible ? 'Público' : 'Privado'}
              </span>
            </div>
            <Controller
              control={control}
              name="isVisible"
              render={({ field }) => (
                <Toggle
                  variant="outline"
                  size="sm"
                  pressed={field.value}
                  onPressedChange={field.onChange}
                  aria-label="Toggle visibilidad"
                >
                  {field.value ? 'Visible' : 'Oculto'}
                </Toggle>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
