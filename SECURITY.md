# Security

Este documento define como manejar secretos y configuraciones sensibles en carpool-it.

## Clasificacion de variables

- Variables `VITE_*`: visibles en cliente (no guardar secretos reales aqui).
- `SUPABASE_ANON`: clave anonima usada en server para operaciones SSR y health checks.
- `SERVER_URL`: variable server opcional para configuraciones internas.

## Donde configurar cada variable

## Local (desarrollo)

1. Copia `.env.example` a `.env`.
2. Completa valores de Supabase para desarrollo.
3. No compartas `.env` por canales inseguros.

## Cloudflare Workers (deploy)

- Variables no sensibles en `wrangler.json` dentro de `env.<nombre>.vars`.
- Secretos con CLI:

```bash
wrangler secret put SUPABASE_ANON
```

## Politicas

- No subir secretos al repositorio.
- No imprimir tokens ni sesiones en logs.
- Usar minimo privilegio y RLS en Supabase para datos de usuario.

## Respuesta a incidentes

Si una clave fue expuesta:

1. Revocarla o regenerarla inmediatamente en Supabase/Cloudflare.
2. Actualizar secretos en Cloudflare y variables locales.
3. Revisar historial de git para eliminar rastros si fue commiteada.
4. Notificar al equipo y registrar postmortem.

## Checklist rapido antes de PR

- `bun run check` ejecutado
- `bun run test` ejecutado
- Sin secretos ni credenciales en cambios
