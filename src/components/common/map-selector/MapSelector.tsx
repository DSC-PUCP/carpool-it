import type { PropsWithChildren } from 'react';
import {
  Map as MapComponent,
  MapMarker,
  MarkerContent,
  MarkerLabel,
} from '@/components/ui/map';
import type { LatLngBoundsLiteral, LatLngTuple } from '@/modules/travel/const';
import { toMapCenter } from '@/modules/travel/const';

type Props = PropsWithChildren & {
  center?: { lat: number; lng: number } | [number, number];
  limitBoundaries: LatLngBoundsLiteral;
  referencePoints: { label: string; cords: LatLngTuple }[];
};

function resolveCenter(
  center?: { lat: number; lng: number } | [number, number]
): [number, number] | undefined {
  if (!center) return undefined;
  if (Array.isArray(center)) return toMapCenter(center);
  return [center.lng, center.lat];
}

export default function MapSelector({
  children,
  center,
  limitBoundaries,
  referencePoints,
}: Props) {
  const mapCenter = resolveCenter(center);
  const bounds = limitBoundaries as [LatLngTuple, LatLngTuple];

  return (
    <MapComponent
      className="my-2 h-[50svh] w-full rounded-2xl"
      center={mapCenter}
      zoom={13}
      minZoom={10}
      maxZoom={16}
      maxBounds={[
        [bounds[0][1], bounds[0][0]],
        [bounds[1][1], bounds[1][0]],
      ]}
    >
      {children}
      {referencePoints.map((point) => (
        <MapMarker
          key={point.label}
          longitude={point.cords[1]}
          latitude={point.cords[0]}
        >
          <MarkerContent>
            <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
            <MarkerLabel position="bottom">{point.label}</MarkerLabel>
          </MarkerContent>
        </MapMarker>
      ))}
    </MapComponent>
  );
}
