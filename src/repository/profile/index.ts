import type { ProfileRepository } from '@/core/interfaces';
import type { UserLocation } from '@/core/models';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

export const profileRepository: ProfileRepository = {
  getProfile: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return Result.error(error);
    if (!data) return Result.error(new Error('Profile not found'));

    return Result.success({
      id: data.id,
      tag: data.tag,
      avatar: data.avatar,
      rating: data.rating,
      ridesCount: data.rides,
      co2Saved: data.contribution,
      isDriver: data.is_driver,
      locationId: data.location_id,
      lastTravel: data.last_travel ? new Date(data.last_travel) : null,
    });
  },
  isDriver: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profile')
      .select('is_driver')
      .eq('id', userId)
      .single();

    if (error) return Result.error(error);
    if (!data) return Result.error(new Error('Profile not found'));

    return Result.success(data.is_driver);
  },
  createVehicle: async (userId, vehicle) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('driver').insert({
      id: userId,
      plate: vehicle.plate,
      color: vehicle.color,
      seats: vehicle.seats,
      price: vehicle.price,
      route_description: vehicle.routeDescription?.trim() || null,
    });

    if (error) return Result.error(error);
    return Result.success();
  },
  setDriver: async (userId) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('profile')
      .update({ is_driver: true })
      .eq('id', userId);

    if (error) return Result.error(error);
    return Result.success();
  },
  getVehicle: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('driver')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) return Result.error(error);
    if (!data) return Result.success(null);

    return Result.success({
      plate: data.plate ?? '',
      color: data.color ?? '',
      seats: data.seats ?? 0,
      price: data.price ?? 0,
      routeDescription:
        (
          data as {
            route_description?: string | null;
          }
        ).route_description ?? '',
      qrUrl: data.qr_url ?? '',
      walletAddress:
        (data as { address_wallet?: string | null }).address_wallet ??
        data.wallet_address ??
        '',
    });
  },

  getLocations: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('location')
      .select('id, name, coords')
      .eq('user_id', userId);
    if (error) return Result.error(error);

    const locations: UserLocation[] = data.map((loc) => ({
      id: loc.id,
      name: loc.name,
      coords: {
        lat: (loc.coords as { coordinates: [number, number] }).coordinates[1],
        lon: (loc.coords as { coordinates: [number, number] }).coordinates[0],
      },
    }));

    return Result.success(locations);
  },

  addLocation: async (userId, location) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('location')
      .insert({
        user_id: userId,
        name: location.name,
        type: 'user',
        coords: `POINT(${location.coords.lon} ${location.coords.lat})`,
      })
      .select('id')
      .single();
    if (error) return Result.error(error);
    return Result.success(data.id);
  },
  setDefaultLocation: async (userId, locationId) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('profile')
      .update({ location_id: locationId })
      .eq('id', userId);
    if (error) return Result.error(error);
    return Result.success();
  },
  updateLocation: async (locationId, newLocation) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('location')
      .update({
        name: newLocation.name,
        coords: `POINT(${newLocation.coords.lon} ${newLocation.coords.lat})`,
      })
      .eq('id', locationId);
    if (error) return Result.error(error);
    return Result.success();
  },
  deleteLocation: async (locationId) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('location')
      .delete()
      .eq('id', locationId);
    if (error) return Result.error(error);
    return Result.success();
  },

  getRecurringTrips: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_user_recurrent_travels', {
      p_user_id: userId,
    });

    if (error) return Result.error(error);

    return Result.success(
      data.map((t) => ({
        id: t.id,
        direction: t.direction,
        originCoords: {
          lat: t.origin_coords?.[0] ?? 0,
          lon: t.origin_coords?.[1] ?? 0,
        },
        destinationCoords: {
          lat: t.destination_coords?.[0] ?? 0,
          lon: t.destination_coords?.[1] ?? 0,
        },
        seats: t.seats ?? 1,
        price: t.price ?? 5,
        recurrenceRule: t.recurrence_rule,
        routeDescription: t.route_description,
        isVisible: t.is_visible ?? true,
        tripTime: (t.trip_time as string) ?? '08:00',
      }))
    );
  },

  addRecurringTrip: async (userId, trip) => {
    const supabase = getSupabaseClient();

    // Enforce max 5 recurrents
    const { data: count, error: countError } = await supabase.rpc(
      'count_user_recurrent_travels',
      { p_user_id: userId }
    );
    if (countError) return Result.error(countError);
    if ((count ?? 0) >= 5)
      return Result.error(
        new Error('Ya tienes el máximo de 5 viajes recurrentes.')
      );

    const { data, error } = await supabase
      .from('recurrent_travel')
      .insert({
        user_id: userId,
        direction: trip.direction,
        origin_coords: `POINT(${trip.originCoords.lon} ${trip.originCoords.lat})`,
        destination_coords: `POINT(${trip.destinationCoords.lon} ${trip.destinationCoords.lat})`,
        seats: trip.seats,
        price: trip.price,
        recurrence_rule: trip.recurrenceRule,
        route_description: trip.routeDescription ?? null,
        is_visible: trip.isVisible ?? true,
        trip_time: trip.tripTime ?? '08:00',
      })
      .select('id')
      .single();

    if (error) return Result.error(error);
    return Result.success(data.id);
  },

  updateRecurringTripVisibility: async (tripId, isVisible) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('recurrent_travel')
      .update({ is_visible: isVisible })
      .eq('id', tripId);
    if (error) return Result.error(error);
    return Result.success();
  },

  deleteRecurringTrip: async (tripId) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('recurrent_travel')
      .delete()
      .eq('id', tripId);
    if (error) return Result.error(error);
    return Result.success();
  },

  getPublicProfileByTag: async (tag) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_public_recurrent_travels_by_tag', { p_user_tag: tag })
      .maybeSingle();

    if (error) return Result.error(error);
    if (!data) return Result.error(new Error('Profile not found'));

    const recurrentTrips = (
      (data.recurrent_travels as Array<Record<string, unknown>>) ?? []
    ).map((t) => ({
      id: t.id as string,
      direction: t.direction as 'to_campus' | 'from_campus',
      originCoords: {
        lat: (t.origin_coords as number[])?.[0] ?? 0,
        lon: (t.origin_coords as number[])?.[1] ?? 0,
      },
      destinationCoords: {
        lat: (t.destination_coords as number[])?.[0] ?? 0,
        lon: (t.destination_coords as number[])?.[1] ?? 0,
      },
      seats: (t.seats as number) ?? 1,
      price: (t.price as number) ?? 5,
      recurrenceRule: t.recurrence_rule as string,
      routeDescription: (t.route_description as string) ?? null,
      isVisible: (t.is_visible as boolean) ?? true,
      tripTime: (t.trip_time as string) ?? '08:00',
    }));

    return Result.success({
      id: data.user_id,
      tag: data.user_tag,
      avatar: data.user_avatar,
      rating: data.user_rating,
      ridesCount: Number(data.user_rides ?? 0),
      isDriver: data.is_driver,
      recurrentTrips,
    });
  },

  updateVehicle: async (userId, vehicle) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('driver')
      .update({
        plate: vehicle.plate,
        color: vehicle.color,
        seats: vehicle.seats,
        price: vehicle.price,
        route_description: vehicle.routeDescription?.trim() || null,
      })
      .eq('id', userId);

    if (error) return Result.error(error);
    return Result.success();
  },

  updatePaymentQr: async (userId, qrUrl) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('driver')
      .update({ qr_url: qrUrl })
      .eq('id', userId);

    if (error) return Result.error(error);
    return Result.success();
  },

  updateMetamaskWallet: async (userId, walletAddress) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('driver')
      .update({ address_wallet: walletAddress } as never)
      .eq('id', userId);

    if (error) {
      if (error.message.toLowerCase().includes('address_wallet')) {
        const { error: fallbackError } = await supabase
          .from('driver')
          .update({ wallet_address: walletAddress })
          .eq('id', userId);

        if (fallbackError) return Result.error(fallbackError);
        return Result.success();
      }

      return Result.error(error);
    }

    return Result.success();
  },

  updateTag: async (userId, tag) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('profile')
      .update({ tag })
      .eq('id', userId);

    if (error) return Result.error(error);
    return Result.success();
  },
};
