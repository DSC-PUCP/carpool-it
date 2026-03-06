import { Link } from '@tanstack/react-router';
import { Cat, Home } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '../ui/empty';

export default function NotFound() {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyTitle>Página no encontrada.</EmptyTitle>
        <EmptyDescription>
          La página que buscas no existe o ha sido movida :(
          <br /> ¿Qué tal si ves unos gatitos tiernos para animarte?
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <a href="https://youtu.be/y0sF5xhGreA?si=uvUkIwni7qEMGT9I">
            <Cat />
            Ver gatitos tiernos
          </a>
        </Button>
        <Button asChild variant="link">
          <Link to="/home" search={{ onlyOffers: undefined }}>
            <Home /> Volver al inicio
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
