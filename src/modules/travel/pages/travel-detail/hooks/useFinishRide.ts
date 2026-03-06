import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { TravelService } from '@/modules/travel/services';

export const useFinishRide = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: TravelService.finishTravel,
    onSuccess: (_, variables) => {
      toast.success('Has finalizado el viaje exitosamente');
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TRAVEL_DETAIL, variables.roomId],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRAVEL] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ACTIVE_RIDE] });
      navigate({ to: '/home' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
