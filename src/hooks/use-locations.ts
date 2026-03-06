import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useLocations = () => {
  const { user } = useRouteContext({ from: '/_layout' });
  return useSuspenseQuery({
    queryKey: [QueryKeys.LOCATIONS],
    queryFn: () => {
      if (!user?.id) return null;
      return ProfileService.getLocations(user.id);
    },
    staleTime: Infinity,
  });
};
