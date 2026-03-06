import type { TravelRepository } from '../interfaces';
import type { RideListFilters } from '../models';

export const listRidesUseCase =
  (travelRepository: TravelRepository) => async (filters?: RideListFilters) => {
    try {
      const rides = await travelRepository.listRooms(filters);
      return {
        error: null,
        data: rides,
      };
    } catch (error) {
      return {
        error: error as Error,
        data: null,
      };
    }
  };
