import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFilters } from '@/hooks/use-filters';

export default function SegmentedControl() {
  const { filters, setFilters } = useFilters('/_layout/_auth/home');

  const getDefaultDirection = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'to_campus' : 'from_campus';
  };

  const currentDirection = filters.direction ?? getDefaultDirection();

  return (
    <Tabs
      value={currentDirection}
      onValueChange={(val) =>
        setFilters({ direction: val as 'to_campus' | 'from_campus' })
      }
    >
      <TabsList className="w-full h-12">
        <TabsTrigger value="to_campus" className="flex-1">
          <span className="text-sm font-semibold">Ir al campus</span>
        </TabsTrigger>
        <TabsTrigger value="from_campus" className="flex-1">
          <span className="text-sm font-semibold">Salir del campus</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
