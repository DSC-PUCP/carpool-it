import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { TravelService } from '@/modules/travel/services';

export const useSetNextStop = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: TravelService.setNextStop,
    onSuccess: (_, variables) => {
      router.invalidate();
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.TRAVEL_DETAIL, variables.roomId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
