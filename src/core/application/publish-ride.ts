import type { TravelRepository } from '../interfaces';
import type { RidePublishInput } from '../interfaces/travel-repository';

export const publishRideUseCase =
  (travelRepository: TravelRepository) => async (payload: RidePublishInput) => {
    if (await travelRepository.userHaveActiveRide(payload.ownerId)) {
      return {
        error: 'El usuario ya tiene un viaje activo.',
        data: null,
      };
    }
    const room = await travelRepository.createRoom(payload);
    return {
      error: null,
      data: room,
    };
  };
