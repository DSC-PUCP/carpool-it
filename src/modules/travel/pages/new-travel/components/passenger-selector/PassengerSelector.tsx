import { Minus, Plus, Users } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import type { FormSchema } from '../../NewTravel';

interface PassengerSelectorProps {
  min?: number;
  max?: number;
}

export default function PassengerSelector({
  min = 1,
  max = 8,
}: PassengerSelectorProps) {
  const { control } = useFormContext<FormSchema>();
  const { role } = useWatch({
    control,
  });

  return (
    <Card className="rounded-2xl mb-8">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <p className="font-bold text-base">
              {role === 'offer'
                ? 'Asientos disponibles'
                : 'Asientos requeridos'}
            </p>
            <p className="text-xs text-muted-foreground">
              {role === 'offer'
                ? '¿Cuántos asientos tienes disponibles?'
                : '¿Cuántos asientos necesitas?'}
            </p>
          </div>
        </div>
        <Controller
          control={control}
          name="seats"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="">
              <div className="flex justify-center md:justify-end items-center gap-4 bg-muted/10 rounded-xl p-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => field.onChange(Math.min(max, field.value - 1))}
                  disabled={field.value <= min}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-card shadow-sm text-muted-foreground hover:text-primary active:scale-95 transition-all p-0"
                  aria-label="Decrease passengers"
                >
                  <Minus className="size-4" />
                </Button>

                <span
                  className="font-bold text-lg w-6 text-center"
                  aria-live="polite"
                >
                  {field.value}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => field.onChange(Math.max(min, field.value + 1))}
                  disabled={field.value >= max}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-card shadow-sm text-muted-foreground hover:text-primary active:scale-95 transition-all p-0"
                  aria-label="Increase passengers"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}
