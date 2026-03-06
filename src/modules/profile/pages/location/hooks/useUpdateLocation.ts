import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import type { UserLocation } from '@/core/models';
import { ProfileService } from '@/modules/profile/services';

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileService.updateLocation,
    onMutate: async (newLocation) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.LOCATIONS] });

      const previousLocations = queryClient.getQueryData([
        QueryKeys.LOCATIONS,
      ]) as UserLocation[];

      queryClient.setQueryData(
        [QueryKeys.LOCATIONS],
        (old: UserLocation[] | undefined) =>
          old
            ? old.map((location) =>
                location.id === newLocation.id ? newLocation : location
              )
            : []
      );

      return { previousLocations };
    },
    onError: (error, _, context) => {
      toast.error(error.message || 'Error al actualizar ubicación');
      if (context?.previousLocations) {
        queryClient.setQueryData(
          [QueryKeys.LOCATIONS],
          context.previousLocations
        );
      }
    },
    onSuccess: () => {
      toast.success('Ubicación actualizada correctamente');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LOCATIONS] });
    },
  });
};
