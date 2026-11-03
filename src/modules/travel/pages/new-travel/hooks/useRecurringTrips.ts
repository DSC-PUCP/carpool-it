import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useRecurringTrips = (userId: string | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.RECURRENTS, userId],
    queryFn: () => ProfileService.getRecurringTrips(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
