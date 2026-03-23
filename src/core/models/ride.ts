import type { LatLngTuple } from '@/modules/travel/const';

export type RideDirection = 'to_campus' | 'from_campus';

export type RideRole = 'driver' | 'passenger';

export type RideType = 'offer' | 'request';

export type RideLocation = {
  lat: number;
  lon: number;
  label: string;
};

export type TravelRoomStop = {
  userId: string; // uuid
  userRole: RideRole;
  userTag: string;
  userAvatar: string;
  stopCoords: LatLngTuple;
  seats: number; // int2
};

export type DriverInfo = {
  id: string; // uuid
  userTag: string;
  userAvatar: string;
  plate: string;
  color: string;
  seats: number;
  rides: number;
  rating: number;
  votes: number;
  price: number;
  routeDescription?: string | null;
  qrUrl: string | null;
} | null;

export type TravelRoom = {
  id: string; // uuid
  ownerId: string; // uuid
  direction: RideDirection; // enum travel_direction
  datetime: Date; // Date object from ISO timestamp
  recurrenceRule: `RRULE:${string}` | null;
  stops: TravelRoomStop[]; // array de paradas
  driver: DriverInfo; // objeto o null
  currentStop: number;
};
