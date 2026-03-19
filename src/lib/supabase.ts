import { env as workersEnv } from 'cloudflare:workers';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookies, setCookie } from '@tanstack/react-start/server';
import { env } from '@/env';
import type { Database } from '@/repository/database.types';

const getServerAnonKey = () => {
  // Prefer Cloudflare runtime bindings. Local env fallback is only for development.
  const anonKey = workersEnv.SUPABASE_ANON || env.SUPABASE_ANON || '';
  if (!anonKey) {
    throw new Error(
      'SUPABASE_ANON no configurado. Define la variable en Cloudflare con "wrangler secret put SUPABASE_ANON" o en .env para desarrollo local.'
    );
  }

  return anonKey;
};

const getSupabaseServerClient = () => {
  return createServerClient<Database>(
    env.VITE_SUPABASE_URL,
    getServerAnonKey(),
    {
      cookies: {
        get: (name) => getCookies()[name],
        set: (name, value, options) => setCookie(name, value, options),
        remove: (name, options) => setCookie(name, '', options),
      },
    }
  );
};

const getSupabaseBrowserClient = () =>
  createBrowserClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_KEY);

const getSupabaseClient = createIsomorphicFn()
  .server(() => getSupabaseServerClient())
  .client(() => getSupabaseBrowserClient());

export default getSupabaseClient;
