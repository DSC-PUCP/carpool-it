import { createFileRoute, redirect } from '@tanstack/react-router';
import Auth from '@/modules/auth/Auth';

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async ({ context: { user } }) => {
    if (user?.email)
      throw redirect({
        to: '/home',
      });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Auth />;
}
