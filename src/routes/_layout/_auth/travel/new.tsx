import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import NewTravel from '@/modules/travel/pages/new-travel/NewTravel';
import { getDefaultDate } from '@/modules/travel/pages/new-travel/utils';

export const Route = createFileRoute('/_layout/_auth/travel/new')({
  loader: () => {
    const datetime = getDefaultDate();
    const direction = datetime.getHours() < 12 ? 'to_campus' : 'from_campus';
    return {
      datetime,
      direction,
    };
  },

  component: RouteComponent,
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
