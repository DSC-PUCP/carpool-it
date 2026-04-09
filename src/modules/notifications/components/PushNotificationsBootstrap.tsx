import { useEffect, useEffectEvent } from 'react';
import { toast } from 'sonner';
import { PushNotificationsService } from '@/modules/notifications/services';

export default function PushNotificationsBootstrap() {
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

  return null;
}
