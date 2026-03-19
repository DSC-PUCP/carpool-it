# Arquitectura del sistema

## Resumen

carpool-it usa un stack SSR con TanStack Start sobre Cloudflare Workers y Supabase como backend de datos, auth y storage.

## Capas

1. UI y rutas
- React 19 + TanStack Router (file-based routing en `src/routes`).
- Layouts y vistas en `src/components` y `src/modules`.

2. Aplicacion y dominio
- Logica de negocio en `src/modules/<feature>/services.ts`.
- Modelos e interfaces en `src/core`.

3. Acceso a datos
- Repositorios en `src/repository`.
- Cliente Supabase unificado en `src/lib/supabase.ts`.

4. Infraestructura
- Runtime SSR: Cloudflare Workers.
- Configuracion: `wrangler.json` + variables de entorno.

## Flujo de peticion

1. El usuario entra por una ruta de TanStack Router.
2. Si la ruta requiere datos SSR, ejecuta loaders/services.
3. Services llaman repositorios, y repositorios usan Supabase.
4. La respuesta renderiza HTML SSR y luego hidrata en cliente.

## Seguridad de configuracion

- Variables `VITE_*` son visibles en cliente.
- `SUPABASE_ANON` se considera server-side para SSR/healthcheck y debe ir en secretos de Cloudflare en entornos deployados.
- Ver `SECURITY.md` para politica completa.

## Integraciones clave

- Auth: Supabase OAuth en `src/modules/auth` y callback en `src/routes/api/auth.callback.ts`.
- Query caching: TanStack Query en `src/integrations/tanstack-query`.
- Healthcheck: endpoint en `src/routes/healthcheck.ts`.

## Deploy

1. Build con Vite (`bun run build`).
2. Deploy a Workers (`bun run deploy`).
3. Secretos gestionados por `wrangler secret put`.
