import { useInfiniteQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/const/query-keys';
import type { RideListFilters } from '@/core/interfaces/travel-repository';
import { useFilters } from '@/hooks/use-filters';
import { TravelService } from '../services';

export const useListRooms = (defaultFilters: Partial<RideListFilters>) => {
  const { filters } = useFilters('/_layout/_auth/home');

  const resolvedFilters =
    Object.keys(filters).length > 0 ? filters : defaultFilters;

  const limit = resolvedFilters.limit ?? 5;

  return useInfiniteQuery({
    queryKey: [QueryKeys.TRAVEL, resolvedFilters],
    queryFn: ({ pageParam = 0 }) =>
      TravelService.listRooms({ ...resolvedFilters, limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.metadata.next,
    staleTime: 1000 * 10,
  });
};
