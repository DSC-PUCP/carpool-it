import { getToken, type MessagePayload, onMessage } from 'firebase/messaging';
import { firebaseVapidKey, getFirebaseMessaging } from '@/lib/firebase';
import getLocalStorage from '@/lib/localStorage';
import getSupabaseClient from '@/lib/supabase';

const PUSH_DEVICE_TOKEN_STORAGE_KEY = 'push_device_token';

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

export namespace PushNotificationsService {
  const invokePushNotifications = async (payload: NotificationRequest) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.functions.invoke('push-notifications', {
      body: payload,
    });

    if (error) {
      throw new Error(
        `No se pudo invocar push-notifications: ${error.message}`
      );
    }
  };

  export const isSupported = async () => {
    const messaging = await getFirebaseMessaging();
    return messaging !== null;
  };

  export const registerServiceWorker = async () => {
    if (typeof window === 'undefined') return null;
    if (!('serviceWorker' in navigator)) return null;

    return navigator.serviceWorker.register('/firebase-messaging-sw.js');
  };

  export const requestPermission =
    async (): Promise<NotificationPermission> => {
      if (typeof window === 'undefined') {
        throw new Error(
          'Las notificaciones push solo están disponibles en el navegador.'
        );
      }

      if (!('Notification' in window)) {
        throw new Error('Tu navegador no soporta notificaciones push.');
      }

      if (Notification.permission === 'granted') {
        return Notification.permission;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'denied') {
        throw new Error('Bloqueaste las notificaciones en tu navegador.');
      }

      if (permission !== 'granted') {
        throw new Error(
          'No se pudo obtener permiso para enviar notificaciones.'
        );
      }

      return permission;
    };

  export const getDeviceToken = async () => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error('Tu navegador no soporta notificaciones push.');
    }

    if (!firebaseVapidKey) {
      throw new Error('Falta configurar VITE_FIREBASE_VAPID_KEY.');
    }

    await registerServiceWorker();

    await requestPermission();
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
    });

    if (!token) {
      throw new Error('No se pudo obtener el token del dispositivo.');
    }

    return token;
  };

  export const getStoredDeviceToken = () => {
    return getLocalStorage().getItem(PUSH_DEVICE_TOKEN_STORAGE_KEY);
  };

  export const clearStoredDeviceToken = () => {
    getLocalStorage().removeItem(PUSH_DEVICE_TOKEN_STORAGE_KEY);
  };

  export const syncDeviceToken = async () => {
    const token = await getDeviceToken();
    const supabase = getSupabaseClient();
    const storage = getLocalStorage();
    const previousToken = storage.getItem(PUSH_DEVICE_TOKEN_STORAGE_KEY);
    const changed = previousToken !== token;

    if (changed) {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('No se pudo identificar al usuario autenticado.');
      }

      await invokePushNotifications({
        type: 'register_device',
        actorUserId: userId,
        token,
        platform:
          typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
    }

    storage.setItem(PUSH_DEVICE_TOKEN_STORAGE_KEY, token);

    return {
      token,
      previousToken,
      changed,
    };
  };

  export const notifyJoinRoom = async (params: {
    roomId: string;
    actorUserId: string;
  }) => {
    await invokePushNotifications({
      type: 'join_room',
      roomId: params.roomId,
      actorUserId: params.actorUserId,
    });
  };

  export const notifyLeaveRoom = async (params: {
    roomId: string;
    actorUserId: string;
  }) => {
    await invokePushNotifications({
      type: 'leave_room',
      roomId: params.roomId,
      actorUserId: params.actorUserId,
    });
  };

  export const notifyChatMessage = async (params: {
    roomId: string;
    actorUserId: string;
    message: string;
  }) => {
    await invokePushNotifications({
      type: 'chat_message',
      roomId: params.roomId,
      actorUserId: params.actorUserId,
      message: params.message,
    });
  };

  export const onForegroundMessage = (
    callback: (payload: MessagePayload) => void
  ) => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging || !active) return;

      unsubscribe = onMessage(messaging, callback);
    };

    void setup();

    return () => {
      active = false;
      unsubscribe?.();
    };
  };
}
