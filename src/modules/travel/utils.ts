import type { LatLngTuple } from './const';
import {
  type ReferencePoint,
  referencePoints,
  universityCoordinates,
  universityLabel,
} from './const';

const toRad = (x: number) => (x * Math.PI) / 180;
const R = 6371000 as const;

export const haversineMeters = (a: LatLngTuple, b: LatLngTuple) => {
  const [latA, lonA] = a;
  const [latB, lonB] = b;

  const dLat = toRad(latB - latA);
  const dLon = toRad(lonB - lonA);

  const phiA = toRad(latA);
  const phiB = toRad(latB);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(phiA) * Math.cos(phiB) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

export function getClosestReferencePoint(origin: LatLngTuple) {
  let closest: ReferencePoint | null = null;
  let minDistance = Infinity;

  for (const point of referencePoints) {
    const dist = haversineMeters(origin, point.cords);
    if (dist < minDistance) {
      minDistance = dist;
      closest = point;
    }
  }

  if (!closest) return null;

  return {
    label: closest.label,
    cords: closest.cords,
    distanceMeters: Math.round(minDistance),
  };
}

export const isCampusLocation = (location: LatLngTuple) => {
  const campusPoint = referencePoints.find(
    (point) => point.label === universityLabel
  );
  if (!campusPoint) return false;
  const distance = haversineMeters(location, campusPoint.cords);
  return distance < 500;
};

export const farestPointFromCampus = (locations: LatLngTuple[]) => {
  let farthestLocation: LatLngTuple | null = null;
  let maxDistance = -1;

  for (const location of locations) {
    const distance = haversineMeters(location, universityCoordinates);
    if (distance > maxDistance) {
      maxDistance = distance;
      farthestLocation = location;
    }
  }

  return farthestLocation;
};

const projectionParameter = (
  A: LatLngTuple,
  B: LatLngTuple,
  P: LatLngTuple
) => {
  const latFactor = Math.cos(toRad((A[0] + B[0]) / 2));

  const Ax = A[1] * latFactor;
  const Ay = A[0];
  const Bx = B[1] * latFactor;
  const By = B[0];
  const Px = P[1] * latFactor;
  const Py = P[0];

  const ABx = Bx - Ax;
  const ABy = By - Ay;
  const APx = Px - Ax;
  const APy = Py - Ay;

  const abLen2 = ABx * ABx + ABy * ABy;

  return (APx * ABx + APy * ABy) / abLen2;
};
export const orderLocationsByNearestWithDirection = (
  locations: LatLngTuple[],
  start: LatLngTuple,
  end: LatLngTuple
) => {
  const remaining = [...locations];
  const ordered: LatLngTuple[] = [];

  let current = start;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    let bestT = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const d = haversineMeters(current, p);
      const t = projectionParameter(start, end, p);

      if (d < bestDistance || (Math.abs(d - bestDistance) < 50 && t > bestT)) {
        bestDistance = d;
        bestT = t;
        bestIndex = i;
      }
    }

    const split = remaining.splice(bestIndex, 1);
    const next = split[0];
    ordered.push(next);
    current = next;
  }

  return ordered;
};

interface HasLocation {
  stopCoords: LatLngTuple;
  [key: string]: unknown;
}

export const orderStopsByRoute = <T extends HasLocation>(
  stops: T[],
  start: LatLngTuple,
  end: LatLngTuple
) => {
  const remaining = [...stops];
  const ordered: T[] = [];

  let current = start;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    let bestT = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const d = haversineMeters(current, p.stopCoords);
      const t = projectionParameter(start, end, p.stopCoords);

      if (d < bestDistance || (Math.abs(d - bestDistance) < 50 && t > bestT)) {
        bestDistance = d;
        bestT = t;
        bestIndex = i;
      }
    }

    const split = remaining.splice(bestIndex, 1);
    const next = split[0];
    ordered.push(next);
    current = next.stopCoords;
  }

  return ordered;
};
