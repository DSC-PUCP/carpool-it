import { Controller, useFormContext } from 'react-hook-form';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { DriverVehicle } from '@/core/models';
import { vehicleColors } from './const';

export default function DriverForm() {
  const form = useFormContext<DriverFormSchema>();
  return (
    <FieldGroup>
      <Controller
        control={form.control}
        name="color"
        render={({ field, fieldState }) => (
          <Field orientation="vertical" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel>Color</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Select
              name={field.name}
              defaultValue={field.value}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un color" />
              </SelectTrigger>
              <SelectContent>
                {vehicleColors.map((color) => (
                  <SelectItem key={color.value} value={color.label}>
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      ></span>
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="plate"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel> Placa (3 ultimos dígitos)</FieldLabel>
            <Input {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="seats"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Asientos</FieldLabel>
            <FieldDescription>
              Número de asientos disponibles PARA pasajeros (excluyendo el
              tuyo).
            </FieldDescription>
            <Input {...field} type="number" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="price"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Precio por asiento</FieldLabel>
            <Input {...field} type="number" min={0} step={0.5} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="routeDescription"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción de ruta (opcional)</FieldLabel>
            <FieldDescription>
              Comparte referencias, punto exacto o detalles útiles para
              pasajeros.
            </FieldDescription>
            <Textarea
              {...field}
              value={field.value ?? ''}
              placeholder="Ej. Recojo por la puerta principal de Plaza San Miguel"
              rows={3}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
type DriverFormSchema = DriverVehicle;
