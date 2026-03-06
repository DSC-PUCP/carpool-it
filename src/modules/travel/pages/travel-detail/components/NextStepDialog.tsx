import { useState } from 'react';
import Typography from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { TravelRoom } from '@/core/models/ride';
import { useFinishRide } from '../hooks/useFinishRide';
import { useSetNextStop } from '../hooks/useSetNextStop';
import DriverPaymentMethods from './DriverPaymentMethods';

export default function NextStepDialog({
  travel,
  userId,
}: {
  travel: TravelRoom;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: finishRide, isPending: isFinishing } = useFinishRide();
  const { mutate: setNextStop, isPending: isSettingNext } = useSetNextStop();

  const isDriver = travel.driver?.id === userId;
  const isOwner = travel.ownerId === userId;
  const hasDriver = !!travel.driver;
  const driverQrUrl = travel.driver?.qrUrl;
  const driverUserId = travel.driver?.id;

  const passengers = travel.stops.filter((s) => s.userRole === 'passenger');

  const orderedPassengers = passengers;

  const currentStopIndex = travel.currentStop;
  const totalStops = orderedPassengers.length;
  const isLastStop = currentStopIndex >= totalStops + 1;

  const handleFinish = () => {
    finishRide({
      roomId: travel.id,
      userId: userId,
      role: isDriver ? 'driver' : 'passenger',
    });
  };

  const handleNextStop = () => {
    const passengersToFinish =
      currentStopIndex === 0
        ? []
        : [orderedPassengers[currentStopIndex - 1]]
            .filter(Boolean)
            .map((p) => ({
              userId: p.userId,
              role: 'passenger' as const,
            }));

    setNextStop(
      {
        roomId: travel.id,
        currentStop: currentStopIndex,
        passengersToFinish,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const isLoading = isFinishing || isSettingNext;

  if (hasDriver && !isDriver) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1 h-12 py-2" variant="outline">
            <Typography variant="large">Finalizar viaje</Typography>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar mi viaje</DialogTitle>
            <DialogDescription>
              ¿Deseas marcar tu viaje como finalizado? El conductor normalmente
              lo hará por ti al llegar a tu destino.
            </DialogDescription>
          </DialogHeader>
          {driverUserId && (
            <DriverPaymentMethods
              driverId={driverUserId}
              fallbackQrUrl={driverQrUrl}
              imageSize="sm"
            />
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleFinish} disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Finalizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const buttonText =
    currentStopIndex === 0
      ? 'Comenzar viaje'
      : isLastStop || (!hasDriver && isOwner)
        ? 'Finalizar viaje'
        : 'Marcar parada';
  const isMarkingStop = buttonText === 'Marcar parada';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 h-12 py-2">
          <Typography variant="large">{buttonText}</Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{buttonText}</DialogTitle>
          <DialogDescription>
            {currentStopIndex === 0
              ? '¿Estás listo para comenzar el viaje?'
              : isLastStop || (!hasDriver && isOwner)
                ? '¿Deseas finalizar el viaje para todos?'
                : `¿Has llegado a la parada de ${orderedPassengers[currentStopIndex - 1]?.userTag}?`}
          </DialogDescription>
        </DialogHeader>
        {driverUserId && (
          <DriverPaymentMethods
            driverId={driverUserId}
            fallbackQrUrl={driverQrUrl}
            imageSize={isMarkingStop ? 'md' : 'sm'}
          />
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={
              isLastStop || (!hasDriver && currentStopIndex > 0)
                ? handleFinish
                : handleNextStop
            }
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
