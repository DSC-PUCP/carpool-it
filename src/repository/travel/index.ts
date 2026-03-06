import type { TravelRepository } from '@/core/interfaces';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';
import { TravelMappers } from './mappers';

export const travelRepository: TravelRepository = {
  userHaveActiveRide: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('travel_room_stop')
      .select('room_id, travel_room(active,recurrence_rule)')
      .eq('user_id', userId)
      .eq('travel_room.active', true)
      .is('travel_room.recurrence_rule', null)
      .maybeSingle();

    if (error) return Result.error(error);
    return Result.success(data?.room_id ?? null);
  },

  listRooms: async (filters) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('search_travel_rooms', {
      p_date: filters?.datetime?.toISOString(),
      p_direction: filters?.direction,
      p_only_offers: filters?.onlyOffers,
      p_lat: filters?.location?.lat,
      p_lon: filters?.location?.lon,
      p_limit: filters?.limit,
      p_offset: filters?.offset,
    });
    if (error) return Result.error(new Error(error.message));
    return Result.success({
      travels: data?.travels?.map(
        TravelMappers.travelRoomSearchToTravelRoomEntity
      ),
      metadata: data?.metadata ?? {
        total: data.metadata.total ?? 0,
        page: data.metadata.page ?? 1,
        totalPages: data.metadata.total_pages ?? 1,
        next: data.metadata.next ?? null,
      },
    });
  },

  createRoom: async (input) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('travel_room')
      .insert({
        owner_id: input.ownerId,
        datetime: input.datetime.toISOString(),
        direction: input.direction,
      })
      .select('id')
      .single();

    if (!error) return Result.success(data.id);
    return Result.error(error);
  },

  deleteRoom: async (roomId) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('travel_room')
      .delete()
      .eq('id', roomId);
    if (error) return Result.error(error);
    return Result.success();
  },

  getRoom: async (roomId) => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .rpc('get_travel_room_detail', {
        p_id: roomId,
      })
      .single();

    if (error) return Result.error(error);
    return Result.success(
      TravelMappers.travelRoomDetailToTravelRoomEntity(data)
    );
  },
  getAvailableSeats: async (params) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_available_seats', {
      p_room_id: params.roomId,
    });
    if (error) return Result.error(error);
    return Result.success(data ?? 0);
  },
  joinRoom: async (params) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('travel_room_stop').insert({
      room_id: params.roomId,
      user_id: params.userId,
      user_role: params.userRole,
      stop_coords: `POINT(${params.stopCoords.lon} ${params.stopCoords.lat})`,
      price: params.price,
      seats: params.seats,
    });

    if (error) return Result.error(error);
    return Result.success();
  },

  quitRoom: async (params) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('travel_room_stop')
      .delete()
      .eq('room_id', params.roomId)
      .eq('user_id', params.userId);

    if (error) return Result.error(error);
    return Result.success();
  },
  isRoomOwner: async (params) => {
    const supabase = getSupabaseClient();
    const { error, count } = await supabase
      .from('travel_room')
      .select('owner_id', { count: 'exact', head: true })
      .eq('id', params.roomId)
      .eq('owner_id', params.userId);

    if (error) return Result.error(error);
    return Result.success((count ?? 0) > 0);
  },

  updateRoomOwner: async (params) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('travel_room')
      .update({ owner_id: params.newOwnerId })
      .eq('id', params.roomId);

    if (error) return Result.error(error);
    return Result.success();
  },

  updateStopIndex: async (params) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('travel_room')
      .update({
        current_stop: params.currentStop + 1,
      })
      .eq('id', params.roomId);
    if (error) return Result.error(error);
    return Result.success(params.currentStop + 1);
  },

  finishTravel: async (params) => {
    const supabase = getSupabaseClient();

    const { error: profileError } = await supabase.rpc(
      'increment_profile_rides',
      {
        p_id: params.userId,
      }
    );
    if (profileError) return Result.error(profileError);

    return Result.success();
  },

  rateDriver: async (params) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('rate_driver', {
      p_driver: params.driverId,
      p_rate: params.rate,
    });
    if (error) return Result.error(error);
    return Result.success();
  },
};
