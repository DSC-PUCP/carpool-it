import type { Result } from '@/lib/utils';
import type {
  DriverVehicle,
  RecurringTrip,
  UserLocation,
  UserProfile,
} from '../models';

export interface ProfileRepository {
  getProfile(userId: string): Promise<Result<UserProfile>>;
  isDriver(userId: string): Promise<Result<boolean>>;
  createVehicle(userId: string, vehicle: DriverVehicle): Promise<Result<void>>;
  setDriver(userId: string): Promise<Result<void>>;
  getVehicle(userId: string): Promise<Result<DriverVehicle | null>>;
  getLocations(userId: string): Promise<Result<UserLocation[]>>;
  addLocation(
    userId: string,
    location: Omit<UserLocation, 'id'>
  ): Promise<Result<string>>;
  setDefaultLocation(userId: string, locationId: string): Promise<Result<void>>;
  updateLocation(
    locationId: string,
    newLocation: Omit<UserLocation, 'id'>
  ): Promise<Result<void>>;
  deleteLocation(locationId: string): Promise<Result<void>>;

  getRecurringTrips(userId: string): Promise<Result<RecurringTrip[]>>;
  deleteRecurringTrip(tripId: string): Promise<Result<void>>;

  updateVehicle(
    userId: string,
    vehicle: Omit<DriverVehicle, 'qrUrl' | 'walletAddress'>
  ): Promise<Result<void>>;
  updatePaymentQr(userId: string, qrUrl: string): Promise<Result<void>>;
  updateMetamaskWallet(
    userId: string,
    walletAddress: string
  ): Promise<Result<void>>;
  updateTag(userId: string, tag: string): Promise<Result<void>>;
}
