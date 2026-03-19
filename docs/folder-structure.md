# Estructura de carpetas

## Vista general

- `src/routes`: rutas file-based de TanStack Router.
- `src/modules`: funcionalidades por dominio (auth, profile, travel).
- `src/repository`: acceso a datos (Supabase) y mapeo a modelos.
- `src/core`: modelos de dominio e interfaces.
- `src/components`: componentes UI compartidos y layout.
- `src/lib`: utilidades transversales e infraestructura.
- `src/hooks`: hooks reutilizables.
- `src/integrations`: providers e integraciones (ej. query client).
- `src/assets`: fuentes, imagenes y estilos globales/modulares.

## Donde agregar cada cambio

- Nueva pantalla o endpoint: `src/routes`.
- Logica de negocio de feature: `src/modules/<feature>`.
- Consulta o mutacion a Supabase: `src/repository/<feature>`.
- Cambio en contratos/modelos: `src/core/models` o `src/core/interfaces`.
- Componente visual reutilizable: `src/components`.
- Helpers tecnicos compartidos: `src/lib`.

## Regla practica

Primero modela en `src/core`, luego implementa acceso en `src/repository`, despues orquesta en `src/modules`, y por ultimo conecta en `src/routes`/UI.
