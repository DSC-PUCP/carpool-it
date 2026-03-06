import { useEffect, useState } from 'react';
import MapSelector from '@/components/common/map-selector/MapSelector';
import MarkerState from '@/components/common/map-selector/MarkerState';
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
import {
  limitBoundaries,
  referencePoints,
  universityCoordinates,
} from '@/modules/travel/const';
import { getClosestReferencePoint } from '@/modules/travel/utils';

type LatLng = { lat: number; lng: number };

type Props = {
  placeholder?: string;
  position?: LatLng;
  setPosition: (val: LatLng) => void;
};
export default function MapDialog({
  placeholder,
  setPosition,
  position,
}: Props) {
  const [placeholderText, setPlaceholderText] = useState<string>(
    placeholder ?? 'Elegir ubicación'
  );
  useEffect(() => {
    if (!position) {
      setPlaceholderText(placeholder ?? 'Elegir ubicación');
      return;
    }
    const closest = getClosestReferencePoint([position.lat, position.lng]);
    if (!closest) return;
    if (closest?.distanceMeters < 500) setPlaceholderText(closest?.label);
    else if (closest.distanceMeters < 1000)
      setPlaceholderText(`${closest?.distanceMeters}m de ${closest?.label}`);
    else
      setPlaceholderText(
        `${(closest.distanceMeters / 1000).toFixed(2)}km de ${closest.label}`
      );
  }, [position, placeholder]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="flex-1">
          <div className="flex-1 text-left ">{placeholderText}</div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mapa</DialogTitle>
          <DialogDescription>Elija una zona de referencia</DialogDescription>
        </DialogHeader>

        <MapSelector
          center={
            position ?? {
              lat: universityCoordinates[0],
              lng: universityCoordinates[1],
            }
          }
          limitBoundaries={limitBoundaries}
          referencePoints={referencePoints}
        >
          <MarkerState
            position={position}
            onChange={(val) => setPosition(val)}
          />
        </MapSelector>

        <DialogFooter>
          <DialogClose className="w-full">
            <Button className="w-full">Ok</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
