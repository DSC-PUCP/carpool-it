import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import NewTravel from '@/modules/travel/pages/new-travel/NewTravel';

export const Route = createFileRoute('/_layout/_auth/travel/new')({
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
