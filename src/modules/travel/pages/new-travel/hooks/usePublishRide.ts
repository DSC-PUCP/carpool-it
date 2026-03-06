import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';
import { TravelService } from '@/modules/travel/services';

export const usePublishRide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TravelService.publishRide,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TRAVEL],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ACTIVE_RIDE],
      });
    },
  });
};

export const useAddLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ProfileService.addLocation,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.LOCATIONS],
      }),
  });
};
