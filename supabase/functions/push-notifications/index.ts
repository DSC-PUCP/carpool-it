// @ts-nocheck

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';

type PushEventType = 'join_room' | 'leave_room' | 'chat_message' | 'next_stop';

type PushEvent = {
  type: PushEventType;
  room_id: string;
  actor_user_id: string;
  message_id?: string;
};

type FirebaseServiceAccount = {
  project_id: string;
  private_key: string;
  client_email: string;
  token_uri?: string;
};

type SendResult = {
  token: string;
  ok: boolean;
  deactivated: boolean;
  errorCode: string | null;
  httpStatus: number | null;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const firebaseCredentialsRaw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '';

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const WEBHOOK_SECRET_CACHE_MS = 5 * 60 * 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_LENGTH = 80;

let webhookSecretCache: { value: string; expiresAt: number } | null = null;
let firebaseAccessTokenCache: { value: string; expiresAt: number } | null =
  null;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const tokenSuffix = (token: string) => token.slice(-6);

const timingSafeEqual = (a: string, b: string) => {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return diff === 0;
};

const getWebhookSecret = async () => {
  const now = Date.now();
  if (webhookSecretCache && webhookSecretCache.expiresAt > now) {
    return webhookSecretCache.value;
  }

  const { data, error } = await supabaseAdmin.rpc('get_push_webhook_secret');

  if (error) {
    throw new Error(`No se pudo leer push_webhook_secret: ${error.message}`);
  }

  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('push_webhook_secret no configurado en Vault');
  }

  webhookSecretCache = { value: data, expiresAt: now + WEBHOOK_SECRET_CACHE_MS };

  return data;
};

const getFirebaseCredentials = () => {
  if (!firebaseCredentialsRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT no configurado');
  }

  return JSON.parse(firebaseCredentialsRaw) as FirebaseServiceAccount;
};

const normalizePrivateKey = (key: string) => key.replace(/\\n/g, '\n');

const getFirebaseAccessToken = async () => {
  const now = Date.now();
  if (firebaseAccessTokenCache && firebaseAccessTokenCache.expiresAt > now) {
    return firebaseAccessTokenCache.value;
  }

  const credentials = getFirebaseCredentials();
  const issuedAt = Math.floor(now / 1000);
  const tokenUri = credentials.token_uri ?? 'https://oauth2.googleapis.com/token';

  const privateKey = await importPKCS8(
    normalizePrivateKey(credentials.private_key),
    'RS256'
  );

  const assertion = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(credentials.client_email)
    .setAudience(tokenUri)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + 3600)
    .sign(privateKey);

  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `No se pudo obtener el access token de Firebase: ${errorText}`
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in?: number;
  };

  const ttlSeconds = Math.max((payload.expires_in ?? 3600) - 60, 60);
  firebaseAccessTokenCache = {
    value: payload.access_token,
    expiresAt: now + ttlSeconds * 1000,
  };

  return payload.access_token;
};

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value);

const validateEvent = (body: unknown): PushEvent | null => {
  if (!body || typeof body !== 'object') return null;

  const candidate = body as Record<string, unknown>;
  const type = candidate.type;

  if (
    type !== 'join_room' &&
    type !== 'leave_room' &&
    type !== 'chat_message' &&
    type !== 'next_stop'
  ) {
    return null;
  }

  if (!isUuid(candidate.room_id) || !isUuid(candidate.actor_user_id)) {
    return null;
  }

  if (type === 'chat_message' && !isUuid(candidate.message_id)) {
    return null;
  }

  return {
    type,
    room_id: candidate.room_id,
    actor_user_id: candidate.actor_user_id,
    message_id: isUuid(candidate.message_id)
      ? candidate.message_id
      : undefined,
  };
};

const getActorTag = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('profile')
    .select('tag')
    .eq('id', userId)
    .maybeSingle();

  if (error) return null;

  return data?.tag ?? null;
};

