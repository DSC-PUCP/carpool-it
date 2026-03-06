import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { TravelService } from '@/modules/travel/services';

export const useActiveRide = () => {
  const { user } = useRouteContext({ from: '/_layout' });
  return useSuspenseQuery({
    queryKey: [QueryKeys.ACTIVE_RIDE],
    queryFn: () => (user ? TravelService.getActiveRideForUser(user.id) : null),
  });
};
