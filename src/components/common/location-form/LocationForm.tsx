import { ClientOnly } from '@tanstack/react-router';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { UserLocation } from '@/core/models';
import {
  limitBoundaries,
  referencePoints,
  universityCoordinates,
} from '@/modules/travel/const';
import MapSelector from '../map-selector/MapSelector';
import MarkerState from '../map-selector/MarkerState';

export default function LocationForm() {
  const form = useFormContext<LocationFormSchema>();
  return (
    <FieldGroup>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel> Nombre</FieldLabel>
            <Input {...field} placeholder="Casa, Trabajo, Recojo" />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="coords"
        render={({ field }) => (
          <ClientOnly>
            <MapSelector
              limitBoundaries={limitBoundaries}
              referencePoints={referencePoints}
              center={
                form.getValues('coords')
                  ? {
                      lat: form.getValues('coords').lat,
                      lng: form.getValues('coords').lon,
                    }
                  : {
                      lat: universityCoordinates[0],
                      lng: universityCoordinates[1],
                    }
              }
            >
              <MarkerState
                position={
                  Object.keys(field.value ?? {}).length
                    ? { lat: field.value.lat, lng: field.value.lon }
                    : undefined
                }
                onChange={({ lat, lng }) =>
                  field.onChange({
                    lat,
                    lon: lng,
                  })
                }
              />
            </MapSelector>
          </ClientOnly>
        )}
      />
    </FieldGroup>
  );
}
type LocationFormSchema = Omit<UserLocation, 'id'>;
