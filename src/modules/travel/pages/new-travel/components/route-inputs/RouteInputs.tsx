import { ClientOnly } from '@tanstack/react-router';
import { ArrowUpDown, MapPin, Star } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Typography from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@/components/ui/button-group';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { useLocations } from '@/hooks/use-locations';
import MapSelector from '@/modules/travel/pages/new-travel/components/MapDialog';
import { isCampusLocation } from '@/modules/travel/utils';
import type { FormSchema } from '../../NewTravel';

export default function RouteInputs() {
  const form = useFormContext<FormSchema>();
  const { data: locations } = useLocations();
  const handleToggle = () => {
    const originVal = { ...form.getValues('origin') };
    form.setValue('origin', { ...form.getValues('destination') });
    form.setValue('destination', originVal);
  };
  const { destination, origin, newLocation } = useWatch({
    control: form.control,
  });

  const originCampus =
    origin && isCampusLocation([origin.lat, origin.lon] as [number, number]);
  return (
    <Card className="rounded-2xl mb-6">
      <CardContent className="p-1">
        <div className="relative flex flex-col gap-0">
          {/* Origin */}
          <div className="flex items-center px-4 py-3 group">
            <div className="flex flex-col items-center mr-4 pt-1">
              <MapPin className="text-primary size-5" />
              {/* Vertical Dotted Connector */}
              <div className="w-0.5 h-10 border-l-2 border-dashed border-border/30 my-1 group-hover:border-primary transition-colors" />
            </div>

            <div className="flex-1 py-1 flex flex-col gap-1">
              <Label>
                <Typography variant="muted">Saliendo de</Typography>
              </Label>
              <ClientOnly>
                <Controller
                  control={form.control}
                  name="origin"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <ButtonGroup>
                        <MapSelector
                          position={
                            Object.keys(field.value ?? {}).length
                              ? { lat: field.value.lat, lng: field.value.lon }
                              : undefined
                          }
                          setPosition={({ lat, lng }) => {
                            if (locations && locations.length === 0)
                              form.setValue('newLocation', true);
                            field.onChange({
                              lat,
                              lon: lng,
                            });
                          }}
                        />
                        {!originCampus && (
                          <>
                            <ButtonGroupSeparator />
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                if (destination) {
                                  if (newLocation)
                                    form.setValue('newLocation', false);
                                  else form.setValue('newLocation', true);
                                }
                              }}
                            >
                              <Star
                                className={
                                  newLocation
                                    ? 'text-yellow-400  fill-yellow-400'
                                    : ''
                                }
                              />
                            </Button>
                          </>
                        )}
                      </ButtonGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </ClientOnly>
            </div>
          </div>

          <div className="m-auto">
            <Button
              variant="outline"
              type="button"
              onClick={handleToggle}
              disabled={!origin && !destination}
            >
              <ArrowUpDown />
            </Button>
          </div>

          {/* Destination */}
          <div className="flex items-center px-4">
            <div className="flex flex-col items-center mr-4 pb-1">
              <div className="w-0.5 h-1" />
              <MapPin className="text-primary size-6" />
            </div>

            <div className="flex-1 flex flex-col py-1 gap-1">
              <Label>
                <Typography variant="muted">Con destino a</Typography>
              </Label>
              <ClientOnly>
                <Controller
                  control={form.control}
                  name="destination"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <ButtonGroup>
                        <MapSelector
                          position={
                            Object.keys(field.value ?? {}).length
                              ? { lat: field.value.lat, lng: field.value.lon }
                              : undefined
                          }
                          setPosition={({ lat, lng }) => {
                            if (locations && locations.length === 0)
                              form.setValue('newLocation', true);
                            field.onChange({
                              lat,
                              lon: lng,
                            });
                          }}
                        />
                        {originCampus && (
                          <>
                            <ButtonGroupSeparator />
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                if (origin) {
                                  if (newLocation)
                                    form.setValue('newLocation', false);
                                  else form.setValue('newLocation', true);
                                }
                              }}
                            >
                              <Star
                                className={
                                  newLocation
                                    ? 'text-yellow-400  fill-yellow-400'
                                    : ''
                                }
                              />
                            </Button>
                          </>
                        )}
                      </ButtonGroup>{' '}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </ClientOnly>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
