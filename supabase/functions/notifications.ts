// @ts-nocheck

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';

type NotificationRequest =
  | { type: 'join_room'; roomId: string; actorUserId: string }
  | { type: 'leave_room'; roomId: string; actorUserId: string }
  | {
      type: 'chat_message';
      roomId: string;
      actorUserId: string;
      message: string;
    }
  | {
      type: 'register_device';
      actorUserId: string;
      token: string;
      platform?: string;
    };

type FirebaseServiceAccount = {
  project_id: string;
  private_key: string;
  client_email: string;
  token_uri?: string;
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

const getFirebaseCredentials = () => {
  if (!firebaseCredentialsRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT no configurado');
  }

  return JSON.parse(firebaseCredentialsRaw) as FirebaseServiceAccount;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });

const normalizePrivateKey = (key: string) => key.replace(/\\n/g, '\n');

const getFirebaseAccessToken = async () => {
  const firebaseCredentials = getFirebaseCredentials();
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = firebaseCredentials.token_uri ?? 'https://oauth2.googleapis.com/token';

  const privateKey = await importPKCS8(
    normalizePrivateKey(firebaseCredentials.private_key),
    'RS256'
  );

  const assertion = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(firebaseCredentials.client_email)
    .setAudience(tokenUri)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo obtener access token de Firebase: ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

const getUserTag = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('profile')
    .select('tag')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data.tag;
};

const getActiveTokensForUsers = async (userIds: string[]) => {
  if (userIds.length === 0) return [] as string[];

  const { data, error } = await supabaseAdmin
    .from('push_device_token')
    .select('token')
    .in('user_id', userIds)
    .eq('active', true);

  if (error) {
    throw new Error(`No se pudieron obtener tokens: ${error.message}`);
  }

  return data.map((row) => row.token);
};

const sendPushToTokens = async (
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string>
) => {
  if (tokens.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const accessToken = await getFirebaseAccessToken();
  const firebaseCredentials = getFirebaseCredentials();
  const endpoint = `https://fcm.googleapis.com/v1/projects/${firebaseCredentials.project_id}/messages:send`;

  const results = await Promise.allSettled(
    tokens.map((token) =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title,
              body,
            },
            data,
          },
        }),
      })
    )
  );

  let sent = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.ok) {
      sent += 1;
      continue;
    }

    failed += 1;
  }

  return { sent, failed };
};

const handleJoinRoomNotification = async (
  payload: Extract<NotificationRequest, { type: 'join_room' }>
) => {
  const { roomId, actorUserId } = payload;

  const { data: members, error: membersError } = await supabaseAdmin
    .from('travel_room_stop')
    .select('user_id')
    .eq('room_id', roomId)
    .neq('user_id', actorUserId);

  if (membersError) {
    throw new Error(`No se pudieron obtener participantes: ${membersError.message}`);
  }

  const memberIds = [...new Set(members.map((member) => member.user_id))];
  const tokens = await getActiveTokensForUsers(memberIds);
  const actorTag = (await getUserTag(actorUserId)) ?? 'Alguien';

  return sendPushToTokens(
    tokens,
    'Nuevo integrante en el viaje',
    `${actorTag} se unio al viaje`,
    {
      type: 'join_room',
      room_id: roomId,
      actor_id: actorUserId,
    }
  );
};

const handleLeaveRoomNotification = async (
  payload: Extract<NotificationRequest, { type: 'leave_room' }>
) => {
  const { roomId, actorUserId } = payload;

  const { data: members, error: membersError } = await supabaseAdmin
    .from('travel_room_stop')
    .select('user_id')
    .eq('room_id', roomId)
    .neq('user_id', actorUserId);

  if (membersError) {
    throw new Error(`No se pudieron obtener participantes: ${membersError.message}`);
  }

  const memberIds = [...new Set(members.map((member) => member.user_id))];
  const tokens = await getActiveTokensForUsers(memberIds);
  const actorTag = (await getUserTag(actorUserId)) ?? 'Alguien';

  return sendPushToTokens(
    tokens,
    'Actualizacion del viaje',
    `${actorTag} salio del viaje`,
    {
      type: 'leave_room',
      room_id: roomId,
      actor_id: actorUserId,
    }
  );
};

const handleChatNotification = async (
  payload: Extract<NotificationRequest, { type: 'chat_message' }>
) => {
  const { roomId, actorUserId, message } = payload;

  const { data: members, error: membersError } = await supabaseAdmin
    .from('travel_room_stop')
    .select('user_id')
    .eq('room_id', roomId)
    .neq('user_id', actorUserId);

  if (membersError) {
    throw new Error(`No se pudieron obtener participantes: ${membersError.message}`);
  }

  const memberIds = [...new Set(members.map((member) => member.user_id))];
  const tokens = await getActiveTokensForUsers(memberIds);
  const actorTag = (await getUserTag(actorUserId)) ?? 'Nuevo mensaje';

  const snippet = message.trim().slice(0, 80);

  const result = await sendPushToTokens(
    tokens,
    `Mensaje de ${actorTag}`,
    snippet || 'Tienes un mensaje nuevo en el chat del viaje',
    {
      type: 'chat_message',
      room_id: roomId,
      actor_id: actorUserId,
    }
  );

  return result;
};

const handleRegisterDevice = async (
  payload: Extract<NotificationRequest, { type: 'register_device' }>
) => {
  const { actorUserId, token, platform } = payload;

  const { error } = await supabaseAdmin.from('push_device_token').upsert(
    {
      user_id: actorUserId,
      token,
      platform: platform ?? null,
      active: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'token',
      ignoreDuplicates: false,
    }
  );

  if (error) {
    throw new Error(`No se pudo registrar token: ${error.message}`);
  }

  return { ok: true };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let payload: NotificationRequest;

  try {
    payload = (await req.json()) as NotificationRequest;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  try {
    switch (payload.type) {
      case 'join_room': {
        if (!payload.roomId || !payload.actorUserId) {
          return jsonResponse({ error: 'roomId y actorUserId son requeridos' }, 400);
        }

        const result = await handleJoinRoomNotification(payload);
        return jsonResponse({ ok: true, result });
      }
      case 'leave_room': {
        if (!payload.roomId || !payload.actorUserId) {
          return jsonResponse({ error: 'roomId y actorUserId son requeridos' }, 400);
        }

        const result = await handleLeaveRoomNotification(payload);
        return jsonResponse({ ok: true, result });
      }
      case 'chat_message': {
        if (!payload.roomId || !payload.actorUserId) {
          return jsonResponse({ error: 'roomId y actorUserId son requeridos' }, 400);
        }

        const result = await handleChatNotification(payload);
        return jsonResponse({ ok: true, result });
      }
      case 'register_device': {
        if (!payload.actorUserId || !payload.token) {
          return jsonResponse(
            { error: 'actorUserId y token son requeridos' },
            400
          );
        }

        const result = await handleRegisterDevice(payload);
        return jsonResponse({ ok: true, result });
      }
      default:
        return jsonResponse({ error: 'Unsupported notification type' }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return jsonResponse({ error: message }, 500);
  }
});
