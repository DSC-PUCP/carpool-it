import { ClipboardPaste, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { parseGoogleMapsUrl } from '../utils';

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

  const handleOpenGoogleMaps = () => {
    const lat = position?.lat ?? universityCoordinates[0];
    const lng = position?.lng ?? universityCoordinates[1];
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const coords = parseGoogleMapsUrl(text);
      if (coords) {
        setPosition(coords);
        toast.success('Coordenadas pegadas correctamente');
      } else {
        toast.error('No se pudieron extraer coordenadas del enlace');
      }
    } catch {
      toast.error('No se pudo acceder al portapapeles');
    }
  };

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
          <DialogDescription>
            Elija una zona de referencia, evite poner su ubicación exacta por
            privacidad
          </DialogDescription>
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

        <DialogFooter className="sm:flex-col flex-col gap-2">
          <div className="flex flex-col gap-2 w-full">
            <Button
              type="button"
              variant="link"
              className="flex-1"
              onClick={handleOpenGoogleMaps}
            >
              <ExternalLink className="size-4" />
              Buscar en Maps
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handlePasteLink}
            >
              <ClipboardPaste className="size-4" />
              Pegar URL de Maps
            </Button>
          </div>
          <DialogClose className="w-full">
            <Button className="w-full">Ok</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
