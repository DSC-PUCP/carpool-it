import { useQueryClient } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { useEffect, useEffectEvent } from 'react';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { PushNotificationsService } from '@/modules/notifications/services';

export default function PushNotificationsBootstrap() {
  const { user } = useRouteContext({ from: '__root__' });
  const queryClient = useQueryClient();

  const handleForegroundMessage = useEffectEvent(
    (payload: {
      notification?: {
        title?: string;
        body?: string;
      };
      data?: {
        title?: string;
        body?: string;
        type?: string;
        room_id?: string;
      };
    }) => {
      const title = payload.notification?.title || payload.data?.title;
      const body = payload.notification?.body || payload.data?.body;
      const type = payload.data?.type;
      const roomId = payload.data?.room_id;

      if (!title && !body) return;

      toast.info(title || 'Nueva notificación', {
        description: body,
      });

      if ((type === 'join_room' || type === 'leave_room') && roomId) {
        void queryClient.invalidateQueries({
          queryKey: [QueryKeys.TRAVEL_DETAIL, roomId],
        });
      }
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
