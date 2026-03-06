import { env as workersEnv } from 'cloudflare:workers';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookies, setCookie } from '@tanstack/react-start/server';
import { env } from '@/env';
import type { Database } from '@/repository/database.types';

const getSupabaseServerClient = () => {
  const ANON_KEY = workersEnv.SUPABASE_ANON || env.SUPABASE_ANON || '';
  return createServerClient<Database>(env.VITE_SUPABASE_URL, ANON_KEY, {
    cookies: {
      get: (name) => getCookies()[name],
      set: (name, value, options) => setCookie(name, value, options),
      remove: (name, options) => setCookie(name, '', options),
    },
  });
};

const getSupabaseBrowserClient = () =>
  createBrowserClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_KEY);

const getSupabaseClient = createIsomorphicFn()
  .server(() => getSupabaseServerClient())
  .client(() => getSupabaseBrowserClient());

export default getSupabaseClient;
