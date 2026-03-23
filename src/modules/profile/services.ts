import type {
  DriverVehicle,
  PaymentsConfig,
  UserLocation,
  UserProfile,
} from '@/core/models';
import { bucketRepository } from '@/repository/bucket';
import { profileRepository } from '@/repository/profile';

export namespace ProfileService {
  export const getProfile = async (userId: string) => {
    const result = await profileRepository.getProfile(userId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue() as UserProfile;
  };

  export const getVehicle = async (userId: string) => {
    const result = await profileRepository.getVehicle(userId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue() as DriverVehicle;
  };

  export const setDriver = async (
    vehicle: DriverVehicle & {
      userId: string;
    }
  ) => {
    const isDriverResult = await profileRepository.isDriver(vehicle.userId);
    if (isDriverResult.isFailure())
      throw new Error(isDriverResult.getError()?.message);
    if (isDriverResult.getValue()) return;
    const vehicleResult = await profileRepository.createVehicle(
      vehicle.userId,
      vehicle
    );
    if (vehicleResult.isFailure())
      throw new Error(vehicleResult.getError()?.message);
    const setDriverResult = await profileRepository.setDriver(vehicle.userId);
    if (setDriverResult.isFailure())
      throw new Error(setDriverResult.getError()?.message);
  };

  export const updateVehicle = async (params: {
    userId: string;
    vehicle: Omit<DriverVehicle, 'qrUrl' | 'walletAddress'>;
  }) => {
    const result = await profileRepository.updateVehicle(
      params.userId,
      params.vehicle
    );
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const getLocations = async (userId: string) => {
    const result = await profileRepository.getLocations(userId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue() as UserLocation[];
  };

  export const addLocation = async (params: {
    userId: string;
    location: Omit<UserLocation, 'id'>;
    setDefault?: boolean;
  }) => {
    const result = await profileRepository.addLocation(
      params.userId,
      params.location
    );
    if (result.isFailure()) throw new Error(result.getError()?.message);
    const locationId = result.getValue() as string;
    if (params.setDefault) {
      const defaultResult = await profileRepository.setDefaultLocation(
        params.userId,
        locationId
      );
      if (defaultResult.isFailure())
        throw new Error(defaultResult.getError()?.message);
    }
    return locationId;
  };

  export const setDefaultLocation = async (params: {
    userId: string;
    locationId: string;
  }) => {
    const result = await profileRepository.setDefaultLocation(
      params.userId,
      params.locationId
    );
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };
  export const updateLocation = async (location: UserLocation) => {
    const result = await profileRepository.updateLocation(
      location.id,
      location
    );
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const deleteLocation = async (locationId: string) => {
    const result = await profileRepository.deleteLocation(locationId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const getRecurringTrips = async (userId: string) => {
    const result = await profileRepository.getRecurringTrips(userId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const deleteRecurringTrip = async (tripId: string) => {
    const result = await profileRepository.deleteRecurringTrip(tripId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const getPayments = async (userId: string) => {
    const vehicleResult = await profileRepository.getVehicle(userId);
    if (vehicleResult.isFailure())
      throw new Error(vehicleResult.getError()?.message);

    const vehicle = vehicleResult.getValue();

    return {
      qrUrl: vehicle?.qrUrl ?? null,
      metamaskAddress: vehicle?.walletAddress || null,
    } as PaymentsConfig;
  };

  export const updatePaymentQr = async (params: {
    userId: string;
    file: File;
  }) => {
    const uploadResult = await bucketRepository.uploadPaymentQr(params);
    if (uploadResult.isFailure())
      throw new Error(uploadResult.getError()?.message);

    const qrUrl = uploadResult.getValue() as string;
    const updateResult = await profileRepository.updatePaymentQr(
      params.userId,
      qrUrl
    );

    if (updateResult.isFailure())
      throw new Error(updateResult.getError()?.message);

    return qrUrl;
  };

  export const updateMetamaskWallet = async (params: {
    userId: string;
    walletAddress: string;
  }) => {
    const result = await profileRepository.updateMetamaskWallet(
      params.userId,
      params.walletAddress
    );
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const updateTag = async (params: { userId: string; tag: string }) => {
    const result = await profileRepository.updateTag(params.userId, params.tag);
    if (result.isFailure()) {
      const error = result.getError();
      // PostgreSQL unique violation code
      if ((error as { code?: string })?.code === '23505') {
        throw new Error('TAG_ALREADY_EXISTS');
      }
      throw new Error(error?.message);
    }
    return result.getValue();
  };
}
