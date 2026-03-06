import { useRouteContext } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { fi } from 'zod/v4/locales';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DriverVehicle } from '@/core/models';
import type { FormSchema } from '../../NewTravel';
import DialogDriver from './DialogDriver';

export default function RoleSelector({
  isDriver,
  setDriver,
  isSettingDriver,
}: {
  isDriver: boolean;
  isSettingDriver: boolean;
  setDriver: (vehicle: DriverVehicle) => Promise<void>;
}) {
  const { vehicleData } = useRouteContext({ from: '/_layout' });
  const [open, setOpen] = useState(false);
  const form = useFormContext<FormSchema>();

  return (
    <>
      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <Tabs
            value={field.value}
            onValueChange={(value) => {
              if (value === 'offer') {
                if (!isDriver) {
                  setOpen(true);
                  return;
                }
                form.setValue('price', vehicleData ? vehicleData.price : 5);
                form.setValue('seats', vehicleData ? vehicleData.seats : 1);
              } else {
                form.setValue('seats', 1);
                form.setValue('price', 5);
              }
              field.onChange(value);
            }}
            className="w-full"
          >
            <TabsList className="w-full h-12 mb-2">
              <TabsTrigger
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                value="offer"
              >
                Ofrece un viaje
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                value="request"
              >
                Solicita un viaje
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />
      <DialogDriver
        onOpenChange={setOpen}
        open={open}
        onSubmit={async (data) => {
          await setDriver(data);
          form.setValue('role', 'offer');
          form.setValue('price', data.price);
          form.setValue('seats', data.seats);
          setOpen(false);
        }}
        isPending={isSettingDriver}
      />
    </>
  );
}
