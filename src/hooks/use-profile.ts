import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useProfile = () => {
  const { user } = useRouteContext({ from: '/_layout' });
  return useSuspenseQuery({
    queryKey: [QueryKeys.PROFILE],
    queryFn: () => {
      if (!user?.id) return null;
      return ProfileService.getProfile(user.id);
    },
    staleTime: Infinity,
  });
};
