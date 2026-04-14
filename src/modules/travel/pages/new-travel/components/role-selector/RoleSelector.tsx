import { useRouteContext } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTour } from '@/components/tour';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DriverVehicle } from '@/core/models';
import getLocalStorage from '@/lib/localStorage';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { TOUR_FLOWS } from '@/lib/tours';
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
  const { setSteps, startTour, setIsTourCompleted, endTour } = useTour();

  const handleDriverSubmit = async (data: DriverVehicle) => {
    await setDriver(data);
    form.setValue('role', 'offer');
    form.setValue('price', data.price);
    form.setValue('seats', data.seats);
    setOpen(false);

    setTimeout(() => {
      endTour();
      const flow = TOUR_FLOWS.driverPublish;
      setSteps([...flow.steps]);
      setIsTourCompleted(false);
      getLocalStorage().setItem('carpool_driver_publish_tour_seen', '1');
      startTour();
    }, 500);
  };

  useEffect(() => {
    const handleAdvanceTour = () => {
      endTour();
      const flow = TOUR_FLOWS.driverPublish;
      setSteps([...flow.steps]);
      setIsTourCompleted(false);
      getLocalStorage().setItem('carpool_driver_publish_tour_seen', '1');
      setTimeout(() => startTour(), 300);
    };

    window.addEventListener('advanceDriverTour', handleAdvanceTour);
    return () =>
      window.removeEventListener('advanceDriverTour', handleAdvanceTour);
  }, [setSteps, startTour, setIsTourCompleted, endTour]);

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
                id={TOUR_STEP_IDS.ROLE_SELECTOR_OFFER}
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
        onSubmit={handleDriverSubmit}
        isPending={isSettingDriver}
      />
    </>
  );
}
