import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import { TravelService } from '@/modules/travel/services';

export const useTravelDetail = () => {
  const { id } = useParams({ from: '/_layout/_public/travel/$id' });
  return useSuspenseQuery({
    queryKey: [QueryKeys.TRAVEL_DETAIL, id],
    queryFn: ({ queryKey }) => TravelService.getRoomDetails(queryKey[1]),
  });
};
