import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { MapMarker, MarkerContent, useMap } from '@/components/ui/map';

type MarkerStateProps = {
  position?: { lat: number; lng: number } | null;
  onChange?: (position: { lat: number; lng: number }) => void;
};

export default function MarkerState({
  onChange,
  position: controlledPosition,
}: MarkerStateProps) {
  const [internalPosition, setInternalPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const position = controlledPosition ?? internalPosition;
  const { map } = useMap();

  const handleMapClick = useCallback(
    (e: { lngLat: { lng: number; lat: number } }) => {
      const pos = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      if (onChange) {
        onChange(pos);
      } else {
        setInternalPosition(pos);
      }
      map?.flyTo({ center: [pos.lng, pos.lat] });
    },
    [onChange, map]
  );

  useEffect(() => {
    if (!map) return;
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, handleMapClick]);

  if (!position) return null;

  return (
    <MapMarker
      longitude={position.lng}
      latitude={position.lat}
      draggable
      onDragEnd={(lngLat) => {
        const pos = { lat: lngLat.lat, lng: lngLat.lng };
        if (onChange) {
          onChange(pos);
        } else {
          setInternalPosition(pos);
        }
      }}
    >
      <MarkerContent>
        <div className="relative flex items-center justify-center">
          <div className="absolute size-25 rounded-full bg-primary/40 pointer-events-none" />
          <div className="bg-linear-to-br from-primary to-primary/80 rounded-full p-1.5 shadow-lg shadow-primary/50">
            <MapPin className="size-3.5 text-white" />
          </div>
        </div>
      </MarkerContent>
    </MapMarker>
  );
}
