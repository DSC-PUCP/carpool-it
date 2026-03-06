import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const usePayments = () => {
  const { user } = useRouteContext({
    from: '/_layout/_auth/profile/payments',
  });

  return useQuery({
    queryKey: [QueryKeys.PAYMENTS],
    queryFn: () => ProfileService.getPayments(user.id),
  });
};
