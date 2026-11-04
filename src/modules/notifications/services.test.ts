// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { storage, mocks } = vi.hoisted(() => ({
  storage: new Map<string, string>(),
  mocks: {
    getToken: vi.fn(),
    deleteToken: vi.fn(),
    onMessage: vi.fn(),
    rpc: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock('@/lib/localStorage', () => ({
  default: () => ({
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: () => null,
    length: 0,
  }),
}));

vi.mock('firebase/messaging', () => ({
  getToken: mocks.getToken,
  deleteToken: mocks.deleteToken,
  onMessage: mocks.onMessage,
}));

vi.mock('@/lib/firebase', () => ({
  firebaseVapidKey: 'vapid-key',
  firebaseClientConfig: () => ({ apiKey: 'api-key', projectId: 'project-id' }),
  getFirebaseMessaging: async () => ({}),
}));

vi.mock('@/lib/supabase', () => ({
  default: () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  }),
}));

import { PushNotificationsService } from './services';

const REGISTRATION_KEY = 'push_device_registration_v2';
const LEGACY_KEY = 'push_device_token';
const EIGHT_DAYS_MS = 8 * 24 * 60 * 60 * 1000;

type NotificationMock = {
  permission: NotificationPermission;
  requestPermission: ReturnType<typeof vi.fn>;
};

const notificationMock: NotificationMock = {
  permission: 'default',
  requestPermission: vi.fn(async () => notificationMock.permission),
};

const registration = {
  scope: '/',
  showNotification: vi.fn(),
} as unknown as ServiceWorkerRegistration;

const serviceWorkerMock = {
  register: vi.fn(async () => registration),
  ready: Promise.resolve(registration),
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: serviceWorkerMock,
  configurable: true,
});

vi.stubGlobal('Notification', notificationMock);
vi.stubGlobal('PushManager', class PushManagerMock {});

const storedRegistration = (value: {
  token: string;
  userId: string;
  syncedAt: number;
}) => JSON.stringify(value);

const grantPermission = () => {
  notificationMock.permission = 'granted';
};

const denyPermission = () => {
  notificationMock.permission = 'denied';
};

const resetPermission = () => {
  notificationMock.permission = 'default';
};

