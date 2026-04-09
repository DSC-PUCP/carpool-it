import { useRouteContext } from '@tanstack/react-router';
import { useEffect, useEffectEvent } from 'react';
import { toast } from 'sonner';
import { PushNotificationsService } from '@/modules/notifications/services';

export default function PushNotificationsBootstrap() {
  const { user } = useRouteContext({ from: '__root__' });

  const handleForegroundMessage = useEffectEvent(
    (payload: {
      notification?: {
        title?: string;
        body?: string;
      };
      data?: {
        title?: string;
        body?: string;
      };
    }) => {
      const title = payload.notification?.title || payload.data?.title;
      const body = payload.notification?.body || payload.data?.body;

      if (!title && !body) return;

      toast.info(title || 'Nueva notificación', {
        description: body,
      });
    }
  );

  useEffect(() => {
    void PushNotificationsService.registerServiceWorker();

    const unsubscribe = PushNotificationsService.onForegroundMessage(
      (payload) => handleForegroundMessage(payload)
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    void PushNotificationsService.syncDeviceToken().catch((error) => {
      console.error('Error al obtener el token de notificaciones:', error);
    });
  }, [user?.id]);

  return null;
}
