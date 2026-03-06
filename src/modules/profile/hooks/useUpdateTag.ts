import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '../services';

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const { user } = useRouteContext({ from: '/_layout' });

  return useMutation({
    mutationFn: (tag: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return ProfileService.updateTag({ userId: user.id, tag });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROFILE] });
    },
  });
};
