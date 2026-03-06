import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useSetDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ProfileService.setDriver,
    onError: (error) => {
      toast.error(`Error al convertirse en conductor: ${error}`);
    },
    onSuccess: async () => {
      toast.success('Ahora eres conductor');
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PROFILE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.VEHICLE],
      });
    },
  });
};
