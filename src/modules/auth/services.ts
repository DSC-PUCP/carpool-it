import { redirect, useNavigate } from '@tanstack/react-router';
import { env } from '@/env';
import getSupabaseClient from '@/lib/supabase';
import type { FileRoutesByTo } from '@/routeTree.gen';

export namespace AuthService {
  export const login = async (next: keyof FileRoutesByTo | string = '/') => {
    const redirectTo = `${env.VITE_SERVER_URL}/api/auth/callback?next=${encodeURIComponent(
      next
    )}`;
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
  };

  export const getUser = async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();
    if (error) throw error;
    return {
      id: data.user.id as string,
      email: data.user.email as string,
      avatar: data.user.user_metadata.avatar_url as string,
      fullName: data.user.user_metadata.full_name as string,
    };
  };

  export const getSession = async () => {
    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    return session
      ? {
          id: session?.user.id as string,
          email: session?.user.email as string,
          avatar: session?.user.user_metadata.avatar_url as string,
          fullName: session?.user.user_metadata.full_name as string,
        }
      : null;
  };

  export const logout = async () => {
    await getSupabaseClient().auth.signOut();
  };

  export const authenticatedGuard = async (email: string | null) => {
    if (!email)
      throw redirect({
        to: '/sign-in',
      });
  };
}
