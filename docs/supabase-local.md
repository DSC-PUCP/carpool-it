# Supabase local y Google OAuth

Esta guia describe como levantar Supabase local para desarrollo y como configurar OAuth de Google.

## Prerequisitos

- Bun (https://bun.sh)
- Docker Desktop (o Docker Engine) corriendo

Referencia oficial de Supabase para desarrollo local:
- https://supabase.com/docs/guides/local-development/overview

## Levantar Supabase local

Desde la raiz del repo:

```bash
bun sb start
```

Comandos utiles:

```bash
bun sb status
bun sb stop
bun sb db reset
```

## Variables locales para la app

1. Copia el archivo de entorno:

```bash
cp .env.example .env
```

2. Configura variables para Supabase local:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_KEY=<anon_key_de_bun_sb_status>
SUPABASE_ANON=<anon_key_de_bun_sb_status>
VITE_SERVER_URL=http://localhost:5173
```

Nota: `VITE_SUPABASE_KEY` es visible en cliente. Usa solo la anon key local o publishable key publica.

## Configurar Google OAuth en Supabase local

La configuracion del provider esta en `supabase/config.toml`, seccion `[auth.external.google]`.

Valores relevantes:

- `enabled = true`
- `client_id = "env(GOOGLE_CLIENT_ID)"`
- `secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"`
- `skip_nonce_check = true` para facilitar login local

### Paso a paso

1. Crea un OAuth Client en Google Cloud (tipo Web application).
2. En Authorized redirect URIs agrega:

```text
http://127.0.0.1:54321/auth/v1/callback
```

3. Exporta variables antes de iniciar Supabase:

PowerShell:

```powershell
$env:GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
$env:SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="tu-google-client-secret"
```

4. Reinicia Supabase local para aplicar cambios:

```bash
bun sb stop
bun sb start
```

## Troubleshooting rapido

- Si `bun sb start` falla, verifica que Docker este corriendo.
- Si OAuth redirige mal, valida `site_url` y `additional_redirect_urls` en `supabase/config.toml`.
- Si falla login de Google, revisa que el redirect URI en Google Cloud coincida exactamente.
