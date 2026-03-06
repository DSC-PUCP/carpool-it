import type { RideListFilters } from '@/core/interfaces/travel-repository';
import type { RideRole } from '@/core/models';
import { travelRepository } from '@/repository';
import { profileRepository } from '@/repository/profile';
import { isCampusLocation } from './utils';

type PublishRidePayload = {
  ownerId: string;
  role: RideRole;
  origin: {
    lat: number;
    lon: number;
  };
  destination: {
    lat: number;
    lon: number;
  };
  campusAt: Date;
  requestedSeats: number;
  price: number;
};

export namespace TravelService {
  export const listRooms = async (filters: Partial<RideListFilters>) => {
    const result = await travelRepository.listRooms(filters);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    const value = result.getValue();
    return {
      travels: value?.travels ?? [],
      metadata: value?.metadata ?? {
        total: 0,
        page: 1,
        totalPages: 1,
        next: null,
      },
    };
  };
  export const getActiveRideForUser = async (userId: string) => {
    const result = await travelRepository.userHaveActiveRide(userId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };

  export const publishRide = async (payload: PublishRidePayload) => {
    const profileResult = await profileRepository.getProfile(payload.ownerId);
    if (profileResult.isFailure())
      throw new Error('Error al obtener el perfil del usuario.');
    const profile = profileResult.getValue();
    if (profile?.lastTravel) {
      const minutesSinceLast =
        (Date.now() - profile.lastTravel.getTime()) / 1000 / 60;
      if (minutesSinceLast < 15)
        throw new Error(
          'Debes esperar 15 minutos antes de publicar un nuevo viaje.'
        );
    }

    const haveActiveTravelResult = await travelRepository.userHaveActiveRide(
      payload.ownerId
    );
    if (haveActiveTravelResult.isFailure())
      throw new Error('Error al verificar viajes activos.');
    if (haveActiveTravelResult.getValue())
      throw new Error('El usuario ya tiene un viaje activo.');
    const direction = isCampusLocation([payload.origin.lat, payload.origin.lon])
      ? 'from_campus'
      : 'to_campus';
    const createRoomResult = await travelRepository.createRoom({
      datetime: payload.campusAt,
      direction,
      ownerId: payload.ownerId,
    });
    if (createRoomResult.isFailure())
      throw new Error('Error al crear la sala de viaje.');

    const joinRoomResut = await travelRepository.joinRoom({
      roomId: createRoomResult.getValue() as string,
      userId: payload.ownerId,
      userRole: payload.role,
      price: payload.price,
      seats: payload.requestedSeats,
      stopCoords:
        direction === 'to_campus'
          ? {
              lat: payload.origin.lat,
              lon: payload.origin.lon,
            }
          : {
              lat: payload.destination.lat,
              lon: payload.destination.lon,
            },
    });
    if (joinRoomResut.isFailure()) {
      await travelRepository.deleteRoom(createRoomResult.getValue() as string);
      throw new Error('Error al unirse a la sala de viaje.');
    }
    return createRoomResult.getValue() as string;
  };

  export const joinRoom = async (params: {
    roomId: string;
    userId: string;
    role: RideRole;
    seats: number;
    price: number;
    stopCoords: {
      lat: number;
      lon: number;
    };
  }) => {
    const { roomId, userId, role, seats, price, stopCoords } = params;
    const userHaveActiveTravelResult =
      await travelRepository.userHaveActiveRide(userId);
    if (userHaveActiveTravelResult.isFailure())
      throw new Error('Error al verificar viajes activos del usuario.');
    if (userHaveActiveTravelResult.getValue())
      throw new Error('El usuario ya tiene un viaje activo.');
    const availableSeatsResult = await travelRepository.getAvailableSeats({
      roomId,
    });
    if (availableSeatsResult.isFailure())
      throw new Error('Error al obtener los asientos disponibles.');
    const availableSeats = availableSeatsResult.getValue() as number;
    if (seats > availableSeats)
      throw new Error('No hay suficientes asientos disponibles en la sala.');
    const result = await travelRepository.joinRoom({
      roomId,
      userId,
      userRole: role,
      seats,
      price,
      stopCoords,
    });
    if (result.isFailure())
      throw new Error(
        `Error al unirse a la sala de viaje: ${result.getError()?.message}`
      );
    return;
  };

  export const getRoomDetails = async (roomId: string) => {
    const result = await travelRepository.getRoom(roomId);
    if (result.isFailure()) return null;
    return result.getValue() ?? null;
  };

  export const quitRoom = async ({
    roomId,
    userId,
    onlyOne,
    newOwnerId,
  }: {
    roomId: string;
    userId: string;
    onlyOne?: boolean;
    newOwnerId?: string;
  }) => {
    if (onlyOne) {
      const deleteResult = await travelRepository.deleteRoom(roomId);
      if (deleteResult.isFailure())
        throw new Error('Error al eliminar la sala de viaje.');
      return;
    }

    if (newOwnerId) {
      const updateOwnerResult = await travelRepository.updateRoomOwner({
        roomId,
        newOwnerId,
      });
      if (updateOwnerResult.isFailure())
        throw new Error(
          'Error al transferir la propiedad de la sala de viaje.'
        );
    }

    const quitResult = await travelRepository.quitRoom({ roomId, userId });
    if (quitResult.isFailure())
      throw new Error('Error al salir de la sala de viaje.');
  };

  export const setNextStop = async (params: {
    roomId: string;
    currentStop: number;
    passengersToFinish?: { userId: string; role: RideRole }[];
  }) => {
    const updateResult = await travelRepository.updateStopIndex({
      roomId: params.roomId,
      currentStop: params.currentStop,
    });
    if (updateResult.isFailure())
      throw new Error(updateResult.getError()?.message);

    if (params.passengersToFinish) {
      await Promise.all(
        params.passengersToFinish.map((passenger) =>
          travelRepository.finishTravel({
            roomId: params.roomId,
            userId: passenger.userId,
            role: passenger.role,
          })
        )
      );
    }

    return updateResult.getValue() as number;
  };

  export const rateDriver = async (params: {
    driverId: string;
    rate: number;
  }) => {
    const result = await travelRepository.rateDriver(params);
    if (result.isFailure()) throw new Error(result.getError()?.message);
  };

  export const finishTravel = async (params: {
    roomId: string;
    userId: string;
    role: RideRole;
  }) => {
    const result = await travelRepository.finishTravel({
      roomId: params.roomId,
      userId: params.userId,
      role: params.role,
    });
    if (result.isFailure()) throw new Error(result.getError()?.message);

    if (params.role === 'driver') {
      const deleteResult = await travelRepository.deleteRoom(params.roomId);
      if (deleteResult.isFailure())
        throw new Error('Error al eliminar la sala de viaje.');
    }

    return result.getValue();
  };
}
