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
    const { data, error } = await supabase
      .from('travel_room')
      .select('*')
      .eq('owner_id', userId)
      .not('recurrence_rule', 'is', null);

    if (error) return Result.error(error);

    return Result.success(
      data.map((t) => ({
        id: t.id,
        datetime: new Date(t.datetime),
        direction: t.direction,
        recurrenceRule: t.recurrence_rule,
      }))
    );
  },

  deleteRecurringTrip: async (tripId) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('travel_room')
      .delete()
      .eq('id', tripId);
    if (error) return Result.error(error);
    return Result.success();
  },

  updateVehicle: async (userId, vehicle) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('driver')
      .update({
        model: vehicle.plate,
        color: vehicle.color,
        seats: vehicle.seats,
        price: vehicle.price,
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
