import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useUpdateRecurringTripVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      isVisible,
    }: {
      tripId: string;
      isVisible: boolean;
    }) => ProfileService.updateRecurringTripVisibility(tripId, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RECURRENTS] });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar visibilidad');
    },
  });
};
