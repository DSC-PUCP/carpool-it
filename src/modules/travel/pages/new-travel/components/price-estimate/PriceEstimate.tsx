import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import type { FormSchema } from '../../NewTravel';

type PriceEstimateProps = {
  currency?: string;
  step?: number;
};

export default function PriceEstimate({
  currency = 'S/.',
  step = 0.5,
}: PriceEstimateProps) {
  const { control, getValues } = useFormContext<FormSchema>();
  const format = (val: number) => val.toFixed(2);
  const parse = (val: string) => Number(val.replace(',', '.')) || 0;
  const [inputValue, setInputValue] = useState(() =>
    format(getValues('price'))
  );

  return (
    <Controller
      name="price"
      control={control}
      defaultValue={0}
      render={({ field }) => {
        const updateValue = (value: number) => {
          field.onChange(value);
          setInputValue(format(value));
        };

        return (
          <div className="flex items-center justify-between px-4 mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Contribución
            </span>

            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-foreground">
                {currency}
              </span>

              <div className="flex items-center rounded-md border h-9">
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupButton
                      type="button"
                      aria-label="Disminuir monto"
                      disabled={field.value <= 0}
                      onClick={() =>
                        updateValue(Math.max(0, field.value - step))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </InputGroupButton>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => {
                      const val = e.target.value;

                      // solo números + punto o coma
                      if (!/^\d*([.,]?\d*)?$/.test(val)) return;

                      setInputValue(val);
                    }}
                    onBlur={() => {
                      const numeric = parse(inputValue);
                      updateValue(numeric);
                    }}
                    aria-label="Monto de contribución"
                    className="w-20 h-9 text-right text-lg font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      aria-label="Incrementar monto"
                      onClick={() => updateValue(field.value + step)}
                    >
                      <Plus className="h-4 w-4" />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
