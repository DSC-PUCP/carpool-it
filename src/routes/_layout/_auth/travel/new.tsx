import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import { QueryKeys } from '@/const/query-keys';
import { getDirectionByHour, getNowInLima } from '@/lib/utils';
import { ProfileService } from '@/modules/profile/services';
import NewTravel from '@/modules/travel/pages/new-travel/NewTravel';
import { getDefaultDate } from '@/modules/travel/pages/new-travel/utils';

export const Route = createFileRoute('/_layout/_auth/travel/new')({
  component: RouteComponent,
  loader: async ({ context: { queryClient, user } }) => {
    await queryClient.query({
      queryKey: [QueryKeys.RECURRENTS, user.id],
      queryFn: () => ProfileService.getRecurringTrips(user.id),
    });

    const nowInLima = getNowInLima();
    return {
      defaultDate: getDefaultDate(nowInLima),
      defaultDirection: getDirectionByHour(nowInLima.getHours()),
    };
  },
});

export default Route;

function RouteComponent() {
  return (
    <>
      <TopStack>
        <TopStackAction>
          <Link to="/home">
            <ArrowLeft />
          </Link>
        </TopStackAction>
        <TopStackTitle>Nuevo viaje</TopStackTitle>
      </TopStack>{' '}
      <NewTravel />
    </>
  );
}
