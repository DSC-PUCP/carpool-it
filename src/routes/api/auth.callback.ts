import { createFileRoute, redirect } from '@tanstack/react-router';
import getSupabaseClient from '@/lib/supabase';

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request: { url } }) => {
        const { searchParams } = new URL(url);

        const code = searchParams.get('code');
        let next = searchParams.get('next') ?? '/';

        if (!next.startsWith('/')) {
          next = '/';
        }

        if (code) {
          const { error } =
            await getSupabaseClient().auth.exchangeCodeForSession(code);

          if (!error) {
            throw redirect({ to: next });
          }
        }

        throw redirect({ to: '/sign-in' });
      },
    },
  },
});
