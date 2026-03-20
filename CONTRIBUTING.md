# Contributing

Gracias por aportar a carpool-it.

## Requisitos

- Bun (https://bun.sh)
- Docker Desktop (o Docker Engine)
- Cuenta de Supabase (proyecto compartido o propio de desarrollo)
- Cuenta de Cloudflare (solo para maintainers que despliegan)

## Setup local

1. Instala dependencias:

```bash
bun install
```

2. Levanta Supabase local:

```bash
bun sb start
```

3. Crea variables locales:

```bash
cp .env.example .env
```

4. Completa `.env` con valores de desarrollo (ver `docs/supabase-local.md`).

5. Levanta el proyecto:

```bash
bun run dev
```

## Comandos utiles

```bash
bun run check
bun run test
bun run build
```

## Documentacion tecnica

- Arquitectura: `docs/architecture.md`
- Estructura de carpetas: `docs/folder-structure.md`
- Modelo de datos: `docs/data-model.md`
- Supabase local y OAuth Google: `docs/supabase-local.md`

## Flujo recomendado de colaboracion

1. Crea una rama desde `main`.
2. Implementa cambios pequenos y enfocados.
3. Ejecuta `bun run check` y `bun run test` antes de abrir PR.
4. Abre Pull Request con descripcion clara de alcance y pruebas.

## Regla de secretos

- Nunca commitees secretos ni archivos con credenciales.
- `.env` esta ignorado por git y debe permanecer local.
- Usa `wrangler secret put` para secretos de Cloudflare en entornos desplegados.
- Si sospechas una filtracion, sigue el procedimiento de `SECURITY.md`.
