import { ClientOnly } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import MapSelector from '@/components/common/map-selector/MapSelector';
import MarkerState from '@/components/common/map-selector/MarkerState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import {
  limitBoundaries,
  referencePoints,
  universityCoordinates,
} from '@/modules/travel/const';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  isPending: boolean;
  onConfirm: (coords: { lat: number; lon: number }) => void;
};

export default function DefaultLocationDialog({
  open,
  onOpenChange,
  prompt,
  isPending,
  onConfirm,
}: Props) {
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setLocationCoords(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecciona tu ubicación</DialogTitle>
          <DialogDescription>{prompt}</DialogDescription>
        </DialogHeader>
        <ClientOnly>
          <MapSelector
            limitBoundaries={limitBoundaries}
            referencePoints={referencePoints}
            center={
              locationCoords
                ? { lat: locationCoords.lat, lng: locationCoords.lon }
                : {
                    lat: universityCoordinates[0],
                    lng: universityCoordinates[1],
                  }
            }
          >
            <MarkerState
              position={
                locationCoords
                  ? { lat: locationCoords.lat, lng: locationCoords.lon }
                  : undefined
              }
              onChange={({ lat, lng }) => {
                setLocationCoords({ lat, lon: lng });
              }}
            />
          </MapSelector>
        </ClientOnly>
        <Button
          className="w-full"
          onClick={() => {
            if (!locationCoords) return;
            onConfirm(locationCoords);
          }}
          disabled={!locationCoords || isPending}
        >
          {isPending ? <Spinner /> : 'Guardar ubicación'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
