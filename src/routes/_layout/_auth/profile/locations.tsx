import { createFileRoute } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import LocationsPage from '@/modules/profile/pages/location/Locations';
import { ProfileService } from '@/modules/profile/services';

export const Route = createFileRoute('/_layout/_auth/profile/locations')({
  loader: async ({ context: { queryClient, user } }) => {
    const data = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.LOCATIONS],
      queryFn: () => ProfileService.getLocations(user.id),
    });
    return data;
  },

  component: LocationsPage,
});
