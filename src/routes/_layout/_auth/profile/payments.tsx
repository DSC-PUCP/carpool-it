import { createFileRoute, notFound } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import PaymentsPage from '@/modules/profile/pages/payment/Payments';
import { ProfileService } from '@/modules/profile/services';

export const Route = createFileRoute('/_layout/_auth/profile/payments')({
  loader: async ({ context: { profileData, queryClient, user } }) => {
    if (!profileData?.isDriver) throw notFound();
  },
  component: PaymentsPage,
});
