import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { TravelService } from '@/modules/travel/services';

export const useJoinRide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: TravelService.joinRoom,
    onSuccess: (_, variables) => {
      toast.success('Te has unido al viaje exitosamente');
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TRAVEL_DETAIL, variables.roomId],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRAVEL] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TRAVEL_DETAIL, variables.roomId],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ACTIVE_RIDE] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
