import type { RideRole, TravelRoom } from '@/core';
import type { LatLngTuple } from '@/modules/travel/const';
import type { Database } from '@/repository/database.types';

export namespace TravelMappers {
  export const travelRoomSearchToTravelRoomEntity = (
    data: Database['public']['Functions']['search_travel_rooms']['Returns'][number]
  ): Omit<TravelRoom, 'currentStop'> & {
    relevanceScore: number;
  } => {
    return {
      ...data,
      ownerId: data.owner_id,
      datetime: new Date(data.datetime),
      recurrenceRule: data.recurrence_rule as `RRULE:${string}` | null,
      relevanceScore: data.relevance_score,
      driver: data.driver
        ? {
            id: data.driver.id as string,
            userTag: data.driver.user_tag as string,
            userAvatar: data.driver.user_avatar as string,
            plate: data.driver.plate as string,
            color: data.driver.color as string,
            seats: data.driver.seats as number,
            rides: data.driver.rides as number,
            rating: data.driver.rating as number,
            votes: data.driver.votes as number,
            price: data.driver.price as number,
            routeDescription: data.driver.route_description as string | null,
            qrUrl: data.driver.qr_url as string | null,
          }
        : null,
      stops: data.stops.map((stop) => ({
        userId: stop.user_id as string,
        userRole: stop.user_role as RideRole,
        userTag: stop.user_tag as string,
        userAvatar: stop.user_avatar as string,
        seats: stop.seats as number,
        stopCoords: [
          stop.stop_coords?.[0],
          stop.stop_coords?.[1],
        ] as LatLngTuple,
      })),
    };
  };

  export const travelRoomDetailToTravelRoomEntity = (
    data:
      | Database['public']['Functions']['get_travel_room_detail']['Returns'][number]
      | null
  ): TravelRoom | null => {
    return data
      ? {
          ...data,
          ownerId: data.owner_id,
          datetime: new Date(data.datetime),
          recurrenceRule: data.recurrence_rule as `RRULE:${string}` | null,
          currentStop: data.current_stop as number,
          driver: data.driver
            ? {
                id: data.driver.id as string,
                userTag: data.driver.user_tag as string,
                userAvatar: data.driver.user_avatar as string,
                plate: data.driver.plate as string,
                color: data.driver.color as string,
                seats: data.driver.seats as number,
                rides: data.driver.rides as number,
                rating: data.driver.rating as number,
                votes: data.driver.votes as number,
                price: data.driver.price as number,
                routeDescription: data.driver.route_description as
                  | string
                  | null,
                qrUrl: data.driver.qr_url as string | null,
              }
            : null,
          stops: data.stops.map((stop) => ({
            userId: stop.user_id as string,
            userRole: stop.user_role as RideRole,
            userTag: stop.user_tag as string,
            userAvatar: stop.user_avatar as string,
            seats: stop.seats as number,
            stopCoords: [
              stop.stop_coords?.[0],
              stop.stop_coords?.[1],
            ] as LatLngTuple,
          })),
        }
      : null;
  };
}
