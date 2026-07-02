import { createFileRoute } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import Recurrents from '@/modules/profile/pages/recurrents/Recurrents';
import { ProfileService } from '@/modules/profile/services';

export const Route = createFileRoute('/_layout/_auth/profile/recurrents')({
  component: Recurrents,
  loader: async ({ context: { queryClient, user } }) => {
    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.RECURRENTS, user.id],
      queryFn: () => ProfileService.getRecurringTrips(user.id),
    });
  },
});
