import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthService } from '@/modules/auth/services';

export const Route = createFileRoute('/_layout/_auth')({
  beforeLoad: async ({ context: { user } }) => {
    if (!user) throw redirect({ to: '/sign-in' });
    await AuthService.authenticatedGuard(user.email);
    return {
      user,
    };
  },
  component: Outlet,
});
