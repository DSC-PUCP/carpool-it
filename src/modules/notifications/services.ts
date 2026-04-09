import { getToken, type MessagePayload, onMessage } from 'firebase/messaging';
import {
  firebaseVapidKey,
  getFirebaseMessaging,
  getFirebaseMessagingServiceWorker,
} from '@/lib/firebase';
import getLocalStorage from '@/lib/localStorage';

const PUSH_DEVICE_TOKEN_STORAGE_KEY = 'push_device_token';

export namespace PushNotificationsService {
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
    const serviceWorkerRegistration = await getFirebaseMessagingServiceWorker();

    if (!serviceWorkerRegistration) {
      throw new Error(
        'No se pudo registrar el service worker de notificaciones.'
      );
    }

    await requestPermission();

    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration,
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
    const storage = getLocalStorage();
    const previousToken = storage.getItem(PUSH_DEVICE_TOKEN_STORAGE_KEY);

    storage.setItem(PUSH_DEVICE_TOKEN_STORAGE_KEY, token);

    return {
      token,
      previousToken,
      changed: previousToken !== token,
    };
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
