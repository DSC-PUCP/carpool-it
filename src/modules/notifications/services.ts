import {
  deleteToken,
  getToken,
  type MessagePayload,
  onMessage,
} from 'firebase/messaging';
import {
  firebaseClientConfig,
  firebaseVapidKey,
  getFirebaseMessaging,
} from '@/lib/firebase';
import getLocalStorage from '@/lib/localStorage';
import getSupabaseClient from '@/lib/supabase';

const REGISTRATION_STORAGE_KEY = 'push_device_registration_v2';
const LEGACY_TOKEN_STORAGE_KEY = 'push_device_token';
const SERVICE_WORKER_PATH = '/firebase-messaging-sw.js';
const SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export type PushPermissionState =
  | 'unsupported'
  | 'ios-needs-install'
  | 'default'
  | 'granted'
  | 'denied';

type StoredRegistration = {
  token: string;
  userId: string;
  syncedAt: number;
};

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null =
  null;

const readStoredRegistration = (): StoredRegistration | null => {
  const raw = getLocalStorage().getItem(REGISTRATION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredRegistration>;

    if (
      typeof parsed.token === 'string' &&
      typeof parsed.userId === 'string' &&
      typeof parsed.syncedAt === 'number'
    ) {
      return {
        token: parsed.token,
        userId: parsed.userId,
        syncedAt: parsed.syncedAt,
      };
    }
  } catch {
    // Ignore corrupted storage and fall through to a fresh registration.
  }

  return null;
};

const writeStoredRegistration = (registration: StoredRegistration) => {
  getLocalStorage().setItem(
    REGISTRATION_STORAGE_KEY,
    JSON.stringify(registration)
  );
};

const removeLegacyTokenKey = () => {
  getLocalStorage().removeItem(LEGACY_TOKEN_STORAGE_KEY);
};

const clearStoredRegistration = () => {
  const storage = getLocalStorage();
  storage.removeItem(REGISTRATION_STORAGE_KEY);
  storage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
};

const isIosDevice = () => {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent;

  return (
    /iphone|ipad|ipod/i.test(userAgent) ||
    (/macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)
  );
};

const isStandaloneDisplay = () => {
  if (typeof window === 'undefined') return false;

  const { navigator: windowNavigator } = window;

  if (
    'standalone' in windowNavigator &&
    (windowNavigator as Navigator & { standalone?: boolean }).standalone
  ) {
    return true;
  }

  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches
  );
};

const getCurrentUserId = async () => {
  const { data, error } = await getSupabaseClient().auth.getUser();

  if (error) return null;

  return data.user?.id ?? null;
};

export namespace PushNotificationsService {
  export const getPermissionState = (): PushPermissionState => {
    if (typeof window === 'undefined') return 'unsupported';

    if (
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return 'unsupported';
    }

    if (isIosDevice() && !isStandaloneDisplay()) {
      return 'ios-needs-install';
    }

    return Notification.permission;
  };

  export const registerServiceWorker = () => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);

    if (!registrationPromise) {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(firebaseClientConfig())) {
        if (value) params.set(key, value);
      }

      const query = params.toString();
      const scriptUrl = query
        ? `${SERVICE_WORKER_PATH}?${query}`
        : SERVICE_WORKER_PATH;

      registrationPromise = navigator.serviceWorker
        .register(scriptUrl, { scope: '/' })
        .then(() => navigator.serviceWorker.ready)
        .catch((error) => {
          registrationPromise = null;
          throw error;
        });
    }

    return registrationPromise;
  };

  const getMessagingToken = async () => {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      throw new Error('Tu navegador no soporta notificaciones push.');
    }

    if (!firebaseVapidKey) {
      throw new Error('Falta configurar VITE_FIREBASE_VAPID_KEY.');
    }

    const registration = await registerServiceWorker();

    if (!registration) {
      throw new Error('No se pudo registrar el service worker.');
    }

    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error('No se pudo obtener el token del dispositivo.');
    }

    return token;
  };

  const registerRemoteToken = async (token: string) => {
    const platform =
      typeof navigator === 'undefined' ? null : navigator.userAgent;

    const { error } = await getSupabaseClient().rpc('register_push_token', {
      p_token: token,
      p_platform: platform ?? undefined,
    });

    if (error) {
      throw new Error(
        `No se pudo registrar el dispositivo para notificaciones: ${error.message}`
      );
    }
  };

  /**
   * Requests permission and registers the device. Must only be called from a
   * user gesture: mobile browsers ignore permission prompts without one.
   */
  export const enable = async () => {
    const state = getPermissionState();

    if (state === 'unsupported') {
      throw new Error('Tu navegador no soporta notificaciones push.');
    }

    if (state === 'ios-needs-install') {
      throw new Error(
        'Agrega Carpool It a la pantalla de inicio para activar las notificaciones.'
      );
    }

    if (state === 'denied') {
      throw new Error(
        'Bloqueaste las notificaciones. Habilítalas desde la configuración del sitio.'
      );
    }

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('No se pudo obtener permiso para enviar notificaciones.');
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('No se pudo identificar al usuario autenticado.');
    }

    const token = await getMessagingToken();

    await registerRemoteToken(token);
    writeStoredRegistration({ token, userId, syncedAt: Date.now() });
    removeLegacyTokenKey();

    return token;
  };

  /**
   * Keeps the remote token in sync without prompting for permission.
   * Registers again when the token, the user, or the 7 day window changed.
   */
  export const sync = async (_options: { silent?: boolean } = {}) => {
    if (getPermissionState() !== 'granted') return null;

    const userId = await getCurrentUserId();

    if (!userId) return null;

    const token = await getMessagingToken();
    const stored = readStoredRegistration();

    const needsSync =
      !stored ||
      stored.token !== token ||
      stored.userId !== userId ||
      Date.now() - stored.syncedAt > SYNC_INTERVAL_MS;

    if (needsSync) {
      await registerRemoteToken(token);
      writeStoredRegistration({ token, userId, syncedAt: Date.now() });
    }

    removeLegacyTokenKey();

    return { token, userId, synced: needsSync };
  };

  /**
   * Deactivates the device token. Never throws so logout is never blocked.
   */
  export const unregister = async () => {
    try {
      const token =
        readStoredRegistration()?.token ??
        getLocalStorage().getItem(LEGACY_TOKEN_STORAGE_KEY);

      if (token) {
        const { error } = await getSupabaseClient().rpc(
          'unregister_push_token',
          { p_token: token }
        );

        if (error) {
          console.error(
            'No se pudo desactivar el token de notificaciones:',
            error.message
          );
        }
      }

      const messaging = await getFirebaseMessaging();

      if (messaging) {
        try {
          await deleteToken(messaging);
        } catch (error) {
          console.error(
            'No se pudo eliminar el token local de Firebase:',
            error
          );
        }
      }
    } catch (error) {
      console.error('No se pudo limpiar el registro de notificaciones:', error);
    } finally {
      clearStoredRegistration();
    }
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
