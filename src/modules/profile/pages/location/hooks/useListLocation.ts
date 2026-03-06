import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useListLocation = () => {
  const { user } = useRouteContext({
    from: '/_layout/_auth/profile/locations',
  });
  return useSuspenseQuery({
    queryKey: [QueryKeys.LOCATIONS],
    queryFn: () => ProfileService.getLocations(user.id),
  });
};