const getRecipients = async (roomId: string, actorUserId: string) => {
  const { data: room, error: roomError } = await supabaseAdmin
    .from('travel_room')
    .select('owner_id')
    .eq('id', roomId)
    .maybeSingle();

  if (roomError) {
    throw new Error(`No se pudo leer la sala: ${roomError.message}`);
  }

  const { data: stops, error: stopsError } = await supabaseAdmin
    .from('travel_room_stop')
    .select('user_id')
    .eq('room_id', roomId);

  if (stopsError) {
    throw new Error(
      `No se pudieron leer los participantes: ${stopsError.message}`
    );
  }

  const recipients = new Set<string>();

  if (room?.owner_id) recipients.add(room.owner_id);
  for (const stop of stops ?? []) recipients.add(stop.user_id);

  recipients.delete(actorUserId);

  return [...recipients];
};

const getActiveTokens = async (userIds: string[]) => {
  if (userIds.length === 0) return [] as string[];

  const { data, error } = await supabaseAdmin
    .from('push_device_token')
    .select('token')
    .in('user_id', userIds)
    .eq('active', true);

  if (error) {
    throw new Error(`No se pudieron leer los tokens: ${error.message}`);
  }

  return [...new Set((data ?? []).map((row) => row.token))];
};

const truncate = (value: string) =>
  value.length > MAX_BODY_LENGTH
    ? value.slice(0, MAX_BODY_LENGTH)
    : value;

const getChatBody = async (event: PushEvent) => {
  const { data, error } = await supabaseAdmin
    .from('travel_room_message')
    .select('content, image_url')
    .eq('id', event.message_id)
    .maybeSingle();

  if (error || !data) {
    return 'Tienes un mensaje nuevo en el chat del viaje';
  }

  const content = typeof data.content === 'string' ? data.content : '';

  if (content.includes('[loc:')) {
    return '📍 Ubicación';
  }

  if (data.image_url && content.trim() === 'Imagen') {
    return '📷 Imagen';
  }

  const trimmed = content.trim();

  return trimmed
    ? truncate(trimmed)
    : 'Tienes un mensaje nuevo en el chat del viaje';
};

const buildNotification = async (event: PushEvent) => {
  const tag = (await getActorTag(event.actor_user_id)) ?? 'Alguien';

  switch (event.type) {
    case 'join_room':
      return {
        title: 'Nuevo integrante en el viaje',
        body: `${tag} se unió al viaje`,
      };
    case 'leave_room':
      return {
        title: 'Actualización del viaje',
        body: `${tag} salió del viaje`,
      };
    case 'next_stop':
      return {
        title: 'Actualización del viaje',
        body: 'El viaje avanzó a la siguiente parada',
      };
    case 'chat_message':
      return {
        title: `Mensaje de ${tag}`,
        body: await getChatBody(event),
      };
    default:
      return { title: 'Carpool It', body: 'Tienes una nueva notificación' };
  }
};

const classifyFailure = (payload: unknown, httpStatus: number) => {
  const error = (payload as { error?: Record<string, unknown> } | null)?.error;
  const details = Array.isArray(error?.details)
    ? (error?.details as Array<Record<string, unknown>>)
    : [];
  const errorCode =
    details.find((detail) => typeof detail?.errorCode === 'string')
      ?.errorCode ?? null;
  const message =
    typeof error?.message === 'string' ? (error.message as string) : '';
  const status = typeof error?.status === 'string' ? error.status : null;

  const unregistered = httpStatus === 404 || errorCode === 'UNREGISTERED';
  const invalidToken =
    errorCode === 'INVALID_ARGUMENT' &&
    /registration token/i.test(message);

  return {
    errorCode: typeof errorCode === 'string' ? errorCode : status,
    deactivated: unregistered || invalidToken,
  };
};

