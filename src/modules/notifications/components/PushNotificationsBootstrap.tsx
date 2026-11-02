import { useQueryClient } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { useEffect, useEffectEvent, useRef } from 'react';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { PushNotificationsService } from '@/modules/notifications/services';

type ForegroundPayload = {
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
};

export default function PushNotificationsBootstrap() {
  const { user } = useRouteContext({ from: '__root__' });
  const queryClient = useQueryClient();
  const registrationErrorShown = useRef(false);

  const showRegistrationError = useEffectEvent(() => {
    if (registrationErrorShown.current) return;

    registrationErrorShown.current = true;
    toast.error(
      'No se pudieron activar las notificaciones en este dispositivo.'
    );
  });

  const handleForegroundMessage = useEffectEvent(
    (payload: ForegroundPayload) => {
      const title = payload.notification?.title || payload.data?.title;
      const body = payload.notification?.body || payload.data?.body;
      const type = payload.data?.type;
      const roomId = payload.data?.room_id;

      if (!title && !body) return;

      toast.info(title || 'Nueva notificación', {
        description: body,
      });

      if (
        (type === 'join_room' ||
          type === 'leave_room' ||
          type === 'next_stop') &&
        roomId
      ) {
        void queryClient.invalidateQueries({
          queryKey: [QueryKeys.TRAVEL_DETAIL, roomId],
        });
      }
    }
  );

  useEffect(() => {
    void PushNotificationsService.registerServiceWorker().catch(() => {
      showRegistrationError();
    });

    return PushNotificationsService.onForegroundMessage((payload) =>
      handleForegroundMessage(payload)
    );
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const runSync = () => {
      void PushNotificationsService.sync({ silent: true }).catch(() => {
        showRegistrationError();
      });
    };

    runSync();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') runSync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  return null;
}
