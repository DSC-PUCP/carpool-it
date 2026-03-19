import { env as workersEnv } from 'cloudflare:workers';
import { createFileRoute } from '@tanstack/react-router';
import { getCookies } from '@tanstack/react-start/server';
import { env } from '@/env';

type CheckResult = { ok: boolean; detail?: string };

const getServerAnonKey = () =>
  workersEnv.SUPABASE_ANON || env.SUPABASE_ANON || '';

async function checkSupabaseReachability(
  supabaseUrl: string,
  anonKey: string
): Promise<CheckResult> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok || res.status === 400 /* expected when no table queried */) {
      return { ok: true };
    }
    return { ok: false, detail: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, detail: String(err) };
  }
}

export const Route = createFileRoute('/healthcheck')({
  server: {
    handlers: {
      GET: async () => {
        const supabaseUrl = env.VITE_SUPABASE_URL;
        const anonKey = getServerAnonKey();

        const checks: Record<string, CheckResult> = {
          supabase_reachability:
            supabaseUrl && anonKey
              ? await checkSupabaseReachability(supabaseUrl, anonKey)
              : {
                  ok: false,
                  detail:
                    'SUPABASE_ANON ausente. Configuralo con "wrangler secret put SUPABASE_ANON" para entornos deployados o en .env para desarrollo local.',
                },
        };

        const allOk = Object.values(checks).every((c) => c.ok);

        // Read cookies — expose names only, mask values to avoid leaking session tokens
        const cookies = getCookies();
        const cookiesSummary = Object.fromEntries(
          Object.entries(cookies).map(([k, v]) => [
            k,
            v ? `***${v.slice(-4)}` : '(empty)',
          ])
        );

        const body = JSON.stringify(
          {
            status: allOk ? 'ok' : 'degraded',
            checks: Object.fromEntries(
              Object.entries(checks).map(([k, v]) => [
                k,
                v.detail ? { ok: v.ok, detail: v.detail } : { ok: v.ok },
              ])
            ),
            cookies: cookiesSummary,
          },
          null,
          2
        );

        return new Response(body, {
          status: allOk ? 200 : 503,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
