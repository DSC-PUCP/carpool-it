import type {
  RideDirection,
  RideLocation,
  RideRole,
  TravelRoom,
} from '@/core/models';
import type { Result } from '@/lib/utils';

export type RideListFilters = {
  direction: RideDirection;
  datetime: Date;
  onlyOffers: boolean;
  location: Omit<RideLocation, 'label'>;
  limit: number;
  offset: number;
};
export type RidePublishInput = {
  ownerId: string;
  direction: RideDirection;
  datetime: Date; // ISO timestamp
};
export type TravelRepository = {
  userHaveActiveRide: (userId: string) => Promise<Result<string | null>>;
  listRooms: (filters?: Partial<RideListFilters>) => Promise<
    Result<{
      travels: Omit<TravelRoom, 'currentStop'>[];
      metadata: {
        total: number;
        page: number;
        totalPages: number;
        next: number | null;
      };
    }>
  >;
  createRoom: (input: RidePublishInput) => Promise<Result<TravelRoom['id']>>;
  deleteRoom: (roomId: string) => Promise<Result<void>>;
  getRoom: (roomId: string) => Promise<Result<TravelRoom | null>>;
  quitRoom: (params: {
    roomId: string;
    userId: string;
  }) => Promise<Result<void>>;
  getAvailableSeats: (params: { roomId: string }) => Promise<Result<number>>;
  joinRoom: (params: {
    roomId: string;
    userId: string;
    userRole: RideRole;
    stopCoords: {
      lat: number;
      lon: number;
    };
    seats: number;
    price: number;
  }) => Promise<Result<void>>;
  isRoomOwner: (params: {
    roomId: string;
    userId: string;
  }) => Promise<Result<boolean>>;
  updateRoomOwner: (params: {
    roomId: string;
    newOwnerId: string;
  }) => Promise<Result<void>>;
  updateStopIndex: (params: {
    roomId: string;
    currentStop: number;
  }) => Promise<Result<number>>;
  finishTravel: (params: {
    roomId: string;
    userId: string;
    role: RideRole;
  }) => Promise<Result<void>>;
  rateDriver: (params: {
    driverId: string;
    rate: number;
  }) => Promise<Result<void>>;
};
