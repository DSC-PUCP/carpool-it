# Modelo de datos (Supabase)

Este documento resume el esquema actual de negocio en Supabase para contexto de desarrollo.

## Tablas principales

## `profile`
- PK: `id` (uuid, referencia a `auth.users.id`).
- Campos clave: `tag`, `is_driver`, `contribution`, `rides`, `rating`, `votes`, `avatar`, `location_id`, `last_travel`.
- Relacion: puede tener una ubicacion activa (`location_id -> location.id`).

## `driver`
- PK/FK: `id` (uuid, referencia a `profile.id`).
- Campos clave: `plate`, `color`, `seats`, `rides`, `rating`, `votes`, `price`, `qr_url`, `wallet_address`.
- Extension del perfil cuando un usuario actua como conductor.

## `location`
- PK: `id` (uuid).
- FK: `user_id -> profile.id`.
- Campos clave: `name`, `type` (enum `location_type`), `coords` (tipo geoposicional), `created_at`.
- Guarda ubicaciones del usuario.

## `travel_room`
- PK: `id` (uuid).
- FK: `owner_id -> profile.id`.
- Campos clave: `direction`, `datetime`, `recurrence_rule`, `active`, `current_stop`, `allow`, `created_at`, `updated_at`.
- Representa una sala/viaje.

## `travel_room_stop`
- PK compuesta: (`room_id`, `user_id`).
- FK: `room_id -> travel_room.id`, `user_id -> profile.id`.
- Campos clave: `user_role`, `stop_coords`, `seats`, `price`, `confirmed`, `created_at`.
- Representa la participacion y parada de cada usuario en una sala.

## Relaciones clave

- `profile` 1:1 `driver`.
- `profile` 1:N `location`.
- `profile` 1:N `travel_room` (como owner).
- `travel_room` 1:N `travel_room_stop`.
- `profile` 1:N `travel_room_stop`.

## Consideraciones para desarrollo

- Hay tipos definidos en Postgres (enums y tipos geograficos) usados por columnas como `direction`, `user_role`, `location.type`, `coords`.
- La app consume tipos TS generados en `src/repository/database.types.ts`.
- Si cambia el esquema, regenrar tipos antes de mergear para evitar drift entre DB y TypeScript.

## SQL de referencia

El esquema base de contexto compartido por el equipo incluye las tablas:
- `driver`
- `location`
- `profile`
- `travel_room`
- `travel_room_stop`
