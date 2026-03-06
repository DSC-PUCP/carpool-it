import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import type { UserLocation } from '@/core/models';
import { ProfileService } from '@/modules/profile/services';

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ProfileService.addLocation,
    onMutate: async ({ location: { name } }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.LOCATIONS] });
      const previousLocations = queryClient.getQueryData([
        'locations',
      ]) as UserLocation[];
      queryClient.setQueryData([QueryKeys.LOCATIONS], (old: UserLocation[]) => [
        ...(old || []),
        { id: 'temp-id', name, coors: { lat: 0, lng: 0 } },
      ]);
      return { previousLocations };
    },
    onError: (error, _, context) => {
      toast.error(error.message || 'Error al agregar ubicación');
      if (context?.previousLocations) {
        queryClient.setQueryData(
          [QueryKeys.LOCATIONS],
          context.previousLocations
        );
      }
    },
    onSuccess: () => {
      toast.success('Ubicación agregada correctamente');
    },
    onSettled: (_, __, { setDefault: firstLocation }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LOCATIONS] });
      if (firstLocation)
        queryClient.invalidateQueries({ queryKey: [QueryKeys.PROFILE] });
    },
  });
};