const sendToTokens = async (
  tokens: string[],
  data: Record<string, string>
): Promise<SendResult[]> => {
  const accessToken = await getFirebaseAccessToken();
  const credentials = getFirebaseCredentials();
  const endpoint = `https://fcm.googleapis.com/v1/projects/${credentials.project_id}/messages:send`;

  const results = await Promise.all(
    tokens.map(async (token): Promise<SendResult> => {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token,
              data,
              webpush: {
                headers: {
                  Urgency: 'high',
                  TTL: '3600',
                },
              },
            },
          }),
        });

        if (response.ok) {
          return {
            token,
            ok: true,
            deactivated: false,
            errorCode: null,
            httpStatus: response.status,
          };
        }

        const payload = await response.json().catch(() => null);
        const failure = classifyFailure(payload, response.status);

        return {
          token,
          ok: false,
          deactivated: failure.deactivated,
          errorCode: failure.errorCode,
          httpStatus: response.status,
        };
      } catch (error) {
        return {
          token,
          ok: false,
          deactivated: false,
          errorCode:
            error instanceof Error && error.name
              ? `NETWORK_${error.name}`
              : 'NETWORK_ERROR',
          httpStatus: null,
        };
      }
    })
  );

  for (const result of results) {
    if (result.ok || result.deactivated) continue;

    if (result.errorCode === 'SENDER_ID_MISMATCH') {
      console.error(
        JSON.stringify({
          level: 'error',
          errorCode: result.errorCode,
          message:
            'Configuración de Firebase inválida: el sender id del service worker no coincide con el proyecto FCM.',
          token: tokenSuffix(result.token),
        })
      );
      continue;
    }

    console.error(
      JSON.stringify({
        level: 'error',
        errorCode: result.errorCode,
        httpStatus: result.httpStatus,
        token: tokenSuffix(result.token),
      })
    );
  }

  return results;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let expectedSecret: string;

  try {
    expectedSecret = await getWebhookSecret();
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        errorCode: 'WEBHOOK_SECRET_UNAVAILABLE',
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    );
    return jsonResponse({ error: 'Servicio no configurado' }, 500);
  }

  const providedSecret = req.headers.get('x-webhook-secret') ?? '';

  if (
    providedSecret.length === 0 ||
    !timingSafeEqual(providedSecret, expectedSecret)
  ) {
    return jsonResponse({ error: 'No autorizado' }, 401);
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400);
  }

  const event = validateEvent(body);

  if (!event) {
    return jsonResponse({ error: 'Evento inválido' }, 400);
  }

  try {
    const [recipients, notification] = await Promise.all([
      getRecipients(event.room_id, event.actor_user_id),
      buildNotification(event),
    ]);

    const tokens = await getActiveTokens(recipients);
    const data: Record<string, string> = {
      type: event.type,
      room_id: event.room_id,
      actor_id: event.actor_user_id,
      title: notification.title,
      body: notification.body,
      url: `/travel/${event.room_id}`,
      tag: `${event.type}:${event.room_id}`,
    };

    const results = await sendToTokens(tokens, data);
    const deactivatedTokens = results
      .filter((result) => result.deactivated)
      .map((result) => result.token);
    const sent = results.filter((result) => result.ok).length;
    const failed = results.length - sent;

    if (deactivatedTokens.length > 0) {
      const { error } = await supabaseAdmin
        .from('push_device_token')
        .update({ active: false })
        .in('token', deactivatedTokens);

      if (error) {
        console.error(
          JSON.stringify({
            level: 'error',
            errorCode: 'TOKEN_DEACTIVATION_FAILED',
            message: error.message,
          })
        );
      }
    }

    const summary = {
      type: event.type,
      room_id: event.room_id,
      recipients: recipients.length,
      tokens: tokens.length,
      sent,
      failed,
      deactivated: deactivatedTokens.length,
    };

    console.log(JSON.stringify(summary));

    return jsonResponse({ ok: true, ...summary }, 200);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        errorCode: 'UNHANDLED',
        type: event.type,
        room_id: event.room_id,
        message: error instanceof Error ? error.message : 'Error desconocido',
      })
    );

    return jsonResponse({ error: 'Error interno' }, 500);
  }
});
