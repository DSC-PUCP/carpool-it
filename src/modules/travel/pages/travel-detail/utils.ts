import type { RideRole, TravelRoom } from '@/core';
import type { UserLocation, UserProfile } from '@/core/models/profile';
import { universityCoordinates } from '../../const';
import { farestPointFromCampus, orderStopsByRoute } from '../../utils';

type TravelUser = {
  id: string;
};

export type JoinRideRole = Extract<RideRole, 'driver' | 'passenger'>;

export const getTravelParticipationState = (
  travel: TravelRoom,
  user: TravelUser | null | undefined
) => {
  if (!user) {
    return {
      isMember: false,
      isOwner: false,
      isPassenger: false,
    };
  }

  const isMember = travel.stops.some((stop) => stop.userId === user.id);
  const isOwner = travel.ownerId === user.id;
  const isPassenger = travel.stops.some(
    (stop) => stop.userId === user.id && stop.userRole === 'passenger'
  );

  return {
    isMember,
    isOwner,
    isPassenger,
  };
};

export const getSeatRecommendationForMember = (
  travel: TravelRoom,
  user: TravelUser | null | undefined,
  isMember: boolean
) => {
  const passengers = travel.stops.filter(
    (stop) => stop.userRole === 'passenger'
  );
  if (!isMember || !user || passengers.length < 2) return null;

  const stopCoordinates = travel.stops.map((stop) => stop.stopCoords);
  const driverStopCoordinates = travel.stops.find(
    (stop) => stop.userRole === 'driver'
  )?.stopCoords;

  const routeReferencePoint = travel.driver
    ? driverStopCoordinates
    : farestPointFromCampus(stopCoordinates);

  const isToCampus = travel.direction === 'to_campus';
  const startPoint = isToCampus
    ? (routeReferencePoint ?? stopCoordinates[0])
    : universityCoordinates;
  const endPoint = isToCampus
    ? universityCoordinates
    : (routeReferencePoint ?? stopCoordinates[0]);

  if (!startPoint || !endPoint) return null;

  const orderedPassengers = orderStopsByRoute(passengers, startPoint, endPoint);
  const passengerOrderIndex = orderedPassengers.findIndex(
    (passenger) => passenger.userId === user.id
  );

  if (passengerOrderIndex === -1) return null;

  if (passengerOrderIndex === 0) {
    return 'Ubícate en el asiento derecho del vehículo para salir más fácilmente.';
  }

  return 'Ubícate en el asiento izquierdo del vehículo.';
};

export const getDefaultLocationForProfile = (
  profile: UserProfile | null | undefined,
  locations: UserLocation[] | null | undefined
) => {
  if (!profile || !locations) return null;
  return (
    locations.find((location) => location.id === profile.locationId) ?? null
  );
};

export const shouldPromptForDriverRoleSelection = (
  profile: UserProfile | null | undefined
) => Boolean(profile?.isDriver);

export const buildJoinRideInput = (params: {
  travel: TravelRoom;
  userId: string;
  role: JoinRideRole;
  defaultLocation: UserLocation;
}) => ({
  roomId: params.travel.id,
  userId: params.userId,
  role: params.role,
  seats: 1,
  price: params.travel.driver?.price ?? 0,
  stopCoords: params.defaultLocation.coords,
});

export const getOwnerTransferCandidate = (
  travel: TravelRoom,
  userId: string,
  isOwner: boolean
) => {
  if (!isOwner) return undefined;

  const nextOwnerCandidate = travel.stops.find(
    (stop) => stop.userId !== userId
  );
  return nextOwnerCandidate?.userId;
};

export const getDriverPaymentState = (travel: TravelRoom) => {
  const driverUserId = travel.driver?.id;

  return {
    driverUserId,
    driverQrUrl: travel.driver?.qrUrl,
    hasDriverPaymentMethods: Boolean(driverUserId),
  };
};

export const canCurrentUserRateDriver = (params: {
  travel: TravelRoom;
  user: TravelUser | null | undefined;
  isMember: boolean;
  isPassenger: boolean;
  hasRatedDriver: (roomId: string, userId: string) => boolean;
}) => {
  if (!params.travel.driver) return false;
  if (!params.user) return false;
  if (!params.isMember || !params.isPassenger) return false;

  return !params.hasRatedDriver(params.travel.id, params.user.id);
};
