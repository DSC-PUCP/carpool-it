import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/const/query-keys';
import type { RideDirection } from '@/core/models';
import { TravelService } from '../services';

export const useListVisibleRecurrents = (direction?: RideDirection) => {
  return useQuery({
    queryKey: [QueryKeys.TRAVEL, 'recurrents', direction],
    queryFn: () => TravelService.listVisibleRecurrents(direction),
    staleTime: 1000 * 60 * 5,
  });
};
