import { createFileRoute, notFound } from '@tanstack/react-router';
import PaymentsPage from '@/modules/profile/pages/payment/Payments';

export const Route = createFileRoute('/_layout/_auth/profile/payments')({
  loader: async ({ context: { profileData } }) => {
    if (!profileData?.isDriver) throw notFound();
  },
  component: PaymentsPage,
});
