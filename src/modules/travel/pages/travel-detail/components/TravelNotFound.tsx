import { Link } from '@tanstack/react-router';
import { Home, MapPinXInside } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default function TravelNotFound() {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPinXInside />
        </EmptyMedia>
        <EmptyTitle>Viaje no encontrado</EmptyTitle>
        <EmptyDescription>
          El viaje que estás buscando ha finalizado o ha sido cancelado.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="link">
          <Link to="/home">
            <Home /> Volver al inicio
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
