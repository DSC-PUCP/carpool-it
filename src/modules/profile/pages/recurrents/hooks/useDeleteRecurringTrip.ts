import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useDeleteRecurringTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileService.deleteRecurringTrip,
    onSuccess: () => {
      toast.success('Viaje recurrente eliminado');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RECURRENTS] });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el viaje recurrente');
    },
  });
};