describe('PushNotificationsService', () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
    resetPermission();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'user-a' } },
      error: null,
    });
    mocks.getToken.mockResolvedValue('token-1');
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.deleteToken.mockResolvedValue(undefined);
  });

  it('sync no pide permiso ni obtiene token cuando el permiso no está concedido', async () => {
    resetPermission();

    const result = await PushNotificationsService.sync({ silent: true });

    expect(result).toBeNull();
    expect(notificationMock.requestPermission).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('sync registra el token la primera vez y guarda el registro tras el éxito de la RPC', async () => {
    grantPermission();

    const result = await PushNotificationsService.sync({ silent: true });

    expect(result).toMatchObject({
      token: 'token-1',
      userId: 'user-a',
      synced: true,
    });
    expect(mocks.rpc).toHaveBeenCalledWith('register_push_token', {
      p_token: 'token-1',
      p_platform: expect.any(String),
    });
    expect(JSON.parse(storage.get(REGISTRATION_KEY) ?? '')).toMatchObject({
      token: 'token-1',
      userId: 'user-a',
    });
  });

  it('sync no vuelve a registrar cuando token, usuario y fecha siguen vigentes', async () => {
    grantPermission();
    storage.set(
      REGISTRATION_KEY,
      storedRegistration({
        token: 'token-1',
        userId: 'user-a',
        syncedAt: Date.now(),
      })
    );

    const result = await PushNotificationsService.sync({ silent: true });

    expect(result).toMatchObject({ synced: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('sync reasigna el token cuando cambia el usuario en el mismo navegador', async () => {
    grantPermission();
    storage.set(
      REGISTRATION_KEY,
      storedRegistration({
        token: 'token-1',
        userId: 'user-a',
        syncedAt: Date.now(),
      })
    );
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'user-b' } },
      error: null,
    });

    const result = await PushNotificationsService.sync({ silent: true });

    expect(result).toMatchObject({ synced: true });
    expect(mocks.rpc).toHaveBeenCalledWith('register_push_token', {
      p_token: 'token-1',
      p_platform: expect.any(String),
    });
    expect(JSON.parse(storage.get(REGISTRATION_KEY) ?? '')).toMatchObject({
      token: 'token-1',
      userId: 'user-b',
    });
  });

  it('sync registra de nuevo cuando cambia el token del dispositivo', async () => {
    grantPermission();
    storage.set(
      REGISTRATION_KEY,
      storedRegistration({
        token: 'token-old',
        userId: 'user-a',
        syncedAt: Date.now(),
      })
    );
    mocks.getToken.mockResolvedValue('token-new');

    const result = await PushNotificationsService.sync({ silent: true });

    expect(result).toMatchObject({ synced: true });
    expect(mocks.rpc).toHaveBeenCalledWith('register_push_token', {
      p_token: 'token-new',
      p_platform: expect.any(String),
    });
  });

  it('sync refresca el registro cuando pasaron más de 7 días', async () => {
    grantPermission();
    storage.set(
      REGISTRATION_KEY,
      storedRegistration({
        token: 'token-1',
        userId: 'user-a',
        syncedAt: Date.now() - EIGHT_DAYS_MS,
      })
    );

    const result = await PushNotificationsService.sync({ silent: true });

    expect(result).toMatchObject({ synced: true });
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('sync propaga el error de la RPC y no escribe localStorage', async () => {
    grantPermission();
    mocks.rpc.mockResolvedValue({ error: { message: 'boom' } });

    await expect(
      PushNotificationsService.sync({ silent: true })
    ).rejects.toThrow('No se pudo registrar el dispositivo');

    expect(storage.has(REGISTRATION_KEY)).toBe(false);
  });

  it('sync conserva el registro anterior cuando la RPC falla', async () => {
    grantPermission();
    const previous = storedRegistration({
      token: 'token-old',
      userId: 'user-a',
      syncedAt: Date.now() - EIGHT_DAYS_MS,
    });
    storage.set(REGISTRATION_KEY, previous);
    mocks.rpc.mockResolvedValue({ error: { message: 'boom' } });

    await expect(
      PushNotificationsService.sync({ silent: true })
    ).rejects.toThrow('No se pudo registrar el dispositivo');

    expect(storage.get(REGISTRATION_KEY)).toBe(previous);
  });

  it('sync elimina la clave legacy tras un registro correcto', async () => {
    grantPermission();
    storage.set(LEGACY_KEY, 'legacy-token');

    await PushNotificationsService.sync({ silent: true });

    expect(storage.has(LEGACY_KEY)).toBe(false);
  });

  it('enable pide permiso desde el gesto y registra el dispositivo', async () => {
    resetPermission();
    notificationMock.requestPermission.mockImplementation(async () => {
      notificationMock.permission = 'granted';
      return 'granted';
    });

    const token = await PushNotificationsService.enable();

    expect(token).toBe('token-1');
    expect(notificationMock.requestPermission).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith('register_push_token', {
      p_token: 'token-1',
      p_platform: expect.any(String),
    });
    expect(JSON.parse(storage.get(REGISTRATION_KEY) ?? '')).toMatchObject({
      token: 'token-1',
      userId: 'user-a',
    });
  });

  it('enable falla sin registrar cuando el usuario rechaza el permiso', async () => {
    resetPermission();
    notificationMock.requestPermission.mockImplementation(async () => {
      notificationMock.permission = 'denied';
      return 'denied';
    });

    await expect(PushNotificationsService.enable()).rejects.toThrow(
      'No se pudo obtener permiso'
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('enable informa cuando el permiso está bloqueado', async () => {
    denyPermission();

    await expect(PushNotificationsService.enable()).rejects.toThrow(
      'Bloqueaste las notificaciones'
    );
    expect(notificationMock.requestPermission).not.toHaveBeenCalled();
  });

  it('unregister desactiva el token remoto y limpia el almacenamiento local', async () => {
    storage.set(
      REGISTRATION_KEY,
      storedRegistration({
        token: 'token-1',
        userId: 'user-a',
        syncedAt: Date.now(),
      })
    );
    storage.set(LEGACY_KEY, 'legacy-token');

    await PushNotificationsService.unregister();

    expect(mocks.rpc).toHaveBeenCalledWith('unregister_push_token', {
      p_token: 'token-1',
    });
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1);
    expect(storage.size).toBe(0);
  });

  it('unregister nunca lanza aunque falle la RPC o Firebase', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    storage.set(
      REGISTRATION_KEY,
      storedRegistration({
        token: 'token-1',
        userId: 'user-a',
        syncedAt: Date.now(),
      })
    );
    mocks.rpc.mockRejectedValue(new Error('network'));
    mocks.deleteToken.mockRejectedValue(new Error('firebase'));

    await expect(
      PushNotificationsService.unregister()
    ).resolves.toBeUndefined();
    expect(storage.size).toBe(0);

    consoleError.mockRestore();
  });

  it('unregister no llama a la RPC cuando no hay token guardado', async () => {
    await PushNotificationsService.unregister();

    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.deleteToken).toHaveBeenCalledTimes(1);
  });
});
