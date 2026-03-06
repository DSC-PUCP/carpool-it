import { HeartCrack } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';

export default function ErrorComponent() {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HeartCrack />
        </EmptyMedia>
        <EmptyTitle>No eres tú, soy yo.</EmptyTitle>
        <EmptyDescription>
          Algo está mal en mí, espero que puedas perdonarme.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
