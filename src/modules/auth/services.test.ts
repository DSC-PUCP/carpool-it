// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    unregister: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock('@/modules/notifications/services', () => ({
  PushNotificationsService: { unregister: mocks.unregister },
}));

vi.mock('@/lib/supabase', () => ({
  default: () => ({ auth: { signOut: mocks.signOut } }),
}));

import { AuthService } from './services';

describe('AuthService.logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.unregister.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it('desactiva el token de notificaciones antes de cerrar la sesión', async () => {
    const order: string[] = [];
    mocks.unregister.mockImplementation(async () => {
      order.push('unregister');
    });
    mocks.signOut.mockImplementation(async () => {
      order.push('signOut');
      return { error: null };
    });

    await AuthService.logout();

    expect(order).toEqual(['unregister', 'signOut']);
  });

  it('cierra la sesión aunque falle la desactivación del token', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mocks.unregister.mockRejectedValue(new Error('network'));

    await expect(AuthService.logout()).resolves.toBeUndefined();
    expect(mocks.signOut).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });
});
