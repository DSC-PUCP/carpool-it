# AGENTS

This file guides agentic coding assistants working in this repository.
Follow existing conventions and keep changes consistent with the current codebase.

## Project Snapshot
- Runtime: Vite + React 19 + TanStack React Start (SSR).
- Routing: TanStack Router file-based routes in `src/routes`.
- Styling: Tailwind CSS v4 + CSS variables in `src/styles.css`.
- UI: Radix UI primitives with shadcn-style components in `src/components/ui`.
- Data: Supabase (typed with `src/repository/database.types.ts`).
- Tooling: TypeScript strict, Biome lint/format, Vitest tests, Storybook.

## Commands
### Install
- `bun install`

### Dev Server
- `bun run dev`

### Build / Preview
- `bun run build`
- `bun run preview`

### Lint / Format
- `bun run lint` (Biome lint)
- `bun run format` (Biome format)
- `bun run check` (Biome lint+format with fixes)

### Tests (Vitest)
- `bun run test` (runs `vitest run`)
- Single file: `bun run test -- src/path/to/foo.test.tsx`
- Single test: `bun run test -- -t "search text"`
- Tip: No `vitest.config` found; add `// @vitest-environment jsdom` per file if DOM APIs are needed.

### Storybook
- `bun run storybook`
- `bun run build-storybook`

### Cloudflare / Deploy
- `bun run cf-typegen` (wrangler types)
- `bun run deploy` (vite build + wrangler deploy)

### Alternative Runners
- Scripts are in `package.json`; `npm run <script>` or `pnpm run <script>` should also work.

## Repo Structure
- `src/core`: domain models and interfaces.
- `src/repository`: data access (Supabase) returning `Result<T>`.
- `src/modules`: feature modules (travel, auth, profile).
- `src/components`: shared UI, layout, and typography.
- `src/routes`: TanStack Router file-based routes (SSR + loaders).
- `src/lib`: utilities and infrastructure (Supabase client, helpers).

## Code Style
### Formatting
- Use Biome; 2-space indentation, single quotes, trailing commas (ES5).
- Let Biome organize imports (enabled in `biome.json`).
- Biome ignores `src/routeTree.gen.ts` and `src/styles.css`; format those manually if you touch them.

### Imports
- Prefer path alias imports with `@/` (configured in `tsconfig.json`).
- Use `import type { ... }` for type-only imports.
- Keep import order: external packages, alias imports, then relative imports.

### Naming
- React components: PascalCase; hooks: `useX`; utilities: camelCase.
- Types and enums: PascalCase (e.g., `RideDirection`, `TravelRoom`).
- Files: components often PascalCase; hooks use `use-*.ts`; UI atoms are lowercase in `src/components/ui`.

### Types & Strictness
- TypeScript is `strict: true`; avoid `any`, prefer explicit types.
- Prefer `type` aliases for data shapes (common in `src/core`).
- Use `as const` for literal unions where appropriate.

### Error Handling
- Repository layer returns `Result<T>` (`src/lib/utils.ts`).
- Service layer unwraps `Result` and throws user-facing `Error`s (many messages are Spanish).
- Keep error messaging consistent with the existing Spanish copy.

### Routing Patterns
- Use `createFileRoute` from TanStack Router for new routes.
- Validate search params with Zod via `validateSearch`.
- Use `loader` + `loaderDeps` with TanStack Query (`ensureQueryData`) for SSR data.
- Route tree is generated; do not edit `src/routeTree.gen.ts` by hand.

### TanStack Query
- Provider lives in `src/integrations/tanstack-query`.
- Prefer stable array keys (e.g., `['travelRooms', deps]`).
- Use `queryClient.ensureQueryData` inside route loaders for SSR.

### Auth & Guards
- Auth logic lives in `src/modules/auth` and uses Supabase OAuth.
- Use `beforeLoad` in routes to fetch session/user data.
- Guarded routes can throw `redirect(...)` from `AuthService.authenticatedGuard`.

### API Routes
- API routes live under `src/routes/api` (e.g., auth callback, OG images).
- Keep API route modules small and framework-native (TanStack Router).

### Data / Supabase
- Access Supabase through `getSupabaseClient` in `src/lib/supabase.ts`.
- Use typed database models from `src/repository/database.types.ts` (treat as generated).
- Prefer repository methods (`travelRepository`) over direct Supabase calls in UI.

### UI Components
- `src/components/ui` uses `class-variance-authority` and `cn` helper for className composition.
- Preserve `data-slot` attributes; styles rely on them.
- Use `asChild` pattern (Radix Slot) where established (e.g., `Button`).
- Keep component props typed with `React.ComponentProps` or explicit types.

### Styling
- Tailwind v4 is the primary styling system.
- Global design tokens live in `src/styles.css` (CSS variables + `@theme`).
- For utility merges, use `cn(...)` from `src/lib/utils.ts`.
- CSS modules live in `src/assets/styles/*.module.css` when needed.

### Assets & Fonts
- Space Grotesk is the primary font (`src/styles.css` + `src/assets/styles/fonts.css`).
- Keep asset paths using `@/` aliases for consistency.

### Environment Variables
- Client vars must be prefixed with `VITE_` (enforced in `src/env.ts`).
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`.
- Optional: `VITE_APP_TITLE`, `SERVER_URL`.
- Vite config references `VITE_SERVER_URL` for sitemap host; set it when generating sitemap.
- Do not commit secrets from `.env`.

### Testing Conventions
- Use `*.test.tsx` / `*.test.ts` naming for Vitest.
- Use Testing Library for component tests.
- Add `// @vitest-environment jsdom` to tests that touch DOM APIs.

### Localization
- UI copy is Spanish in most places; keep user-facing text consistent.
- For future i18n, the repo already depends on `i18next` / `react-i18next`.

### Generated / External Files
- `src/routeTree.gen.ts` is generated by TanStack Router.
- `src/repository/database.types.ts` is generated from Supabase types.
- `src/styles.css` is hand-edited but ignored by Biome; keep changes intentional.

## Cursor / Copilot Rules
- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found in this repo.

## Notes for Agents
- Avoid introducing new tooling unless it matches existing stack decisions.
- Prefer adding new modules under `src/modules/<feature>` and reuse shared UI components.
- Keep Spanish UI copy consistent; avoid mixing English for user-facing strings.
- Do not edit `src/routeTree.gen.ts` directly; update routes and regenerate.
- Follow Biome rules before opening PRs (`bun run check`).
