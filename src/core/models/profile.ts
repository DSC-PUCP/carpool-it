import type { Database } from '@/repository/database.types';

export type UserLocationType = Database['public']['Enums']['location_type'];
export type TravelDirection = Database['public']['Enums']['travel_direction'];

export interface UserProfile {
  id: string;
  tag: string;
  avatar: string | null;
  rating: number | null;
  ridesCount: number;
  co2Saved: number;
  isDriver: boolean;
  locationId: string | null;
  lastTravel: Date | null;
}

export interface DriverVehicle {
  plate: string;
  color: string;
  seats: number;
  price: number;
  routeDescription?: string;
  qrUrl: string;
  walletAddress: string;
}

export interface PaymentsConfig {
  qrUrl: string | null;
  metamaskAddress: string | null;
}

export interface UserLocation {
  id: string;
  name: string;
  coords: { lat: number; lon: number };
}

export interface RecurringTrip {
  id: string;
  direction: TravelDirection;
  originCoords: { lat: number; lon: number };
  destinationCoords: { lat: number; lon: number };
  seats: number;
  price: number;
  recurrenceRule: string;
  routeDescription: string | null;
  isVisible: boolean;
  tripTime: string; // HH:MM format
}

export interface PublicProfile {
  id: string;
  tag: string;
  avatar: string | null;
  rating: number | null;
  ridesCount: number;
  isDriver: boolean;
  recurrentTrips: RecurringTrip[];
}
