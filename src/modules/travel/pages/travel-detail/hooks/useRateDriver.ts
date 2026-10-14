import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import getLocalStorage from '@/lib/localStorage';
import { TravelService } from '@/modules/travel/services';

const getRatedKey = (roomId: string, userId: string) =>
  `rated_driver_${roomId}_${userId}`;

export const hasRatedDriver = (roomId: string, userId: string): boolean => {
  const ls = getLocalStorage();
  return ls.getItem(getRatedKey(roomId, userId)) === '1';
};

export const useRateDriver = (roomId: string, userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { driverId: string; rate: number }) =>
      TravelService.rateDriver(params),
    onSuccess: () => {
      const ls = getLocalStorage();
      ls.setItem(getRatedKey(roomId, userId), '1');
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.TRAVEL_DETAIL, roomId],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.TRAVEL] });
      toast.success('¡Gracias por tu calificación!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
