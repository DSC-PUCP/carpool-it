import { createFileRoute, notFound } from '@tanstack/react-router';
import Vehicle from '@/modules/profile/pages/vehicle/Vehicle';

export const Route = createFileRoute('/_layout/_auth/profile/vehicle')({
  loader: ({ context }) => {
    const { vehicleData } = context;
    if (!vehicleData) throw notFound();
    return vehicleData;
  },
  component: Vehicle,
});
