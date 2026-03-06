import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import type { UserProfile } from '@/core/models';
import { ProfileService } from '@/modules/profile/services';

export const useDefaultLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileService.setDefaultLocation,
    onMutate: async ({ locationId }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.PROFILE] });

      const previousProfile = queryClient.getQueryData<UserProfile>([
        QueryKeys.PROFILE,
      ]);

      queryClient.setQueryData<UserProfile>([QueryKeys.PROFILE], (old) =>
        old
          ? {
              ...old,
              locationId,
            }
          : undefined
      );

      return { previousProfile };
    },
    onError: (error, _, context) => {
      toast.error(
        error.message || 'Error al actualizar ubicación predeterminada'
      );
      if (context?.previousProfile) {
        queryClient.setQueryData([QueryKeys.PROFILE], context.previousProfile);
      }
    },
    onSuccess: () => {
      toast.success('Ubicación predeterminada actualizada');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROFILE] });
    },
  });
};
