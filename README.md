# carpool-it

Aplicacion web de carpooling construida con TanStack Start (SSR), Cloudflare Workers y Supabase.

## Inicio rapido

Prerequisitos:

- Bun (https://bun.sh)
- Docker Desktop (o Docker Engine) corriendo

1. Instala dependencias:

```bash
bun install
```

2. Inicia Supabase local:

```bash
bun sb start
```

3. Crea tu archivo de entorno local:

```bash
cp .env.example .env
```

4. Completa valores segun la guia de seguridad y ejecuta en local:

```bash
bun run dev
```

## Documentacion para contributors

- Flujo de colaboracion: ver `CONTRIBUTING.md`.
- Politica de secretos y respuesta a incidentes: ver `SECURITY.md`.
- Convenciones tecnicas del repositorio: ver `AGENTS.md`.
- Arquitectura del sistema: ver `docs/architecture.md`.
- Estructura de carpetas: ver `docs/folder-structure.md`.
- Modelo de datos en Supabase: ver `docs/data-model.md`.
- Supabase local + OAuth Google: ver `docs/supabase-local.md`.

## Scripts principales

```bash
bun run dev
bun run build
bun run preview
bun run check
bun run lint
bun run format
bun run test
bun run deploy
```

## Stack

- Frontend/SSR: TanStack Start + React 19
- Runtime/Deploy: Cloudflare Workers
- Base de datos/Auth/Storage: Supabase
- Estilos: Tailwind CSS v4
- Calidad: TypeScript strict + Biome + Vitest

## Licencia

Este proyecto esta licenciado bajo GNU GPL v3 o posterior. Revisa `LICENSE` para el texto completo.
